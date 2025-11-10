import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    brand: {
      type: String,
      default: "",
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
      min: [0, "Price cannot be negative"],
    },
    oldPrice: {
      type: Number,
      default: 0,
      min: [0, "Old price cannot be negative"],
    },
    catName: {
      type: String,
      default: "",
      trim: true,
    },
    CatId: {
      type: String,
      default: "",
      trim: true,
    },
    subCatId: {
      type: String,
      default: "",
      trim: true,
    },
    subCat: {
      type: String,
      default: "",
      trim: true,
    },
    thirdsubCat: {
      type: String,
      default: "",
      trim: true,
    },
    thirdsubCatId: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    countInStock: {
      type: Number,
      required: [true, "Stock count is required"],
      min: [0, "Stock cannot be negative"],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot exceed 5"],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    discount: {
      type: Number,
      required: [true, "Discount is required"],
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100%"],
    },
    sale:{
      type: Number,
      default: 0
    },
    productRam: [
      {
        type: String,
        trim: true,
      },
    ],
    size: [
      {
        type: String,
        trim: true,
      },
    ],
    productWeight: [
      {
        type: String,
        trim: true,
      },
    ],
   bannerimages: 
   {
     type: [String],
     default: [] 
   },
     bannerTitleName: {
      type: String,
      trim: true,
    },
  userId: {
       type: mongoose.Schema.ObjectId,
       ref: "User",
     },
    isDisplayOnHomeBanner: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const ProductModel = mongoose.model("Product", productSchema);

export default ProductModel;
