import moment from "moment";
import { everyTypeEnum, weekdaysEnums } from "../../config/enum.js";

export const generateNextPaymentDate = ({
  scheduleDate,
  every,
  everyType,
  weekday = null,
}) => {
  let date = moment(scheduleDate);

  if (
    everyType === everyTypeEnum.WEEK_DAY &&
    !Object.keys(weekdaysEnums).includes(weekday)
  ) {
    throw new Error(`Invalid weekday:${weekday}`);
  }

  if (everyType === everyTypeEnum.DAY) {
    date.add(every, "days");
  } else if (everyType === everyTypeEnum.WEEK_DAY) {
    const targetWeekdayIndex = weekdaysEnums[weekday];
    const dateWeekdayIndex = date.day();
    const diff = targetWeekdayIndex - dateWeekdayIndex;

    if (diff !== 0) {
      date.add(diff >= 0 ? diff : diff + 7, "days");
    }

    date.add(every, "weeks");
  } else if (everyType === everyTypeEnum.MONTH) {
    date.add(every, "months");
  } else if (everyType === everyTypeEnum.YEAR) {
    date.add(every, "years");
  }

  return date.toDate();
};
