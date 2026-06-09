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
  "/head",
  verifyUser,
  checkAuthorization({
    permission: permissions.POST_CATEGORY,
  }),
  validate.createHead,
  controller.createHead
);
route.post(
  "/:id",
  verifyUser,
  checkAuthorization({
    permission: permissions.POST_CATEGORY,
  }),
  validate.create,
  controller.create
);


route.get(
  "/",
  verifyUser,
  checkAuthorization({
    permission: permissions.GET_CATEGORY,
  }),
  controller.get
);
route.get(
  "/head",
  verifyUser,
  checkAuthorization({
    permission: permissions.GET_CATEGORY,
  }),
  controller.getHead
);
route.get(
  "/archive",
  verifyUser,
  checkAuthorization({
    permission: permissions.GET_CATEGORY,
  }),
  controller.getArchive
);

route.patch(
  "/head/:id",
  verifyUser,
  checkAuthorization({
    permission: permissions.PATCH_CATEGORY,
  }),
  validate.patchHead,
  controller.patchHead
);
route.patch(
  "/archive/:id?",
  verifyUser,
  checkAuthorization({
    permission: permissions.ARCHIVE_CATEGORY,
  }),
  controller.archive
);
route.patch(
  "/:id",
  verifyUser,
  checkAuthorization({
    permission: permissions.PATCH_CATEGORY,
  }),
  validate.patch,
  controller.patch
);

export default route;
