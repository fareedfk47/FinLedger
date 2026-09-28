const express = require("express");

const accountController = require("../controllers/account.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const router = express.Router();

/**
 * - POST /api/accounts/
 * - Create a new account
 * - Protected Route
 */

router.post(
  "/",
  authMiddleware.authMiddleware,
  accountController.createAccount,
);

/**
 * - GET /api/accounts/
 * - Get accounts
 * - Protected Route
 */

router.get("/", authMiddleware.authMiddleware, accountController.getMyAccounts);

/**
 * - GET /api/accounts/:accountNumber
 * - Get account By Account Number
 * - Protected Route
 */

router.get(
  "/:accountNumber",
  authMiddleware.authMiddleware,
  accountController.getAccountByNumber,
);

router.patch(
  "/:accountNumber/block",
  authMiddleware.authMiddleware,
  roleMiddleware.requireRole("manager", "admin"),
  accountController.blockAccount,
);

router.patch(
  "/:accountNumber/unblock",
  authMiddleware.authMiddleware,
  roleMiddleware.requireRole("manager", "admin"),
  accountController.unblockAccount,
);

router.patch(
  "/:accountNumber/close",
  authMiddleware.authMiddleware,
  roleMiddleware.requireRole("admin"),
  accountController.closeAccount
);
module.exports = router;
