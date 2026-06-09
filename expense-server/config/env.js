import dotenv from "dotenv";

export const NODE_ENV = process.env.NODE_ENV;

console.log({ NODE_ENV });

if (NODE_ENV === "development") {
  dotenv.config({ path: ".env.dev" });
} else if (NODE_ENV === "production") {
  dotenv.config({ path: ".env" });
} else {
  process.exit();
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
