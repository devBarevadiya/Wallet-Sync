import moment from "moment";
import { errorResponse, successResponse } from "../../helper/apiResponse.js";
import {
  paymentPlatformEnum,
  priceIdToPlan,
  revenueCatEventType,
  subscriptionTypeEnum,
} from "../../config/enum.js";
import UserModel from "../user/model.js";
import mongoose from "mongoose";
import { STRIPE_ENDPOINT_SECRET } from "../../config/env.js";
import stripe from "../../config/stripe.js";

class controller {
  static revenueCat = async (req, res) => {
    try {
      const { event } = req.body;

      const storeName = event?.store;
      const userId = event?.subscriber_attributes?.User_Id?.value;
      const subscriptionName =
        event?.subscriber_attributes?.Subscription_Name?.value || "";
      const eventType = event?.type;
      const platform = event?.store;
      const purchasedAt = moment(event.purchased_at_ms);
      const expirationAt = moment(event.expiration_at_ms);

      // console.log({
      //   storeName,
      //   userId,
      //   subscriptionName,
      //   eventType,
      //   purchasedAt,
      //   expirationAt,
      // });

      if (mongoose.isValidObjectId(userId)) {
        const user = await UserModel.findById(userId);

        if (user) {
          if (
            eventType === revenueCatEventType.INITIAL_PURCHASE ||
            eventType === revenueCatEventType.RENEWAL
          ) {
            user.subscriptionPurchasedAt = purchasedAt;
            user.subscriptionExpiredAt = expirationAt;
            user.subscriptionType = subscriptionTypeEnum.PREMIUM;
            user.subscriptionName = subscriptionName;
            user.platform = platform;
          } else if (
            eventType === revenueCatEventType.CANCELLATION ||
            eventType === revenueCatEventType.EXPIRATION
          ) {
            user.subscriptionPurchasedAt = null;
            user.subscriptionExpiredAt = null;
            user.subscriptionType = subscriptionTypeEnum.FREE;
            user.subscriptionName = "";
            user.platform = null;
          }

          await user.save();
        } else {
          console.error("Webhook: User not exist with ObjetId: ", userId);
        }
      } else {
        console.error("Webhook: Invalid user ObjetId: ", userId);
      }

      return successResponse({
        res,
        statusCode: 200,
        message: "success",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
      });
    }
  };

  static stripe = async (req, res) => {
    const signature = req.headers["stripe-signature"];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        STRIPE_ENDPOINT_SECRET
      );

      const customerId = event.data.object.customer;
      const eventType = event.type;
      const status = event.data.object.status;

      console.log({
        eventType,
        customerId,
        status,
      });

      if (eventType === "checkout.session.completed" && status === "complete") {
        const metadata = event.data.object.metadata;

        if (metadata.subscriptionName) {
          const payload = {
            subscriptionPurchasedAt: moment().toISOString(),
            subscriptionExpiredAt: null,
            subscriptionType: subscriptionTypeEnum.PREMIUM,
            platform: paymentPlatformEnum.STRIPE,
            subscriptionId: "",
            subscriptionName: metadata.subscriptionName,
          };

          console.log({ eventType, payload });

          await UserModel.updateOne(
            {
              stipeCustomerId: customerId,
            },
            payload
          );
        }
      } else if (
        (eventType === "customer.subscription.updated" &&
          ["past_due", "active", "trialing"].includes(status)) ||
        (eventType === "customer.subscription.created" &&
          ["past_due", "active", "trialing"].includes(status))
      ) {
        const customerId = event.data.object.customer;
        const subscriptionId = event.data.object.id;
        const priceId = event.data.object.plan.id;

        const payload = {
          subscriptionPurchasedAt: moment.unix(
            event.data.object.current_period_start
          ),
          subscriptionExpiredAt: moment.unix(
            event.data.object.current_period_end
          ),
          subscriptionType: subscriptionTypeEnum.PREMIUM,
          platform: paymentPlatformEnum.STRIPE,
          subscriptionId: subscriptionId,
          subscriptionName: priceIdToPlan[priceId],
        };

        console.log(eventType, payload, priceId);

        await UserModel.updateOne(
          {
            stipeCustomerId: customerId,
          },
          payload
        );
      } else if (
        eventType === "customer.subscription.deleted" ||
        eventType === "customer.subscription.paused"
      ) {
        await UserModel.updateOne(
          {
            stipeCustomerId: customerId,
          },
          {
            subscriptionPurchasedAt: null,
            subscriptionExpiredAt: null,
            subscriptionType: subscriptionTypeEnum.FREE,
            platform: null,
            subscriptionId: "",
            subscriptionName: "",
          }
        );
      } else if (
        eventType === "customer.subscription.updated" &&
        ["past_due", "canceled"].includes(status)
      ) {
        const customerId = event.data.object.customer;
        await UserModel.updateOne(
          { stipeCustomerId: customerId },
          {
            subscriptionPurchasedAt: null,
            subscriptionExpiredAt: null,
            subscriptionType: subscriptionTypeEnum.FREE,
            platform: null,
            subscriptionId: "",
            subscriptionName: "",
          }
        );
      } else if (
        eventType === "customer.subscription.updated" &&
        status === "trialing" &&
        event.data.object.trial_end < moment().unix()
      ) {
        // The trial period has ended, and it's no longer active or past_due
        const customerId = event.data.object.customer;

        // Update the user to mark them as free after the trial ends
        await UserModel.updateOne(
          { stipeCustomerId: customerId },
          {
            subscriptionPurchasedAt: null,
            subscriptionExpiredAt: moment
              .unix(event.data.object.current_period_end)
              .toISOString(),
            subscriptionType: subscriptionTypeEnum.FREE, // Mark as free after trial
            platform: null,
            subscriptionId: "",
            subscriptionName: "",
          }
        );
      }
    } catch (error) {
      console.error(error);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    res.json({ received: true });
  };
}
export default controller;
