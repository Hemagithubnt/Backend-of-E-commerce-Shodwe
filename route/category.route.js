import { Router } from "express";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import { createCategory, getCategories, getcategoriesCount, getSingleCategory, getSubCategoriesWithParent, getSubcategoryCount, removeCategory, removeImageFromCloudinary, updateCategory} from "../controllers/category.controller.js";

const categoryRouter = Router();
categoryRouter.post("/uploadImagesCreateCategory",auth,upload.array("images"), createCategory);
categoryRouter.get("/",getCategories);
categoryRouter.get("/get/count",getcategoriesCount);
categoryRouter.get("/get/count/subCat",getSubcategoryCount);
categoryRouter.get("/:id",getSingleCategory);
categoryRouter.delete("/deleteImage", auth,removeImageFromCloudinary);
categoryRouter.delete("/:id", auth,removeCategory);
categoryRouter.put("/:id", auth, upload.array("images"), updateCategory);
categoryRouter.get("/subcategories", getSubCategoriesWithParent);



export default categoryRouter;