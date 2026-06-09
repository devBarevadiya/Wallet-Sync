import express from "express";
import controller from "./controller.js";
import validate from "./validate.js";

const route = express.Router();

route.post("/revenue-cat", validate.revenueCat, controller.revenueCat);
route.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  controller.stripe
);

export default route;
