import ProductModel from "../models/product.model.js";
import productRAMSModel from "../models/productRAMS.js";
import ProductWeightModel from "../models/productWeight.js";
import ProductSizeModel from "../models/productSize.js";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Upload images + Create/Update Product
export async function createProduct(request, response) {
  try {
    //  read files as a map so we can access both "images" and "bannerImages" without breaking old behavior
    const filesByField = request.files || {}; 
    const imageFiles = Array.isArray(filesByField)
      ? filesByField
      : filesByField.images || []; 
    const bannerFiles = filesByField.bannerImages || []; 

    const imagesArr = [];

    // Upload images to Cloudinary (if any)
    if (imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        const result = await cloudinary.uploader.upload(imageFiles[i].path, {
          use_filename: true,
          unique_filename: false,
          overwrite: false,
        });
        imagesArr.push(result.secure_url);

        // Clean up local file
        fs.unlinkSync(imageFiles[i].path);
      }
    }

    //  Upload banner images (if any)
    const bannerUrls = []; 
    if (bannerFiles.length > 0) {
     
      for (let i = 0; i < bannerFiles.length; i++) {
        
        const result = await cloudinary.uploader.upload(bannerFiles[i].path, {
          
          use_filename: true, 
          unique_filename: false, 
          overwrite: false, 
        }); 
        bannerUrls.push(result.secure_url); 
        fs.unlinkSync(bannerFiles[i].path); 
      } 
    } 

    let product;

    // Step 2: Create or Update Product
    const productId = request.body.productId; // NEW: safely read if client sends productId in body for upsert-like behavior
    if (productId) {
      // Update existing product
      product = await ProductModel.findById(productId);
      if (!product) {
        return response.status(404).json({
          message: "Product not found",
          success: false,
          error: true,
        });
      }

      
    } else {
      // Create new product
      product = new ProductModel();
    }

    // Step 3: Parse array fields SAFELY 
    let productRam = [];
    let size = [];
    let productWeight = [];

    try {
      // Parse productRam
      if (request.body.productRam) {
        if (Array.isArray(request.body.productRam)) {
          // Already an array - use directly
          productRam = request.body.productRam;
        } else if (typeof request.body.productRam === "string") {
          // Parse JSON string
          const parsed = JSON.parse(request.body.productRam);
          productRam = Array.isArray(parsed) ? parsed : [];
        }
      }

      //  size
      if (request.body.size) {
        if (Array.isArray(request.body.size)) {
          size = request.body.size;
        } else if (typeof request.body.size === "string") {
          const parsed = JSON.parse(request.body.size);
          size = Array.isArray(parsed) ? parsed : [];
        }
      }

      //  productWeight
      if (request.body.productWeight) {
        if (Array.isArray(request.body.productWeight)) {
          productWeight = request.body.productWeight;
        } else if (typeof request.body.productWeight === "string") {
          const parsed = JSON.parse(request.body.productWeight);
          productWeight = Array.isArray(parsed) ? parsed : [];
        }
      }
    } catch (parseError) {
      console.log(" Array parse error:", parseError);
    }

    //  Step 4: Update product fields
    product.name = request.body.name || product.name;
    product.isDisplayOnHomeBanner = request.body.isDisplayOnHomeBanner;
    product.description = request.body.description || product.description;
    product.brand = request.body.brand || product.brand;
    product.price = request.body.price || product.price;
    product.oldPrice = request.body.oldPrice || product.oldPrice;
    product.catName = request.body.catName || product.catName;
    product.category = request.body.category || product.category;
    product.userId = request.body.userId || product.userId;
    product.subCatId = request.body.subCatId || product.subCatId;
    product.CatId = request.body.CatId || product.CatId;
    product.subCat = request.body.subCat || product.subCat;
    product.thirdsubCat = request.body.thirdsubCat || product.thirdsubCat;
    product.thirdsubCatId = request.body.thirdsubCatId || product.thirdsubCatId;
    product.countInStock = request.body.countInStock || product.countInStock;
    product.rating = request.body.rating || product.rating;
    product.isFeatured = request.body.isFeatured || product.isFeatured;
    product.discount = request.body.discount || product.discount;

    // NEW: Assign banner fields (title + multiple images)
    if (typeof request.body.bannerTitleName === "string") {
      product.bannerTitleName = request.body.bannerTitleName;
    }
    if (bannerUrls.length > 0) {
      product.bannerimages = [...(product.bannerimages || []), ...bannerUrls];
    }

  
    product.productRam =
      productRam.length > 0 ? productRam : product.productRam || [];
    product.size = size.length > 0 ? size : product.size || [];
    product.productWeight =
      productWeight.length > 0 ? productWeight : product.productWeight || [];

    // Step 5: Add new images to existing images
    if (imagesArr.length > 0) {
      product.images = [...(product.images || []), ...imagesArr];
    }

    // Step 6: Save to database
    await product.save();

    return response.status(200).json({
      message: productId
        ? "Product updated successfully"
        : "Product created successfully",
      product,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error in createProduct:", error);
    return response.status(500).json({
      message: error.message || "Error creating/updating product",
      success: false,
      error: true,
    });
  }
}

//get All products
export async function getAllProducts(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage);
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page not found",
        success: false,
        error: true,
      });
    }

    const products = await ProductModel.find()
      .populate({ path: "category", strictPopulate: false })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      return response.status(500).json({
        message: "No products found",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      message: "Products retrieved successfully",
      success: true,
      error: false,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    return response.status(500).json({
      message: error.message || "Error retrieving products",
      success: false,
      error: true,
    });
  }
}

