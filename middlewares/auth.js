import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js"; 

const auth = async (request, response, next) => {
  try {
    const token =
      request.cookies.accessToken ||
      request?.headers?.authorization?.split(" ")[1];

    if (!token) {
      return response.status(401).json({
        message: "Provide token",
        error: true,
        success: false,
      });
    }

    const decode = await jwt.verify(
      token,
      process.env.SECRET_KEY_ACCESS_TOKEN
    );

    if (!decode) {
      return response.status(401).json({
        message: "unauthorized access",
        error: true,
        success: false,
      });
    }

    //  Set userId for backward compatibility
    request.userId = decode.id;

    //Fetch full user data including role
    const user = await UserModel.findById(decode.id).select("-password -refresh_token -otp -otpExpires");
    
    if (!user) {
      return response.status(401).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    // Attach full user object with role
    request.user = user;

    next();
  } catch (error) {
    console.error("Auth error:", error);
    return response.status(500).json({
      message: "You have not login",
      error: true,
      success: false,
    });
  }
};

export default auth;
