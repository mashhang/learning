import nodemailer from "nodemailer";
import { getApiUrl } from "../utils/getApiUrl.js";

const API_URL = getApiUrl();
// const API_URL = process.env.API_URL || "http://192.168.1.10:5001"; // ✅ Use backend env

/**
 * Sends a verification email to the user
 * @param to - recipient email address
 * @param name - user's name
 * @param token - email verification token
 */
export const sendVerificationEmail = async (
  to: string,
  name: string,
  token: string
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // or other SMTP provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const verifyUrl = `${API_URL}/verify?token=${token}`; // 👈 Frontend link that triggers backend verification

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Verify your email",
    html: `
      <h2>Hello, ${name}!</h2>
      <p>Thank you for registering. Please click the button below to verify your email address:</p>
      <a href="${verifyUrl}" style="padding: 10px 20px; background: #30608E; color: white; text-decoration: none;">Verify Email</a>
      <p>If you did not create an account, please ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