//get All products by CatId
export async function getAllProductsByCatId(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage);
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page not found",
        success: false,
        error: true,
      });
    }

    const products = await ProductModel.find({
      CatId: request.params.id,
    })
      .populate({ path: "category", strictPopulate: false })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      return response.status(500).json({
        message: "No products found",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      message: "Products retrieved successfully",
      success: true,
      error: false,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    return response.status(500).json({
      message: error.message || "Error retrieving products",
      success: false,
      error: true,
    });
  }
}

//get All products by Catname
export async function getAllProductsByCatName(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage);
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page not found",
        success: false,
        error: true,
      });
    }

    const products = await ProductModel.find({
      catName: request.query.catName,
    })
      .populate({ path: "category", strictPopulate: false })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      return response.status(500).json({
        message: "No products found",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      message: "Products retrieved successfully",
      success: true,
      error: false,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    return response.status(500).json({
      message: error.message || "Error retrieving products",
      success: false,
      error: true,
    });
  }
}

//get All products by SubCatId
export async function getAllProductsBySubCatId(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage);
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page not found",
        success: false,
        error: true,
      });
    }

    const products = await ProductModel.find({
      subCatId: request.params.id,
    })
      .populate({ path: "category", strictPopulate: false })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      return response.status(500).json({
        message: "No products found",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      message: "Products retrieved successfully",
      success: true,
      error: false,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    return response.status(500).json({
      message: error.message || "Error retrieving products",
      success: false,
      error: true,
    });
  }
}

//get All products by SubCatname
export async function getAllProductsBySubCatName(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage);
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page not found",
        success: false,
        error: true,
      });
    }

    const products = await ProductModel.find({
      subCat: request.query.subCat,
    })
      .populate({ path: "category", strictPopulate: false })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      return response.status(500).json({
        message: "No products found",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      message: "Products retrieved successfully",
      success: true,
      error: false,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    return response.status(500).json({
      message: error.message || "Error retrieving products",
      success: false,
      error: true,
    });
  }
}

//get All products by ThirdLevelSubCatId
export async function getAllProductsByThirdLevelSubCatId(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage);
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page not found",
        success: false,
        error: true,
      });
    }

    const products = await ProductModel.find({
      thirdsubCatId: request.params.id,
    })
      .populate({ path: "category", strictPopulate: false })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      return response.status(500).json({
        message: "No products found",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      message: "Products retrieved successfully",
      success: true,
      error: false,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    return response.status(500).json({
      message: error.message || "Error retrieving products",
      success: false,
      error: true,
    });
  }
}

