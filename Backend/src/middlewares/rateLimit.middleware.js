const rateLimit = require("express-rate-limit");

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // maximum 20 login requests per IP
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    message: "Too many login requests. Please try again later.",
    status: "Failed",
  },
});

module.exports = {
  loginRateLimiter,
};