import mongoose from "mongoose";

const mongooseSchema = mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    appliedOn: { type: Date, default: null },
    expiresOn: { type: Date, default: null },
    trialDays: { type: Number, default: 7 },
    tag: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { versionKey: false, timestamps: true }
);

mongooseSchema.index({ code: 1 });
mongooseSchema.index({ user: 1 });

const PromoCodeModel = mongoose.model("PromoCode", mongooseSchema);

(async () => {
  try {
    console.log("[INFO] Sync Promo code model fields");
    await PromoCodeModel.updateMany(
      { tag: { $exists: false } },
      { $set: { tag: "" } }
    );
    console.log("[INFO] Sync Promo code model fields complete");
  } catch (error) {
    console.error(error);
  }
})();

export default PromoCodeModel;
