require("dotenv").config();
const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text, html }) => {
  console.log("SMTP_USER:", process.env.SMTP_USER);
  console.log("SMTP_PASS:", process.env.SMTP_PASS ? "✓ loaded" : "✗ missing");

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to,
    subject,
    text,
    html,
  };

  console.log("Sending email with options:", mailOptions);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(" Email sent successfully:", info);
  } catch (error) {
    console.error(" Email sending failed:", error);
    throw error;
  }
};

module.exports = sendEmail;