//get All products by ThirdLevelSubCatname
export async function getAllProductsByThirdLevelSubCatName(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage);
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page not found",
        success: false,
        error: true,
      });
    }

    const products = await ProductModel.find({
      thirdsubCat: request.query.thirdsubCat,
    })
      .populate({ path: "category", strictPopulate: false })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products) {
      return response.status(500).json({
        message: "No products found",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      message: "Products retrieved successfully",
      success: true,
      error: false,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    return response.status(500).json({
      message: error.message || "Error retrieving products",
      success: false,
      error: true,
    });
  }
}

//get All products by Price
export async function getAllProductsByPrice(request, response) {
  let productList = [];

  if (request.query.catId !== "" && request.query.catId !== undefined) {
    const productListArr = await ProductModel.find({
      CatId: request.query.catId, // ✅ FIX: CatId (capital C) matches your schema
    }).populate({ path: "category", strictPopulate: false });

    productList = productListArr;
  }

  if (request.query.subCatId !== "" && request.query.subCatId !== undefined) {
    const productListArr = await ProductModel.find({
      subCatId: request.query.subCatId,
    }).populate({ path: "category", strictPopulate: false });

    productList = productListArr;
  }

  if (
    request.query.thirdsubCatId !== "" &&
    request.query.thirdsubCatId !== undefined
  ) {
    const productListArr = await ProductModel.find({
      thirdsubCatId: request.query.thirdsubCatId,
    }).populate({ path: "category", strictPopulate: false });

    productList = productListArr;
  }

  // ✅ FIX: Correct maxPrice logic (was wrong earlier)
  const filteredProducts = productList.filter((product) => {
    if (
      request.query.minPrice &&
      product.price < parseInt(request.query.minPrice)
    ) {
      return false;
    }
    if (
      request.query.maxPrice &&
      product.price > parseInt(request.query.maxPrice)
    ) {
      return false;
    }
    return true;
  });

  return response.status(200).json({
    error: false,
    success: true,
    products: filteredProducts,
    totalPages: 0,
    page: 0,
  });
}

//get all products by rating
export async function getAllProductsByRating(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10; // ✅ Add default value
    const requestedRating = parseFloat(request.query.rating); // ✅ Convert to number
    const catId = request.query.catId;

    //  Build dynamic filter object
    const filter = {};

    //  Add rating filter if provided
    if (!isNaN(requestedRating)) {
      filter.rating = requestedRating;
    }

    //  Add category filter if provided
    if (catId) {
      filter.CatId = catId;
    }

    console.log("Filter object:", filter);

    //  If no filters provided, return error
    if (Object.keys(filter).length === 0) {
      return response.status(400).json({
        message: "Please provide rating and/or catId parameters",
        success: false,
        error: true,
      });
    }

    //  Get total count with the same filter
    const totalPosts = await ProductModel.countDocuments(filter);
    const totalPages = Math.ceil(totalPosts / perPage);

    console.log("Total products matching filter:", totalPosts);
    console.log("Total pages:", totalPages);

    //  Check if page exists (only if there are results)
    if (totalPages > 0 && page > totalPages) {
      return response.status(404).json({
        message: "Page not found",
        success: false,
        error: true,
      });
    }

    //  Get products with the same filter
    const products = await ProductModel.find(filter)
      .populate({ path: "category", strictPopulate: false })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ rating: -1, createdAt: -1 }) // Sort by highest rating first
      .exec();

    console.log("Products retrieved:", products.length);

    //  Handle empty results properly
    if (products.length === 0) {
      return response.status(200).json({
        message: "No products found matching the criteria",
        success: true,
        error: false,
        products: [],
        totalPages: 0,
        totalProducts: 0,
        page: page,
        filters: {
          rating: requestedRating || null,
          catId: catId || null,
        },
      });
    }

    return response.status(200).json({
      message: "Products retrieved successfully",
      success: true,
      error: false,
      products: products,
      totalPages: totalPages,
      totalProducts: totalPosts, //  Added total count
      page: page,
      filters: {
        rating: requestedRating || null,
        catId: catId || null,
      },
    });
  } catch (error) {
    console.error("Error in getAllProductsByRating:", error);
    return response.status(500).json({
      message: error.message || "Error retrieving products by rating",
      success: false,
      error: true,
    });
  }
}

