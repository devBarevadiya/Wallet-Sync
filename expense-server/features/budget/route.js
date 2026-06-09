import express from "express";
import controller from "./controller.js";
import validate from "./validate.js";
import { verifyUser } from "../../middleware/verifyMiddleware.js";

const route = express.Router();

route.post("/", verifyUser, validate.create, controller.create);
route.post("/get-all", verifyUser, validate.get, controller.get);

route.post(
  "/:budgetId/head-category",
  verifyUser,
  validate.addHeadCategory,
  controller.addHeadCategory
);
route.post(
  "/:budgetId/head-category/:headCategoryId/add-category",
  verifyUser,
  validate.addCategory,
  controller.addCategory
);
route.post(
  "/:budgetId/get-transactions",
  verifyUser,
  validate.getTransactionsForBudget,
  controller.getTransactionsForBudget
);

route.get("/:budgetId", verifyUser, controller.getDetails);

route.delete("/:budgetId", verifyUser, controller.delete);

route.patch(
  "/:budgetId/rollover",
  verifyUser,
  validate.patchRollover,
  controller.patchRollover
);
route.patch("/:budgetId", verifyUser, validate.patch, controller.patch);

export default route;
