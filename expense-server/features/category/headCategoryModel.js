import mongoose from "mongoose";
import { categoryTypeEnum } from "../../config/enum.js";

const mongooseSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    icon: { type: String, default: "" },
    color: { type: String, default: "" },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    type: {
      type: String,
      enum: Object.values(categoryTypeEnum),
      default: categoryTypeEnum.EXPENSE,
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

mongooseSchema.index({ title: 1, user: 1 }, { unique: true });
mongooseSchema.index({ user: 1 });

const HeadCategoryModel = mongoose.model("HeadCategory", mongooseSchema);

// SYNC DB
(async () => {
  try {
    console.log("[INFO] Sync head category model fields");
    await HeadCategoryModel.updateMany(
      { isCustom: { $exists: false } },
      { $set: { isCustom: false } }
    );

    console.log(`[INFO] Sync head category model fields complete`);
  } catch (error) {
    console.error(error);
  }
})();

export default HeadCategoryModel;
