import HomeSliderModel from "../models/homeSlider.model.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Upload images to Cloudinary
export async function uploadImages(request, response) {
  try {
    const imagesArr = [];
    const image = request.files;

    if (!image || image.length === 0) {
      return response.status(400).json({
        message: "No images provided",
        error: true,
        success: false,
      });
    }

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    };

    for (let i = 0; i < image.length; i++) {
      const result = await cloudinary.uploader.upload(image[i].path, options);
      imagesArr.push(result.secure_url);

      try {
        fs.unlinkSync(image[i].path);
      } catch (err) {
        console.error("Error deleting temp file:", err);
      }
    }

    return response.status(200).json({
      images: imagesArr,
      success: true,
    });
  } catch (error) {
    console.error("Error uploading images:", error);
    return response.status(500).json({
      message: error.message || "Error uploading images",
      error: true,
      success: false,
    });
  }
}

// Add Home Slide
export async function addHomeSlide(request, response) {
  try {
    const { images } = request.body;
    const userId = request.user._id;

    if (!userId) {
      return response.status(401).json({
        message: "You must be logged in to create banners",
        success: false,
        error: true,
      });
    }

    if (!images || images.length === 0) {
      return response.status(400).json({
        message: "At least one image is required",
        success: false,
        error: true,
      });
    }

    let slide = new HomeSliderModel({
      images: images,
      userId: userId,
    });

    slide = await slide.save();

    return response.status(200).json({
      message: "Slide created successfully",
      data: slide,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error creating slider:", error);
    return response.status(500).json({
      message: error.message || "Error creating slider",
      error: true,
      success: false,
    });
  }
}

// Get all slides
export async function getHomeSlides(request, response) {
  try {
    const slides = await HomeSliderModel.find()
      .populate("userId", "name email role")
      .sort({ createdAt: -1 });

    return response.status(200).json({
      success: true,
      error: false,
      data: slides,
    });
  } catch (error) {
    console.error("Error fetching slides:", error);
    return response.status(500).json({
      message: error.message || "Error fetching slides",
      error: true,
      success: false,
    });
  }
}

//  Get single slide
export async function getSingleHomeSlide(request, response) {
  try {
    const { id } = request.params;

    const slide = await HomeSliderModel.findById(id).populate(
      "userId",
      "name email role"
    );

    if (!slide) {
      return response.status(404).json({
        message: "Slide not found",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      success: true,
      error: false,
      data: slide,
    });
  } catch (error) {
    console.error("Error fetching slide:", error);
    return response.status(500).json({
      message: error.message || "Error fetching slide",
      error: true,
      success: false,
    });
  }
}

//  Update slide
export async function updateSlide(request, response) {
  try {
    const { id } = request.params;
    const { images } = request.body;
    const currentUser = request.user;

    const slide = await HomeSliderModel.findById(id);

    if (!slide) {
      return response.status(404).json({
        message: "Slide not found",
        success: false,
        error: true,
      });
    }

    const isOwner = slide.userId.toString() === currentUser._id.toString();
    const isAdmin = currentUser.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return response.status(403).json({
        message: "You don't have permission to edit this slide",
        success: false,
        error: true,
      });
    }

    if (!images || images.length === 0) {
      return response.status(400).json({
        message: "At least one image is required",
        success: false,
        error: true,
      });
    }

    const updatedSlide = await HomeSliderModel.findByIdAndUpdate(
      id,
      { images: images },
      { new: true }
    );

    return response.status(200).json({
      message: "Slide updated successfully",
      data: updatedSlide,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error updating slider:", error);
    return response.status(500).json({
      message: error.message || "Error updating slider",
      error: true,
      success: false,
    });
  }
}

//  Delete single slide
export async function DeleteSlide(request, response) {
  try {
    const { id } = request.params;
    const currentUser = request.user;

    const slide = await HomeSliderModel.findById(id);

    if (!slide) {
      return response.status(404).json({
        message: "Slide not found",
        success: false,
        error: true,
      });
    }

    const isOwner = slide.userId.toString() === currentUser._id.toString();
    const isAdmin = currentUser.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return response.status(403).json({
        message: "You don't have permission to delete this slide",
        success: false,
        error: true,
      });
    }

    await HomeSliderModel.findByIdAndDelete(id);

    return response.status(200).json({
      message: "Slide deleted successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error deleting slider:", error);
    return response.status(500).json({
      message: error.message || "Error deleting slider",
      error: true,
      success: false,
    });
  }
}

//  Delete multiple slides
export async function deleteMultipleSlide(request, response) {
  try {
    const { ids } = request.body;
    const currentUser = request.user;
    const isAdmin = currentUser.role === "ADMIN";

    if (!ids || ids.length === 0) {
      return response.status(400).json({
        message: "No slides selected",
        success: false,
        error: true,
      });
    }

    if (isAdmin) {
      await HomeSliderModel.deleteMany({ _id: { $in: ids } });
      return response.status(200).json({
        message: "Slides deleted successfully",
        success: true,
        error: false,
      });
    }

    const slides = await HomeSliderModel.find({ _id: { $in: ids } });
    const ownSlides = slides.filter(
      (slide) => slide.userId.toString() === currentUser._id.toString()
    );

    if (ownSlides.length === 0) {
      return response.status(403).json({
        message: "You don't own any of the selected slides",
        success: false,
        error: true,
      });
    }

    const ownSlideIds = ownSlides.map((slide) => slide._id);
    await HomeSliderModel.deleteMany({ _id: { $in: ownSlideIds } });

    return response.status(200).json({
      message: `Deleted ${ownSlideIds.length} of ${ids.length} selected slides`,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error deleting multiple slides:", error);
    return response.status(500).json({
      message: error.message || "Error deleting slides",
      error: true,
      success: false,
    });
  }
}

// ✅ Remove image from Cloudinary
export async function removeImageFromCloudinary(request, response) {
  try {
    const { imageUrl } = request.body;

    if (!imageUrl) {
      return response.status(400).json({
        message: "Image URL is required",
        success: false,
        error: true,
      });
    }

    const urlParts = imageUrl.split("/");
    const publicIdWithExt = urlParts[urlParts.length - 1];
    const publicId = publicIdWithExt.split(".")[0];

    await cloudinary.uploader.destroy(publicId);

    return response.status(200).json({
      message: "Image deleted from Cloudinary successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    return response.status(500).json({
      message: error.message || "Error deleting image",
      error: true,
      success: false,
    });
  }
}
