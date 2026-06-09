import mongoose from "mongoose";

export const successResponse = async ({
  res,
  statusCode = 200,
  message,
  data,
  ...other
}) => {
  return res
    .status(statusCode)
    .json({ success: true, message, data, ...other });
};

export const errorResponse = async ({
  res,
  error,
  success = false,
  statusCode = 500,
  message = "Whoops! Something went wrong. We're on it!",
  funName,
}) => {
  if (funName && error) {
    console.log(`[ERROR] ${funName} ${error}`);
  } else if (error) {
    console.log(error);
  }

  let arrOjb = {};
  if (error instanceof mongoose.Error.CastError) {
    message = "Invalid ID provided";
  } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
    message = "Document not found";
  }

  if (error?.name === "MongoServerError" && error?.code === 11000) {
    statusCode = 400;
    let duplicateKeys = Object.values(error.keyPattern).join(", ");
    message = `Values with this ${duplicateKeys} field are already in use`;
  } else if (error?.name === "JsonWebTokenError") {
    message = "Invalid token";
    statusCode = 401;
  } else if (error?.name === "TokenExpiredError") {
    message = "Token expired";
    statusCode = 401;
  } else if (error?.name === "NotBeforeError") {
    message = "Token not yet valid";
    statusCode = 401;
  }

  return res.status(statusCode).json({ success, message, ...arrOjb });
};

export const validateResponse = (res, error, statusCode = 400) => {
  let arrOjb = { success: false };

  error.details.map((item, key) => {
    const { path, message } = item;
    arrOjb = { ...arrOjb, message: message.replace(/['"]/g, "") };
  });

  return res.status(statusCode).json(arrOjb);
};
