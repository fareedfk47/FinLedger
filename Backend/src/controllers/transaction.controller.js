const mongoose = require("mongoose");
const crypto = require("crypto");
const userModel = require("../models/user.model");
const accountModel = require("../models/account.model");
const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const auditService = require("../services/audit.service");
const auditLogModel = require("../models/auditLog.model");
const emailService = require("../services/email.service");

async function deposit(req, res) {
  const session = await mongoose.startSession();
  let requestHash;

  try {
    const userId = req.user.id;
    const { accountNumber, amount, description } = req.body;
    const idempotencyKey = req.headers["idempotency-key"];

    // Validate idempotency key
    if (!idempotencyKey) {
      return res.status(400).json({
        message: "Idempotency-Key header is required",
        status: "Failed",
      });
    }

    // Validate account number
    if (!accountNumber) {
      return res.status(400).json({
        message: "Account number is required",
        status: "Failed",
      });
    }

    // Validate amount is present
    if (amount === undefined || amount === null || amount === "") {
      return res.status(400).json({
        message: "Amount is required",
        status: "Failed",
      });
    }

    const depositAmount = Number(amount);

    // Validate amount
    if (!Number.isFinite(depositAmount) || depositAmount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
        status: "Failed",
      });
    }

    // Maximum 2 decimal places
    if (Math.round(depositAmount * 100) !== depositAmount * 100) {
      return res.status(400).json({
        message: "Amount can have at most 2 decimal places",
        status: "Failed",
      });
    }

    // Validate description
    if (description !== undefined && description !== null) {
      if (typeof description !== "string") {
        return res.status(400).json({
          message: "Description must be a string",
          status: "Failed",
        });
      }

      if (description.trim().length > 200) {
        return res.status(400).json({
          message: "Description cannot exceed 200 characters",
          status: "Failed",
        });
      }
    }

    const cleanDescription =
      typeof description === "string" ? description.trim() : "";

    // Create fingerprint of the actual deposit request
    requestHash = crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          type: "deposit",
          accountNumber,
          amount: depositAmount,
          description: cleanDescription,
        }),
      )
      .digest("hex");

    // Check if idempotency key was already used
    const existingTransaction = await transactionModel.findOne({
      user: userId,
      idempotencyKey,
    });

    if (existingTransaction) {
      // Same key but different request
      if (existingTransaction.requestHash !== requestHash) {
        return res.status(409).json({
          message: "Idempotency key already used for a different request",
          status: "Failed",
        });
      }

      // Same key and same request
      const user = await userModel.findById(userId).select("name email");

      return res.status(200).json({
        message: "Transaction already processed",
        status: "Success",
        user: {
          name: user?.name,
          email: user?.email,
        },
        transaction: existingTransaction,
      });
    }

    let createdTransaction;

    await session.withTransaction(async () => {
      const account = await accountModel
        .findOne({
          accountNumber,
          user: userId,
        })
        .session(session);

      if (!account) {
        const error = new Error("Account not found");
        error.code = "ACCOUNT_NOT_FOUND";
        throw error;
      }

      if (account.status !== "active") {
        const error = new Error("Account is not active");
        error.code = "ACCOUNT_NOT_ACTIVE";
        throw error;
      }

      const newBalance = account.balance + depositAmount;

      account.balance = newBalance;
      await account.save({ session });

      const transaction = await transactionModel.create(
        [
          {
            user: userId,
            account: account._id,
            type: "deposit",
            amount: depositAmount,
            balanceAfter: newBalance,
            description: cleanDescription,
            idempotencyKey,
            requestHash,
            status: "completed",
          },
        ],
        { session }, 
      );

      createdTransaction = transaction[0];

      await ledgerModel.create(
        [
          {
            account: account._id,
            transaction: createdTransaction._id,
            type: "credit",
            amount: depositAmount,
            balanceAfter: newBalance,
            description: cleanDescription,
          },
        ],
        { session },
      );

      await auditService.createAuditLog({
        user: userId,
        action: "DEPOSIT",
        resource: "transaction",
        resourceId: createdTransaction._id,
        description: `Deposit of ${depositAmount} completed`,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        session,
      });
    });

    const user = await userModel.findById(userId).select("name email");

    if (user?.email) {
      emailService.sendTransactionEmail(user.email, {
        type: "deposit",
        amount: depositAmount,
        accountNumber,
        balanceAfter: createdTransaction.balanceAfter,
        description: cleanDescription,
        date: createdTransaction.createdAt,
      });
    }

    return res.status(201).json({
      message: "Deposit successful",
      status: "Success",
      user: {
        name: user?.name,
        email: user?.email,
      },
      transaction: createdTransaction,
    });
  } catch (error) {
    console.error("Deposit error:", error);

    if (error.code === "ACCOUNT_NOT_FOUND") {
      return res.status(404).json({
        message: "Account not found",
        status: "Failed",
      });
    }

    if (error.code === "ACCOUNT_NOT_ACTIVE") {
      return res.status(400).json({
        message: "Account is not active",
        status: "Failed",
      });
    }

    // Handle duplicate idempotency key caused by a race condition
    if (error.code === 11000) {
      const existingTransaction = await transactionModel.findOne({
        user: req.user.id,
        idempotencyKey: req.headers["idempotency-key"],
      });

      if (existingTransaction) {
        if (existingTransaction.requestHash !== requestHash) {
          return res.status(409).json({
            message: "Idempotency key already used for a different request",
            status: "Failed",
          });
        }

        const user = await userModel
          .findById(req.user.id)
          .select("name email");

        return res.status(200).json({
          message: "Transaction already processed",
          status: "Success",
          user: {
            name: user?.name,
            email: user?.email,
          },
          transaction: existingTransaction,
        });
      }
    }

    return res.status(500).json({
      message: "Something went wrong. Please try again later.",
      status: "Failed",
    });
  } finally {
    await session.endSession();
  }
}

