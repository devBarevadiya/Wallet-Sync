import slugify from "slugify";
import {
  errorResponse,
  successResponse,
  validateResponse,
} from "../../helper/apiResponse.js";
import { paginationDetails, paginationFun } from "../../helper/common.js";
import { isExist } from "../../helper/isExist.js";
import { awsS3 } from "../aws/helper/awsS3.controller.js";
import BlogModel from "./model.js";

class controller {
  static create = async (req, res) => {
    try {
      const { title } = req.body;

      const existingBlog = await BlogModel.findOne({ title: title });

      if (existingBlog) {
        return errorResponse({
          res,
          statusCode: 400,
          message: "Blog title is taken or not available",
        });
      }

      req.body = {
        ...req.body,
        user: req.user._id,
        slug: slugify(title, { lower: true, strict: true }),
      };

      const blog = await BlogModel.create(req.body);

      return successResponse({
        res,
        statusCode: 201,
        data: { _id: blog._id },
        message: "Blog created successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "create blog",
      });
    }
  };

  static checkTitleAvailable = async (req, res) => {
    try {
      const { title } = req.query;

      const documentCount = await BlogModel.countDocuments({ title });

      return successResponse({
        res,
        statusCode: 200,
        message: "Blog title availability checked successfully",
        data: {
          isTaken: documentCount > 0,
        },
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "get checkTitleAvailable",
      });
    }
  };

  static update = async (req, res) => {
    try {
      const { slug } = req.params;
      const { image, title } = req.body;

      const existingBlog = await BlogModel.findOne({ slug });

      if (!existingBlog) {
        return errorResponse({
          res,
          statusCode: 404,
          message: "Blog not exist",
        });
      }

      if (title && existingBlog.title !== title) {
        const existingBlog = await BlogModel.findOne({ title });

        if (existingBlog) {
          return errorResponse({
            res,
            statusCode: 400,
            message: "Blog title is not available",
          });
        }

        req.body.slug = slugify(title, { lower: true, strict: true });
      }

      if (
        image &&
        existingBlog.image &&
        existingBlog.image !== req.body.image
      ) {
        await awsS3.deleteFile({ fileName: existingBlog.image });
      }

      await BlogModel.findByIdAndUpdate(existingBlog._id, req.body);

      return successResponse({
        res,
        statusCode: 200,
        data: { _id: existingBlog._id },
        message: "Blog updated successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "update blog",
      });
    }
  };

  static delete = async (req, res) => {
    try {
      const { id } = req.params;

      const blog = await isExist(res, id, BlogModel);

      if (blog.image) {
        await awsS3.deleteFile({ fileName: blog.image });
      }

      await BlogModel.findByIdAndDelete(id);

      return successResponse({
        res,
        statusCode: 200,
        data: { _id: id },
        message: "Blog deleted successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "delete blog",
      });
    }
  };

  static getSummary = async (req, res) => {
    try {
      const { skip, limit } = paginationFun(req.query);

      const blogs = await BlogModel.find()
        .select("title description image slug createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const count = await BlogModel.countDocuments();

      const pagination = paginationDetails({
        limit: limit,
        page: req.query.page,
        totalItems: count,
      });

      return successResponse({
        res,
        statusCode: 200,
        pagination: pagination,
        data: blogs,
        message: "Blog fetch successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "get blog",
      });
    }
  };

  static getDetails = async (req, res) => {
    try {
      const { slug } = req.params;

      const existingBlog = await BlogModel.findOne({ slug })
        .select("-updatedAt -user")
        .lean();

      if (!existingBlog) {
        return errorResponse({
          res,
          message: "Blog not exists",
          statusCode: 404,
        });
      }

      return successResponse({
        res,
        statusCode: 200,
        data: existingBlog,
        message: "Blog fetch successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "get blog",
      });
    }
  };
}
export default controller;
