import { Router } from "express";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import {
  createProduct,
  deleteProduct,
  getAllFeaturedProducts,
  getAllProducts,
  getAllProductsByCatId,
  getAllProductsByCatName,
  getAllProductsByPrice,
  getAllProductsByRating,
  getAllProductsBySubCatId,
  getAllProductsBySubCatName,
  getAllProductsByThirdLevelSubCatId,
  getAllProductsByThirdLevelSubCatName,
  getProductsCount,
  getSingleProduct,
  removeImageFromCloudinary,
  updateProduct,
} from "../controllers/product.controller.js";

const productRouter = Router();
productRouter.post(
  "/createProduct",
  auth,
  upload.array("images"),
  createProduct
);
productRouter.get("/getAllProducts", getAllProducts);
productRouter.get("/getAllProductsByCatId/:id", getAllProductsByCatId);
productRouter.get("/getAllProductsByCatName", getAllProductsByCatName);
productRouter.get("/getAllProductsBySubCatId/:id", getAllProductsBySubCatId);
productRouter.get("/getAllProductsBySubCatName", getAllProductsBySubCatName);
productRouter.get(
  "/getAllProductsByThirdLevelSubCatId/:id",
  getAllProductsByThirdLevelSubCatId
);
productRouter.get(
  "/getAllProductsByThirdLevelSubCatName",
  getAllProductsByThirdLevelSubCatName
);
productRouter.get("/getAllProductsByPrice", getAllProductsByPrice);
productRouter.get("/getAllProductsByRating", getAllProductsByRating);
productRouter.get("/getAllProductsCount", getProductsCount);
productRouter.get("/getAllFeaturedProducts", getAllFeaturedProducts);
productRouter.delete("/:id", deleteProduct);
productRouter.get("/:id", getSingleProduct);
productRouter.delete("/deleteImage",auth, removeImageFromCloudinary);
productRouter.put("/updateProduct/:id",auth, updateProduct);


export default productRouter;
