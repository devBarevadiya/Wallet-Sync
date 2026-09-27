import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

const LOCAL_DB_URL = "mongodb://127.0.0.1:27017/walletsync";

const getConnectionUrl = (url) => {
  if (url) {
    return url;
  }

  if (process.env.NODE_ENV === "development") {
    return LOCAL_DB_URL;
  }

  return undefined;
};

export const connectDb = async (url) => {
  const connectionUrl = getConnectionUrl(url);

  if (!connectionUrl) {
    throw new Error(
      "DATABASE_URL is not configured. Set DATABASE_URL in environment variables or in the .env file."
    );
  }

  const connectOptions = {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  };

  try {
    await mongoose.connect(connectionUrl, connectOptions);
    console.log(`database connection established (${connectionUrl})`);
    return;
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development";
    const isAlreadyLocal = connectionUrl === LOCAL_DB_URL;

    if (!isDev) {
      console.error(
        `Primary MongoDB connection failed (${connectionUrl}):`,
        error.message || error
      );
      throw error;
    }

    console.warn(
      `Primary MongoDB connection failed (${connectionUrl}):`,
      error.message || error
    );

    if (!isAlreadyLocal) {
      try {
        console.warn("Trying local MongoDB at", LOCAL_DB_URL);
        await mongoose.connect(LOCAL_DB_URL, connectOptions);
        console.log("local MongoDB connection established");
        // Seed data on fallback
        await seedFallbackData();
        return;
      } catch (localError) {
        console.warn(
          "Local MongoDB connection failed:",
          localError.message || localError
        );
      }
    }

    try {
      console.warn("Falling back to in-memory MongoDB...");
      const mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();

      await mongoose.connect(memoryUri, connectOptions);
      console.log("local in-memory MongoDB connection established");

      // Seed data on fallback
      await seedFallbackData();
      return;
    } catch (memoryError) {
      console.error(
        "Local in-memory MongoDB connection failed:",
        memoryError.message || memoryError
      );
      throw memoryError;
    }
  }
};

const seedFallbackData = async () => {
  try {
    const fs = await import("fs");
    const CurrencyModel = (await import("../features/currency/model.js")).default;
    
    const count = await CurrencyModel.countDocuments();
    if (count === 0 && fs.existsSync("./data/currencies.json")) {
      let data = JSON.parse(fs.readFileSync("./data/currencies.json", "utf-8"));
      
      // Clean up MongoDB Extended JSON syntax ($oid, $date)
      data = data.map(item => ({
        _id: item._id?.$oid || item._id,
        symbol: item.symbol,
        currency: item.currency,
        code: item.code,
        createdAt: item.createdAt?.$date || item.createdAt,
        updatedAt: item.updatedAt?.$date || item.updatedAt,
      }));

      await CurrencyModel.insertMany(data);
      console.log(`Seeded ${data.length} currencies into fallback database.`);
    }
  } catch (err) {
    console.error("Failed to seed fallback data:", err);
  }
};

