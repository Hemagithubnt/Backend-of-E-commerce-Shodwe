import mongoose from "mongoose";

const productRAMSSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    dateCreated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const productRAMSModel = mongoose.model("ProductRAMS", productRAMSSchema);

export default productRAMSModel;
