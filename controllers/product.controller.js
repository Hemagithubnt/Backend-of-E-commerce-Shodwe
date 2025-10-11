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

// COMBINED API - Upload images + Create/Update Product
export async function createProduct(request, response) {
  try {
    const files = request.files || [];
    const { productId } = request.body; // Optional - for updating existing product
    const imagesArr = [];

    // 🔹 Step 1: Upload images to Cloudinary (if any)
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const result = await cloudinary.uploader.upload(files[i].path, {
          use_filename: true,
          unique_filename: false,
          overwrite: false,
        });
        imagesArr.push(result.secure_url);

        // Clean up local file
        fs.unlinkSync(files[i].path);
      }
    }

    let product;

    // 🔹 Step 2: Create or Update Product
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

    // 🔹 Step 3: Parse array fields SAFELY (FIX FOR NESTED ARRAYS)
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

      // Parse size
      if (request.body.size) {
        if (Array.isArray(request.body.size)) {
          size = request.body.size;
        } else if (typeof request.body.size === "string") {
          const parsed = JSON.parse(request.body.size);
          size = Array.isArray(parsed) ? parsed : [];
        }
      }

      // Parse productWeight
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
      // Keep empty arrays if parsing fails
    }

    console.log("✅ Parsed Arrays:", { productRam, size, productWeight });

    // 🔹 Step 4: Update product fields
    product.name = request.body.name || product.name;
    product.description = request.body.description || product.description;
    product.brand = request.body.brand || product.brand;
    product.price = request.body.price || product.price;
    product.oldPrice = request.body.oldPrice || product.oldPrice;
    product.catName = request.body.catName || product.catName;
    product.category = request.body.category || product.category;
    product.subCatId = request.body.subCatId || product.subCatId;
    product.CatId = request.body.CatId || product.CatId;
    product.subCat = request.body.subCat || product.subCat;
    product.thirdsubCat = request.body.thirdsubCat || product.thirdsubCat;
    product.thirdsubCatId = request.body.thirdsubCatId || product.thirdsubCatId;
    product.countInStock = request.body.countInStock || product.countInStock;
    product.rating = request.body.rating || product.rating;
    product.isFeatured = request.body.isFeatured || product.isFeatured;
    product.discount = request.body.discount || product.discount;

    // CRITICAL FIX: Assign parsed arrays (not raw request.body values)
    product.productRam =
      productRam.length > 0 ? productRam : product.productRam || [];
    product.size = size.length > 0 ? size : product.size || [];
    product.productWeight =
      productWeight.length > 0 ? productWeight : product.productWeight || [];

    // 🔹 Step 5: Add new images to existing images
    if (imagesArr.length > 0) {
      product.images = [...(product.images || []), ...imagesArr];
    }

    // 🔹 Step 6: Save to database
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
      .populate("category")
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
      .populate("category")
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
      .populate("category")
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
      .populate("category")
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
      .populate("category")
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
      .populate("category")
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
      .populate("category")
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
    }).populate("category");

    productList = productListArr;
  }

  if (request.query.subCatId !== "" && request.query.subCatId !== undefined) {
    const productListArr = await ProductModel.find({
      subCatId: request.query.subCatId,
    }).populate("category");

    productList = productListArr;
  }

  if (
    request.query.thirdsubCatId !== "" &&
    request.query.thirdsubCatId !== undefined
  ) {
    const productListArr = await ProductModel.find({
      thirdsubCatId: request.query.thirdsubCatId,
    }).populate("category");

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
      product.price > parseInt(request.query.maxPrice) // ✅ FIXED (was < before)
    ) {
      return false;
    }
    return true;
  });

  return response.status(200).json({
    error: false,
    success: true,
    products: filteredProducts,
    totalPages: 0, // ✅ you can later replace with pagination if needed
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
      .populate("category")
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
      .populate("category")
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
    }).populate("category");

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
  const product = await ProductModel.findById(request.params.id).populate(
    "category"
  );
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
export async function deleteMultipleProduct(req, res) {
  try {
    const idsParam = req.query.ids;
    if (!idsParam) {
      return res
        .status(400)
        .json({ success: false, error: true, message: "No IDs provided" });
    }
    const ids = idsParam.split(",").map((id) => id.trim());
    if (!ids.length) {
      return res
        .status(400)
        .json({ success: false, error: true, message: "Invalid IDs" });
    }
    // Delete from Cloudinary, then from DB
    await Promise.all(
      ids.map(async (id) => {
        const prod = await ProductModel.findById(id);
        if (prod?.images) {
          await Promise.all(
            prod.images.map((url) => {
              const name = url.split("/").pop().split(".")[0];
              return cloudinary.uploader.destroy(name);
            })
          );
        }
      })
    );
    const { deletedCount } = await ProductModel.deleteMany({
      _id: { $in: ids },
    });
    if (!deletedCount) {
      return res
        .status(404)
        .json({ success: false, error: true, message: "No products deleted" });
    }
    return res
      .status(200)
      .json({
        success: true,
        error: false,
        message: `${deletedCount} deleted`,
      });
  } catch (err) {
    console.error("❌ deleteMultipleProduct error:", err);
    return res
      .status(500)
      .json({
        success: false,
        error: true,
        message: err.message || "Server error",
      });
  }
}

