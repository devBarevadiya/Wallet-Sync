import mongoose from "mongoose";
import BalanceHistoryModel from "../balanceHistory/model.js";

const mongooseSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String, default: "" },
    image: { type: String, required: true },
    html: { type: String, default: "" },
  },
  { timestamps: true, versionKey: false }
);

mongooseSchema.index({ createdAt: -1 });
mongooseSchema.index({ title: 1 });

const BlogModel = mongoose.model("Blog", mongooseSchema);

export default BlogModel;
