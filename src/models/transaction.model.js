const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
      index: true,
    },

    fromAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
    },

    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
    },

    type: {
      type: String,
      enum: ["deposit", "withdraw", "transfer"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: [1, "Transaction amount must be greater than 0"],
    },

    balanceAfter: {
      type: Number,
      min: 0,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },

    idempotencyKey: {
      type: String,
      required: true,
    },
    requestHash: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

transactionSchema.index({ user: 1, idempotencyKey: 1 }, { unique: true });

const transactionModel = mongoose.model("transaction", transactionSchema);

module.exports = transactionModel;
