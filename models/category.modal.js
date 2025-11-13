import mongoose from "mongoose";

const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  images: [
    {
      type: String,
    },
  ],
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
  parentCatName: {
    type: String,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null,
  },
}, { timestamps: true });

const CategoryModel = mongoose.model("Category", categorySchema);

export default CategoryModel;
