import mongoose from "mongoose";

const mongooseSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    color: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

mongooseSchema.index({ title: 1, user: 1 }, { unique: true });
mongooseSchema.index({ user: 1 });
const LabelModel = mongoose.model("Label", mongooseSchema);

export default LabelModel;
