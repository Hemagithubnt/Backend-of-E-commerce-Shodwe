import UserModel from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmailFun from "../config/sendEmail.js";
import VerificationEmail from "../utils/verifyEmailTemplate.js";
import generatedAccessToken from "../utils/generatedAccessToken.js";
import generatedRefreshToken from "../utils/generatedRefreshToken.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import ReviewModel from "../models/review.model.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
//register controller
export async function registerUserController(request, response) {
  try {
    const { name, email, password } = request.body;

    // 1. Basic validation
    if (!name || !email || !password) {
      return response.status(400).json({
        message: "Please provide all required fields: name, email, and password.",
        error: true,
        success: false,
      });
    }

    // 2. Check if user already exists
    const existingUser = await UserModel.findOne({ email: email });
    if (existingUser) {
      // If user exists but is not verified, we can resend OTP.
      // For simplicity, we'll just send an error for now.
      return response.status(400).json({
        message: "A user with this email has already been registered.",
        error: true,
        success: false,
      });
    }

    // 3. Prepare user data
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    const payload = {
      name,
      email,
      password: hashPassword,
      otp: verifyCode,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
      
      // --- THIS IS THE CRITICAL FIX ---
      signUpWithGoogle: false, // Explicitly set to false for normal registration
      // ---------------------------------
    };

    // 4. Create and save the new user
    const newUser = new UserModel(payload);
    await newUser.save();

    // 5. Send verification email
    await sendEmailFun({
      sendTo: email,
      subject: "Verify Your Email for E-commerce Shodwe",
      text: `Your One-Time Password is: ${verifyCode}`,
      html: VerificationEmail(name, verifyCode),
    });

    // 6. Respond to the client
    return response.status(201).json({
      success: true,
      error: false,
      message: "User registered successfully! Please check your email for the OTP.",
    });

  } catch (error) {
    // This will catch any errors, including validation errors.
    return response.status(500).json({
      message: error.message || "An internal server error occurred during registration.",
      error: true,
      success: false,
    });
  }
}

