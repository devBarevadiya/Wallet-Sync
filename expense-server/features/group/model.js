import mongoose from "mongoose";
import { accountPermissionEnum } from "../../config/enum.js";

const mongooseSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    icon: { type: String, default: "" },
    createBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        isActive: {
          type: Boolean,
          default: false,
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        accounts: [
          {
            account: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Account",
            },
            permission: {
              type: String,
              enum: Object.values(accountPermissionEnum),
              default: accountPermissionEnum.ADMIN_ACCESS,
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

mongooseSchema.index({ createBy: 1 }, { unique: true });
const GroupModel = mongoose.model("Group", mongooseSchema);

export default GroupModel;
