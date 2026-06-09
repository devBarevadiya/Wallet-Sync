// import moment from "moment";

// export const getMomentDate = (date, format) => {
//   console.log({ date });
//   return moment(date).format(format ? format : "DD/MM/YYYY");
// };
// export const getMomentTime = (time, format) => {
//   console.log({ time });
//   return moment(time, "HH:mm").format(format ? format : "hh:mm A");
// };
// export const formatSecondsToMMSS = (seconds) => {
//   const duration = moment.duration(seconds, "seconds");
//   const minutes = duration.minutes();
//   const remainingSeconds = duration.seconds();
//   return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
//     .toString()
//     .padStart(2, "0")}`;
// };

import moment from "moment";

export const getMomentDate = (date, format) => {
  return moment
    .utc(date)
    .local()
    .format(format || "DD/MM/YYYY");
};

export const getMomentTime = (date, format) => {
  return moment
    .utc(date)
    .local()
    .format(format || "hh:mm A");
};

export const getMomentTimeWithSeconds = (date) => {
  // Parse as UTC and convert to local time
  const localTime = moment.utc(date).local();

  // Format the time to include hours, minutes, and seconds
  const formattedTime = localTime.format("h:mm:ss");

  return `${formattedTime}`; // Append 's' at the end
};

export const formatSecondsToMMSS = (seconds) => {
  const duration = moment.duration(seconds, "seconds");
  const minutes = duration.minutes();
  const remainingSeconds = duration.seconds();
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

export const getUnixTimestamp = (date) => {
  let unixTimestamp;

  if (date) {
    unixTimestamp = moment(date).unix();
    const currentUnix = moment().unix();

    // Check if the provided date is in the future
    if (unixTimestamp <= currentUnix) {
      throw new Error("The provided date must be in the future.");
    }
  } else {
    // Default to 24 hours from now if no date is passed
    unixTimestamp = moment().add(1, "seconds").unix();
  }

  return unixTimestamp;
};
