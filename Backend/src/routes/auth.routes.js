
const express = require("express");

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const rateLimitMiddleware = require("../middlewares/rateLimit.middleware");

const router = express.Router();

router.post("/register", authController.registerUser);

router.post(
  "/login",
  rateLimitMiddleware.loginRateLimiter,
  authController.loginUser,
);

router.post(
  "/logout",
  authMiddleware.authMiddleware,
  authController.logoutUser,
);

module.exports = router;