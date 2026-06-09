import fetch from "node-fetch";

import {
  accountPermissionEnum,
  authRoleEnum,
  subscriptionTypeEnum,
} from "../../config/enum.js";
import { errorResponse, successResponse } from "../../helper/apiResponse.js";
import { isExist } from "../../helper/isExist.js";
import AccountModel from "../account/model.js";
import UserModel from "../user/model.js";
import GroupModel from "./model.js";
import { sendMail } from "../../helper/nodeMailer.js";
import { generateToken } from "../../helper/jwtToken.js";

const populate = [
  {
    path: "createBy",
    select: "avatar email username",
  },
  { path: "members", select: "user account" },
  {
    path: "members.user",
    select: "avatar email username",
  },
  {
    path: "members.accounts.account",
    select: "title",
  },
];

class controller {
  static create = async (req, res) => {
    try {
      const user = req.user;
      const count = await GroupModel.countDocuments({
        createBy: req.user._id,
      });

      if (count >= 1) {
        return errorResponse({
          res,
          message: "User can only create one group",
        });
      }

      const userAccounts = await AccountModel.find({ user: user._id })
        .select("_id")
        .lean();

      req.body.createBy = req.user._id;
      req.body.members = [
        {
          isActive: false,
          user: user._id,
          accounts: userAccounts.map((account) => ({
            account: account._id,
            permission: accountPermissionEnum.ADMIN_ACCESS,
          })),
        },
      ];

      const doc = await GroupModel.create(req.body);

      const result = await GroupModel.findById(doc._id).populate(populate);

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "user added to group successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "post.create",
      });
    }
  };

  static get = async (req, res) => {
    try {
      const groups = await GroupModel.find({
        $or: [{ createBy: req.user._id }, { "members.user": req.user._id }],
      })
        .populate({
          path: "createBy",
          select: "_id username avatar email",
        })
        .lean();

      // const result = groups.map((group) => {
      //   const member = group.members.find(
      //     (member) => member.user.toString() === req.user._id.toString()
      //   );

      //   return {
      //     title: group.title,
      //     createBy: group.createBy,
      //     isActive: member ? member.isActive : false,
      //   };
      // });

      return successResponse({
        res,
        statusCode: 200,
        data: groups,
        message: "fetch group successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "group.get",
      });
    }
  };

  static getDetails = async (req, res) => {
    const { id } = req.params;
    try {
      await isExist(res, id, GroupModel);
      const result = await GroupModel.findOne({
        _id: id,
        $or: [
          { createBy: req.user._id },
          { members: { $elemMatch: { user: req.user._id } } },
        ],
      }).populate(populate);

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "fetch group details successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "group.getDetails",
      });
    }
  };

  static switchGroup = async (req, res) => {
    const { id } = req.params;

    try {
      await GroupModel.updateMany(
        { "members.user": req.user._id },
        { $set: { "members.$[elem].isActive": false } },
        { arrayFilters: [{ "elem.user": req.user._id }] }
      );

      if (id) {
        await GroupModel.findOneAndUpdate(
          { _id: id, "members.user": req.user._id },
          { $set: { "members.$.isActive": true } },
          { new: true }
        );
      }

      return successResponse({
        res,
        statusCode: 200,
        // data: id,
        message: "User switch group successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "patch.switchGroup",
      });
    }
  };

  static addToGroup = async (req, res) => {
    try {
      const subscriptionType = req.user?.subscriptionType;

      const { email, accounts } = req.body;
      const user = await UserModel.findOne({ email: email }).select("_id");

      // Check user can share account
      if (
        subscriptionType !== subscriptionTypeEnum.PREMIUM &&
        subscriptionType !== subscriptionTypeEnum.PROMO_CODE &&
        req.user.role !== authRoleEnum.ADMIN
      ) {
        return errorResponse({
          res,
          statusCode: 403,
          message: "Free tier users can not share accounts with other users",
        });
      }

      const { id } = req.params;

      const group = await GroupModel.findById(id);

      if (!group) {
        return errorResponse({
          res,
          statusCode: 404,
          message: "Group not exist",
        });
      }

      if (String(group.createBy) !== String(req.user._id))
        return errorResponse({
          res,
          message: "You don't have permission to add members to this group",
        });

      if (!user) {
        const token = await generateToken({
          email: email,
          groupId: id,
          accounts: accounts,
        });

        // Create deep link
        const linkRes = await fetch(
          "https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyBdrZMwPIL48P8_lP1JuAOEiSooTc6pv98",
          {
            method: "post",
            body: JSON.stringify({
              dynamicLinkInfo: {
                domainUriPrefix: "https://walletsync.page.link",
                link: `https://walletsync-web.vercel.app/invite?token=${token}`,
                androidInfo: {
                  androidPackageName: "com.walletsync.expensemanager",
                },
                iosInfo: {
                  iosBundleId: "com.walletsync.expensemanager",
                  iosAppStoreId: "6608966569",
                },
                navigationInfo: {
                  enableForcedRedirect: true,
                },
              },
              suffix: {
                option: "SHORT",
              },
            }),
          }
        );

        const linkJsonRes = await linkRes.json();

        const deepLink = linkJsonRes.shortLink;

        console.log({ deepLink, token });

        // Send deep link to email
        await sendMail({
          to: email,
          subject: "You're Invited! Create Your Account Today",
          dynamicData: {
            email: email,
            link: deepLink,
          },
          filename: "registerInvite.html",
        });

        await successResponse({
          res,
          message: `Invitation mail send successfully to ${email}`,
        });

        return;
      }

      const existingMember = group.members.find(
        (member) => String(member.user) === String(user._id)
      );

      if (existingMember) {
        // req.body.accounts.forEach((newAccount) => {
        //   const existingAccount = existingMember.accounts.find(
        //     (account) => String(account.account) === String(newAccount.account)
        //   );
        //   if (!existingAccount) {
        //     existingMember.accounts.push(newAccount);
        //   } else {
        //     existingAccount.permission = newAccount.permission;
        //   }
        // });

        errorResponse({
          res,
          statusCode: 400,
          message: "User already added in group",
        });

        return;
      } else {
        group.members.push({
          user: user._id,
          accounts: req.body.accounts,
        });
      }

      await group.save();

      const result = await GroupModel.findById(id).populate(populate).lean();

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "User added to group successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "post.addToGroup",
      });
    }
  };

  static removeToGroup = async (req, res) => {
    const { id, user } = req.params;
    try {
      const doc = await isExist(res, id, GroupModel);

      if (String(doc.createBy) !== String(req.user._id))
        return errorResponse({
          res,
          message: "You don't have permission to remove members to this group",
        });

      const record = doc.members.find(
        (item) => String(item.user) === String(user)
      );

      const result = await GroupModel.findByIdAndUpdate(
        id,
        {
          $pull: { members: record },
        },
        { new: true }
      ).populate(populate);

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "User remove from group successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "post.removeToGroup",
      });
    }
  };

  static leaveFromGroup = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const existingGroup = await GroupModel.findById(id).lean();

      if (!existingGroup) {
        return errorResponse({
          res,
          message: "Group not exists",
          statusCode: 404,
        });
      }

      await GroupModel.updateOne(
        { _id: id },
        {
          $pull: { members: { user: userId } },
        }
      );

      return successResponse({
        res,
        statusCode: 200,
        data: {
          _id: id,
        },
        message: "User left from group successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "post.leaveFromGroup",
      });
    }
  };

  static patch = async (req, res) => {
    const { id } = req.params;
    try {
      const doc = await isExist(res, id, GroupModel);

      if (String(doc.createBy) !== String(req.user._id))
        return errorResponse({
          res,
          message: "You don't have permission to update this group",
        });

      const result = await GroupModel.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true }
      ).populate(populate);

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "group update successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "post.addToGroup",
      });
    }
  };

  static delete = async (req, res) => {
    const { id } = req.params;
    try {
      const doc = await isExist(res, id, GroupModel);

      if (String(doc.createBy) !== String(req.user._id))
        return errorResponse({
          res,
          message: "You don't have permission to delete this group",
        });

      await GroupModel.findByIdAndDelete(id);

      return successResponse({
        res,
        statusCode: 200,
        data: id,
        message: "group delete successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "group.delete",
      });
    }
  };

  static changePermission = async (req, res) => {
    try {
      const { groupId } = req.params;
      const { email, accounts } = req.body;

      const doc = await isExist(res, groupId, GroupModel);

      if (String(doc.createBy) !== String(req.user._id)) {
        return errorResponse({
          res,
          message:
            "You don't have permission to change permission for this group",
        });
      }

      const user = await UserModel.findOne({ email: req.body.email }).select(
        "_id"
      );

      if (!user) return errorResponse({ res, message: "User dose not exist" });

      const result = await GroupModel.findOneAndUpdate(
        {
          _id: groupId,
          "members.user": user._id,
        },
        {
          $set: {
            "members.$.accounts": accounts,
          },
        },
        { new: true }
      ).populate(populate);

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "group permission change successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "group.changePermission",
      });
    }
  };
}
export default controller;
