import mongoose from "mongoose";

const bannerV1Schema = mongoose.Schema(
  {
    bannerTitle: {
      type: String,
      required: [true, "Banner title is required"],
      trim: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
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
    price: {
      type: Number,
      default: 0,
      min: [0, "Price cannot be negative"],
    },
      userId: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
          },
     alignInfo: {
      type: String,
      default: '',
      required: true
    },

  },
  {
    timestamps: true,
  }
);

const BannerV1Model = mongoose.model("BannerV1", bannerV1Schema);

export default BannerV1Model;
