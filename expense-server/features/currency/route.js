import express from "express";
import controller from "./controller.js";
import validate from "./validate.js";
import { verifyUser } from "../../middleware/verifyMiddleware.js";
import {
  checkAuthorization,
  permissions,
} from "../../middleware/checkAuthorization.js";

const route = express.Router();

route.post(
  "/",
  verifyUser,
  checkAuthorization({
    permission: permissions.POST_CURRENCY,
  }),
  validate.create,
  controller.create
);
route.get("/", controller.get);

route.delete(
  "/:id?",
  verifyUser,
  checkAuthorization({
    permission: permissions.DELETE_CURRENCY,
  }),
  controller.delete
);
route.patch(
  "/:id",
  verifyUser,
  checkAuthorization({
    permission: permissions.PATCH_CURRENCY,
  }),
  validate.patch,
  controller.patch
);

export default route;
