import { agenda } from "../../config/agenda.js";
import { createBalanceHistory } from "../balanceHistory/helper.js";

createBalanceHistory();

agenda.define("create balance history", async () => {
  try {
    await createBalanceHistory();
  } catch (error) {
    console.error(error);
  }
});
