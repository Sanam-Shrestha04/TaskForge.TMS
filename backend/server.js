require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const sendEmail = require("./utils/sendEmail");

const authRoutes = require("./routes/authRoutes");
const newRoutes = require("./routes/newRoutes");
const taskRoutes = require("./routes/taskRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

// CORS setup
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Route registration
app.use("/api/auth", authRoutes);
app.use("/api/users", newRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reports", reportRoutes);

//  Root route
app.get("/", (req, res) => {
  res.send("TaskForge backend is live");
});

// Admin Access Request Route — sends confirmation to applicant
app.post("/api/admin/apply", async (req, res) => {
  const { email, name } = req.body;
  console.log("Received admin apply request:", { email, name });

  if (!email || !name) {
    return res.status(400).json({ message: "Missing email or name." });
  }

  try {
    await sendEmail({
      to: email, // Send to the applicant
      subject: "Your Admin Access Request",
      html: `

<p>We’ve received your request to become an <strong>admin</strong> on <strong>TaskForge</strong>.</p>

<p>To complete your access, please use the following token during signup:</p>

<p style="font-size: 1.2rem; font-weight: bold; background: #f0f0f0; padding: 0.5rem; border-radius: 6px;">
  ${process.env.ADMIN_INVITE_TOKEN}
</p>

<p>Thank you for your interest in contributing to TaskForge 🙌<br />
We’re excited to have you onboard!</p>

<p style="margin-top: 2rem;">— The TaskForge Team</p>      `,
    });

    res.status(200).json({ message: "Confirmation email sent to applicant." });
  } catch (error) {
    console.error(" Failed to send confirmation email:", error);
    res
      .status(500)
      .json({ message: "Failed to send email.", error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