// UPDATED verifyEmail controller
export async function verifyEmailController(request, response) {
  try {
    const { email, otp } = request.body;

    if (!email || !otp) {
      return response.status(400).json({
        message: "Email and OTP are required.",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return response.status(404).json({
        message: "User not found. Please register first.",
        error: true,
        success: false,
      });
    }

    if (user.verify_email) {
      return response.status(400).json({
        message: "This email is already verified.",
        error: true,
        success: false,
      });
    }

    // Check if OTP is expired
    if (new Date() > user.otpExpires) {
      return response.status(400).json({
        message: "OTP has expired. Please request a new one.",
        error: true,
        success: false,
      });
    }

    // Check if OTP is correct
    if (user.otp !== otp) {
      return response.status(400).json({
        message: "The OTP you entered is incorrect.",
        error: true,
        success: false,
      });
    }

    // If OTP is correct and not expired, update the user
    user.verify_email = true;
    user.otp = null;
    user.otpExpires = null;
    
    // This save will now work without errors
    await user.save(); 

    return response.status(200).json({
      success: true,
      error: false,
      message: "Email verified successfully! You can now log in.",
    });

  } catch (error) {
    return response.status(500).json({
      message: error.message || "An internal server error occurred during verification.",
      error: true,
      success: false,
    });
  }
}


export async function authWithGoogle(request, response) {
  const { name, email, password, avatar, mobile, role } = request.body;
  try {
    const existingUser = await UserModel.findOne({ email: email });
    if (!existingUser) {
      const user = await UserModel.create({
        name: name,
        mobile: mobile,
        email: email,
        password: "null",
        avatar: avatar,
        role: role,
        verify_email: true,
        signUpWithGoogle: true,
      });
      await user.save();
        const accessToken = await generatedAccessToken(user._id);
      const refreshToken = await generatedRefreshToken(user._id);

      await UserModel.findByIdAndUpdate(user?._id, {
        last_login_date: new Date(),
      });

      const cookiesOption = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      };
      response.cookie("accessToken", accessToken, cookiesOption);
      response.cookie("refreshToken", refreshToken, cookiesOption);

      return response.json({
        message: "Login successfully",
        error: false,
        success: true,
        data: {
          accessToken,
          refreshToken,
        },
      });
    } else {
      const accessToken = await generatedAccessToken(existingUser._id);
      const refreshToken = await generatedRefreshToken(existingUser._id);

      await UserModel.findByIdAndUpdate(existingUser?._id, {
        last_login_date: new Date(),
      });

      const cookiesOption = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      };
      response.cookie("accessToken", accessToken, cookiesOption);
      response.cookie("refreshToken", refreshToken, cookiesOption);

      return response.json({
        message: "Login successfully",
        error: false,
        success: true,
        data: {
          accessToken,
          refreshToken,
        },
      });
    }
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//Login controller
export async function loginUserController(request, response) {
  try {
    const { email, password } = request.body;

    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return response.status(400).json({
        message: "User not register",
        error: true,
        success: false,
      });
    }

    if (user.status !== "Active") {
      return response.status(400).json({
        message: "Contact to Admin",
        error: true,
        success: false,
      });
    }

    if (user.verify_email !== true) {
      return response.status(400).json({
        message: "Your Email is not verify yet please verify your email first",
        error: true,
        success: false,
      });
    }

    const checkPassword = await bcryptjs.compare(password, user.password);

    if (!checkPassword) {
      return response.status(400).json({
        message: "Check your password",
        error: true,
        success: false,
      });
    }

    const accessToken = await generatedAccessToken(user._id);
    const refreshToken = await generatedRefreshToken(user._id);

    const updateUser = await UserModel.findByIdAndUpdate(user?._id, {
      last_login_date: new Date(),
    });

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    response.cookie("accessToken", accessToken, cookiesOption);
    response.cookie("refreshToken", refreshToken, cookiesOption);

    return response.json({
      message: "Login successfully",
      error: false,
      success: true,
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// Logout controller
export async function logoutController(request, response) {
  try {
    response.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    response.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    return response.json({
      message: "Logout successful",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Something went wrong",
      error: true,
      success: false,
    });
  }
}

// image upload
var imagesArr = [];
export async function userAvatarController(request, response) {
  try {
    imagesArr = [];
    const userId = request.userId; // from auth middleware
    const files = request.files; // multer -> array('avatar')

    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      return response.status(500).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    //first remove image from cloudinary
    const imgUrl = user.avatar;
    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];

    const imageName = image.split(".")[0];

    if (imageName) {
      const res = await cloudinary.uploader.destroy(
        imageName,
        (error, result) => {
          // console.log(error,res)
        }
      );
    }

    if (!files || files.length === 0) {
      return response.status(400).json({
        message: "No file uploaded",
        error: true,
        success: false,
      });
    }

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    };

    for (let i = 0; i < files.length; i++) {
      // ✅ Pure await style (no callback)
      const result = await cloudinary.uploader.upload(files[i].path, options);

      // Push uploaded image URL
      imagesArr.push(result.secure_url);

      // Remove local file after upload
      fs.unlinkSync(files[i].path);
    }

    // Update user’s avatar in DB (first image only)
    await UserModel.findByIdAndUpdate(userId, { avatar: imagesArr[0] });

    return response.status(200).json({
      _id: userId,
      avatar: imagesArr[0],
      uploaded: imagesArr, // return all uploaded URLs if multiple
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Error uploading avatar",
      error: true,
      success: false,
    });
  }
}

//remove image from cloudinary for any user
export async function removeImageFromCloudinary(request, response) {
  const imgUrl = request.query.img;
  const urlArr = imgUrl.split("/");
  const image = urlArr[urlArr.length - 1];

  const imageName = image.split(".")[0];

  if (imageName) {
    const res = await cloudinary.uploader.destroy(
      imageName,
      (error, result) => {
        // console.log(error,res)
      }
    );
    if (res) {
      response.status(200).send(res);
    }
  }
}
//Update user details
export async function updateUserDetails(request, response) {
  try {
    const userId = request.userId; //auth middleware
    const { name, email, mobile, password } = request.body;

    const userExist = await UserModel.findById(userId);
    if (!userExist) {
      return response.status(400).send("the user cannot be updated!");
    }

    let verifyCode = "";

    if (email !== userExist.email) {
      verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    }

    let hashPassword = "";
    if (password) {
      const salt = await bcryptjs.genSalt(10);
      hashPassword = await bcryptjs.hash(password, salt);
    } else {
      hashPassword = userExist.password;
    }

    const updateUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        name: name,
        mobile: mobile,
        email: email,
        verify_email: true,
        password: hashPassword,
        otp: verifyCode !== "" ? verifyCode : null,
        otpExpires: verifyCode !== "" ? Date.now() + 600000 : "",
      },
      { new: true }
    );

    if (email !== userExist.email) {
      // Send verification email
      await sendEmailFun({
        sendTo: email,
        subject: "Verify email from Ecommerce App",
        text: "",
        html: VerificationEmail(name, verifyCode),
      });
    }
    return response.status(200).json({
      message: "User Updated successfully",
      error: false,
      success: true,
      user: {
        name: updateUser?.name,
        _id: updateUser?._id,
        email: updateUser?.email,
        mobile: updateUser?.mobile,
        avatar: updateUser?.avatar,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Error uploading avatar",
      error: true,
      success: false,
    });
  }
}

//forgot password
export async function forgotPasswordController(request, response) {
  try {
    const { email } = request.body;
    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return response.status(400).json({
        message: "Email not available",
        error: true,
        success: false,
      });
    } else {
      let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

      user.otp = verifyCode;
      (user.otpExpires = Date.now() + 600000), await user.save();

      await sendEmailFun({
        sendTo: email,
        subject: "Verify OTP from Ecommerce App",
        text: "",
        html: VerificationEmail(user.name, verifyCode),
      });

      return response.json({
        message: "Check your email",
        error: false,
        success: true,
      });
    }
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Error uploading avatar",
      error: true,
      success: false,
    });
  }
}

