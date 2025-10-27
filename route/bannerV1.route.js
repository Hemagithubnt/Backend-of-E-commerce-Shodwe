import { Router } from "express";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import {
  createBanner,
  getAllBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
  deleteMultipleBanners,
  getBannersCount,
  getBannersByCatId,
  getBannersBySubCatId,
} from "../controllers/bannerV1.controller.js";

const bannerV1Router = Router();

// Create Banner
bannerV1Router.post(
  "/createBanner",
  auth,
  upload.array("images"),
  createBanner
);

// Get All Banners with Pagination
bannerV1Router.get("/getAllBanners", getAllBanners);

// Get Banners Count
bannerV1Router.get("/getBannersCount", getBannersCount);

// Get Banners by Category ID
bannerV1Router.get("/getBannersByCatId/:id", getBannersByCatId);

// Get Banners by SubCategory ID
bannerV1Router.get("/getBannersBySubCatId/:id", getBannersBySubCatId);

// Delete Multiple Banners
bannerV1Router.delete("/deleteMultiple", auth, deleteMultipleBanners);

// Delete Banner by ID
bannerV1Router.delete("/:id", auth, deleteBanner);

// Get Banner by ID
bannerV1Router.get("/:id", getBannerById);

// Update Banner
bannerV1Router.put(
  "/updateBanner/:id",
  auth,
  upload.array("images"),
  updateBanner
);

export default bannerV1Router;
