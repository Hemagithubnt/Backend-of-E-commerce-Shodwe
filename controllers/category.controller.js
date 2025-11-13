import CategoryModel from "../models/category.modal.js";

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Upload image + create category in one API
//  in this API if you provide image then it saves it and if you not provide image and also provide children category without
// imagethen ok No problem then it also save or alrounder API
export async function createCategory(request, response) {
  try {
    const files = request.files || [];
    const imagesArr = [];

    // If images are provided, upload them
    if (files.length > 0) {
      const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      };

      for (let i = 0; i < files.length; i++) {
        const result = await cloudinary.uploader.upload(files[i].path, options);
        imagesArr.push(result.secure_url);
        fs.unlinkSync(files[i].path);
      }
    }

    // Create category (images can be empty array if none provided)
    const category = await CategoryModel.create({
      name: request.body.name,
      images: imagesArr,
      parentId: request.body.parentId || null,
      userId: request.user._id,
      parentCatName: request.body.parentCatName || null,
    });

    return response.status(200).json({
      message: "Category created successfully",
      category,
      success: true,
      error: false,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Error creating category",
      error: true,
      success: false,
    });
  }
}

// get Categories (with nested subcategories)
export async function getCategories(request, response) {
  try {
    const categories = await CategoryModel.find();
    const categoryMap = {};

    // 1. Initialize each category with children = []
    categories.forEach((cat) => {
      categoryMap[cat._id] = { ...cat._doc, children: [] };
    });

    // 2. Organize into hierarchy
    const rootCategories = [];
    categories.forEach((cat) => {
      if (cat.parentId) {
        if (categoryMap[cat.parentId]) {
          categoryMap[cat.parentId].children.push(categoryMap[cat._id]);
        }
      } else {
        rootCategories.push(categoryMap[cat._id]);
      }
    });

    return response.status(200).json({
      success: true,
      error: false,
      data: rootCategories,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Error fetching categories",
      error: true,
      success: false,
    });
  }
}

//get categories count
export async function getcategoriesCount(request, response) {
  try {
    const categoriesCount = await CategoryModel.countDocuments({
      parentId: undefined,
    });
    if (!categoriesCount) {
      return response.status(500).json({
        error: true,
        success: false,
      });
    } else {
      response.send({
        categoryCount: categoriesCount,
      });
    }
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Error creating category",
      error: true,
      success: false,
    });
  }
}

//get sub-categories count
export async function getSubcategoryCount(request, response) {
  try {
    const categories = await CategoryModel.find();

    if (!categories) {
      return response.status(500).json({
        error: true,
        success: false,
      });
    } else {
      const subCatList = [];
      for (let cat of categories) {
        if (cat.parentId !== undefined) {
          subCatList.push(cat);
        }
      }
      response.send({
        SubCategoryCount: subCatList.length,
      });
    }
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Error creating category",
      error: true,
      success: false,
    });
  }
}

//get single category
export async function getSingleCategory(request, response) {
  try {
    const category = await CategoryModel.findById(request.params.id);
    if (!category) {
      return response.status(500).json({
        message: "The Category with the given ID was not found ",
        error: true,
        success: false,
      });
    }
    response.status(200).send({
      error: false,
      success: true,
      category: category,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Error creating category",
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

// delete Category from database
export async function removeCategory(request, response) {
  try {
    const category = await CategoryModel.findById(request.params.id);

    if (!category) {
      return response.status(404).json({
        message: "Category not found!",
        success: false,
        error: true,
      });
    }

    // Delete all images from Cloudinary
    for (const imgUrl of category.images) {
      const urlArr = imgUrl.split("/");
      const image = urlArr[urlArr.length - 1];
      const imageName = image.split(".")[0];

      if (imageName) {
        await cloudinary.uploader.destroy(imageName);
      }
    }

    // Delete all subcategories (and their children)
    const subCategories = await CategoryModel.find({ parentId: request.params.id });

    for (const subCat of subCategories) {
      const thirdSubCategories = await CategoryModel.find({ parentId: subCat._id });

      for (const third of thirdSubCategories) {
        await CategoryModel.findByIdAndDelete(third._id);
      }

      await CategoryModel.findByIdAndDelete(subCat._id);
    }

    
    const deletedCat = await CategoryModel.findByIdAndDelete(request.params.id);

    return response.status(200).json({
      message: "Category Deleted!",
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


// Update Category 
export async function updateCategory(request, response) {
  try {
    const files = request.files || [];
    const imagesArr = [];

    // FIX: Get existing category first
    const existingCategory = await CategoryModel.findById(request.params.id);
    
    if (!existingCategory) {
      return response.status(404).json({
        message: "Category not found",
        success: false,
        error: true,
      });
    }

    // If new images are uploaded, process them
    if (files.length > 0) {
      const options = { 
        use_filename: true, 
        unique_filename: false, 
        overwrite: false 
      };
      
      for (let i = 0; i < files.length; i++) {
        const result = await cloudinary.uploader.upload(files[i].path, options);
        imagesArr.push(result.secure_url);
        fs.unlinkSync(files[i].path);
      }
    }

    // Prepare update fields
    const updateData = {
      name: request.body.name,
      parentId: request.body.parentId || null,
      parentCatName: request.body.parentCatName || null,
    };

    // FIX: If new images provided → use new, otherwise keep existing
    if (imagesArr.length > 0) {
      updateData.images = imagesArr;
    } else {
      updateData.images = existingCategory.images; //  Keep old images!
    }

    const category = await CategoryModel.findByIdAndUpdate(
      request.params.id,
      updateData,
      { new: true }
    );

    if (!category) {
      return response.status(404).json({
        message: "Category not found or cannot be updated",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      message: "Category updated successfully",
      category,
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

// Get subcategories with parent category data (for E-commerce)
export async function getSubCategoriesWithParent(request, response) {
  try {
    // Get all categories
    const allCategories = await CategoryModel.find();
    
    // Filter subcategories (those with parentId)
    const subCategories = allCategories.filter(cat => cat.parentId !== null && cat.parentId !== undefined);
    
    // Enhance each subcategory with parent category data
    const enrichedSubCategories = subCategories.map(subCat => {
      // Find parent category
      const parentCategory = allCategories.find(cat => cat._id.toString() === subCat.parentId.toString());
      
      return {
        _id: subCat._id,
        name: subCat.name, // Subcategory name
        parentCatName: subCat.parentCatName, // Parent category name
        parentId: subCat.parentId,
        images: parentCategory ? parentCategory.images : [], 
        createdAt: subCat.createdAt,
        updatedAt: subCat.updatedAt,
        parentCategory: parentCategory // Full parent data
      };
    });

    return response.status(200).json({
      success: true,
      error: false,
      data: enrichedSubCategories,
    });

  } catch (error) {
    return response.status(500).json({
      message: error.message || "Error fetching subcategories",
      error: true,
      success: false,
    });
  }
}





