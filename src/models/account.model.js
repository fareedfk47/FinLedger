const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },

    accountNumber: {
      type: String,
      required: true,
      unique: true,
    },

    accountType: {
      type: String,
      enum: ["savings", "current"],
      default: "savings",
    },

    currency: {
      type: String,
      required: [true, "Currency is required for creating an account"],
      default: "INR",
    },

    balance: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["active", "blocked", "closed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

accountSchema.index({ user: 1, status: 1 });

accountSchema.index(
  { user: 1, accountType: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["active", "blocked"] },
    },
  },
);

const accountModel = mongoose.model("account", accountSchema);

module.exports = accountModel;
