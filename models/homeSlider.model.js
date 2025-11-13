import mongoose from "mongoose";

const homeSliderSchema = new mongoose.Schema(
  {
    images: {
      type: [String],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const HomeSliderModel = mongoose.model("HomeSlider", homeSliderSchema);

export default HomeSliderModel;
