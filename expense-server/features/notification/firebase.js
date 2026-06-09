import { emitter } from "../../config/emitter.js";
import firebaseAdmin from "../../config/firebase.js";
import NotificationModel from "./model.js";

emitter.on(
  "notification",
  async ({ userId, tokens, title, body, data = {} }) => {
    try {
      console.log("[INFO] Notification Trigger");

      if (tokens.length < 1) {
        return;
      }

      await NotificationModel.create({
        icon: "https://guardianshot.blr1.digitaloceanspaces.com/expense/notofocation/3bc51c58-efe4-4803-bf9e-144fcb0c213a.png",
        user: userId,
        title: title,
        description: body,
      });

      const result = await firebaseAdmin.messaging().sendEachForMulticast({
        tokens: tokens,
        notification: {
          title: title,
          body: body,
        },
        data: data,
      });

      if (result.failureCount > 0) {
        console.error("Failed to send notifications to some tokens");
      } else {
        console.log("[INFO] Notification sent successfully to all tokens");
      }

      return result;
    } catch (error) {
      // console.error("[INFO]", error);
    }
  }
);
