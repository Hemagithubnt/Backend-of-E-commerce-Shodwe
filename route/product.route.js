import { Router } from "express";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import {
  createProduct,
  createProductRAMS,
  createProductSize,
  createProductWeight,
  deleteMultipleProduct,
  deleteMultipleProductRAMS,
  deleteMultipleProductSize,
  deleteMultipleProductWeight,
  deleteProduct,
  deleteProductRAMS,
  deleteProductSize,
  deleteProductWeight,
  filterProducts,
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
  getProductRAMS,
  getProductRAMSById,
  getProductsCount,
  getProductSize,
  getProductSizeById,
  getProductWeight,
  getProductWeightById,
  getSingleProduct,
  removeImageFromCloudinary,
  sortBy,
  updateProduct,
  updateProductRAMS,
  updateProductsize,
  updateProductWeight,
} from "../controllers/product.controller.js";

const productRouter = Router();

productRouter.post(
  "/createProduct",
  auth,
  // CHANGED: accept both images[] and bannerImages[]
  upload.fields([
    { name: "images", maxCount: 20 },         // existing product images
    { name: "bannerImages", maxCount: 20 },   // NEW: banner images
  ]),
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
productRouter.delete("/deleteMultiple", deleteMultipleProduct);
productRouter.delete("/:id", deleteProduct);
productRouter.get("/:id", getSingleProduct);
productRouter.delete("/deleteImage", auth, removeImageFromCloudinary);

// ADD MULTER MIDDLEWARE TO UPDATE ROUTE
productRouter.put(
  "/updateProduct/:id",
  auth,
  // CHANGED: accept both images[] and bannerImages[]
  upload.fields([
    { name: "images", maxCount: 20 },         // existing product images
    { name: "bannerImages", maxCount: 20 },   // NEW: banner images
  ]),
  updateProduct
);

// ProductRAMS based Routes
productRouter.post("/productRAMS/create", auth, createProductRAMS);
productRouter.delete("/deleteMultipleProductRAMS", deleteMultipleProductRAMS);
productRouter.delete("/productRAMS/:id", deleteProductRAMS);
productRouter.put("/updateProductRAMS/:id", auth, updateProductRAMS);
productRouter.get("/ProductRAMS/get", getProductRAMS);
productRouter.get("/ProductRAMS/:id", getProductRAMSById);

// ProductWeight based Routes
productRouter.post("/productWeight/create", auth, createProductWeight);
productRouter.delete("/deleteMultipleProductWeight", deleteMultipleProductWeight);
productRouter.delete("/productWeight/:id", deleteProductWeight);
productRouter.put("/updateProductWeight/:id", auth, updateProductWeight);
productRouter.get("/ProductWeight/get", getProductWeight);
productRouter.get("/ProductWeight/:id", getProductWeightById);

// ProductSize based Routes
productRouter.post("/productSize/create", auth, createProductSize);
productRouter.delete("/deleteMultipleProductSize", deleteMultipleProductSize);
productRouter.delete("/productSize/:id", deleteProductSize);
productRouter.put("/updateProductSize/:id", auth, updateProductsize);
productRouter.get("/ProductSize/get", getProductSize);
productRouter.get("/ProductSize/:id", getProductSizeById);

// filter 
productRouter.post("/filterProducts", filterProducts);
//sortBy 
productRouter.post("/sortBy", sortBy);

export default productRouter;