async function withdraw(req, res) {
  const session = await mongoose.startSession();
  let requestHash;

  try {
    const userId = req.user.id;
    const { accountNumber, amount, description } = req.body;
    const idempotencyKey = req.headers["idempotency-key"];

    // Validate idempotency key
    if (!idempotencyKey) {
      return res.status(400).json({
        message: "Idempotency-Key header is required",
        status: "Failed",
      });
    }

    // Validate account number
    if (!accountNumber) {
      return res.status(400).json({
        message: "Account number is required",
        status: "Failed",
      });
    }

    // Validate amount is present
    if (amount === undefined || amount === null || amount === "") {
      return res.status(400).json({
        message: "Amount is required",
        status: "Failed",
      });
    }

    const withdrawAmount = Number(amount);

    // Validate amount
    if (!Number.isFinite(withdrawAmount) || withdrawAmount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
        status: "Failed",
      });
    }

    // Maximum 2 decimal places
    if (Math.round(withdrawAmount * 100) !== withdrawAmount * 100) {
      return res.status(400).json({
        message: "Amount can have at most 2 decimal places",
        status: "Failed",
      });
    }

    // Validate description
    if (description !== undefined && description !== null) {
      if (typeof description !== "string") {
        return res.status(400).json({
          message: "Description must be a string",
          status: "Failed",
        });
      }

      if (description.trim().length > 200) {
        return res.status(400).json({
          message: "Description cannot exceed 200 characters",
          status: "Failed",
        });
      }
    }

    const cleanDescription =
      typeof description === "string" ? description.trim() : "";

    // Create fingerprint of the actual withdrawal request
    requestHash = crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          type: "withdraw",
          accountNumber,
          amount: withdrawAmount,
          description: cleanDescription,
        }),
      )
      .digest("hex");

    // Check if idempotency key was already used
    const existingTransaction = await transactionModel.findOne({
      user: userId,
      idempotencyKey,
    });

    if (existingTransaction) {
      // Same key but different request
      if (existingTransaction.requestHash !== requestHash) {
        return res.status(409).json({
          message: "Idempotency key already used for a different request",
          status: "Failed",
        });
      }

      // Same key and same request
      const user = await userModel.findById(userId).select("name email");

      return res.status(200).json({
        message: "Transaction already processed",
        status: "Success",
        user: {
          name: user?.name,
          email: user?.email,
        },
        transaction: existingTransaction,
      });
    }

    let createdTransaction;

    await session.withTransaction(async () => {
      const account = await accountModel
        .findOne({
          accountNumber,
          user: userId,
        })
        .session(session);

      if (!account) {
        const error = new Error("Account not found");
        error.code = "ACCOUNT_NOT_FOUND";
        throw error;
      }

      if (account.status !== "active") {
        const error = new Error("Account is not active");
        error.code = "ACCOUNT_NOT_ACTIVE";
        throw error;
      }

      // Check sufficient balance
      if (account.balance < withdrawAmount) {
        const error = new Error("Insufficient balance");
        error.code = "INSUFFICIENT_BALANCE";
        throw error;
      }

      const newBalance = account.balance - withdrawAmount;

      account.balance = newBalance;
      await account.save({ session });

      const transaction = await transactionModel.create(
        [
          {
            user: userId,
            account: account._id,
            type: "withdraw",
            amount: withdrawAmount,
            balanceAfter: newBalance,
            description: cleanDescription,
            idempotencyKey,
            requestHash,
            status: "completed",
          },
        ],
        { session },
      );

      createdTransaction = transaction[0];

      await ledgerModel.create(
        [
          {
            account: account._id,
            transaction: createdTransaction._id,
            type: "debit",
            amount: withdrawAmount,
            balanceAfter: newBalance,
            description: cleanDescription,
          },
        ],
        { session },
      );

      await auditService.createAuditLog({
        user: userId,
        action: "WITHDRAW",
        resource: "transaction",
        resourceId: createdTransaction._id,
        description: `Withdrawal of ${withdrawAmount} completed`,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        session,
      });
    });

    const user = await userModel.findById(userId).select("name email");

    if (user?.email) {
      emailService.sendTransactionEmail(user.email, {
        type: "withdraw",
        amount: withdrawAmount,
        accountNumber,
        balanceAfter: createdTransaction.balanceAfter,
        description: cleanDescription,
        date: createdTransaction.createdAt,
      });
    }

    return res.status(201).json({
      message: "Withdrawal successful",
      status: "Success",
      user: {
        name: user?.name,
        email: user?.email,
      },
      transaction: createdTransaction,
    });
  } catch (error) {
    console.error("Withdraw error:", error);

    if (error.code === "ACCOUNT_NOT_FOUND") {
      return res.status(404).json({
        message: "Account not found",
        status: "Failed",
      });
    }

    if (error.code === "ACCOUNT_NOT_ACTIVE") {
      return res.status(400).json({
        message: "Account is not active",
        status: "Failed",
      });
    }

    if (error.code === "INSUFFICIENT_BALANCE") {
      return res.status(400).json({
        message: "Insufficient balance",
        status: "Failed",
      });
    }

    // Handle duplicate idempotency key caused by a race condition
    if (error.code === 11000) {
      const existingTransaction = await transactionModel.findOne({
        user: req.user.id,
        idempotencyKey: req.headers["idempotency-key"],
      });

      if (existingTransaction) {
        if (existingTransaction.requestHash !== requestHash) {
          return res.status(409).json({
            message: "Idempotency key already used for a different request",
            status: "Failed",
          });
        }

        const user = await userModel
          .findById(req.user.id)
          .select("name email");

        return res.status(200).json({
          message: "Transaction already processed",
          status: "Success",
          user: {
            name: user?.name,
            email: user?.email,
          },
          transaction: existingTransaction,
        });
      }
    }

    return res.status(500).json({
      message: "Something went wrong. Please try again later.",
      status: "Failed",
    });
  } finally {
    await session.endSession();
  }
}

