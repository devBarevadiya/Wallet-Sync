import moment from "moment";
import { paymentStatusEnum, transactionTypeEnum } from "../../config/enum.js";
import AccountModel from "../account/model.js";
import TransactionModel from "../transaction/model.js";
import HeadCategoryModel from "../category/headCategoryModel.js";
import BalanceHistoryModel from "../balanceHistory/model.js";
import BudgetModel from "../budget/model.js";
import PlannedModel from "../planned/model.js";
import { plannedPopulate } from "../planned/controller.js";
import { budgetPopulate, budgetSelect } from "../budget/controller.js";
import PaymentModel from "../payment/model.js";

export const analyzeLastRecords = async ({
  accountIds,
  transactionPopulate,
  fromDate,
  toDate,
  labels,
}) => {
  const filter = {
    $or: [{ account: { $in: accountIds } }, { to: { $in: accountIds } }],
  };

  if (fromDate) {
    if (!filter.date) filter.date = {};
    filter.date.$gte = moment(fromDate, "YYYY-MM-DD").startOf("day").toDate();
  }

  if (toDate) {
    if (!filter.date) filter.date = {};
    filter.date.$lte = moment(toDate, "YYYY-MM-DD").endOf("day").toDate();
  }

  if (labels) {
    if (!filter.labels) filter.labels = {};
    filter.labels = { $in: labels };
  }

  const transactions = await TransactionModel.find(filter)
    .limit(3)
    .sort({ date: -1 })
    .select("-user -createdAt -updatedAt")
    .populate(transactionPopulate);

  return transactions;
};

export const analyzeSpending = async ({
  accountIds,
  fromDate,
  toDate,
  labels,
}) => {
  const filter = {
    account: { $in: accountIds },
    type: transactionTypeEnum.EXPENSE,
  };

  if (fromDate) {
    if (!filter.date) filter.date = {};
    filter.date.$gte = moment(fromDate, "YYYY-MM-DD").startOf("day").toDate();
  }

  if (toDate) {
    if (!filter.date) filter.date = {};
    filter.date.$lte = moment(toDate, "YYYY-MM-DD").endOf("day").toDate();
  }

  if (labels) {
    if (!filter.labels) filter.labels = {};
    filter.labels = { $in: labels };
  }

  const transactions = await TransactionModel.find(filter)
    .select("category amount")
    .populate([
      { path: "category", select: "title color icon" },
      { path: "currency", select: "code" },
    ]);

  const result = [];

  for (const transaction of transactions) {
    const { amount, category } = transaction;
    const totalAmount = amount;

    let findData = result.find((item) => item._id === category._id);

    if (!findData) {
      result.push({
        _id: category._id,
        title: category.title,
        color: category.color,
        amount: totalAmount,
        icon: category.icon,
      });
    } else {
      findData.amount += totalAmount;
    }
  }

  return result;
};

export const analyzeCurrency = async ({ accountIds }) => {
  const filter = { _id: { $in: accountIds } };

  const accounts = await AccountModel.find(filter)
    .populate({ path: "currency", select: "symbol currency code" })
    .lean();

  const balanceMap = {};

  accounts.forEach((account) => {
    if (account.currency) {
      const { _id } = account.currency;

      if (!balanceMap[_id]) {
        balanceMap[_id] = {
          ...account.currency,
          balance: 0,
        };
      }
      balanceMap[_id].balance += account.balance;
    }
  });

  return Object.values(balanceMap);
};

export const analyzeTotalBalance = async ({ accountIds }) => {
  const filter = {
    _id: { $in: accountIds },
  };
  const accounts = await AccountModel.find(filter).populate("currency");

  const balanceMap = {};

  accounts.forEach((account) => {
    if (account.currency) {
      const currencyCode = account.currency.code;
      if (!balanceMap[currencyCode]) {
        balanceMap[currencyCode] = 0;
      }
      balanceMap[currencyCode] += account.balance;
    }
  });

  const totalBalanceInUserCurrency = Object.values(balanceMap).reduce(
    (total, balance) => total + balance,
    0
  );

  return totalBalanceInUserCurrency;
};

