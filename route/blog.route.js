import { Router } from "express";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  deleteMultipleBlogs,
  getBlogsCount,
} from "../controllers/blog.controller.js";

const blogRouter = Router();

// Create Blog
blogRouter.post("/createBlog", auth, upload.array("images"), createBlog);

// Get All Blogs with Pagination
blogRouter.get("/getAllBlogs", getAllBlogs);

// Get Blogs Count
blogRouter.get("/getBlogsCount", getBlogsCount);

// Delete Multiple Blogs
blogRouter.delete("/deleteMultiple", auth, deleteMultipleBlogs);

// Delete Blog by ID
blogRouter.delete("/:id", auth, deleteBlog);

// Get Blog by ID
blogRouter.get("/:id", getBlogById);

// Update Blog
blogRouter.put("/updateBlog/:id", auth, upload.array("images"), updateBlog);

export default blogRouter;
