import dns from "node:dns";
import dotenv from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";

// Fix Node.js c-ares DNS SRV query refusal on Windows/ISP DNS
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (_) {}

export const NODE_ENV = process.env.NODE_ENV || "development";

const envFile = NODE_ENV === "development" ? ".env.dev" : ".env";
const envPath = resolve(process.cwd(), envFile);
const defaultEnvPath = resolve(process.cwd(), ".env");

if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`[env] Loaded ${envFile}`);
} else if (existsSync(defaultEnvPath)) {
  dotenv.config({ path: defaultEnvPath });
  console.warn(`[env] ${envFile} not found, loaded .env instead`);
} else {
  console.warn(
    `[env] No environment file found for NODE_ENV=${NODE_ENV}. Using process environment variables only.`
  );
}

export const {
  PORT,
  DATABASE_URL,
  CLIENT_URL,

  // digital ocean
  DIGITAL_OCEAN_SPACES_SECRET_KEY,
  DIGITAL_OCEAN_SPACES_ACCESS_KEY,
  DIGITAL_OCEAN_SPACES_BASE_URL,
  DIGITAL_OCEAN_SPACES_REGION,
  DIGITAL_OCEAN_BUCKET_NAME,

  JWT_SECRET_KEY,
  SECRET_KEY,

  // smtp mail server
  MAIL_HOST,
  MAIL_PORT,
  MAIL_USER,
  MAIL_PASSWORD,

  // Social account login
  PROJECT_NAME,
  ORIGIN_URL,

  // Swagger
  SWAGGER_USERNAME,
  SWAGGER_PASSWORD,

  // Currency
  CURRENCY_RATE_EXCHANGE,

  // Revenue cat
  REVENUE_CAT_HEADER_SECRET,

  // Stripe
  STRIPE_PUBLISHABLE_KEY,
  STRIPE_SECRET_KEY,
  STRIPE_ENDPOINT_SECRET,
  LIFE_TIME_PRICE_IDS,
} = process.env;
