import moment from "moment";
import { agenda } from "../../config/agenda.js";
import {
  budgetPeriodEnum,
  budgetRolloverUserResponse,
  budgetStatusType,
} from "../../config/enum.js";
import BudgetModel from "../budget/model.js";

const createNewRolloverBudget = async (ob) => {
  const budget = new BudgetModel();

  budget.name = ob.name;
  budget.createdBy = ob.createdBy;
  budget.rollover = {
    generatedAmount: ob.remainingAmount > 0 ? ob.remainingAmount : 0,
    acceptedAmount: 0,
    userResponse: budgetRolloverUserResponse.PENDING,
  };
  budget.period = ob.period;
  budget.maxAmount = ob.maxAmount;
  budget.remainingAmount = ob.maxAmount;
  budget.headCategories = ob.headCategories.map((hc) => {
    return {
      headCategory: hc.headCategory,
      maxAmount: hc.maxAmount,
      remainingAmount: hc.maxAmount,
      spendLimitType: hc.spendLimitType,
      categories: hc.categories.map((c) => {
        return {
          category: c.category,
          maxAmount: c.maxAmount,
          remainingAmount: c.maxAmount,
          spendLimitType: c.spendLimitType,
        };
      }),
    };
  });
  budget.accounts = ob.accounts;
  budget.prevBudget = ob._id;

  await budget.save();

  // ========================
  // Mark old budget as close
  // ========================
  ob.status = budgetStatusType.CLOSE;
  ob.nextBudget = budget._id;
  await ob.save();

  console.log(`Budget rollover >> ${ob._id} >> ${budget._id} `);
};

const handleOnDailyCron = async () => {
  try {
    const budgets = await BudgetModel.find({
      status: budgetStatusType.OPEN,
    });

    for (const budget of budgets) {
      try {
        const now = moment();
        const createdAt = moment(budget.createdAt);

        if (budget.period === budgetPeriodEnum.WEEKLY) {
          if (now.diff(createdAt, "weeks") >= 1) {
            console.log(
              `Budget ${budget.name} >> cron >> creating new rollover budget`
            );
            await createNewRolloverBudget(budget);
            continue;
          }
        } else if (budget.period === budgetPeriodEnum.MONTHLY) {
          if (now.diff(createdAt, "months") >= 1) {
            console.log(
              `Budget ${budget.name} >> cron >> creating new rollover budget`
            );
            await createNewRolloverBudget(budget);
            continue;
          }
        } else if (budget.period === budgetPeriodEnum.YEARLY) {
          if (now.diff(createdAt, "years") >= 1) {
            console.log(
              `Budget ${budget.name} >> cron >> creating new rollover budget`
            );
            await createNewRolloverBudget(budget);
            continue;
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    console.log("Cron >> Budget >> All budget rollover checked successfully");
  } catch (error) {
    console.log(error);
  }
};

handleOnDailyCron();
agenda.define("dailyCron", handleOnDailyCron);
