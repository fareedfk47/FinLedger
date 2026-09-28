const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      immutable: true,
      index: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      immutable: true,
    },

    ipAddress: {
      type: String,
      immutable: true,
    },

    userAgent: {
      type: String,
      immutable: true,
    },

    action: {
      type: String,
      required: true,
      enum: [
        "LOGIN",
        "LOGIN_FAILED",
        "LOGOUT",
        "ACCOUNT_CREATED",
        "DEPOSIT",
        "WITHDRAW",
        "TRANSFER",
        "ACCOUNT_BLOCKED",
        "ACCOUNT_UNBLOCKED",
        "ACCOUNT_CLOSED",
      ],
      immutable: true,
    },

    resource: {
      type: String,
      required: true,
      enum: ["auth", "account", "transaction"],
      immutable: true,
    },

    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      immutable: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      immutable: true,
    },
  },
  {
    timestamps: true,
  },
);

function preventAuditLogModification() {
  throw new Error("Audit logs are immutable and cannot be modified or deleted");
}

auditLogSchema.pre("findOneAndUpdate", preventAuditLogModification);

auditLogSchema.pre("updateOne", preventAuditLogModification);

auditLogSchema.pre("updateMany", preventAuditLogModification);

auditLogSchema.pre("deleteOne", preventAuditLogModification);

auditLogSchema.pre("deleteMany", preventAuditLogModification);

auditLogSchema.pre("findOneAndDelete", preventAuditLogModification);

auditLogSchema.pre("findOneAndReplace", preventAuditLogModification);

const auditLogModel = mongoose.model("auditLog", auditLogSchema);

module.exports = auditLogModel;