async function getMyTransactions(req, res) {
  try {
    const userId = req.user.id;

    let { page = 1, limit = 10 } = req.query;

    page = Number(page);
    limit = Number(limit);

    if (
      !Number.isInteger(page) ||
      page < 1
    ) {
      return res.status(400).json({
        message: "Page must be a positive integer",
        status: "Failed",
      });
    }

    if (
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 10
    ) {
      return res.status(400).json({
        message: "Limit must be between 1 and 10",
        status: "Failed",
      });
    }

    const skip = (page - 1) * limit;

    const accounts = await accountModel
      .find({ user: userId })
      .select("_id");

    const accountIds = accounts.map((account) => account._id);

    const filter = {
      user: userId,
      $or: [
        { account: { $in: accountIds } },
        { fromAccount: { $in: accountIds } },
        { toAccount: { $in: accountIds } },
      ],
    };

    const [transactions, totalTransactions] = await Promise.all([
      transactionModel
        .find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit),

      transactionModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalTransactions / limit);

    return res.status(200).json({
      message: "Transactions fetched successfully",
      status: "Success",

      pagination: {
        page,
        limit,
        totalTransactions,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1 && totalTransactions > 0,
      },

      transactions,
    });
  } catch (error) {
    console.error("Get transactions error:", error);

    return res.status(500).json({
      message: "Something went wrong. Please try again later.",
      status: "Failed",
    });
  }
}

