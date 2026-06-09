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
    permission: permissions.POST_TRANSACTION,
  }),
  validate.create,
  controller.create
);

route.get(
  "/",
  verifyUser,
  checkAuthorization({
    permission: permissions.GET_TRANSACTION,
  }),
  validate.get,
  controller.get
);

route.get("/filter-options", verifyUser, controller.getFilterOptions);

route.get(
  "/head/:id",
  verifyUser,
  checkAuthorization({
    permission: permissions.GET_TRANSACTION,
  }),
  controller.getByHead
);

route.get(
  "/category/:id",
  verifyUser,
  checkAuthorization({
    permission: permissions.GET_TRANSACTION,
  }),
  controller.getByCategory
);

route.get(
  "/details/:id",
  verifyUser,
  checkAuthorization({
    permission: permissions.GET_TRANSACTION,
  }),
  controller.getDetails
);

route.patch(
  "/:id",
  verifyUser,
  checkAuthorization({
    permission: permissions.PATCH_TRANSACTION,
  }),
  validate.patch,
  controller.patch
);

route.delete(
  "/",
  verifyUser,
  checkAuthorization({
    permission: permissions.DELETE_MANY_TRANSACTION,
  }),
  validate.deleteMany,
  controller.deleteMany
);

route.delete(
  "/:id",
  verifyUser,
  checkAuthorization({
    permission: permissions.DELETE_TRANSACTION,
  }),
  controller.delete
);

export default route;
