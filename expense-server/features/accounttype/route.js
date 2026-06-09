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
    permission: permissions.POST_ACCOUNT_TYPE,
  }),
  validate.create,
  controller.create
);
route.get(
  "/",
  verifyUser,
  checkAuthorization({
    permission: permissions.GET_ACCOUNT_TYPE,
  }),
  controller.get
);

route.delete(
  "/:id?",
  verifyUser,
  checkAuthorization({
    permission: permissions.DELETE_ACCOUNT_TYPE,
  }),
  controller.delete
);
route.patch(
  "/:id",
  verifyUser,
  checkAuthorization({
    permission: permissions.PATCH_ACCOUNT_TYPE,
  }),
  validate.patch,
  controller.patch
);

export default route;
