import mongoose from "mongoose";

const mongooseSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    icon: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

mongooseSchema.index({ user: 1 });
const NotificationModel = mongoose.model("Notification", mongooseSchema);

export default NotificationModel;
