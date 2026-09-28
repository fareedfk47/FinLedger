const crypto = require("crypto");
const mongoose = require("mongoose");
const accountModel = require("../models/account.model");
const userModel = require("../models/user.model");
const auditService = require("../services/audit.service");

async function createAccount(req, res) {
  const session = await mongoose.startSession();
  let selectedAccountType;

  try {
    const userId = req.user.id;
    const { accountType } = req.body;

    if (accountType && !["savings", "current"].includes(accountType)) {
      return res.status(400).json({
        message: "Account type must be savings or current",
        status: "Failed",
      });
    }

    selectedAccountType = accountType || "savings";

    // Check whether the user already has an active/blocked account
    // of the requested type.
    const existingAccount = await accountModel.findOne({
      user: userId,
      accountType: selectedAccountType,
      status: { $in: ["active", "blocked"] },
    });

    if (existingAccount) {
      return res.status(409).json({
        message: `You already have an active or blocked ${selectedAccountType} account`,
        status: "Failed",
      });
    }

    // Generate a unique account number
    let accountNumber;
    let accountExists = true;

    while (accountExists) {
      accountNumber = crypto
        .randomInt(100000000000, 1000000000000)
        .toString();

      accountExists = await accountModel.exists({
        accountNumber,
      });
    }

    let account;

    // Account creation + audit log happen atomically
    await session.withTransaction(async () => {
      const createdAccounts = await accountModel.create(
        [
          {
            user: userId,
            accountNumber,
            accountType: selectedAccountType,
            currency: "INR",
            balance: 0,
            status: "active",
          },
        ],
        { session },
      );

      account = createdAccounts[0];

      await auditService.createAuditLog({
        user: userId,
        action: "ACCOUNT_CREATED",
        resource: "account",
        resourceId: account._id,
        description: `Account ${account.accountNumber} created`,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        session,
      });
    });

    return res.status(201).json({
      message: "Account created successfully",
      status: "Success",
      account: {
        id: account._id,
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        currency: account.currency,
        balance: account.balance,
        status: account.status,
        createdAt: account.createdAt,
      },
    });
  } catch (error) {
    console.error("Create account error:", error);

    if (error.code === 11000) {
      if (error.keyPattern?.accountNumber) {
        return res.status(409).json({
          message: "Account number already exists. Please try again.",
          status: "Failed",
        });
      }

      if (error.keyPattern?.user && error.keyPattern?.accountType) {
        return res.status(409).json({
          message: `You already have an active or blocked ${selectedAccountType} account`,
          status: "Failed",
        });
      }

      return res.status(409).json({
        message: "Account already exists",
        status: "Failed",
      });
    }

    return res.status(500).json({
      message: "Something went wrong. Please try again later.",
      status: "Failed",
    });
  } finally {
    await session.endSession();
  }
}

async function getMyAccounts(req, res) {
  try {
    const userId = req.user.id;

    const accounts = await accountModel.find({ user: userId }).select("-user");

    const user = await userModel.findById(userId).select("name email");

    return res.status(200).json({
      message: "Accounts fetched successfully",
      status: "Success",
      user: {
        name: user?.name,
        email: user?.email,
      },
      accounts,
    });
  } catch (error) {
    console.error("Get accounts error:", error);

    return res.status(500).json({
      message: "Something went wrong. Please try again later.",
      status: "Failed",
    });
  }
}

async function getAccountByNumber(req, res) {
  try {
    const userId = req.user.id;
    const { accountNumber } = req.params;

    const user = await userModel.findById(userId).select("name email");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        status: "Failed",
      });
    }

    const account = await accountModel
      .findOne({
        accountNumber,
        user: userId,
      })
      .select("-user");

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
        status: "Failed",
      });
    }

    return res.status(200).json({
      message: "Account fetched successfully",
      status: "Success",
      user: {
        name: user?.name,
        email: user?.email,
      },
      account,
    });
  } catch (error) {
    console.error("Get account error:", error);

    return res.status(500).json({
      message: "Something went wrong. Please try again later.",
      status: "Failed",
    });
  }
}

async function blockAccount(req, res) {
  const session = await mongoose.startSession();

  try {
    const userId = req.user.id;
    const { accountNumber } = req.params;

    let account;

    await session.withTransaction(async () => {
      // Atomically change active → blocked
      account = await accountModel.findOneAndUpdate(
        {
          accountNumber,
          status: "active",
        },
        {
          $set: {
            status: "blocked",
          },
        },
        {
          returnDocument: "after",
          session,
        },
      );

      if (!account) {
        const existingAccount = await accountModel
          .findOne({ accountNumber })
          .session(session);

        if (!existingAccount) {
          const error = new Error("Account not found");
          error.code = "ACCOUNT_NOT_FOUND";
          throw error;
        }

        if (existingAccount.status === "closed") {
          const error = new Error("Account is closed");
          error.code = "ACCOUNT_CLOSED";
          throw error;
        }

        const error = new Error("Account is already blocked");
        error.code = "ACCOUNT_ALREADY_BLOCKED";
        throw error;
      }

      await auditService.createAuditLog({
        user: userId,
        action: "ACCOUNT_BLOCKED",
        resource: "account",
        resourceId: account._id,
        description: `Account ${account.accountNumber} blocked`,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        session,
      });
    });

    return res.status(200).json({
      message: "Account blocked successfully",
      status: "Success",
      account: {
        id: account._id,
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        currency: account.currency,
        balance: account.balance,
        status: account.status,
        updatedAt: account.updatedAt,
      },
    });
  } catch (error) {
    console.error("Block account error:", error);

    if (error.code === "ACCOUNT_NOT_FOUND") {
      return res.status(404).json({
        message: "Account not found",
        status: "Failed",
      });
    }

    if (error.code === "ACCOUNT_CLOSED") {
      return res.status(400).json({
        message: "Account is closed",
        status: "Failed",
      });
    }

    if (error.code === "ACCOUNT_ALREADY_BLOCKED") {
      return res.status(400).json({
        message: "Account is already blocked",
        status: "Failed",
      });
    }

    return res.status(500).json({
      message: "Something went wrong. Please try again later.",
      status: "Failed",
    });
  } finally {
    await session.endSession();
  }
}
 
