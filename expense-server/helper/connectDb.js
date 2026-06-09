import mongoose from "mongoose";

export const connectDb = async (url) => {
  try {
    mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 🔁 Increase timeout to 30 seconds
      socketTimeoutMS: 45000, // optional: timeout for sending/receiving data
    });
    console.log("database connection established");
  } catch (error) {
    console.log("error: ", error);
  }
};
