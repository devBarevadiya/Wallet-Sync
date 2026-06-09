import { emitter } from "../../config/emitter.js";
import CategoryModel from "./model.js";

emitter.on("transaction", async (transaction) => {
  try {
    await CategoryModel.updateOne(
      {
        _id: transaction.category,
      },
      {
        $inc: { usageCount: 1 },
      }
    ).lean();
  } catch (error) {
    console.error(error);
  }
});