export const analyzeBalanceTrend = async ({ accountIds, fromDate, toDate }) => {
  const filter = {
    account: { $in: accountIds },
  };

  if (fromDate) {
    if (!filter.createdAt) filter.createdAt = {};
    filter.createdAt.$gte = moment(fromDate, "YYYY-MM-DD")
      .startOf("day")
      .toDate();
  }

  if (toDate) {
    if (!filter.createdAt) filter.createdAt = {};
    filter.createdAt.$lte = moment(toDate, "YYYY-MM-DD").endOf("day").toDate();
  }

  const balanceHistories = await BalanceHistoryModel.find(filter)
    .select("balance createdAt")
    .sort({ createdAt: 1 })
    .lean();

  const aggregatedBalanceObj = {};

  for (const record of balanceHistories) {
    const key = moment(record.createdAt).format("YYYY-MM-DD");

    if (!aggregatedBalanceObj[key]) {
      aggregatedBalanceObj[key] = {
        date: key,
        balance: record.balance,
      };
    } else {
      aggregatedBalanceObj[key].balance += record.balance;
    }
  }

  return Object.values(aggregatedBalanceObj);
};

export const analyzeCashFlow = async ({ accountIds, fromDate, toDate }) => {
  const filter = {
    account: { $in: accountIds },
    $or: [
      { type: transactionTypeEnum.INCOME },
      { type: transactionTypeEnum.EXPENSE },
    ],
  };

  if (fromDate) {
    if (!filter.date) filter.date = {};
    filter.date.$gte = moment(fromDate, "YYYY-MM-DD").startOf("day").toDate();
  }

  if (toDate) {
    if (!filter.date) filter.date = {};
    filter.date.$lte = moment(toDate, "YYYY-MM-DD").endOf("day").toDate();
  }

  const transactions = await TransactionModel.find(filter)
    .select("-_id amount type")
    .populate([{ path: "currency", select: "code -_id" }]);

  // Calculate total balance
  const endDate = toDate
    ? moment(toDate).endOf("day").toDate()
    : moment().endOf("day").toDate();

  const entries = await BalanceHistoryModel.find({
    account: { $in: accountIds },
    createdAt: { $lte: endDate },
  }).sort({ createdAt: -1 });

  const latestBalances = new Map();

  for (const entry of entries) {
    if (!latestBalances.has(entry.account.toString())) {
      latestBalances.set(entry.account.toString(), entry.balance);
    }
  }

  const totalBalance = Array.from(latestBalances.values()).reduce(
    (sum, balance) => sum + balance,
    0
  );

  const result = {
    balance: totalBalance,
    income: 0,
    expense: 0,
  };

  for (const transaction of transactions) {
    const { amount } = transaction;

    if (transaction.type === transactionTypeEnum.INCOME) {
      result.income += amount;
    } else {
      result.expense += amount;
    }
  }

  return result;
};

export const analyzeCashFlowTable = async ({
  accountIds,
  fromDate,
  toDate,
}) => {
  const filter = {
    account: { $in: accountIds },
    $or: [
      { type: transactionTypeEnum.INCOME },
      { type: transactionTypeEnum.EXPENSE },
    ],
  };

  if (fromDate) {
    if (!filter.date) filter.date = {};
    filter.date.$gte = moment(fromDate, "YYYY-MM-DD").startOf("day").toDate();
  }

  if (toDate) {
    if (!filter.date) filter.date = {};
    filter.date.$lte = moment(toDate, "YYYY-MM-DD").endOf("day").toDate();
  }

  const transactions = await TransactionModel.find(filter)
    .select("-_id amount type")
    .populate([{ path: "currency", select: "code -_id" }]);

  const result = {
    INCOME: { count: 0, amount: 0 },
    EXPENSE: { count: 0, amount: 0 },
  };

  for (const transaction of transactions) {
    const { type, amount } = transaction;

    result[type].amount += amount;
    result[type].count++;
  }
  return result;
};

export const analyzeReport = async ({
  group,
  accountIds,
  fromDate,
  toDate,
  labels,
}) => {
  const headCategories = await HeadCategoryModel.find({
    user: group.createBy,
  }).select("categories title type icon");

  const filter = {
    user: group.createBy,
    account: { $in: accountIds },
  };

  if (fromDate) {
    if (!filter.date) filter.date = {};
    filter.date.$gte = moment(fromDate, "YYYY-MM-DD").startOf("day").toDate();
  }

  if (toDate) {
    if (!filter.date) filter.date = {};
    filter.date.$lte = moment(toDate, "YYYY-MM-DD").endOf("day").toDate();
  }

  if (labels) {
    if (!filter.labels) filter.labels = {};
    filter.labels = { $in: labels };
  }

  const transactions = await TransactionModel.find(filter)
    .select("amount currency category type  -_id")
    .populate({ path: "currency", select: "code -_id" });

  const result = {
    INCOME: { total: 0, category: [] },
    EXPENSE: { total: 0, category: [] },
  };

  for (const headCategory of headCategories) {
    let totalAmount = 0;
    const { categories } = headCategory;

    for (const categoryElem of categories) {
      const findTransaction = transactions.filter(
        (item) => String(item.category) === String(categoryElem)
      );

      for (const transactionElement of findTransaction) {
        const amount = transactionElement.amount;
        const type = transactionElement.type;

        if (type === transactionTypeEnum.INCOME) {
          totalAmount += amount;
        } else if (type === transactionTypeEnum.EXPENSE) {
          totalAmount -= amount;
        }
      }
    }

    result[headCategory.type].total += totalAmount;
    result[headCategory.type].category.push({
      _id: headCategory._id,
      amount: totalAmount,
      title: headCategory.title,
      icon: headCategory.icon,
    });
  }

  result.total = result.INCOME.total - result.EXPENSE.total;

  return result;
};

