import BannerV1Model from "../models/banner.model.js";
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

// Create Banner
export async function createBanner(request, response) {
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

    const banner = new BannerV1Model({
      bannerTitle: request.body.bannerTitle,
      images: imagesArr,
      catName: request.body.catName || "",
      CatId: request.body.CatId || "",
      subCatId: request.body.subCatId || "",
      subCat: request.body.subCat || "",
      thirdsubCat: request.body.thirdsubCat || "",
      thirdsubCatId: request.body.thirdsubCatId || "",
      price: request.body.price || 0,
      alignInfo: request.body.alignInfo || '',
       userId: request.user._id,
    });

    const savedBanner = await banner.save();

    return response.status(201).json({
      message: "Banner created successfully",
      success: true,
      error: false,
      data: savedBanner,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
}

// Get All Banners
export async function getAllBanners(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10;
    const totalPosts = await BannerV1Model.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page not found",
        success: false,
        error: true,
      });
    }

    const banners = await BannerV1Model.find()
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    return response.status(200).json({
      banners: banners,
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

// Get Banner by ID
export async function getBannerById(request, response) {
  try {
    const banner = await BannerV1Model.findById(request.params.id);

    if (!banner) {
      return response.status(404).json({
        message: "Banner not found",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      banner: banner,
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

// Update Banner
export async function updateBanner(request, response) {
  try {
    const existingBanner = await BannerV1Model.findById(request.params.id);
    if (!existingBanner) {
      return response.status(404).json({
        message: "Banner not found",
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
      existingImages = existingBanner.images || [];
    }

    const allImages = [...existingImages, ...imagesArr];

    const updateData = {
      bannerTitle: request.body.bannerTitle,
      images: allImages.length > 0 ? allImages : existingBanner.images,
      catName: request.body.catName,
      CatId: request.body.CatId,
      subCatId: request.body.subCatId,
      subCat: request.body.subCat,
      thirdsubCat: request.body.thirdsubCat,
      thirdsubCatId: request.body.thirdsubCatId,
      price: request.body.price,
      alignInfo: request.body.alignInfo
    };

    const banner = await BannerV1Model.findByIdAndUpdate(
      request.params.id,
      updateData,
      { new: true, runValidators: false }
    );

    if (!banner) {
      return response.status(404).json({
        message: "Banner cannot be updated!",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      message: "Banner updated successfully",
      success: true,
      error: false,
      banner: banner,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
}

// Delete Banner by ID
export async function deleteBanner(request, response) {
  try {
    const banner = await BannerV1Model.findById(request.params.id);

    if (!banner) {
      return response.status(404).json({
        message: "Banner not found",
        success: false,
        error: true,
      });
    }

    // Delete images from Cloudinary
    if (banner.images && banner.images.length > 0) {
      for (const imageUrl of banner.images) {
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

    await BannerV1Model.findByIdAndDelete(request.params.id);

    return response.status(200).json({
      message: "Banner deleted successfully",
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

// Delete Multiple Banners
export async function deleteMultipleBanners(request, response) {
  try {
    const { ids } = request.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return response.status(400).json({
        message: "Please provide banner IDs to delete",
        success: false,
        error: true,
      });
    }

    // Get all banners to delete their images
    const banners = await BannerV1Model.find({ _id: { $in: ids } });

    // Delete images from Cloudinary
    for (const banner of banners) {
      if (banner.images && banner.images.length > 0) {
        for (const imageUrl of banner.images) {
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

    await BannerV1Model.deleteMany({ _id: { $in: ids } });

    return response.status(200).json({
      message: "Banners deleted successfully",
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

// Get Banners Count
export async function getBannersCount(request, response) {
  try {
    const count = await BannerV1Model.countDocuments();

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

// Get Banners by Category ID
export async function getBannersByCatId(request, response) {
  try {
    const banners = await BannerV1Model.find({ CatId: request.params.id }).sort({
      createdAt: -1,
    });

    return response.status(200).json({
      banners: banners,
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

// Get Banners by SubCategory ID
export async function getBannersBySubCatId(request, response) {
  try {
    const banners = await BannerV1Model.find({
      subCatId: request.params.id,
    }).sort({ createdAt: -1 });

    return response.status(200).json({
      banners: banners,
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
