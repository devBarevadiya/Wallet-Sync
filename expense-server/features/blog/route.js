import express from "express";
import controller from "./controller.js";
import validate from "./validate.js";
import { verifyUser } from "../../middleware/verifyMiddleware.js";
import {
  checkAuthorization,
  permissions,
} from "../../middleware/checkAuthorization.js";

const route = express.Router();

route.get("/", controller.getSummary);
route.get("/available", controller.checkTitleAvailable);
route.get("/:slug/details", controller.getDetails);

route.post(
  "/",
  verifyUser,
  checkAuthorization({
    permission: permissions.CREATE_BLOG,
  }),
  validate.create,
  controller.create
);

route.patch(
  "/:slug",
  verifyUser,
  checkAuthorization({
    permission: permissions.UPDATE_BLOG,
  }),
  validate.update,
  controller.update
);

route.delete(
  "/:id",
  verifyUser,
  checkAuthorization({
    permission: permissions.DELETE_BLOG,
  }),
  controller.delete
);

export default route;
