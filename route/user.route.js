import { Router } from "express";
import { forgotPasswordController, loginUserController, logoutController, refreshTokenji, registerUserController, removeImageFromCloudinary, resetPassword, updateUserDetails,
userAvatarController, userDetails, verifyEmailController, 
verifyForgotPasswordOtp,
  getAllUsers,
  getSingleUser,  
  deleteUser,
  deleteMultipleUsers,
  updateUserStatus,
  authWithGoogle} from "../controllers/user.controller.js";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";

const userRouter = Router();

userRouter.post("/register", registerUserController);
userRouter.post("/verifyEmail", verifyEmailController);
userRouter.post("/login", loginUserController);
userRouter.post("/authWithGoogle", authWithGoogle);
userRouter.get("/logout", auth, logoutController);
userRouter.put("/user-avatar", auth, upload.array("avatar"), userAvatarController);
userRouter.delete("/deleteImage", auth,removeImageFromCloudinary);
userRouter.put('/:id', auth, updateUserDetails);
userRouter.post('/forgot-password', forgotPasswordController);
userRouter.post('/verify-forgot-password-otp', verifyForgotPasswordOtp);
userRouter.post('/reset-password', resetPassword);
userRouter.post('/refresh-Token', refreshTokenji);
userRouter.get('/user-details',auth, userDetails);

//  NEW ADMIN ROUTES FOR USER MANAGEMENT
userRouter.get("/", auth, getAllUsers); // Get all users
userRouter.get("/:id", auth, getSingleUser); // Get single user
userRouter.delete("/:id", auth, deleteUser); // Delete single user
userRouter.post("/deleteMultiple", auth, deleteMultipleUsers); // Delete multiple users
userRouter.put("/status/:id", auth, updateUserStatus); // Update user status




export default userRouter;
