import express from "express";
import controller from "./controller.js";
import validate from "./validate.js";
import { verifyUser } from "../../middleware/verifyMiddleware.js";

const route = express.Router();

route.get(
  "/subscription/:subscriptionId",
  verifyUser,
  controller.getSubscription
);

route.patch(
  "/subscription-plan",
  verifyUser,
  validate.updateSubscriptionPlan,
  controller.updateSubscriptionPlan
);

route.post(
  "/session",
  verifyUser,
  validate.createSession,
  controller.createSession
);

route.delete(
  "/subscription",
  verifyUser,
  validate.cancelSubscription,
  controller.cancelSubscription
);

export default route;
