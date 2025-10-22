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

//upload images on cloudinary
var imagesArr = [];
export async function uploadImages(request, response) {
  try {
    imagesArr = [];

    const image = request.files;

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    };

    for (let i = 0; i < image?.length; i++) {
      const img = await cloudinary.uploader.upload(
        image[i].path,
        options,
        function (error, result) {
          imagesArr.push(result.secure_url);
          fs.unlinkSync(`uploads/${request.files[i].filename}`);
        }
      );
    }

    return response.status(200).json({
      images: imagesArr,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Error uploading avatar",
      error: true,
      success: false,
    });
  }
}

// Add HomeSlide
export async function addHomeSlide(request, response) {
  try {
    let slide = new HomeSliderModel({
      images: imagesArr,
    });

    if (!slide) {
      return response.status(500).json({
        message: "Slide is not created",
        success: false,
        error: true,
      });
    }

    slide = await slide.save();

    imagesArr = [];

    return response.status(200).json({
      message: "Slide created",
      data: slide,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error(" Error creating slider:", error);
    return response.status(500).json({
      message: error.message || "Error creating slider",
      error: true,
      success: false,
    });
  }
}

// 2. GET ALL - Fetch all slides
export async function getHomeSlides(request, response) {
  try {
    const slides = await HomeSliderModel.find();

    if (!slides) {
      return response.status(404).json({
        message: "Slides not found",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      success: true,
      error: false,
      data: slides,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Error fetching sliders",
      error: true,
      success: false,
    });
  }
}

// 3. GET SINGLE - Fetch one slider by ID
export async function getSingleHomeSlide(request, response) {
  try {
    const Slide = await HomeSliderModel.findById(request.params.id);

    if (!Slide) {
      return response.status(404).json({
        message: "Slider not found",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      data: Slide,
    });
  } catch (error) {
    console.error("❌ Error fetching single slider:", error);
    return response.status(500).json({
      message: error.message || "Error fetching slider",
      error: true,
      success: false,
    });
  }
}

//remove image from cloudinary for any user
export async function removeImageFromCloudinary(request, response) {
  const imgUrl = request.query.img;
  const urlArr = imgUrl.split("/");
  const image = urlArr[urlArr.length - 1];

  const imageName = image.split(".")[0];

  if (imageName) {
    const res = await cloudinary.uploader.destroy(
      imageName,
      (error, result) => {
        // console.log(error,res)
      }
    );
    if (res) {
      response.status(200).send(res);
    }
  }
}

// 5. DELETE SINGLE - Delete slider from DB & Cloudinary
export async function DeleteSlide(request, response) {
  try {
    const slide = await HomeSliderModel.findById(request.params.id);
    const images = slide.images;
    let img = "";
    for (img of images) {
      const imgUrl = img;
      const urlArr = imgUrl.split("/");
      const image = urlArr[urlArr.length - 1];

      const imageName = image.split(".")[0];
      if (imageName) {
        cloudinary.uploader.destroy(imageName, (error, result) => {
          //console.log(error,res)
        });
      }
    }

    const deletedSlide = await HomeSliderModel.findByIdAndDelete(
      request.params.id
    );
    if (!deletedSlide) {
      return response.status(404).json({
        message: "Slide not found",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      message: "Slide deleted successfully!",
      success: true,
      error: false,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Internal server error",
      success: false,
      error: true,
    });
  }
}

// Update HomeSlide 
// Update the existing updateSlide function
export async function updateSlide(request, response) {
  try {
    const { images } = request.body;

    if (!images || images.length === 0) {
      return response.status(400).json({
        message: "At least one image is required",
        success: false,
        error: true,
      });
    }

    const slide = await HomeSliderModel.findByIdAndUpdate(
      request.params.id,
      { images: images },
      { new: true }
    );

    if (!slide) {
      return response.status(404).json({
        message: "Slide cannot be updated!",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      message: "Slide updated successfully",
      success: true,
      error: false,
      data: slide,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Internal server error",
      success: false,
      error: true,
    });
  }
}

// 6. DELETE MULTIPLE - Delete multiple sliders
export async function deleteMultipleSlide(request, response) {
 
    const { ids } = request.body;

    if (!ids || !Array.isArray(ids)) {
      return response.status(400).json({
        success: false,
        error: true,
        message: "No IDs provided",
      });
    }

    // Delete images from Cloudinary for each slider
    for (let i = 0; i < ids.length; i++) {
      const slide = await HomeSliderModel.findById(ids[i]);
      const images = slide.images;
      let img = "";
      for (img of images) {
        const imgUrl = img;
        const urlArr = imgUrl.split("/");
        const image = urlArr[urlArr.length - 1];

        const imageName = image.split(".")[0];
        if (imageName) {
          cloudinary.uploader.destroy(imageName, (error, result) => {
            //console.log(error,res)
          });
        }
      }
    }

    // Delete from database
     try {
       await HomeSliderModel.deleteMany({ _id: { $in: ids } });
    return response.status(200).json({
      message: "Slides deleted successfully!",
      success: true,
      error: false,
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      error: true,
      message: error.message || "Server error",
    });
  }
}
