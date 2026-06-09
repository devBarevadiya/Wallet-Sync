import {
  authRoleEnum,
  categoryIconTypeEnum,
  categoryNatureEnum,
  subscriptionTypeEnum,
} from "../../config/enum.js";
import {
  errorResponse,
  successResponse,
  validateResponse,
} from "../../helper/apiResponse.js";
import { isExist } from "../../helper/isExist.js";
import { AuthErrorObj } from "../../middleware/verifyMiddleware.js";
import CategoryModel from "./model.js";
import HeadCategoryModel from "./headCategoryModel.js";
import { awsS3 } from "../aws/helper/awsS3.controller.js";
import { countCustomCategoryAndHeadCategory } from "./helper.js";
import UserModel from "../user/model.js";

class controller {
  static create = async (req, res) => {
    try {
      const user = req.user;
      const { id } = req.params;

      const existingHeadCategory = await HeadCategoryModel.findById(id);

      if (!existingHeadCategory) {
        return errorResponse({
          res,
          statusCode: 404,
          message: "Head category not found",
        });
      }

      const subscriptionType = user?.subscriptionType;

      // Check limit for create custom category
      if (
        subscriptionType !== subscriptionTypeEnum.PREMIUM &&
        subscriptionType !== subscriptionTypeEnum.PROMO_CODE &&
        user.role !== authRoleEnum.ADMIN
      ) {
        const count = await countCustomCategoryAndHeadCategory(user._id);

        if (count >= 5) {
          return errorResponse({
            res,
            statusCode: 403,
            message: "Free tier users are limited up to 5 custom categories",
          });
        }
      }

      // CREATE RECORD FOR MASTER AND OTHER USERS
      if (req.user.role === authRoleEnum.ADMIN) {
        // CREATE MASTER RECORD
        req.body.user = null;

        const existingCount = await CategoryModel.countDocuments({
          title: req.body.title,
          user: req.body.user,
        });

        if (existingCount > 0) {
          return errorResponse({
            res,
            statusCode: 400,
            message: "Category title already in use",
          });
        }

        const category = await CategoryModel.create(req.body);

        const headCategory = await HeadCategoryModel.findByIdAndUpdate(
          id,
          {
            $push: { categories: category._id },
          },
          { new: true }
        );

        // CREATE FOR OTHER USERS
        const userIdArray = await UserModel.distinct("_id", {
          role: authRoleEnum.USER,
        });

        for (const userId of userIdArray) {
          try {
            req.body.user = userId;

            const existingCount = await CategoryModel.countDocuments({
              title: req.body.title,
              user: req.body.user,
            });

            // If the category already exists for the user, skip creation
            if (existingCount > 0) {
              continue;
            }

            const category = await CategoryModel.create(req.body);

            await HeadCategoryModel.updateOne(
              {
                title: headCategory.title,
                user: req.body.user,
              },
              {
                $push: { categories: category._id },
              }
            );
          } catch (error) {
            console.error(`Error creating category for user ${userId}:`, error);
          }
        }

        return successResponse({
          res,
          statusCode: 201,
          data: category,
          message: "Category created successfully",
        });
      } else {
        // CREATE RECORD FOR GROUP USER
        req.body.user = req.group.createBy;

        const existingCount = await CategoryModel.countDocuments({
          title: req.body.title,
          user: req.body.user,
        });

        if (existingCount > 0) {
          return errorResponse({
            res,
            statusCode: 400,
            message: "Category title already in use",
          });
        }

        req.body.isCustom = true;

        const category = await CategoryModel.create(req.body);

        await HeadCategoryModel.findByIdAndUpdate(
          id,
          {
            $push: { categories: category._id },
          },
          { new: true }
        );

        return successResponse({
          res,
          statusCode: 201,
          data: category,
          message: "Category created successfully",
        });
      }
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "create.Category",
      });
    }
  };

  static createHead = async (req, res) => {
    try {
      const subscriptionType = req.user?.subscriptionType;

      // Check limit for create custom category
      if (
        subscriptionType !== subscriptionTypeEnum.PREMIUM &&
        subscriptionType !== subscriptionTypeEnum.PROMO_CODE &&
        req.user.role !== authRoleEnum.ADMIN
      ) {
        const count = await countCustomCategoryAndHeadCategory(req.user._id);

        if (count >= 5) {
          return errorResponse({
            res,
            statusCode: 403,
            message: "Free tier users are limited up to 5 custom categories",
          });
        }
      }

      const { title, icon, color, type, nature, iconType, user } = req.body;

      if (req.user.role === authRoleEnum.ADMIN) {
        // Create master head category
        req.body.user = null;

        const headCategory = new HeadCategoryModel(req.body);

        const category = await CategoryModel.create({
          title,
          icon,
          color,
          type,
          user,
          isCustom: false,
          nature: nature || categoryNatureEnum.NONE,
          iconType: iconType || categoryIconTypeEnum.ICON,
        });

        headCategory.categories.push(category._id);
        await headCategory.save();

        const userIdArray = await UserModel.distinct("_id", {
          role: authRoleEnum.USER,
        });

        for (const userId of userIdArray) {
          try {
            req.body.user = userId;

            const existingCount = await HeadCategoryModel.countDocuments({
              title: req.body.title,
              user: req.body.user,
            });

            // If the head category already exists for the user, skip creation
            if (existingCount > 0) {
              continue;
            }

            const headCategory = new HeadCategoryModel(req.body);

            const category = await CategoryModel.create({
              title,
              icon,
              color,
              type,
              user: userId,
              isCustom: false,
              nature: nature || categoryNatureEnum.NONE,
              iconType: iconType || categoryIconTypeEnum.ICON,
            });

            headCategory.categories.push(category._id);

            await headCategory.save();
          } catch (error) {
            console.error(
              `Error creating head category for user ${userId}:`,
              error
            );
          }
        }

        const data = await HeadCategoryModel.findById(headCategory._id).select(
          "-categories -user -isCustom"
        );

        return successResponse({
          res,
          statusCode: 201,
          data: data,
          message: "Head Category created successfully",
        });
      } else {
        // Create head category for group user
        req.body.user = req.group.createBy;
        req.body.isCustom = true;

        const { title, icon, color, type, nature, iconType, user } = req.body;

        const headCategory = new HeadCategoryModel(req.body);

        const category = {
          title,
          icon,
          color,
          type,
          user,
          isCustom: false,
          nature: nature || categoryNatureEnum.NONE,
          iconType: iconType || categoryIconTypeEnum.ICON,
        };

        const createdCategory = await CategoryModel.create(category);

        headCategory.categories.push(createdCategory._id);
        await headCategory.save();

        const data = await HeadCategoryModel.findById(headCategory._id).select(
          "-categories -user -isCustom"
        );

        return successResponse({
          res,
          statusCode: 201,
          data: data,
          message: "Head Category created successfully",
        });
      }
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "create.createHead",
      });
    }
  };

  static get = async (req, res) => {
    try {
      let filter = {};

      if (req.user.role !== authRoleEnum.ADMIN) {
        filter.user = req.group.createBy;
      } else {
        filter.user = null;
      }

      const categoryFields =
        "title icon iconType color nature usageCount isCustom user";

      const result = await HeadCategoryModel.find(filter)
        .select("title categories type icon isCustom user")
        .populate({
          path: "categories",
          select: categoryFields,
          match: { isDraft: false },
        });

      const mostUsed = await CategoryModel.find({
        ...filter,
        usageCount: { $gt: 0 },
      })
        .sort({ usageCount: -1 })
        .limit(12)
        .select(categoryFields);

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        mostUsed: mostUsed,
        message: "Category fetched successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "get.Category",
      });
    }
  };

  static getHead = async (req, res) => {
    try {
      let filter = {};
      if (req.user.role !== authRoleEnum.ADMIN) {
        filter.user = req.group.createBy;
      } else {
        filter.user = null;
      }

      const result = await HeadCategoryModel.find(filter).select(
        "title type icon isCustom user"
      );

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Category fetched successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "get.Category",
      });
    }
  };

  static getArchive = async (req, res) => {
    try {
      let filter = { isDraft: true };
      if (req.user.role !== authRoleEnum.ADMIN) {
        filter.user = req.group.createBy;
      } else {
        filter.user = null;
      }

      const result = await CategoryModel.find(filter).select("-user");
      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Category fetched successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "get.Category",
      });
    }
  };

  static patchHead = async (req, res) => {
    const { id } = req.params;
    try {
      const doc = await isExist(res, id, HeadCategoryModel);

      if (
        req.user.role !== authRoleEnum.ADMIN &&
        String(doc.user) !== String(req.group.createBy)
      )
        return validateResponse(res, AuthErrorObj);

      if (doc.icon && doc.icon !== req.body.icon)
        awsS3.deleteFile({ fileName: doc.icon });

      const result = await HeadCategoryModel.findByIdAndUpdate(
        id,
        {
          $set: req.body,
        },
        { new: true }
      ).select("-user -categories");

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Category updated successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "patch.Category",
      });
    }
  };

  static patch = async (req, res) => {
    const { id } = req.params;
    try {
      await isExist(res, id, CategoryModel);
      const result = await CategoryModel.findByIdAndUpdate(
        id,
        {
          $set: req.body,
        },
        { new: true }
      ).select("-user");

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Category updated successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "patch.Category",
      });
    }
  };

  static archive = async (req, res) => {
    const { id } = req.params;
    try {
      const doc = await isExist(res, id, CategoryModel);
      await CategoryModel.findByIdAndUpdate(id, {
        $set: { isDraft: !doc.isDraft },
      });

      return successResponse({
        res,
        statusCode: 200,
        message: `Documents ${
          !doc.isDraft ? "archive" : "unarchive"
        } successfully`,
        data: id,
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "archive.Category",
      });
    }
  };
}
export default controller;
