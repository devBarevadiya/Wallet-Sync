import mongoose from "mongoose";

const mongooseSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    initialBalance: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    currency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Currency",
      required: true,
    },
    accountType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountType",
      required: true,
    },
    accountNumber: {
      type: String,
    },
    color: { type: String, required: true },
    isArchive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

mongooseSchema.index({ title: 1, user: 1 }, { unique: true });
mongooseSchema.index({ user: 1 });

const AccountModel = mongoose.model("Account", mongooseSchema);

async function updateMissingFields() {
  try {
    await AccountModel.updateMany(
      { initialBalance: { $exists: false } },
      { $set: { initialBalance: 0 } }
    );

    console.log("[INFO] Account Missing fields updated successfully.");
  } catch (error) {
    console.error(error);
  }
}

// Run the update function
updateMissingFields();

export default AccountModel;
