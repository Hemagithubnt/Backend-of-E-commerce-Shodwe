import ProductModel from "../models/product.model.js";

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

//  COMBINED API - Upload images + Create/Update Product
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

    // 🔹 Step 3: Update product fields
    product.name = request.body.name || product.name;
    product.description = request.body.description || product.description;
    product.brand = request.body.brand || product.brand;
    product.price = request.body.price || product.price;
    product.oldPrice = request.body.oldPrice || product.oldPrice;
    product.catName = request.body.catName || product.catName;
    product.subCatId = request.body.subCatId || product.subCatId;
    product.CatId = request.body.CatId || product.CatId;
    product.subCat = request.body.subCat || product.subCat;
    product.thirdsubCat = request.body.thirdsubCat || product.thirdsubCat;
    product.thirdsubCatId = request.body.thirdsubCatId || product.thirdsubCatId;
    product.category = request.body.category || product.category;
    product.countInStock = request.body.countInStock || product.countInStock;
    product.rating = request.body.rating || product.rating;
    product.isFeatured = request.body.isFeatured || product.isFeatured;
    product.discount = request.body.discount || product.discount;
    product.productRam = request.body.productRam || product.productRam;
    product.size = request.body.size || product.size;
    product.productWeight = request.body.productWeight || product.productWeight;

    //  Step 4: Add new images to existing images
    if (imagesArr.length > 0) {
      product.images = [...(product.images || []), ...imagesArr];
    }

    //  Step 5: Save to database
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

// //  SEPARATE APIs (Alternative approach)

// export async function uploadProductImages(request, response) {
//   try {
//     const files = request.files || [];
//     const { productId } = request.body;
//     const imagesArr = [];

//     if (files.length === 0) {
//       return response.status(400).json({
//         message: "No images uploaded",
//         success: false,
//         error: true,
//       });
//     }

//     // Upload to Cloudinary
//     for (let i = 0; i < files.length; i++) {
//       const result = await cloudinary.uploader.upload(files[i].path, {
//         use_filename: true,
//         unique_filename: false,
//         overwrite: false,
//       });
//       imagesArr.push(result.secure_url);
//       fs.unlinkSync(files[i].path);
//     }

//     // ✅ If productId exists, attach to product
//     if (productId) {
//       const product = await ProductModel.findById(productId);
//       if (!product) {
//         return response.status(404).json({
//           message: "Product not found",
//           success: false,
//           error: true,
//         });
//       }
//       product.images = [...(product.images || []), ...imagesArr];
//       await product.save();

//       return response.status(200).json({
//         message: "Images uploaded and attached to product",
//         product,
//         images: imagesArr,
//         success: true,
//         error: false,
//       });
//     }

//     // ✅ If no productId, just return image URLs
//     return response.status(200).json({
//       message: "Images uploaded successfully",
//       images: imagesArr,
//       success: true,
//       error: false,
//     });

//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || "Error uploading images",
//       success: false,
//       error: true,
//     });
//   }
// }

// export async function createProductDetails(request, response) {
//   try {
//     const { productId, imageUrls } = request.body; // ✅ Accept imageUrls from frontend

//     let product;

//     if (productId) {
//       product = await ProductModel.findById(productId);
//       if (!product) {
//         return response.status(404).json({
//           message: "Product not found",
//           success: false,
//           error: true,
//         });
//       }
//     } else {
//       product = new ProductModel();
//     }

//     // Update product fields
//     product.name = request.body.name || product.name;
//     product.description = request.body.description || product.description;
//     product.brand = request.body.brand || product.brand;
//     product.price = request.body.price || product.price;
//     product.oldPrice = request.body.oldPrice || product.oldPrice;
//     product.catName = request.body.catName || product.catName;
//     product.subCatId = request.body.subCatId || product.subCatId;
//     product.CatId = request.body.CatId || product.CatId;
//     product.subCat = request.body.subCat || product.subCat;
//     product.thirdsubCat = request.body.thirdsubCat || product.thirdsubCat;
//     product.thirdsubCatId = request.body.thirdsubCatId || product.thirdsubCatId;
//     product.category = request.body.category || product.category;
//     product.countInStock = request.body.countInStock || product.countInStock;
//     product.rating = request.body.rating || product.rating;
//     product.isFeatured = request.body.isFeatured || product.isFeatured;
//     product.discount = request.body.discount || product.discount;
//     product.productRam = request.body.productRam || product.productRam;
//     product.size = request.body.size || product.size;
//     product.productWeight = request.body.productWeight || product.productWeight;

//     // ✅ Add images if provided
//     if (imageUrls && Array.isArray(imageUrls)) {
//       product.images = [...(product.images || []), ...imageUrls];
//     }

//     await product.save();

//     return response.status(200).json({
//       message: productId
//         ? "Product details updated successfully"
//         : "New product created successfully",
//       product,
//       success: true,
//       error: false,
//     });

//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || "Error creating/updating product details",
//       success: false,
//       error: true,
//     });
//   }
// }

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
      subCatId: request.params.subCatId,
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
      thirdsubCatId: request.params.thirdsubCatId,
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

//delete Product
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

    const product = await ProductModel.findByIdAndUpdate(
      request.params.id,
      {
        name: request.body.name,
        description: request.body.description,
        images: request.body.images,
        brand: request.body.brand,
        price: request.body.price,
        oldPrice: request.body.oldPrice,
        catName: request.body.catName,
        CatId: request.body.CatId,
        subCatId: request.body.subCatId,
        subCat: request.body.subCat,
        thirdsubCat: request.body.thirdsubCat,
        thirdsubCatId: request.body.thirdsubCatId,
        category: request.body.category,
        countInStock: request.body.countInStock,
        rating: request.body.rating,
        isFeatured: request.body.isFeatured,
        discount: request.body.discount,
        productRam: request.body.productRam,
        size: request.body.size,
        productWeight: request.body.productWeight,
      },
      { new: true }
    );

    if (!product) {
      return response.status(404).json({
        message: " product can not be Updated!",
        success: false,
        error: true,
        product:product
      });
    }

    let imagesArr = [];
    return response.status(200).json({
      message: "Product is Updated Successfully",
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