export const analyzeReportDetails = async ({
  fromDate,
  toDate,
  headCategoryId,
  labels,
}) => {
  const { categories, title } = await HeadCategoryModel.findById(headCategoryId)
    .select("categories title -_id")
    .populate({ path: "categories", select: "title icon" });

  const filter = {
    category: { $in: categories.map((item) => item._id) },
  };

  if (fromDate) {
    if (!filter.date) filter.date = {};
    filter.date.$gte = moment(fromDate, "YYYY-MM-DD").startOf("day").toDate();
  }

  if (toDate) {
    if (!filter.date) filter.date = {};
    filter.date.$lte = moment(toDate, "YYYY-MM-DD").endOf("day").toDate();
  }

  if (labels) {
    if (!filter.labels) filter.labels = {};
    filter.labels = { $in: labels };
  }

  const transactions = await TransactionModel.find(filter)
    .select("amount currency category type -_id")
    .populate([
      { path: "currency", select: "code -_id" },
      { path: "category", select: "title icon" },
    ]);

  const result = { title, category: [] };

  for (const element of categories) {
    const filteredTransactions = transactions.filter(
      (item) => String(item.category._id) === String(element._id)
    );
    let totalAmount = 0;
    for (const transaction of filteredTransactions) {
      const { amount, type } = transaction;

      if (type === transactionTypeEnum.INCOME) {
        totalAmount += amount;
      } else if (type === transactionTypeEnum.EXPENSE) {
        totalAmount -= amount;
      }
    }

    result.category.push({
      _id: element._id,
      title: element.title,
      amount: totalAmount,
      icon: element.icon,
    });
  }

  return result;
};

export const analyzeBudget = async (filter) => {
  const budgets = await BudgetModel.find(filter)
    .sort({ createdAt: -1 })
    .populate(budgetPopulate)
    .select(budgetSelect)
    .limit(3)
    .lean();

  return budgets;
};

export const analyzePlanned = async ({ accountIds, fromDate, toDate }) => {
  const filter = { account: { $in: accountIds } };

  if (fromDate) {
    if (!filter.createdAt) filter.createdAt = {};
    filter.createdAt.$gte = moment(fromDate, "YYYY-MM-DD")
      .startOf("day")
      .toDate();
  }

  if (toDate) {
    if (!filter.createdAt) filter.createdAt = {};
    filter.createdAt.$lte = moment(toDate, "YYYY-MM-DD").endOf("day").toDate();
  }

  const result = await PlannedModel.find(filter)
    .populate(plannedPopulate)
    .select("-user")
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  const plannedWithDueDates = await Promise.all(
    result.map(async (planned) => {
      const nextPayment = await PaymentModel.findOne({
        planned: planned._id,
        status: paymentStatusEnum.PENDING,
      })
        .sort({ paymentDate: 1 })
        .lean();

      if (nextPayment) {
        return {
          ...planned,
          nextPaymentDate: nextPayment.paymentDate,
        };
      } else {
        return {
          ...planned,
          nextPaymentDate: null,
        };
      }
    })
  );

  return plannedWithDueDates;
};

export const analyzeMostCostlyExpenses = async ({
  accountIds,
  transactionPopulate,
  fromDate,
  toDate,
  labels,
}) => {
  const filter = {
    account: { $in: accountIds },
    type: transactionTypeEnum.EXPENSE,
  };

  if (fromDate) {
    if (!filter.date) filter.date = {};
    filter.date.$gte = moment(fromDate, "YYYY-MM-DD").startOf("day").toDate();
  }

  if (toDate) {
    if (!filter.date) filter.date = {};
    filter.date.$lte = moment(toDate, "YYYY-MM-DD").endOf("day").toDate();
  }

  if (labels) {
    if (!filter.labels) filter.labels = {};
    filter.labels = { $in: labels };
  }

  const transactions = await TransactionModel.find(filter)
    .sort({ amount: -1 })
    .limit(3)
    .populate(transactionPopulate)
    .lean();

  return transactions;
};
