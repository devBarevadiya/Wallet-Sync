import { PROJECT_NAME } from "../../config/env.js";
import { errorResponse, successResponse } from "../../helper/apiResponse.js";
import { awsS3 } from "./helper/awsS3.controller.js";
import { v4 as uuidv4 } from "uuid";

export class controller {
  static getPresignedURL = async (req, res) => {
    try {
      const { fileName, contentType } = req.body;

      const result = await awsS3.preSignedURL({
        fileName,
        contentType,
      });

      return successResponse({
        res,
        data: result,
        statusCode: 200,
        message: "Presigned URL fetched successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        funName: "aws.getPresignedURL",
        statusCode: 500,
        error,
      });
    }
  };

  static store = async (req, res) => {
    try {
      const { dirName } = req.body;
      const fileName = `${PROJECT_NAME}/${dirName}/${uuidv4()}.${req.file.originalname
        .split(".")
        .pop()}`;

      await awsS3.uploadFile({
        fileName,
        file: req.file.buffer,
      });

      return successResponse({
        res,
        statusCode: 201,
        message: "File put successfully",
        data: fileName,
      });
    } catch (error) {
      return errorResponse({
        res,
        funName: "aws.store",
        statusCode: 500,
        error,
      });
    }
  };
}