async function getMyLedger(req, res) {
  try {
    const userId = req.user.id;

    let { page = 1, limit = 10 } = req.query;

    page = Number(page);
    limit = Number(limit);

    if (!Number.isInteger(page) || page < 1) {
      return res.status(400).json({
        message: "Page must be a positive integer",
        status: "Failed",
      });
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 10) {
      return res.status(400).json({
        message: "Limit must be between 1 and 10",
        status: "Failed",
      });
    }

    const skip = (page - 1) * limit;

    const accounts = await accountModel
      .find({ user: userId })
      .select("_id");

    const accountIds = accounts.map((account) => account._id);

    const filter = {
      account: { $in: accountIds },
    };

    const [ledgerEntries, totalEntries] = await Promise.all([
      ledgerModel
        .find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit),

      ledgerModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalEntries / limit);

    return res.status(200).json({
      message: "Ledger fetched successfully",
      status: "Success",

      pagination: {
        page,
        limit,
        totalEntries,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1 && totalEntries > 0,
      },

      ledger: ledgerEntries,
    });
  } catch (error) {
    console.error("Get ledger error:", error);

    return res.status(500).json({
      message: "Something went wrong. Please try again later.",
      status: "Failed",
    });
  }
}

async function transfer(req, res) {
  const session = await mongoose.startSession();
  let requestHash;

  try {
    const userId = req.user.id;
    const {
      fromAccountNumber,
      toAccountNumber,
      amount,
      description,
    } = req.body;

    const idempotencyKey = req.headers["idempotency-key"];

    // Validate idempotency key
    if (!idempotencyKey) {
      return res.status(400).json({
        message: "Idempotency-Key header is required",
        status: "Failed",
      });
    }

    // Validate sender account
    if (!fromAccountNumber) {
      return res.status(400).json({
        message: "Sender account number is required",
        status: "Failed",
      });
    }

    // Validate receiver account
    if (!toAccountNumber) {
      return res.status(400).json({
        message: "Receiver account number is required",
        status: "Failed",
      });
    }

    // Sender and receiver must be different
    if (fromAccountNumber === toAccountNumber) {
      return res.status(400).json({
        message: "Sender and receiver accounts must be different",
        status: "Failed",
      });
    }

    // Validate amount is present
    if (amount === undefined || amount === null || amount === "") {
      return res.status(400).json({
        message: "Amount is required",
        status: "Failed",
      });
    }

    const transferAmount = Number(amount);

    // Validate amount
    if (!Number.isFinite(transferAmount) || transferAmount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
        status: "Failed",
      });
    }

    // Maximum 2 decimal places
    if (Math.round(transferAmount * 100) !== transferAmount * 100) {
      return res.status(400).json({
        message: "Amount can have at most 2 decimal places",
        status: "Failed",
      });
    }

    // Validate description
    if (description !== undefined && description !== null) {
      if (typeof description !== "string") {
        return res.status(400).json({
          message: "Description must be a string",
          status: "Failed",
        });
      }

      if (description.trim().length > 200) {
        return res.status(400).json({
          message: "Description cannot exceed 200 characters",
          status: "Failed",
        });
      }
    }

    const cleanDescription =
      typeof description === "string" ? description.trim() : "";

    // Create fingerprint of the actual transfer request
    requestHash = crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          type: "transfer",
          fromAccountNumber,
          toAccountNumber,
          amount: transferAmount,
          description: cleanDescription,
        }),
      )
      .digest("hex");

    // Check if idempotency key was already used
    const existingTransaction = await transactionModel.findOne({
      user: userId,
      idempotencyKey,
    });

    if (existingTransaction) {
      // Same key but different request
      if (existingTransaction.requestHash !== requestHash) {
        return res.status(409).json({
          message: "Idempotency key already used for a different request",
          status: "Failed",
        });
      }

      // Same key and same request
      const user = await userModel.findById(userId).select("name email");

      return res.status(200).json({
        message: "Transaction already processed",
        status: "Success",
        user: {
          name: user?.name,
          email: user?.email,
        },
        transaction: existingTransaction,
      });
    }

    let createdTransaction;

    await session.withTransaction(async () => {
      // Find sender account
      const fromAccount = await accountModel
        .findOne({
          accountNumber: fromAccountNumber,
          user: userId,
        })
        .session(session);

      if (!fromAccount) {
        const error = new Error("Sender account not found");
        error.code = "FROM_ACCOUNT_NOT_FOUND";
        throw error;
      }

      if (fromAccount.status !== "active") {
        const error = new Error("Sender account is not active");
        error.code = "FROM_ACCOUNT_NOT_ACTIVE";
        throw error;
      }

      // Find receiver account
      const toAccount = await accountModel
        .findOne({
          accountNumber: toAccountNumber,
        })
        .session(session);

      if (!toAccount) {
        const error = new Error("Receiver account not found");
        error.code = "TO_ACCOUNT_NOT_FOUND";
        throw error;
      }

      if (toAccount.status !== "active") {
        const error = new Error("Receiver account is not active");
        error.code = "TO_ACCOUNT_NOT_ACTIVE";
        throw error;
      }

      // Both accounts must use the same currency
      if (fromAccount.currency !== toAccount.currency) {
        const error = new Error("Currency mismatch between accounts");
        error.code = "CURRENCY_MISMATCH";
        throw error;
      }

      // Check sufficient balance
      if (fromAccount.balance < transferAmount) {
        const error = new Error("Insufficient balance");
        error.code = "INSUFFICIENT_BALANCE";
        throw error;
      }

      const newFromBalance = fromAccount.balance - transferAmount;
      const newToBalance = toAccount.balance + transferAmount;

      // Update both balances
      fromAccount.balance = newFromBalance;
      toAccount.balance = newToBalance;

      await fromAccount.save({ session });
      await toAccount.save({ session });

      // Create transfer transaction
      const transaction = await transactionModel.create(
        [
          {
            user: userId,
            account: fromAccount._id,
            fromAccount: fromAccount._id,
            toAccount: toAccount._id,
            type: "transfer",
            amount: transferAmount,
            balanceAfter: newFromBalance,
            description: cleanDescription,
            idempotencyKey,
            requestHash,
            status: "completed",
          },
        ],
        { session },
      );

      createdTransaction = transaction[0];

      // Sender ledger entry
      await ledgerModel.create(
        [
          {
            account: fromAccount._id,
            transaction: createdTransaction._id,
            type: "debit",
            amount: transferAmount,
            balanceAfter: newFromBalance,
            description: cleanDescription,
          },
        ],
        { session },
      );

      // Receiver ledger entry
      await ledgerModel.create(
        [
          {
            account: toAccount._id,
            transaction: createdTransaction._id,
            type: "credit",
            amount: transferAmount,
            balanceAfter: newToBalance,
            description: cleanDescription,
          },
        ],
        { session },
      );

      // Audit log inside the same transaction
      await auditService.createAuditLog({
        user: userId,
        action: "TRANSFER",
        resource: "transaction",
        resourceId: createdTransaction._id,
        description: `Transfer of ${transferAmount} completed`,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        session,
      });
    });

    const user = await userModel.findById(userId).select("name email");

    if (user?.email) {
      emailService.sendTransactionEmail(user.email, {
        type: "transfer",
        amount: transferAmount,
        accountNumber: fromAccountNumber,
        balanceAfter: createdTransaction.balanceAfter,
        description: cleanDescription || `Transfer to ${toAccountNumber}`,
        date: createdTransaction.createdAt,
      });
    }

    return res.status(201).json({
      message: "Transfer successful",
      status: "Success",
      user: {
        name: user?.name,
        email: user?.email,
      },
      transaction: createdTransaction,
    });
  } catch (error) {
    console.error("Transfer error:", error);

    if (error.code === "FROM_ACCOUNT_NOT_FOUND") {
      return res.status(404).json({
        message: "Sender account not found",
        status: "Failed",
      });
    }

    if (error.code === "TO_ACCOUNT_NOT_FOUND") {
      return res.status(404).json({
        message: "Receiver account not found",
        status: "Failed",
      });
    }

    if (error.code === "FROM_ACCOUNT_NOT_ACTIVE") {
      return res.status(400).json({
        message: "Sender account is not active",
        status: "Failed",
      });
    }

    if (error.code === "TO_ACCOUNT_NOT_ACTIVE") {
      return res.status(400).json({
        message: "Receiver account is not active",
        status: "Failed",
      });
    }

    if (error.code === "CURRENCY_MISMATCH") {
      return res.status(400).json({
        message: "Currency mismatch between accounts",
        status: "Failed",
      });
    }

    if (error.code === "INSUFFICIENT_BALANCE") {
      return res.status(400).json({
        message: "Insufficient balance",
        status: "Failed",
      });
    }

    // Handle duplicate idempotency key caused by a race condition
    if (error.code === 11000) {
      const existingTransaction = await transactionModel.findOne({
        user: req.user.id,
        idempotencyKey: req.headers["idempotency-key"],
      });

      if (existingTransaction) {
        if (existingTransaction.requestHash !== requestHash) {
          return res.status(409).json({
            message: "Idempotency key already used for a different request",
            status: "Failed",
          });
        }

        const user = await userModel
          .findById(req.user.id)
          .select("name email");

        return res.status(200).json({
          message: "Transaction already processed",
          status: "Success",
          user: {
            name: user?.name,
            email: user?.email,
          },
          transaction: existingTransaction,
        });
      }
    }

    return res.status(500).json({
      message: "Something went wrong. Please try again later.",
      status: "Failed",
    });
  } finally {
    await session.endSession();
  }
}

async function getMyAuditLogs(req, res) {
  try {
    const userId = req.user.id;

    let { page = 1, limit = 10 } = req.query;

    page = Number(page);
    limit = Number(limit);

    if (!Number.isInteger(page) || page < 1) {
      return res.status(400).json({
        message: "Page must be a positive integer",
        status: "Failed",
      });
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 10) {
      return res.status(400).json({
        message: "Limit must be between 1 and 10",
        status: "Failed",
      });
    }

    const skip = (page - 1) * limit;

    const filter = {
      user: userId,
    };

    const [auditLogs, totalLogs] = await Promise.all([
      auditLogModel
        .find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit),

      auditLogModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalLogs / limit);

    return res.status(200).json({
      message: "Audit logs fetched successfully",
      status: "Success",

      pagination: {
        page,
        limit,
        totalLogs,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1 && totalLogs > 0,
      },

      auditLogs,
    });
  } catch (error) {
    console.error("Get audit logs error:", error);

    return res.status(500).json({
      message: "Something went wrong. Please try again later.",
      status: "Failed",
    });
  }
}

module.exports = {
  deposit,
  withdraw,
  getMyTransactions,
  getMyLedger,
  transfer,
  getMyAuditLogs,
};
