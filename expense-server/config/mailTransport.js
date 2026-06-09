import nodemailer from "nodemailer";
import { MAIL_HOST, MAIL_PASSWORD, MAIL_PORT, MAIL_USER } from "./env.js";

const smtpConfig = {
  host: MAIL_HOST,
  port: Number(MAIL_PORT),
  secure: true,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
  debug: true,
};

export const mailTransport = nodemailer.createTransport(smtpConfig);
