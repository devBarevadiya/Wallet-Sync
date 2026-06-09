import {
  paymentPlatformEnum,
  priceIdToPlan,
  subscriptionPlanEnum,
} from "../../config/enum.js";
import { LIFE_TIME_PRICE_IDS } from "../../config/env.js";
import stripe from "../../config/stripe.js";
import { errorResponse, successResponse } from "../../helper/apiResponse.js";
import UserModel from "../user/model.js";

class controller {
  static updateSubscriptionPlan = async (req, res) => {
    try {
      const user = req.user;
      const { priceId } = req.body;

      const subscriptionId = user.subscriptionId;

      if (!subscriptionId) {
        return errorResponse({
          res,
          statusCode: 400,
          message: "Subscription not found",
        });
      }

      const subscriptionItems = await stripe.subscriptionItems.list({
        subscription: subscriptionId,
      });

      const subscriptionItemId = subscriptionItems.data[0].id;

      const subscriptionItem = await stripe.subscriptions.update(
        subscriptionId,
        {
          items: [
            {
              id: subscriptionItemId,
              deleted: true,
            },
            {
              price: priceId,
            },
          ],
        }
      );

      return successResponse({
        res,
        message: "success",
        data: subscriptionItem,
      });
    } catch (error) {
      return errorResponse({
        res,
        message: error.message,
        statusCode: 404,
      });
    }
  };

  static getSubscription = async (req, res) => {
    const { subscriptionId } = req.params;

    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      return successResponse({
        res,
        message: "success",
        data: subscription,
      });
    } catch (error) {
      return errorResponse({
        res,
        message: error.message,
        statusCode: 404,
      });
    }
  };

  static cancelSubscription = async (req, res) => {
    try {
      const reqUser = req.user;
      const { cancelAtPeriodEnd, cancelAt } = req.body;

      const subscriptionId = reqUser?.subscriptionId;
      const platform = reqUser?.platform;

      if (!subscriptionId || platform !== paymentPlatformEnum.STRIPE) {
        return errorResponse({
          res,
          statusCode: 404,
          message: "There is no subscription to cancel",
        });
      }

      const options = {};

      if (cancelAtPeriodEnd) {
        options.cancel_at_period_end = true;
      } else if (cancelAt) {
        options.cancel_at = cancelAt;
      }

      await stripe.subscriptions.update(subscriptionId, options);

      return successResponse({
        res,
        message: "success",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
      });
    }
  };

  static createSession = async (req, res) => {
    try {
      if (!LIFE_TIME_PRICE_IDS) {
        throw Error("env LIFE_TIME_PRICE_IDS is required");
      }

      const LIFE_TIME_PRICE_ID_ARRAY = LIFE_TIME_PRICE_IDS.split(",").map(
        (item) => item.trim()
      );

      const reqUser = req.user;
      const { priceId, paymentSuccessUrl, paymentCancelUrl, subscriptionName } =
        req.body;

      const user = await UserModel.findById(reqUser._id);

      const customer = await this.getOrCreateCustomer(user.email);

      user.stipeCustomerId = customer.id;

      await user.save();

      let trialDays = 0;
      const hasUsedTrial = !LIFE_TIME_PRICE_ID_ARRAY.includes(priceId)
        ? await this.hasUsedFreeTrial(customer.id, priceId)
        : true;
      if (!hasUsedTrial) {
        if (subscriptionPlanEnum.WEEKLY == subscriptionName) {
          trialDays = 3;
        } else if (subscriptionPlanEnum.YEARLY == subscriptionName) {
          trialDays = 7;
        }
      }

      const options = {
        customer: customer.id,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: LIFE_TIME_PRICE_ID_ARRAY.includes(priceId)
          ? "payment"
          : "subscription",
        success_url: paymentSuccessUrl,
        cancel_url: paymentCancelUrl,
      };

      if (options.mode === "payment") {
        options.metadata = {
          userId: String(user._id),
          subscriptionName: subscriptionName,
        };
      } else if (options.mode === "subscription") {
        options.metadata = {
          userId: String(user._id),
          subscriptionName: subscriptionName,
        };

        if (trialDays) {
          options.subscription_data = {
            trial_period_days: trialDays,
          };
        }
      }

      const session = await stripe.checkout.sessions.create(options);

      return successResponse({
        res,
        message: "success",
        data: session,
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
      });
    }
  };

  static hasUsedFreeTrial = async (customerId, priceId) => {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        price: priceId,
        status: "all",
      });

      for (const subscription of subscriptions.data) {
        for (const item of subscription.items.data) {
          if (item.plan.id == priceId && subscription.trial_end) {
            return true;
          }
        }
      }
      return false;

      // return subscription.data.some(
      //   (subscription) =>
      //     subscription.trial_end && subscription.trial_end < Date.now() / 1000
      // );
    } catch (error) {
      console.error("Error retrieving or creating customer:", error);
      throw error;
    }
  };

  static getOrCreateCustomer = async (email) => {
    try {
      const customers = await stripe.customers.list({ email: email });
      if (customers.data.length > 0) {
        return customers.data[0];
      } else {
        const customer = await stripe.customers.create({
          email: email,
        });
        return customer;
      }
    } catch (error) {
      console.error("Error retrieving or creating customer:", error);
      throw error;
    }
  };
}
export default controller;