//  Get products by rating range (Optional)
export async function getProductsByRatingRange(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10;
    const minRating = parseFloat(request.query.minRating) || 0;
    const maxRating = parseFloat(request.query.maxRating) || 5;
    const catId = request.query.catId;

    //  Build filter with rating range
    const filter = {
      rating: { $gte: minRating, $lte: maxRating },
    };

    if (catId) {
      filter.CatId = catId;
    }

    console.log("Filter object:", filter);

    const totalPosts = await ProductModel.countDocuments(filter);
    const totalPages = Math.ceil(totalPosts / perPage);

    if (totalPages > 0 && page > totalPages) {
      return response.status(404).json({
        message: "Page not found",
        success: false,
        error: true,
      });
    }

    const products = await ProductModel.find(filter)
      .populate({ path: "category", strictPopulate: false })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ rating: -1, createdAt: -1 })
      .exec();

    if (products.length === 0) {
      return response.status(200).json({
        message: `No products found with rating between ${minRating} and ${maxRating}`,
        success: true,
        error: false,
        products: [],
        totalPages: 0,
        totalProducts: 0,
        page: page,
      });
    }

    return response.status(200).json({
      message: "Products retrieved successfully",
      success: true,
      error: false,
      products: products,
      totalPages: totalPages,
      totalProducts: totalPosts,
      page: page,
      ratingRange: {
        min: minRating,
        max: maxRating,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Error retrieving products by rating range",
      success: false,
      error: true,
    });
  }
}

//get All products count
export async function getProductsCount(request, response) {
  try {
    const productsCount = await ProductModel.countDocuments();

    if (!productsCount) {
      return response.status(500).json({
        message: error.message,
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      success: true,
      error: false,
      productsCount: productsCount,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Error retrieving products by rating range",
      success: false,
      error: true,
    });
  }
}

//get all featured Product
export async function getAllFeaturedProducts(request, response) {
  try {
    const products = await ProductModel.find({
      isFeatured: true,
    }).populate({ path: "category", strictPopulate: false });

    if (!products) {
      return response.status(500).json({
        message: "No products found",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      message: "Products retrieved successfully",
      success: true,
      error: false,
      products: products,
    });
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    return response.status(500).json({
      message: error.message || "Error retrieving products",
      success: false,
      error: true,
    });
  }
}

//delete single Product
export async function deleteProduct(request, response) {
  const product = await ProductModel.findById(request.params.id).populate({
    path: "category",
    strictPopulate: false,
  });
  if (!product) {
    return response.status(404).json({
      message: "No products found",
      success: false,
      error: true,
    });
  }

  const images = product.images;

  let img;
  for (img of images) {
    const imageUrl = img;
    const urlArr = imageUrl.split("/");
    const image = urlArr[urlArr.length - 1];

    const imageName = image.split(".")[0];

    if (imageName) {
      cloudinary.uploader.destroy(imageName, (error, result) => {
        //console.log(error, result);
      });
    }
  }

  const deleteProduct = await ProductModel.findByIdAndDelete(request.params.id);

  if (!deleteProduct) {
    return response.status(404).json({
      message: "Product not deleted!",
      success: false,
      error: true,
    });
  }

  return response.status(200).json({
    message: "Product deleted!",
    success: true,
    error: false,
  });
}

//delete multiple Product
//delete multiple Product - FIXED
export async function deleteMultipleProduct(req, res) {
  try {
        const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "No IDs provided"
      });
    }

    // Delete images from Cloudinary for each product
    await Promise.all(
      ids.map(async (id) => {
        try {
          const prod = await ProductModel.findById(id);
          if (prod?.images && Array.isArray(prod.images)) {
            await Promise.all(
              prod.images.map((url) => {
                const name = url.split("/").pop().split(".")[0];
                return cloudinary.uploader.destroy(name).catch(() => null);
              })
            );
          }
        } catch (err) {
          console.log(`Error deleting images for product ${id}:`, err.message);
        }
      })
    );

    // Delete products from database
    const { deletedCount } = await ProductModel.deleteMany({
      _id: { $in: ids }
    });

    if (deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "No products deleted"
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      message: `${deletedCount} product(s) deleted successfully`
    });

  } catch (err) {
    console.error("Error in deleteMultipleProduct:", err);
    return res.status(500).json({
      success: false,
      error: true,
      message: err.message || "Server error"
    });
  }
}

