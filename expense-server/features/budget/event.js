import { emitter } from "../../config/emitter.js";
import {
  allowedNotificationsEnum,
  budgetNotificationThresholdPercentageEnum,
  budgetSpendLimitType,
  budgetStatusType,
  transactionTypeEnum,
} from "../../config/enum.js";
import BudgetModel from "./model.js";
import controller from "./controller.js";
import UserModel from "../user/model.js";

emitter.on("transaction", async (transaction) => {
  try {
    // Allow only if transaction type is expense
    if (transaction.type !== transactionTypeEnum.EXPENSE) return;

    // Find active budget
    const budgets = await BudgetModel.find({
      accounts: transaction.account,
      status: budgetStatusType.OPEN,
    }).populate([
      {
        path: "headCategories.headCategory",
        select: "title",
      },
      {
        path: "headCategories.categories.category",
        select: "title",
      },
    ]);

    for (const budget of budgets) {
      try {
        const headCategory = budget.headCategories.find(
          (hc) =>
            String(hc.headCategory._id) === String(transaction.headCategory)
        );

        if (
          headCategory &&
          headCategory.spendLimitType !== budgetSpendLimitType.NONE
        ) {
          const notificationsToSend = [];
          const emailNotificationsToSend = [];

          // Attach transaction
          budget.transactions.push(transaction._id);

          // ===============
          // Budget's Users
          // ===============
          const userIdArray = await controller.findUsersByAccounts(
            budget.accounts
          );

          const users = await UserModel.find({
            _id: { $in: userIdArray },
            allowedNotifications: allowedNotificationsEnum.BUDGET_REMINDER,
          }).select("deviceTokens email username");

          // Update budget amount
          budget.spendAmount += Number(transaction.amount);
          budget.remainingAmount = budget.maxAmount - budget.spendAmount;

          // =========================
          // Budget limit Notification
          // =========================
          const budgetSpendLimitPercentage =
            (budget.spendAmount / budget.maxAmount) * 100;

          if (budgetSpendLimitPercentage >= 80) {
            const isNotificationSent = budget.notifications.includes(
              budgetNotificationThresholdPercentageEnum.P80
            );

            if (!isNotificationSent) {
              users.forEach((user) => {
                notificationsToSend.push({
                  userId: String(user._id),
                  tokens: user.deviceTokens.map((t) => t.deviceToken),
                  title: `Budget alert!`,
                  body: `You have reached your 80% budget`,
                });
              });

              budget.notifications.push(
                budgetNotificationThresholdPercentageEnum.P80
              );
            }
          }

          if (budgetSpendLimitPercentage > 100) {
            const isNotificationSent = budget.notifications.includes(
              budgetNotificationThresholdPercentageEnum.P100
            );

            if (!isNotificationSent) {
              users.forEach((user) => {
                notificationsToSend.push({
                  userId: String(user._id),
                  tokens: user.deviceTokens.map((t) => t.deviceToken),
                  title: `Budget alert!`,
                  body: `You have reached your 100% budget`,
                });
              });

              budget.notifications.push(
                budgetNotificationThresholdPercentageEnum.P100
              );
            }
          }

          // Update head category amount
          headCategory.spendAmount += Number(transaction.amount);

          if (headCategory.spendLimitType === budgetSpendLimitType.LIMIT) {
            headCategory.remainingAmount =
              headCategory.maxAmount - headCategory.spendAmount;
          }

          // ================================
          // Head category limit Notification
          // ================================
          let headCategoryMaxAmount = 0;

          if (headCategory.spendLimitType === budgetSpendLimitType.LIMIT) {
            headCategoryMaxAmount = headCategory.maxAmount;
          } else if (
            headCategory.spendLimitType === budgetSpendLimitType.NO_LIMIT
          ) {
            headCategoryMaxAmount = budget.maxAmount;
          }

          const headCategorySpendLimitPercentage =
            (headCategory.spendAmount / headCategoryMaxAmount) * 100;

          if (headCategorySpendLimitPercentage >= 80) {
            const isNotificationSent = headCategory.notifications.includes(
              budgetNotificationThresholdPercentageEnum.P80
            );

            if (!isNotificationSent) {
              users.forEach((user) => {
                notificationsToSend.push({
                  userId: String(user._id),
                  tokens: user.deviceTokens.map((t) => t.deviceToken),
                  title: `Budget alert!`,
                  body: `You have reached your 80% budget in head category ${headCategory.headCategory.title}`,
                });

                emailNotificationsToSend.push({
                  email: user.email,
                  username: user.username,
                  categoryName: headCategory.headCategory.title,
                  budgetLimitAmount: headCategory.maxAmount,
                  budgetSpendAmount: headCategory.spendAmount,
                  budgetRemainingAmount: headCategory.remainingAmount,
                  exceedPercentage: 80,
                });
              });

              headCategory.notifications.push(
                budgetNotificationThresholdPercentageEnum.P80
              );
            }
          }
          if (headCategorySpendLimitPercentage > 100) {
            const isNotificationSent = headCategory.notifications.includes(
              budgetNotificationThresholdPercentageEnum.P100
            );

            if (!isNotificationSent) {
              users.forEach((user) => {
                notificationsToSend.push({
                  userId: String(user._id),
                  tokens: user.deviceTokens.map((t) => t.deviceToken),
                  title: `Budget alert!`,
                  body: `You have reached your 100% budget in head category ${headCategory.headCategory.title}`,
                });

                emailNotificationsToSend.push({
                  email: user.email,
                  username: user.username,
                  categoryName: headCategory.headCategory.title,
                  budgetLimitAmount: headCategory.maxAmount,
                  budgetSpendAmount: headCategory.spendAmount,
                  budgetRemainingAmount: headCategory.remainingAmount,
                  exceedPercentage: 100,
                });
              });

              headCategory.notifications.push(
                budgetNotificationThresholdPercentageEnum.P100
              );
            }
          }

          // Update category amount
          const category = headCategory.categories.find(
            (c) => String(c.category._id) === String(transaction.category)
          );

          if (category) {
            category.spendAmount += Number(transaction.amount);

            if (category.spendLimitType === budgetSpendLimitType.LIMIT) {
              category.remainingAmount =
                category.maxAmount - category.spendAmount;
            }

            // ================================
            // category limit Notification
            // ================================
            let categoryMaxAmount = 0;

            if (category.spendLimitType === budgetSpendLimitType.LIMIT) {
              categoryMaxAmount = category.maxAmount;
            } else if (
              category.spendLimitType === budgetSpendLimitType.NO_LIMIT
            ) {
              if (headCategory.spendLimitType === budgetSpendLimitType.LIMIT) {
                categoryMaxAmount = headCategory.maxAmount;
              } else if (
                headCategory.spendLimitType === budgetSpendLimitType.NO_LIMIT
              ) {
                categoryMaxAmount = budget.maxAmount;
              }
            }

            const categorySpendLimitPercentage =
              (category.spendAmount / categoryMaxAmount) * 100;

            if (categorySpendLimitPercentage >= 80) {
              const isNotificationSent = category.notifications.includes(
                budgetNotificationThresholdPercentageEnum.P80
              );

              if (!isNotificationSent) {
                users.forEach((user) => {
                  notificationsToSend.push({
                    userId: String(user._id),
                    tokens: user.deviceTokens.map((t) => t.deviceToken),
                    title: `Budget alert!`,
                    body: `You have reached your 80% budget in category ${category.category.title}`,
                  });

                  emailNotificationsToSend.push({
                    email: user.email,
                    username: user.username,
                    categoryName: category.category.title,
                    budgetLimitAmount: category.maxAmount,
                    budgetSpendAmount: category.spendAmount,
                    budgetRemainingAmount: category.remainingAmount,
                    exceedPercentage: 80,
                  });
                });

                category.notifications.push(
                  budgetNotificationThresholdPercentageEnum.P80
                );
              }
            }

            if (categorySpendLimitPercentage > 100) {
              const isNotificationSent = category.notifications.includes(
                budgetNotificationThresholdPercentageEnum.P100
              );

              if (!isNotificationSent) {
                users.forEach((user) => {
                  notificationsToSend.push({
                    userId: String(user._id),
                    tokens: user.deviceTokens.map((t) => t.deviceToken),
                    title: `Budget alert!`,
                    body: `You have reached your 100% budget in category ${category.category.title}`,
                  });

                  emailNotificationsToSend.push({
                    email: user.email,
                    username: user.username,
                    categoryName: category.category.title,
                    budgetLimitAmount: category.maxAmount,
                    budgetSpendAmount: category.spendAmount,
                    budgetRemainingAmount: category.remainingAmount,
                    exceedPercentage: 100,
                  });
                });

                category.notifications.push(
                  budgetNotificationThresholdPercentageEnum.P100
                );
              }
            }
          }

          // Save updates
          await budget.save();

          for (const notification of notificationsToSend) {
            emitter.emit("notification", notification);
          }

          for (const emailNotification of emailNotificationsToSend) {
            emitter.emit(
              "email_notification_budget_reminder",
              emailNotification
            );
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  } catch (error) {
    console.log(error);
  }
});

emitter.on("update:transaction:account", async (transaction) => {
  try {
    console.log("[INFO] Transaction account id has been changed");

    const { accountId, transactionId } = transaction;

    await BudgetModel.updateMany(
      {
        accounts: { $ne: accountId },
        transactions: transactionId,
      },
      {
        $pull: { transactions: transactionId },
      }
    );
  } catch (error) {
    console.error(error);
  }
});

emitter.on(
  "transaction_amount_update",
  async ({
    newAmount,
    oldAmount,
    categoryId,
    headCategoryId,
    transactionId,
  }) => {
    const amountDiff = newAmount - oldAmount;

    const budgets = await BudgetModel.find({
      transactions: transactionId,
      status: budgetStatusType.OPEN,
    });

    for (const budget of budgets) {
      try {
        if (newAmount === 0) {
          // Handle delete transaction
          budget.transactions = budget.transactions.filter(
            (transaction) => String(transaction._id) !== String(transactionId)
          );
        }

        budget.spendAmount += amountDiff;
        budget.remainingAmount = budget.maxAmount - budget.spendAmount;

        const headCategory = budget.headCategories.find(
          (hc) => String(hc.headCategory._id) === String(headCategoryId)
        );

        if (headCategory) {
          headCategory.spendAmount += amountDiff;

          if (headCategory.spendLimitType === budgetSpendLimitType.LIMIT) {
            headCategory.remainingAmount =
              headCategory.maxAmount - headCategory.spendAmount;
          }
        }

        const category = headCategory.categories.find(
          (c) => String(c.category._id) === String(categoryId)
        );

        if (category) {
          category.spendAmount += amountDiff;

          if (category.spendLimitType === budgetSpendLimitType.LIMIT) {
            category.remainingAmount =
              category.maxAmount - category.spendAmount;
          }
        }

        await budget.save();
      } catch (error) {
        console.error(error);
      }
    }
  }
);
