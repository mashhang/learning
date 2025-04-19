import nodemailer from "nodemailer";
/**
 * Sends a verification email to the user
 * @param to - recipient email address
 * @param name - user's name
 * @param token - email verification token
 */
export const sendVerificationEmail = async (to, name, token) => {
    const transporter = nodemailer.createTransport({
        service: "gmail", // or other SMTP provider
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    const verifyUrl = `http://localhost:5001/verify?token=${token}`; // 👈 Frontend link that triggers backend verification
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