//verify Forgot Password Otp
export async function verifyForgotPasswordOtp(request, response) {
  try {
    const { email, otp } = request.body;

    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return response.status(400).json({
        message: "Email not available",
        error: true,
        success: false,
      });
    }

    if (!email || !otp) {
      return response.status(400).json({
        message: "Provide required field email, otp.",
        error: true,
        success: false,
      });
    }

    if (otp !== user.otp) {
      return response.status(400).json({
        message: "Invalid OTP",
        error: true,
        success: false,
      });
    }

    const currentTime = new Date().toISOString();
    if (user.otpExpires < currentTime) {
      return response.status(400).json({
        message: "OTP is expired",
        error: true,
        success: false,
      });
    }

    user.otp = "";
    user.otpExpires = "";
    user.verify_email = true;

    await user.save();

    return response.json({
      message: "verify OTP successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//reset password
export async function resetPassword(request, response) {
  try {
    const { email, newPassword, confirmPassword } = request.body;

    // Validate inputs
    if (!email) {
      return response.status(400).json({
        message: "Email not available",
        error: true,
        success: false,
      });
    }

    if (!newPassword || !confirmPassword) {
      return response.status(400).json({
        error: true,
        success: false,
        message: "Please provide new password and confirm password",
      });
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return response.status(400).json({
        message: "New password and confirm password must be the same",
        error: true,
        success: false,
      });
    }

    // Find user by email
    const user = await UserModel.findOne({ email });

    if (!user) {
      return response.status(400).json({
        message: "Email not available",
        error: true,
        success: false,
      });
    }

    // Hash the new password
    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(newPassword, salt);

    // Update user password
    user.password = hashPassword;
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    return response.json({
      message: "Password updated successfully.",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}


//refresh token controller
export async function refreshTokenji(request, response) {
  try {
    const refreshToken =
      request.cookies.refreshToken ||
      request?.headers?.authorization?.split(" ")[1]; // [bearer token]
    if (!refreshToken) {
      return response.status(401).json({
        message: "Invalid Token",
        error: true,
        success: false,
      });
    }

    const verifyToken = await jwt.verify(
      refreshToken,
      process.env.SECRET_KEY_REFRESH_TOKEN
    );
    if (!verifyToken) {
      return response.status(401).json({
        message: "Token is expired",
        error: true,
        success: false,
      });
    }

    const userId = verifyToken?._id;
    const newAccessToken = await generatedAccessToken(userId);

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    response.cookie("accessToken", newAccessToken, cookiesOption);

    return response.json({
      message: "New Access token generated",
      error: false,
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//get login user details
export async function userDetails(request, response) {
  try {
    const userId = request.userId;

    const user = await UserModel.findById(userId)
      .select("-password -refresh_token")
      .populate("address_details");
    //here i don't need password and refresh_token so i minus of both
    // here i use populate for address details, shopping cart and order history attaching to user
    return response.json({
      message: "user details",
      data: user,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: "something is wrong",
      error: true,
      success: false,
    });
  }
}

//  GET ALL USERS 
export async function getAllUsers(request, response) {
  try {
    if (request.user?.role !== "ADMIN") {
      return response.status(403).json({
        error: true,
        success: false,
        message: "Only admins can view all users",
      });
    }

    const users = await UserModel.find();

    return response.json({
      error: false,
      success: true,
      message: "All users",
      data: users,
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return response.status(500).json({
      message: error.message || "Error fetching users",
      success: false,
      error: true,
    });
  }
}


// GET SINGLE USER BY ID - New API
export async function getSingleUser(request, response) {
  try {
    const { id } = request.params;

    const user = await UserModel.findById(id)
      .select("-password -refresh_token -otp -otpExpires")
      .populate("address_details")
      .populate("shopping_cart")
      .populate("orderHistory");

    if (!user) {
      return response.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "User details fetched successfully",
      data: user,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Something went wrong",
      error: true,
      success: false,
    });
  }
}

//  DELETE SINGLE USER - New API
export async function deleteUser(request, response) {
  try {
    const { id } = request.params;

    const user = await UserModel.findById(id);
    if (!user) {
      return response.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    // Remove user avatar from cloudinary if exists
    if (user.avatar) {
      const imgUrl = user.avatar;
      const urlArr = imgUrl.split("/");
      const image = urlArr[urlArr.length - 1];
      const imageName = image.split(".")[0];

      if (imageName) {
        await cloudinary.uploader.destroy(imageName);
      }
    }

    await UserModel.findByIdAndDelete(id);

    return response.status(200).json({
      message: "User deleted successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Something went wrong",
      error: true,
      success: false,
    });
  }
}

//  DELETE MULTIPLE USERS - New API
export async function deleteMultipleUsers(request, response) {
  try {
    const { ids } = request.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return response.status(400).json({
        message: "Please provide valid user IDs",
        error: true,
        success: false,
      });
    }

    // Get users to delete their avatars from cloudinary
    const users = await UserModel.find({ _id: { $in: ids } });

    // Delete avatars from cloudinary
    for (const user of users) {
      if (user.avatar) {
        const imgUrl = user.avatar;
        const urlArr = imgUrl.split("/");
        const image = urlArr[urlArr.length - 1];
        const imageName = image.split(".")[0];

        if (imageName) {
          await cloudinary.uploader.destroy(imageName);
        }
      }
    }

    // Delete users from database
    const result = await UserModel.deleteMany({ _id: { $in: ids } });

    return response.status(200).json({
      message: `${result.deletedCount} users deleted successfully`,
      error: false,
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Something went wrong",
      error: true,
      success: false,
    });
  }
}

//  UPDATE USER STATUS - New API for admin
export async function updateUserStatus(request, response) {
  try {
    const { id } = request.params;
    const { status } = request.body;

    if (!["Active", "Inactive", "Suspended"].includes(status)) {
      return response.status(400).json({
        message: "Invalid status. Must be Active, Inactive, or Suspended",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    ).select("-password -refresh_token -otp -otpExpires");

    if (!user) {
      return response.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "User status updated successfully",
      data: user,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Something went wrong",
      error: true,
      success: false,
    });
  }
}

//Review controller
export async function addReview(request, response) {
   try {
    const {userName,review,image,rating,userId} = request.body;

    const userReview = new ReviewModel({
      image:image,
      userName:userName,
      review:review,
      rating:rating,
      userId:userId

    })
   }catch (error) {
    return response.status(500).json({
      message: error.message || "Something went wrong",
      error: true,
      success: false,
    });
  }
}

