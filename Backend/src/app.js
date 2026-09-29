const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");

const app = express();

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

/**
 * - Routes Required
 */
const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");
const transactionRouter = require("./routes/transaction.routes");

/**
 * - Use Routes
 */
app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/transactions", transactionRouter);

/**
 * - 404 Handler
 */
app.use((req, res) => {
  return res.status(404).json({
    message: "Route not found",
    status: "Failed",
  });
});

/**
 * - Global Error Handler
 */
app.use((error, req, res, next) => {
  console.error("Global error:", error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    message: "Something went wrong. Please try again later.",
    status: "Failed",
  });
});

module.exports = app;