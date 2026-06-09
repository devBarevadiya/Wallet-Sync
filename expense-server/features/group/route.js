import express from "express";
import controller from "./controller.js";
import validate from "./validate.js";
import { verifyUser } from "../../middleware/verifyMiddleware.js";

const route = express.Router();

route.get("/", verifyUser, controller.get);

route.get("/:id", verifyUser, controller.getDetails);

route.post("/", verifyUser, validate.create, controller.create);

route.post("/:id", verifyUser, validate.addToGroup, controller.addToGroup);

route.post("/remove/:id/:user", verifyUser, controller.removeToGroup);

route.post("/leave/:id", verifyUser, controller.leaveFromGroup);

route.patch("/switch/:id?", verifyUser, controller.switchGroup);

route.patch(
  "/:groupId/permission",
  verifyUser,
  validate.changePermission,
  controller.changePermission
);

route.patch("/:id", verifyUser, validate.patch, controller.patch);

route.delete("/:id", verifyUser, controller.delete);

export default route;
