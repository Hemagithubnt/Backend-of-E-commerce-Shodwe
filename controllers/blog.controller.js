import BlogModel from "../models/blog.model.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Helper to extract public_id from Cloudinary URL
function getPublicIdFromUrl(url) {
  try {
    const cleanUrl = url.split("?")[0];
    const parts = cleanUrl.split("/upload/");
    if (parts.length < 2) return null;
    const afterUpload = parts[1].replace(/^v[0-9]+\/+/, "");
    const withoutExt = afterUpload.replace(/\.[^/.]+$/, "");
    return withoutExt || null;
  } catch {
    return null;
  }
}

// Create Blog
export async function createBlog(request, response) {
  try {
    const files = request.files || [];
    const imagesArr = [];

    // Upload images to Cloudinary
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        try {
          const result = await cloudinary.uploader.upload(files[i].path, {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
          });
          imagesArr.push(result.secure_url);
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
        } finally {
          if (fs.existsSync(files[i].path)) {
            fs.unlinkSync(files[i].path);
          }
        }
      }
    }

    if (imagesArr.length === 0) {
      return response.status(400).json({
        message: "At least one image is required",
        success: false,
        error: true,
      });
    }

    const blog = new BlogModel({
      title: request.body.title,
      description: request.body.description,
      images: imagesArr,
    });

    const savedBlog = await blog.save();

    return response.status(201).json({
      message: "Blog created successfully",
      success: true,
      error: false,
      data: savedBlog,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
}

// Get All Blogs
export async function getAllBlogs(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10;
    const totalPosts = await BlogModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page not found",
        success: false,
        error: true,
      });
    }

    const blogs = await BlogModel.find()
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    return response.status(200).json({
      blogs: blogs,
      totalPages: totalPages,
      page: page,
      success: true,
      error: false,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
}

// Get Blog by ID
export async function getBlogById(request, response) {
  try {
    const blog = await BlogModel.findById(request.params.id);

    if (!blog) {
      return response.status(404).json({
        message: "Blog not found",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      blog: blog,
      success: true,
      error: false,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
}

// Update Blog
export async function updateBlog(request, response) {
  try {
    const existingBlog = await BlogModel.findById(request.params.id);
    if (!existingBlog) {
      return response.status(404).json({
        message: "Blog not found",
        success: false,
        error: true,
      });
    }

    const files = request.files || [];
    const imagesArr = [];

    // Upload new images
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        try {
          const result = await cloudinary.uploader.upload(files[i].path, {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
          });
          imagesArr.push(result.secure_url);
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
        } finally {
          if (fs.existsSync(files[i].path)) {
            fs.unlinkSync(files[i].path);
          }
        }
      }
    }

    // Parse existing images
    let existingImages = [];
    try {
      if (request.body.existingImages) {
        existingImages = JSON.parse(request.body.existingImages);
      }
    } catch (e) {
      existingImages = existingBlog.images || [];
    }

    const allImages = [...existingImages, ...imagesArr];

    const updateData = {
      title: request.body.title,
      description: request.body.description,
      images: allImages.length > 0 ? allImages : existingBlog.images,
    };

    const blog = await BlogModel.findByIdAndUpdate(
      request.params.id,
      updateData,
      { new: true, runValidators: false }
    );

    if (!blog) {
      return response.status(404).json({
        message: "Blog cannot be updated!",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      message: "Blog updated successfully",
      success: true,
      error: false,
      blog: blog,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
}

// Delete Blog by ID
export async function deleteBlog(request, response) {
  try {
    const blog = await BlogModel.findById(request.params.id);

    if (!blog) {
      return response.status(404).json({
        message: "Blog not found",
        success: false,
        error: true,
      });
    }

    // Delete images from Cloudinary
    if (blog.images && blog.images.length > 0) {
      for (const imageUrl of blog.images) {
        const publicId = getPublicIdFromUrl(imageUrl);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.log("Cloudinary delete failed:", publicId, err?.message);
          }
        }
      }
    }

    await BlogModel.findByIdAndDelete(request.params.id);

    return response.status(200).json({
      message: "Blog deleted successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
}

// Delete Multiple Blogs
export async function deleteMultipleBlogs(request, response) {
  try {
    const { ids } = request.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return response.status(400).json({
        message: "Please provide blog IDs to delete",
        success: false,
        error: true,
      });
    }

    // Get all blogs to delete their images
    const blogs = await BlogModel.find({ _id: { $in: ids } });

    // Delete images from Cloudinary
    for (const blog of blogs) {
      if (blog.images && blog.images.length > 0) {
        for (const imageUrl of blog.images) {
          const publicId = getPublicIdFromUrl(imageUrl);
          if (publicId) {
            try {
              await cloudinary.uploader.destroy(publicId);
            } catch (err) {
              console.log("Cloudinary delete failed:", publicId, err?.message);
            }
          }
        }
      }
    }

    await BlogModel.deleteMany({ _id: { $in: ids } });

    return response.status(200).json({
      message: "Blogs deleted successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
}

// Get Blogs Count
export async function getBlogsCount(request, response) {
  try {
    const count = await BlogModel.countDocuments();

    return response.status(200).json({
      count: count,
      success: true,
      error: false,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
}
