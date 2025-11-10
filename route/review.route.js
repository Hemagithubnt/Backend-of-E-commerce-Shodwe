import { Router } from "express";
import {
  getAllReviews,
  AddReview,
  getTotalReviews,
} from "../controllers/review.controller.js";
import auth from "../middlewares/auth.js";


const reviewRouter = Router();

// Create review with image upload (single image)
reviewRouter.post("/addReview",auth,  AddReview);

// Get all reviews for perticular product
reviewRouter.get("/getReviews", getAllReviews);

//get Total reviews 
reviewRouter.get("/getTotalReviews", getTotalReviews);



export default reviewRouter;
