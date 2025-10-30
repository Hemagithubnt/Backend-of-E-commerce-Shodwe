import { Router } from "express";
import {
  getAllReviews,
  AddReview,
} from "../controllers/review.controller.js";
import auth from "../middlewares/auth.js";


const reviewRouter = Router();

// Create review with image upload (single image)
reviewRouter.post("/addReview",auth,  AddReview);

// Get all reviews
reviewRouter.get("/getReviews", getAllReviews);



export default reviewRouter;
