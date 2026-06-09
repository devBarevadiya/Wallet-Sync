import mongoose from "mongoose";

const mongooseSchema = mongoose.Schema(
  {
    icon: { type: String, required: true },
    title: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const AccountTypeModel = mongoose.model("AccountType", mongooseSchema);

export default AccountTypeModel;
