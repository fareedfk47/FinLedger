const express = require("express");

const router = express.Router();

const transactionController = require("../controllers/transaction.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post(
  "/deposit",
  authMiddleware.authMiddleware,
  transactionController.deposit,
);

router.post(
  "/withdraw",
  authMiddleware.authMiddleware,
  transactionController.withdraw,
);

router.get(
  "/",
  authMiddleware.authMiddleware,
  transactionController.getMyTransactions,
);

router.get(
  "/ledger",
  authMiddleware.authMiddleware,
  transactionController.getMyLedger,
);

router.post(
  "/transfer",
  authMiddleware.authMiddleware,
  transactionController.transfer,
);

router.get(
  "/audit-logs",
  authMiddleware.authMiddleware,
  transactionController.getMyAuditLogs,
);
module.exports = router;
