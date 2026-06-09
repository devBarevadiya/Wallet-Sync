import {
  accountPermissionEnum,
  analyticsTypeEnum,
  authRoleEnum,
  budgetStatusType,
} from "../../config/enum.js";
import {
  errorResponse,
  successResponse,
  validateResponse,
} from "../../helper/apiResponse.js";

import HeadCategoryModel from "../category/headCategoryModel.js";
import { isExist } from "../../helper/isExist.js";
import {
  analyzeBalanceTrend,
  analyzeBudget,
  analyzeCashFlow,
  analyzeCashFlowTable,
  analyzeCurrency,
  analyzeLastRecords,
  analyzeMostCostlyExpenses,
  analyzePlanned,
  analyzeReport,
  analyzeReportDetails,
  analyzeSpending,
  analyzeTotalBalance,
} from "../dashboard/helper.js";
import { AuthErrorObj } from "../../middleware/verifyMiddleware.js";
import { populate as transactionPopulate } from "../transaction/controller.js";
import moment from "moment";

class controller {
  static getAnalytics = async (req, res) => {
    try {
      const {
        accounts,
        LAST_RECORD,
        SPENDING,
        CURRENCY,
        TOTAL_BALANCE,
        BALANCE_TREND,
        CASH_FLOW,
        CASH_FLOW_TABLE,
        REPORT,
        REPORT_DETAILS,
        BUDGET,
        PLANNED,
        COSTLY_EXPENSES,
      } = req.body;

      const group = req.group;
      const reqUser = req.user;

      let accountIds = [];

      const groupAccountIds = req.group.accounts
        .filter((item) => item.permission !== accountPermissionEnum.NO_ACCESS)
        .map((item) => String(item._id));

      if (accounts?.length > 0) {
        for (const accountId of groupAccountIds) {
          if (accounts.includes(accountId)) {
            accountIds.push(accountId);
          }
        }
      } else {
        accountIds.push(...groupAccountIds);
      }

      const chartNames = [];
      const promises = [];
      const responseData = {};

      if (LAST_RECORD?.include) {
        chartNames.push(analyticsTypeEnum.LAST_RECORD);
        promises.push(
          analyzeLastRecords({
            accountIds,
            fromDate: LAST_RECORD?.parameters?.fromDate,
            toDate: LAST_RECORD?.parameters?.toDate,
            labels: LAST_RECORD?.parameters?.labels,
            transactionPopulate,
          })
        );
      }

      if (SPENDING?.include) {
        chartNames.push(analyticsTypeEnum.SPENDING);
        promises.push(
          analyzeSpending({
            accountIds: accountIds,
            fromDate: SPENDING?.parameters?.fromDate,
            toDate: SPENDING?.parameters?.toDate,
            labels: SPENDING?.parameters?.labels,
          })
        );
      }

      if (CURRENCY?.include) {
        chartNames.push(analyticsTypeEnum.CURRENCY);
        promises.push(
          analyzeCurrency({
            accountIds,
          })
        );
      }

      if (TOTAL_BALANCE?.include) {
        chartNames.push(analyticsTypeEnum.TOTAL_BALANCE);
        promises.push(
          analyzeTotalBalance({
            accountIds,
          })
        );
      }

      if (BALANCE_TREND?.include) {
        chartNames.push(analyticsTypeEnum.BALANCE_TREND);
        promises.push(
          analyzeBalanceTrend({
            accountIds,
            fromDate: BALANCE_TREND?.parameters?.fromDate,
            toDate: BALANCE_TREND?.parameters?.toDate,
          })
        );
      }

      if (CASH_FLOW?.include) {
        chartNames.push(analyticsTypeEnum.CASH_FLOW);
        promises.push(
          analyzeCashFlow({
            accountIds,
            fromDate: CASH_FLOW?.parameters?.fromDate,
            toDate: CASH_FLOW?.parameters?.toDate,
          })
        );
      }

      if (CASH_FLOW_TABLE?.include) {
        chartNames.push(analyticsTypeEnum.CASH_FLOW_TABLE);
        promises.push(
          analyzeCashFlowTable({
            accountIds,
            fromDate: CASH_FLOW_TABLE?.parameters?.fromDate,
            toDate: CASH_FLOW_TABLE?.parameters?.toDate,
          })
        );
      }

      if (REPORT?.include) {
        chartNames.push(analyticsTypeEnum.REPORT);

        promises.push(
          analyzeReport({
            group: req.group,
            accountIds,
            fromDate: REPORT?.parameters?.fromDate,
            toDate: REPORT?.parameters?.toDate,
            labels: REPORT?.parameters?.labels,
          })
        );
      }

      if (REPORT_DETAILS?.include) {
        const headCategoryId = REPORT_DETAILS?.parameters?.headCategoryId;

        const doc = await isExist(res, headCategoryId, HeadCategoryModel);

        if (
          req.user.role !== authRoleEnum.ADMIN &&
          String(doc.user) !== String(req.user._id)
        ) {
          return validateResponse(res, AuthErrorObj);
        }

        chartNames.push(analyticsTypeEnum.REPORT_DETAILS);
        promises.push(
          analyzeReportDetails({
            headCategoryId,
            fromDate: REPORT_DETAILS?.parameters?.fromDate,
            toDate: REPORT_DETAILS?.parameters?.toDate,
            labels: REPORT_DETAILS?.parameters?.labels,
          })
        );
      }

      if (BUDGET?.include) {
        chartNames.push(analyticsTypeEnum.BUDGET);

        const filter = {
          status: budgetStatusType.OPEN,
        };

        const inGroup = group._id;

        if (inGroup) {
          // const filteredAccountIds = group.accounts
          //   .filter(
          //     (item) => item.permission !== accountPermissionEnum.NO_ACCESS
          //   )
          //   .map((item) => String(item._id));

          filter.accounts = {
            $not: { $elemMatch: { $nin: accountIds } },
          };
        } else {
          filter.createdBy = reqUser._id;
        }

        if (BUDGET?.parameters?.period) {
          filter.period = BUDGET.parameters.period;
        }

        if (BUDGET?.parameters?.fromDate) {
          if (!filter.createdAt) filter.createdAt = {};
          filter.createdAt.$gte = moment(
            BUDGET?.parameters?.fromDate,
            "YYYY-MM-DD"
          )
            .startOf("day")
            .toDate();
        }

        if (BUDGET?.parameters?.toDate) {
          if (!filter.createdAt) filter.createdAt = {};
          filter.createdAt.$lte = moment(
            BUDGET?.parameters?.toDate,
            "YYYY-MM-DD"
          )
            .endOf("day")
            .toDate();
        }

        promises.push(analyzeBudget(filter));
      }

      if (PLANNED?.include) {
        chartNames.push(analyticsTypeEnum.PLANNED);
        promises.push(
          analyzePlanned({
            fromDate: PLANNED?.parameters?.fromDate,
            toDate: PLANNED?.parameters?.toDate,
            accountIds: accountIds,
          })
        );
      }

      if (COSTLY_EXPENSES?.include) {
        chartNames.push(analyticsTypeEnum.COSTLY_EXPENSES);
        promises.push(
          analyzeMostCostlyExpenses({
            accountIds: accountIds,
            transactionPopulate,
            fromDate: COSTLY_EXPENSES?.parameters?.fromDate,
            toDate: COSTLY_EXPENSES?.parameters?.toDate,
            labels: COSTLY_EXPENSES?.parameters?.labels,
          })
        );
      }

      const results = await Promise.all(promises);

      for (let i = 0; i < chartNames.length; i++) {
        responseData[chartNames[i]] = results[i];
      }

      return successResponse({
        res,
        statusCode: 200,
        data: responseData,
        message: "Analytics fetched successfully",
      });
    } catch (error) {
      console.log(error);
      return errorResponse({
        res,
        error,
        funName: "getAnalytics",
      });
    }
  };
}
export default controller;
