import moment from "moment";
import mongoose from "mongoose";
import { customAlphabet } from "nanoid";
import puppeteer from "puppeteer";
import PromoCodeModel from "../features/promoCode/model.js";

export const paginationFun = (data) => {
  const { page = 1, limit = 10 } = data;

  return {
    limit: Number(limit),
    skip: (Number(page) - 1) * Number(limit),
  };
};

export const paginationDetails = ({ page = 1, totalItems, limit = 10 }) => {
  const totalPages = Math.ceil(totalItems / limit);

  return { page: Number(page), totalPages, totalItems, limit: Number(limit) };
};

export const convertHtmlToImage = async (
  htmlContent,
  width = 1242,
  height = 874
) => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
  });

  const page = await browser.newPage();

  await page.setViewport({ width, height });

  // Set the content of the page with the provided HTML
  await page.setContent(htmlContent);

  // Capture a screenshot of the page and get the image as a buffer
  const imageBuffer = await page.screenshot();

  // Close the browser
  await browser.close();

  return imageBuffer;
};

export const calculatePercentage = (value, referenceValue) => {
  return Math.floor((value / referenceValue) * 100);
};

export const monthFilter = (query) => {
  const { from, to } = query;

  // Get current month's range
  let fromDate = moment().startOf("month");
  let toDate = moment().endOf("month").add(1, "day");

  // If from and to are provided, use them
  if (from && to) {
    fromDate = moment(from);
    toDate = moment(to).add(1, "day");
  }

  return { fromDate, toDate };
};

export const dateValidation = (value, helpers) => {
  if (!moment(value, "YYYY-MM-DD", true).isValid()) {
    return helpers.message(
      "Date must be in the format YYYY-MM-DD and be a valid date"
    );
  }
  return value;
};

export const isoDateValidation = (value, helpers) => {
  if (!moment(value, moment.ISO_8601, true).isValid()) {
    return helpers.error("any.invalid", { message: "Invalid ISO date format" });
  }
  return value;
};

export const objectIdValidation = (value, helpers) => {
  if (!mongoose.isValidObjectId(value)) {
    return helpers.message('"{{#label}}" must be a valid ObjectId');
  }
  return value;
};

export async function generateUniquePromoCodes(count) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  // Max length is 14
  const nanoid = customAlphabet(alphabet, 14);

  // Use a Set to ensure uniqueness before DB check
  const promoCodes = new Set();

  while (promoCodes.size < count) {
    // Random length between 10-14
    const length = Math.floor(Math.random() * (14 - 10 + 1)) + 10;

    const promoCode = nanoid().slice(0, length);

    // Check if promo code already exists in DB
    const existingCode = await PromoCodeModel.findOne({ code: promoCode });

    if (!existingCode) {
      // Add to Set only if unique
      promoCodes.add(promoCode);
    }
  }

  // Convert Set to Array before returning
  return Array.from(promoCodes);
}
