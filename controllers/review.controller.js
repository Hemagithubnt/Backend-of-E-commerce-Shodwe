import ReviewModel from "../models/review.model.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Cloudinary config (if not already in main file)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Create Review
export async function AddReview(request, response) {
  try {
    const { userName, review, rating, userId,image,productId } = request.body;

     const userReview = new ReviewModel({
      userName:userName,
      review:review,
      rating:rating,
      userId:userId,
      image: image,
      productId:productId,
    });

  const savedReview = await userReview.save();

     return response.status(201).json({
      message: "Review added successfully",
      data: savedReview,
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

// Get All Reviews
export async function getAllReviews(request, response) {
  try {
    const productId = request.query.productId;

    const reviews = await ReviewModel.find({productId:productId});

    if(!reviews){
      return response.status(404).json({
      message: "review not found",
      error: true,
      success: false,
    });
    }

    return response.status(200).json({
      message: "Reviews fetched successfully",
      reviews: reviews,
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

