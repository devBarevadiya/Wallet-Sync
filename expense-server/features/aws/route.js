import express from "express";

import validate from "./validate.js";
import { controller } from "./controller.js";
import multer from "multer";
const route = express.Router();

const upload = multer();

route.post("/s3/presignedURL", validate.create, controller.getPresignedURL);
route.post("/store", upload.single("file"), validate.store, controller.store);

export default route;
