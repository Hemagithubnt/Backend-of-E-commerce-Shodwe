import mongoose from "mongoose";

const productSizeSchema = mongoose.Schema(
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
    
  },
  {
    timestamps: true,
  }
);

const ProductSizeModel = mongoose.model("ProductSize", productSizeSchema);

export default ProductSizeModel;