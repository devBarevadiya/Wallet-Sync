import moment from "moment";
import { agenda } from "../../config/agenda.js";
import PromoCodeModel from "../promoCode/model.js";
import UserModel from "../user/model.js";
import { subscriptionTypeEnum } from "../../config/enum.js";

const markExpiredPromoUsersAsFree = async () => {
  console.log("[INFO] CRON START >> Promo code check for free trial end");
  const now = moment().startOf("day").toDate();

  // Find expired promo codes where trial period has ended
  const expiredPromos = await PromoCodeModel.find({
    expiresOn: { $ne: null, $lt: now },
    user: { $ne: null },
  });

  for (const promo of expiredPromos) {
    try {
      await UserModel.findByIdAndUpdate(promo.user, {
        // Mark user as FREE
        subscriptionType: subscriptionTypeEnum.FREE,
      });

      console.log(
        `[INFO] User ${promo.user} marked as FREE due to expired promo code.`
      );
    } catch (error) {
      console.error(error);
    }
  }

  console.log("[INFO] CRON COMPLETE >> Promo code check for free trial end");
};

markExpiredPromoUsersAsFree();

agenda.define("promoCode", async () => {
  try {
    markExpiredPromoUsersAsFree();
  } catch (error) {
    console.error(error);
  }
});
