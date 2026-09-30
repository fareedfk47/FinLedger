const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");

const app = express();

app.set("trust proxy", 1);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(helmet());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.some(
        (o) => o === origin || o.replace(/\/$/, "") === origin.replace(/\/$/, "")
      );
      if (isAllowed || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      return callback(new Error("CORS policy violation: origin not allowed"));
    },
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
app.get("/api/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    service: "FinLedger API",
    timestamp: new Date().toISOString(),
  });
});

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