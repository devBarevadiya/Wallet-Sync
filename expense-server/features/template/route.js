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
    permission: permissions.POST_TEMPLATE,
  }),
  validate.create,
  controller.create
);
route.get(
  "/",
  verifyUser,
  checkAuthorization({
    permission: permissions.GET_TEMPLATE,
  }),
  controller.get
);
route.get(
  "/:id",
  verifyUser,
  checkAuthorization({
    permission: permissions.GET_TEMPLATE,
  }),
  controller.getDetails
);

route.delete(
  "/:id",
  verifyUser,
  checkAuthorization({
    permission: permissions.DELETE_TEMPLATE,
  }),
  controller.delete
);
route.patch(
  "/:id",
  verifyUser,
  checkAuthorization({
    permission: permissions.PATCH_TEMPLATE,
  }),
  validate.patch,
  controller.patch
);

export default route;