//get single product
export async function getSingleProduct(request, response) {
  try {
    const product = await ProductModel.findById(request.params.id).populate(
      "category"
    );

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

//Update productDetails
export async function updateProduct(request, response) {
  try {
    console.log("📦 Update Request Body:", request.body); // Debug

    const files = request.files || [];
    const imagesArr = [];

    // Step 1: Upload new images to Cloudinary
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        try {
          const result = await cloudinary.uploader.upload(files[i].path, {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
          });
          imagesArr.push(result.secure_url);
          fs.unlinkSync(files[i].path);
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          if (fs.existsSync(files[i].path)) {
            fs.unlinkSync(files[i].path);
          }
        }
      }
    }

    // Step 2: Parse JSON arrays SAFELY with validation
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
    } catch (e) {
      console.log("productRam parse error:", e);
      productRam = [];
    }

    try {
      if (
        request.body.size &&
        request.body.size !== "undefined" &&
        request.body.size !== "[]"
      ) {
        const parsed = JSON.parse(request.body.size);
        size = Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      console.log("size parse error:", e);
      size = [];
    }

    try {
      if (
        request.body.productWeight &&
        request.body.productWeight !== "undefined" &&
        request.body.productWeight !== "[]"
      ) {
        const parsed = JSON.parse(request.body.productWeight);
        productWeight = Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      console.log("productWeight parse error:", e);
      productWeight = [];
    }

    console.log(" Parsed Arrays:", { productRam, size, productWeight }); // Debug

    // Step 3: Get existing product
    const existingProduct = await ProductModel.findById(request.params.id);
    if (!existingProduct) {
      return response.status(404).json({
        message: "Product not found",
        success: false,
        error: true,
      });
    }

    // Step 4: Parse existing images
    let existingImages = [];
    try {
      if (request.body.existingImages) {
        existingImages = JSON.parse(request.body.existingImages);
      }
    } catch (e) {
      existingImages = existingProduct.images || [];
    }

    // Step 5: Combine images
    const allImages = [...existingImages, ...imagesArr];

    //  Step 6: Build update object - CRITICAL FIXES
    const updateData = {
      name: request.body.name,
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
      productRam: productRam,
      size: size,
      productWeight: productWeight,
    };

    //  CRITICAL FIX: Handle category ObjectId properly
    if (
      request.body.CatId &&
      request.body.CatId !== "undefined" &&
      request.body.CatId !== "[object Object]" &&
      mongoose.Types.ObjectId.isValid(request.body.CatId)
    ) {
      updateData.category = request.body.CatId; // ✅ Use CatId as category ObjectId
    }

    // Step 7: Update product
    const product = await ProductModel.findByIdAndUpdate(
      request.params.id,
      updateData,
      { new: true, runValidators: false } // ✅ Disable validators for update
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

// (1) These are controller related to ProductRAMS----

// Create New ProductRAMS
export async function createProductRAMS(request, response) {
  try {
    let productRAMS = new productRAMSModel({
      name: request.body.name,
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
        message: "No IDs provided" 
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
    const productRAMS = await productRAMSModel.findByIdAndUpdate(  // ✅ FIX: Remove "new" keyword, add "await"
      request.params.id,
      {  // ✅ FIX: Add opening brace
        name: request.body.name,
      },
      { new: true }  // Return updated document
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
      data: productRAMS,  // ✅ Return updated data
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
      data: productRAM
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
      data: productRAM
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
      data: productWeight
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
        message: "No IDs provided" 
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
      data: productWeight
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
      data: productWeight
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
      data: productSize
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
        message: "No IDs provided" 
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
      data: productSize
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
      data: productSize
    });

  } catch (error) {
    return response.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
}

