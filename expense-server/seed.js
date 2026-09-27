import mongoose from "mongoose";
import { DATABASE_URL } from "./config/env.js";
import { connectDb } from "./helper/connectDb.js";
import CurrencyModel from "./features/currency/model.js";
import fs from "fs";

const seedCurrencies = async () => {
  try {
    await connectDb(DATABASE_URL);
    console.log("Connected to DB:", DATABASE_URL);

    const data = JSON.parse(fs.readFileSync("./data/currencies.json", "utf-8"));
    
    // Clear existing
    await CurrencyModel.deleteMany({});
    console.log("Cleared existing currencies");

    // Insert
    await CurrencyModel.insertMany(data);
    console.log(`Inserted ${data.length} currencies`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding currencies:", error);
    process.exit(1);
  }
};

seedCurrencies();
