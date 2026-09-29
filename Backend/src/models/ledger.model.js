const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
      required: true,
      index: true,
      immutable: true,
    },

    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "transaction",
      required: true,
      index: true,
      immutable: true,
    },

    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
      immutable: true,
    },

    amount: {
      type: Number,
      required: true,
      min: [1, "Ledger amount must be greater than 0"],
      immutable: true,
    },

    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
      immutable: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
      immutable: true,
    },
  },
  {
    timestamps: true,
  },
);

function preventLedgerModification() {
  throw new Error(
    "Ledger entries are immutable and cannot be modified or deleted",
  );
}

ledgerSchema.pre("findOneAndUpdate", preventLedgerModification);

ledgerSchema.pre("updateOne", preventLedgerModification);

ledgerSchema.pre("updateMany", preventLedgerModification);

ledgerSchema.pre("deleteOne", preventLedgerModification);

ledgerSchema.pre("deleteMany", preventLedgerModification);

ledgerSchema.pre("findOneAndDelete", preventLedgerModification);

ledgerSchema.pre("findOneAndReplace", preventLedgerModification);

const ledgerModel = mongoose.model("ledger", ledgerSchema);

module.exports = ledgerModel;