async function unblockAccount(req, res) {
  const session = await mongoose.startSession();

  try {
    const userId = req.user.id;
    const { accountNumber } = req.params;

    let account;

    await session.withTransaction(async () => {
      account = await accountModel.findOneAndUpdate(
        {
          accountNumber,
          status: "blocked",
        },
        {
          $set: {
            status: "active",
          },
        },
        {
          returnDocument: "after",
          session,
        },
      );

      if (!account) {
        const existingAccount = await accountModel
          .findOne({ accountNumber })
          .session(session);

        if (!existingAccount) {
          const error = new Error("Account not found");
          error.code = "ACCOUNT_NOT_FOUND";
          throw error;
        }

        if (existingAccount.status === "closed") {
          const error = new Error("Account is closed");
          error.code = "ACCOUNT_CLOSED";
          throw error;
        }

        const error = new Error("Account is already active");
        error.code = "ACCOUNT_ALREADY_ACTIVE";
        throw error;
      }

      await auditService.createAuditLog({
        user: userId,
        action: "ACCOUNT_UNBLOCKED",
        resource: "account",
        resourceId: account._id,
        description: `Account ${account.accountNumber} unblocked`,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        session,
      });
    });

    return res.status(200).json({
      message: "Account unblocked successfully",
      status: "Success",
      account: {
        id: account._id,
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        currency: account.currency,
        balance: account.balance,
        status: account.status,
        updatedAt: account.updatedAt,
      },
    });
  } catch (error) {
    console.error("Unblock account error:", error);

    if (error.code === "ACCOUNT_NOT_FOUND") {
      return res.status(404).json({
        message: "Account not found",
        status: "Failed",
      });
    }

    if (error.code === "ACCOUNT_CLOSED") {
      return res.status(400).json({
        message: "Account is closed",
        status: "Failed",
      });
    }

    if (error.code === "ACCOUNT_ALREADY_ACTIVE") {
      return res.status(400).json({
        message: "Account is already active",
        status: "Failed",
      });
    }

    return res.status(500).json({
      message: "Something went wrong. Please try again later.",
      status: "Failed",
    });
  } finally {
    await session.endSession();
  }
}

async function closeAccount(req, res) {
  const session = await mongoose.startSession();

  try {
    const userId = req.user.id;
    const { accountNumber } = req.params;

    let account;

    await session.withTransaction(async () => {
      account = await accountModel.findOneAndUpdate(
        {
          accountNumber,
          status: { $in: ["active", "blocked"] },
          balance: 0,
        },
        {
          $set: {
            status: "closed",
          },
        },
        {
          returnDocument: "after",
          session,
        },
      );

      if (!account) {
        const existingAccount = await accountModel
          .findOne({ accountNumber })
          .session(session);

        if (!existingAccount) {
          const error = new Error("Account not found");
          error.code = "ACCOUNT_NOT_FOUND";
          throw error;
        }

        if (existingAccount.status === "closed") {
          const error = new Error("Account is already closed");
          error.code = "ACCOUNT_ALREADY_CLOSED";
          throw error;
        }

        if (existingAccount.balance !== 0) {
          const error = new Error(
            "Account cannot be closed while balance is not zero",
          );
          error.code = "ACCOUNT_HAS_BALANCE";
          throw error;
        }
      }

      await auditService.createAuditLog({
        user: userId,
        action: "ACCOUNT_CLOSED",
        resource: "account",
        resourceId: account._id,
        description: `Account ${account.accountNumber} closed`,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        session,
      });
    });

    return res.status(200).json({
      message: "Account closed successfully",
      status: "Success",
      account: {
        id: account._id,
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        currency: account.currency,
        balance: account.balance,
        status: account.status,
        updatedAt: account.updatedAt,
      },
    });
  } catch (error) {
    console.error("Close account error:", error);

    if (error.code === "ACCOUNT_NOT_FOUND") {
      return res.status(404).json({
        message: "Account not found",
        status: "Failed",
      });
    }

    if (error.code === "ACCOUNT_ALREADY_CLOSED") {
      return res.status(400).json({
        message: "Account is already closed",
        status: "Failed",
      });
    }

    if (error.code === "ACCOUNT_HAS_BALANCE") {
      return res.status(400).json({
        message: "Account cannot be closed while balance is not zero",
        status: "Failed",
      });
    }

    return res.status(500).json({
      message: "Something went wrong. Please try again later.",
      status: "Failed",
    });
  } finally {
    await session.endSession();
  }
}

module.exports = {
  createAccount,
  getMyAccounts,
  getAccountByNumber,
  blockAccount,
  unblockAccount,
  closeAccount,
};