//get single product
export async function getSingleProduct(request, response) {
  try {
    const product = await ProductModel.findById(request.params.id).populate({
      path: "category",
      strictPopulate: false,
    });

    if (!product) {
      return response.status(404).json({
        message: "No products found",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      message: "Product found!",
      success: true,
      error: false,
      product: product,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message,
      success: false,
      error: true,
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

// Helper to derive Cloudinary public_id from URL if you don't store it
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

export async function updateProduct(request, response) {
  try {
    const existingProduct = await ProductModel.findById(request.params.id);
    if (!existingProduct) {
      return response.status(404).json({
        message: "Product not found",
        success: false,
        error: true,
      });
    }

    // Support both array('images') and fields
    const filesByField = request.files || {};
    const imageFiles = Array.isArray(filesByField)
      ? filesByField
      : filesByField.images || [];
    const bannerFiles = filesByField.bannerImages || [];

    // Upload product images
    const imagesArr = [];
    if (imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        try {
          const result = await cloudinary.uploader.upload(imageFiles[i].path, {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
          });
          imagesArr.push(result.secure_url);
        } catch (e) {
          console.log("Image upload failed:", e?.message);
        } finally {
          if (fs.existsSync(imageFiles[i].path))
            fs.unlinkSync(imageFiles[i].path);
        }
      }
    }

    // Upload banner images
    const bannerUrls = [];
    if (bannerFiles.length > 0) {
      for (let i = 0; i < bannerFiles.length; i++) {
        try {
          const result = await cloudinary.uploader.upload(bannerFiles[i].path, {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
          });
          bannerUrls.push(result.secure_url);
        } catch (e) {
          console.log("Banner upload failed:", e?.message);
        } finally {
          if (fs.existsSync(bannerFiles[i].path))
            fs.unlinkSync(bannerFiles[i].path);
        }
      }
    }

    // Parse arrays (same as you already had) ...
    let productRam = [];
    let size = [];
    let productWeight = [];
    try {
      if (
        request.body.productRam &&
        request.body.productRam !== "undefined" &&
        request.body.productRam !== "[]"
      ) {
        const parsed = JSON.parse(request.body.productRam);
        productRam = Array.isArray(parsed) ? parsed : [];
      }
    } catch {}
    try {
      if (
        request.body.size &&
        request.body.size !== "undefined" &&
        request.body.size !== "[]"
      ) {
        const parsed = JSON.parse(request.body.size);
        size = Array.isArray(parsed) ? parsed : [];
      }
    } catch {}
    try {
      if (
        request.body.productWeight &&
        request.body.productWeight !== "undefined" &&
        request.body.productWeight !== "[]"
      ) {
        const parsed = JSON.parse(request.body.productWeight);
        productWeight = Array.isArray(parsed) ? parsed : [];
      }
    } catch {}

    // Parse existing product images carry-over
    let existingImages = [];
    try {
      if (request.body.existingImages) {
        existingImages = JSON.parse(request.body.existingImages);
      }
    } catch {
      existingImages = existingProduct.images || [];
    }
    const allImages = [...existingImages, ...imagesArr];

    // Build updateData baseline
    const updateData = {
      name: request.body.name,
      isDisplayOnHomeBanner: request.body.isDisplayOnHomeBanner,
      description: request.body.description,
      images: allImages.length > 0 ? allImages : existingProduct.images,
      brand: request.body.brand,
      price: request.body.price,
      oldPrice: request.body.oldPrice,
      catName: request.body.catName,
      CatId: request.body.CatId,
      subCatId: request.body.subCatId,
      subCat: request.body.subCat,
      thirdsubCat: request.body.thirdsubCat,
      thirdsubCatId: request.body.thirdsubCatId,
      countInStock: request.body.countInStock,
      rating: parseFloat(request.body.rating) || 0,
      isFeatured:
        request.body.isFeatured === "true" || request.body.isFeatured === true,
      discount: request.body.discount,
      productRam,
      size,
      productWeight,
    };

    // Update banner title
    if (typeof request.body.bannerTitleName === "string") {
      updateData.bannerTitleName = request.body.bannerTitleName;
    }

    // 1) Handle individual deletions of existing banner images via deleteBannerUrls
    let deleteBannerUrls = [];
    try {
      if (request.body.deleteBannerUrls) {
        const parsed = JSON.parse(request.body.deleteBannerUrls);
        if (Array.isArray(parsed)) {
          deleteBannerUrls = parsed.filter((u) => typeof u === "string");
        }
      }
    } catch {}
    if (deleteBannerUrls.length > 0) {
      // Cloudinary destroy
      for (const url of deleteBannerUrls) {
        const publicId = getPublicIdFromUrl(url);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
            console.log("Deleted banner from Cloudinary:", publicId);
          } catch (err) {
            console.log("Cloudinary delete failed:", publicId, err?.message);
          }
        }
      }
      // Prune from DB baseline
      const baseline = Array.isArray(existingProduct.bannerimages)
        ? existingProduct.bannerimages
        : [];
      const pruned = baseline.filter((u) => !deleteBannerUrls.includes(u));
      updateData.bannerimages = pruned; // set baseline to pruned list
    } else {
      // initialize baseline if not pruned earlier
      updateData.bannerimages = Array.isArray(existingProduct.bannerimages)
        ? existingProduct.bannerimages
        : [];
    }

    // 2) Apply replace vs append for newly uploaded banners
    const shouldReplaceBanner = request.body.replaceBanner === "true";
    if (bannerUrls.length > 0) {
      if (shouldReplaceBanner) {
        // delete all old banners first (safer when replacing everything)
        for (const oldUrl of updateData.bannerimages) {
          const publicId = getPublicIdFromUrl(oldUrl);
          if (publicId) {
            try {
              await cloudinary.uploader.destroy(publicId);
            } catch {}
          }
        }
        updateData.bannerimages = bannerUrls;
      } else {
        updateData.bannerimages = [...updateData.bannerimages, ...bannerUrls];
      }
    }

    // Handle category ObjectId
    if (
      request.body.CatId &&
      request.body.CatId !== "undefined" &&
      request.body.CatId !== "[object Object]" &&
      mongoose.Types.ObjectId.isValid(request.body.CatId)
    ) {
      updateData.category = request.body.CatId;
    }

    // Save
    const product = await ProductModel.findByIdAndUpdate(
      request.params.id,
      updateData,
      { new: true, runValidators: false }
    );

    if (!product) {
      return response.status(404).json({
        message: "Product cannot be updated!",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      message: "Product is Updated Successfully",
      success: true,
      error: false,
      product,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
}
// (1) These are controller related to ProductRAMS----

// Create New ProductRAMS
export async function createProductRAMS(request, response) {
  try {
    let productRAMS = new productRAMSModel({
      name: request.body.name,
       userId: request.user._id,
    });
    productRAMS = await productRAMS.save();

    if (!productRAMS) {
      return response.status(404).json({
        message: "ProductRAMS is not Created",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      message: "ProductRAMS Created successfully!",
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

//delete single ProductRAMS
export async function deleteProductRAMS(request, response) {
  const productRAMS = await productRAMSModel.findById(request.params.id);

  if (!productRAMS) {
    return response.status(404).json({
      message: "No item found",
      success: false,
      error: true,
    });
  }

  const deleteProductRAMS = await productRAMSModel.findByIdAndDelete(
    request.params.id
  );

  if (!deleteProductRAMS) {
    return response.status(404).json({
      message: "items not deleted!",
      success: false,
      error: true,
    });
  }

  return response.status(200).json({
    message: "Product RAMS deleted!",
    success: true,
    error: false,
  });
}

//delete multiple ProductRAMS
export async function deleteMultipleProductRAMS(request, response) {
  try {
    const { ids } = request.body;

    if (!ids || !Array.isArray(ids)) {
      return response.status(400).json({
        success: false,
        error: true,
        message: "No IDs provided",
      });
    }

    await productRAMSModel.deleteMany({ _id: { $in: ids } });

    return response.status(200).json({
      success: true,
      error: false,
      message: "Product RAMS deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting multiple ProductRAMS:", error);
    return response.status(500).json({
      success: false,
      error: true,
      message: error.message || "Server error",
    });
  }
}

//Update productRAM
export async function updateProductRAMS(request, response) {
  try {
    const productRAMS = await productRAMSModel.findByIdAndUpdate(
      request.params.id,
      {
        name: request.body.name,
      },
      { new: true } // Return updated document
    );

    if (!productRAMS) {
      return response.status(404).json({
        message: "ProductRAMS not found or could not be updated!",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      message: "ProductRAMS updated successfully!",
      success: true,
      error: false,
      data: productRAMS, // ✅ Return updated data
    });
  } catch (error) {
    console.error("Error updating ProductRAMS:", error);
    return response.status(500).json({
      message: error.message || "Error updating ProductRAMS",
      success: false,
      error: true,
    });
  }
}

//Get all productRAMS
export async function getProductRAMS(request, response) {
  try {
    const productRAM = await productRAMSModel.find();
    if (!productRAM) {
      return response.status(404).json({
        message: "ProductRAMS can not be get!",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      success: true,
      error: false,
      data: productRAM,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
}

//Get Single RAMS
export async function getProductRAMSById(request, response) {
  try {
    const productRAM = await productRAMSModel.findById(request.params.id);
    if (!productRAM) {
      return response.status(404).json({
        message: "ProductRAMS can not be get!",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      success: true,
      error: false,
      data: productRAM,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
}

// (2) All Route related to ProductWeight

// Create New ProductWeight
export async function createProductWeight(request, response) {
  try {
    let productWeight = new ProductWeightModel({
      name: request.body.name,
       userId: request.user._id,
    });
    productWeight = await productWeight.save();

    if (!productWeight) {
      return response.status(404).json({
        message: "productWeight is not Created",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      message: "productWeight Created successfully!",
      success: true,
      error: false,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message,
      success: false,
      error: true,
      data: productWeight,
    });
  }
}

//delete single ProductWeight
export async function deleteProductWeight(request, response) {
  const productWeight = await ProductWeightModel.findById(request.params.id);

  if (!productWeight) {
    return response.status(404).json({
      message: "No item found",
      success: false,
      error: true,
    });
  }

  const deleteProductWeight = await ProductWeightModel.findByIdAndDelete(
    request.params.id
  );

  if (!deleteProductWeight) {
    return response.status(404).json({
      message: "items not deleted!",
      success: false,
      error: true,
    });
  }

  return response.status(200).json({
    message: "Product Weight deleted successfully!",
    success: true,
    error: false,
  });
}

//delete multiple ProductWeight
export async function deleteMultipleProductWeight(request, response) {
  try {
    const { ids } = request.body;

    if (!ids || !Array.isArray(ids)) {
      return response.status(400).json({
        success: false,
        error: true,
        message: "No IDs provided",
      });
    }

    await ProductWeightModel.deleteMany({ _id: { $in: ids } });

    return response.status(200).json({
      success: true,
      error: false,
      message: "Product Weight deleted successfully!",
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      error: true,
      message: error.message || "Server error",
    });
  }
}

//Update productWeight
export async function updateProductWeight(request, response) {
  try {
    const productWeight = await ProductWeightModel.findByIdAndUpdate(
      request.params.id,
      {
        name: request.body.name,
      },
      { new: true }
    );

    if (!productWeight) {
      return response.status(404).json({
        message: "productWeight not found or could not be updated!",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      message: "productWeight updated successfully!",
      success: true,
      error: false,
      data: productWeight,
    });
  } catch (error) {
    console.error("Error updating ProductRAMS:", error);
    return response.status(500).json({
      message: error.message || "Error updating ProductRAMS",
      success: false,
      error: true,
    });
  }
}

//Get all productWeight
export async function getProductWeight(request, response) {
  try {
    const productWeight = await ProductWeightModel.find();
    if (!productWeight) {
      return response.status(404).json({
        message: "productWeight can not be get!",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      success: true,
      error: false,
      data: productWeight,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
}

//Get Single  Weight
export async function getProductWeightById(request, response) {
  try {
    const productWeight = await ProductWeightModel.findById(request.params.id);
    if (!productWeight) {
      return response.status(404).json({
        message: "productWeight can not be get!",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      success: true,
      error: false,
      data: productWeight,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
}

// (3) All Route related to ProductSize

// Create New ProductSize
export async function createProductSize(request, response) {
  try {
    let productSize = new ProductSizeModel({
      name: request.body.name,
      userId: request.user._id,
    });
    productSize = await productSize.save();

    if (!productSize) {
      return response.status(404).json({
        message: "productWeight is not Created",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      message: "productWeight Created successfully!",
      success: true,
      error: false,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message,
      success: false,
      error: true,
      data: productSize,
    });
  }
}

//delete single ProductSize
export async function deleteProductSize(request, response) {
  const productSize = await ProductSizeModel.findById(request.params.id);

  if (!productSize) {
    return response.status(404).json({
      message: "No item found",
      success: false,
      error: true,
    });
  }

  const deleteProductSize = await ProductSizeModel.findByIdAndDelete(
    request.params.id
  );

  if (!deleteProductSize) {
    return response.status(404).json({
      message: "items not deleted!",
      success: false,
      error: true,
    });
  }

  return response.status(200).json({
    message: "Product Size deleted successfully!",
    success: true,
    error: false,
  });
}

//delete multiple Product size
export async function deleteMultipleProductSize(request, response) {
  try {
    const { ids } = request.body;

    if (!ids || !Array.isArray(ids)) {
      return response.status(400).json({
        success: false,
        error: true,
        message: "No IDs provided",
      });
    }

    await ProductSizeModel.deleteMany({ _id: { $in: ids } });

    return response.status(200).json({
      success: true,
      error: false,
      message: "Product Size deleted successfully!",
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      error: true,
      message: error.message || "Server error",
    });
  }
}

//Update productSize
export async function updateProductsize(request, response) {
  try {
    const productSize = await ProductSizeModel.findByIdAndUpdate(
      request.params.id,
      {
        name: request.body.name,
      },
      { new: true }
    );

    if (!productSize) {
      return response.status(404).json({
        message: "productSize not found or could not be updated!",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      message: "productSize updated successfully!",
      success: true,
      error: false,
      data: productSize,
    });
  } catch (error) {
    console.error("Error updating productSize:", error);
    return response.status(500).json({
      message: error.message || "Error updating productSize",
      success: false,
      error: true,
    });
  }
}

//Get all productSize
export async function getProductSize(request, response) {
  try {
    const productSize = await ProductSizeModel.find();
    if (!productSize) {
      return response.status(404).json({
        message: "productSize can not be get!",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      success: true,
      error: false,
      data: productSize,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
}

//Get Single Size
export async function getProductSizeById(request, response) {
  try {
    const productSize = await ProductSizeModel.findById(request.params.id);
    if (!productSize) {
      return response.status(404).json({
        message: "productSize can not be get!",
        success: false,
        error: true,
      });
    }

    return response.status(200).json({
      success: true,
      error: false,
      data: productSize,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
}

// --------------------------------------------------------------------------------------------------------
// some extra function filterration functions controller 
// ---------------------------------------------------------------------------------------------------------

//filter product
export async function filterProducts(request, response) {
  try {
    const {
      catId,
      subCatId,
      thirdsubCatId,
      minPrice,
      maxPrice,
      rating,
      page,
      limit,
    } = request.body;

    const filters = {};

    // ONLY add catId filter if array has items
    if (catId.length) {
      filters.CatId = { $in: catId };
    }

    if (subCatId.length) {
      filters.subCatId = { $in: subCatId };
    }

    if (thirdsubCatId.length) {
      filters.thirdsubCatId = { $in: thirdsubCatId };
    }

    if (minPrice || maxPrice) {
      filters.price = { $gte: +minPrice || 0, $lte: +maxPrice || Infinity };
    }

    if (rating?.length) {
      filters.rating = { $in: rating };
    }

    const products = await ProductModel.find(filters)
      .populate({ path: "category", strictPopulate: false })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ProductModel.countDocuments(filters);

    return response.status(200).json({
      success: true,
      error: false,
      message: "Products filtered successfully",
      products: products,
      total: total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
}

//sortItems
const sortItems = (products, sortBy, order) => {
  return products.sort((a, b) => {
    if (sortBy === "name") {
      return order === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }

    if (sortBy === "price") {
      return order === "asc" ? a.price - b.price : b.price - a.price;
    }
    return 0;
  });
};

export async function sortBy(request, response) {
  const { products, sortBy, order } = request.body;
  const sortedItems = sortItems([...products?.products], sortBy, order);

  return response.status(200).json({
    error: false,
    success: true,
    products: sortedItems,
    totalPages: 0,
    page: 0,
  });
}

// here is api for search for all products
export async function searchProductController(request, response) {
  try {
    const { query,page, limit } = request.body;
    if (!query) {
      return response.status(400).json({
        message: "Query is Required",
        success: false,
        error: true,
      });
    }

    const products = await ProductModel.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { brand: { $regex: query, $options: "i" } },
        { catName: { $regex: query, $options: "i" } },
        { subCat: { $regex: query, $options: "i" } },
        { thirdsubCat: { $regex: query, $options: "i" } },
      ],
    }).populate("category")

    const total = await products?.length;

    return response.status(200).json({
      success: true,
      error: false,
      products: products,
      total: 1,
      page: parseInt(page),
      totalPages: 1
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
}
