import mongoose from "mongoose";

const productRAMSSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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