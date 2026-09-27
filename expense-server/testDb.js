import mongoose from "mongoose";
import { DATABASE_URL } from "./config/env.js";

const testDb = async () => {
  try {
    await mongoose.connect(DATABASE_URL);
    console.log("Connected to DB:", DATABASE_URL);

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));

    // Fetch currencies directly
    const count = await mongoose.connection.db.collection('currencies').countDocuments();
    console.log("Currencies count:", count);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

testDb();
