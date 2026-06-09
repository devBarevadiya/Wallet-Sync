import mongoose from "mongoose";

const mongooseSchema = mongoose.Schema(
  {
    createAccountLimit: { type: Number, required: true, default: 3 },
  },
  { timestamps: true }
);

const SettingModel = mongoose.model("Setting", mongooseSchema);

export default SettingModel;
