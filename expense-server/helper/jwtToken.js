import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../config/env.js";

export const generateToken = async (data, expiresIn = "30d") => {
  try {
    return jwt.sign(data, JWT_SECRET_KEY, { expiresIn: expiresIn });
  } catch (error) {
    console.log(`[ERROR] ${error}`);
  }
};
export const verifyToken = async (token) => {
  return jwt.verify(token, JWT_SECRET_KEY);
};
