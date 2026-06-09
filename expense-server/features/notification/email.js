import { emitter } from "../../config/emitter.js";
import { sendMail } from "../../helper/nodeMailer.js";

emitter.on("email_notification_register", async ({ email, username }) => {
  try {
    await sendMail({
      to: email,
      filename: "register.html",
      dynamicData: {
        username,
        getStartedLink: "https://walletsync-app.vercel.app/app/dashboard",
      },
      subject: `Welcome to WalletSync, ${username}`,
    });
  } catch (error) {
    console.log(error);
  }
});

emitter.on(
  "email_notification_summary_report",
  async ({
    email,
    username,
    totalIncome,
    totalExpense,
    totalTransfer,
    categories,
    recurringBillsCount,
    frequency,
  }) => {
    try {
      await sendMail({
        to: email,
        filename: "summaryReport.html",
        dynamicData: {
          username,
          totalIncome,
          totalExpense,
          totalTransfer,
          categories: categories
            .map(
              (category) => `<li>${category.title}: ${category.totalSpend}</li>`
            )
            .join(""),
          recurringBillsCount,
          frequency,
          reportLink: "https://walletsync-app.vercel.app/app/dashboard",
        },
        subject: "Your Weekly Financial Snapshot Is Read!y",
      });
    } catch (error) {
      console.log(error);
    }
  }
);

emitter.on(
  "email_notification_payment_reminder",
  async ({ email, username, paymentName, amount, dueDate }) => {
    try {
      await sendMail({
        to: email,
        filename: "paymentReminder.html",
        dynamicData: {
          username,
          paymentName,
          amount,
          dueDate,
          viewPaymentDetailsLink: "https://walletsync-app.vercel.app/app/dashboard",
        },
        subject: `Upcoming Payment Reminder, ${username}`,
      });
    } catch (error) {
      console.log(error);
    }
  }
);

emitter.on(
  "email_notification_budget_reminder",
  async ({
    email,
    username,
    categoryName,
    budgetLimitAmount,
    budgetSpendAmount,
    budgetRemainingAmount,
    exceedPercentage,
  }) => {
    try {
      await sendMail({
        to: email,
        filename: "budgetReminder.html",
        dynamicData: {
          username,
          categoryName,
          budgetLimitAmount,
          budgetSpendAmount,
          budgetRemainingAmount,
          exceedPercentage,
          updateNowLink: "https://walletsync-app.vercel.app/app/dashboard",
        },
        subject: `Alert: You've exceeded ${exceedPercentage}% of your budget!`,
      });
    } catch (error) {
      console.log(error);
    }
  }
);

emitter.on("email_notification_inactive_user", async ({ email, username }) => {
  try {
    await sendMail({
      to: email,
      filename: "inactivityReminder.html",
      dynamicData: {
        username,
        createTransactionLink: "https://walletsync-app.vercel.app/app/dashboard",
      },
      subject: "We miss you! Log Your Transactions Today to Stay on Track",
    });
  } catch (error) {
    console.log(error);
  }
});
