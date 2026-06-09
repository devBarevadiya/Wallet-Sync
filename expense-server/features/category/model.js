import mongoose from "mongoose";
import { categoryIconTypeEnum, categoryNatureEnum } from "../../config/enum.js";

const mongooseSchema = mongoose.Schema(
  {
    title: { type: String },
    color: { type: String },
    icon: { type: String },
    iconType: {
      type: String,
      enum: Object.values(categoryIconTypeEnum),
    },
    nature: {
      type: String,
      enum: Object.values(categoryNatureEnum),
      default: categoryNatureEnum.NONE,
    },
    isDraft: { type: Boolean, default: false },
    isSaving: { type: Boolean, default: false },
    isCustom: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

mongooseSchema.index({ title: 1, user: 1 }, { unique: true });
mongooseSchema.index({ isDraft: 1, user: 1 });
mongooseSchema.index({ nature: 1 });

const CategoryModel = mongoose.model("Category", mongooseSchema);

// SYNC DB
(async () => {
  try {
    console.log("[INFO] Sync category model fields");
    await CategoryModel.updateMany(
      { usageCount: { $exists: false } },
      { $set: { usageCount: 0 } }
    );
    await CategoryModel.updateMany(
      { isCustom: { $exists: false } },
      { $set: { isCustom: false } }
    );

    console.log(`[INFO] Sync category model fields complete`);
  } catch (error) {
    console.error(error);
  }
})();

export default CategoryModel;
