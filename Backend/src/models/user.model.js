const mongoose = require("mongoose");
const bcryptJs = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required for registration"],
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please fill a valid email address",
      ],
      unique: [true, "Email already exists"],
    },

    name: {
      type: String,
      required: [true, "Name is required for registration"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    password: {
      type: String,
      required: [true, "Password is required for registration"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "manager", "admin"],
      default: "user",
      required: true,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    failedLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const hashedPassword = await bcryptJs.hash(this.password, 10);

  this.password = hashedPassword;
});

userSchema.methods.comparePassword = async function (password) {
  return await bcryptJs.compare(password, this.password);
};

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
