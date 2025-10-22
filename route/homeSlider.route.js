import { Router } from "express";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import {
  addHomeSlide,
  deleteMultipleSlide,
  DeleteSlide,
  getHomeSlides,
  getSingleHomeSlide,
  removeImageFromCloudinary,
  updateSlide,
  uploadImages,
} from "../controllers/homeSlider.controller.js";

const HomeSlideRouter = Router();

// Upload images
HomeSlideRouter.post("/uploadImages", auth, upload.array("images"), uploadImages);

// Add new slide
HomeSlideRouter.post("/add", auth, addHomeSlide);

// Get all slides
HomeSlideRouter.get("/", getHomeSlides);

// Get single slide
HomeSlideRouter.get("/:id", getSingleHomeSlide);

// Delete image from cloudinary
HomeSlideRouter.delete("/deleteImages", auth, removeImageFromCloudinary);

// Delete multiple slides
HomeSlideRouter.post("/deleteMultiple", auth, deleteMultipleSlide);

// Delete single slide
HomeSlideRouter.delete("/:id", auth, DeleteSlide);

// Update slide
HomeSlideRouter.put("/:id", auth, updateSlide);

export default HomeSlideRouter;
