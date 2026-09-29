const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");
const auditService = require("../services/audit.service");

async function registerUser(req, res) {
  try {
    const { email, name, password, confirmPassword } = req.body;

    // Required input validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        message: "Name, email, password and confirm password are required",
        status: "Failed",
      });
    }

    // Validate JWT configuration
    if (!process.env.JWT_SECRETKEY) {
      console.error("JWT_SECRETKEY is not configured");

      return res.status(500).json({
        message: "Something went wrong. Please try again later.",
        status: "Failed",
      });
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Password and confirm password do not match",
        status: "Failed",
      });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({
      email,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists",
        status: "Failed",
      });
    }

    // Create user
    // Password is hashed automatically by user.model.js
    const user = await userModel.create({
      email,
      name,
      password,
    });

    // Create account creation audit log
    try {
      await auditService.createAuditLog({
        user: user._id,
        action: "ACCOUNT_CREATED",
        resource: "auth",
        resourceId: user._id,
        description: "User account created successfully",
        email: user.email,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
    } catch (error) {
      console.error("Registration audit error:", error);
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRETKEY,
      {
        expiresIn: "7d",
      },
    );

    // Store JWT in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send response first
    res.status(201).json({
      message: "User registered successfully",
      status: "Success",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });

    // Send registration email after response
    try {
      await emailService.sendRegistrationEmail(user.email, user.name);

      console.log("Registration email sent successfully");
    } catch (error) {
      console.error("Registration email failed:", error);
    }
  } catch (error) {
    console.error("Registration error:", error);

    // Handle MongoDB duplicate email error
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already exists",
        status: "Failed",
      });
    }

    // Never expose internal error details
    if (!res.headersSent) {
      return res.status(500).json({
        message: "Something went wrong. Please try again later.",
        status: "Failed",
      });
    }
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        status: "Failed",
      });
    }

    // Clean email
    const cleanEmail = email.trim().toLowerCase();

    // Find user and explicitly include password
    const user = await userModel
      .findOne({ email: cleanEmail })
      .select("+password");

    // Generic authentication error
    if (!user) {
      try {
        await auditService.createAuditLog({
          action: "LOGIN_FAILED",
          resource: "auth",
          description: "Login failed: user not found",
          email: cleanEmail,
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        });
      } catch (error) {
        console.error("Failed login audit error:", error);
      }

      return res.status(401).json({
        message: "Invalid email or password",
        status: "Failed",
      });
    }

    // Check whether the 15-minute failed-login window has expired
    if (user.failedLoginAt) {
      const fifteenMinutes = 15 * 60 * 1000;
      const timeSinceFirstFailure = Date.now() - user.failedLoginAt.getTime();

      if (timeSinceFirstFailure >= fifteenMinutes) {
        user.failedLoginAttempts = 0;
        user.failedLoginAt = null;

        await user.save();
      }
    }

    // Block login if maximum failed attempts have been reached
    if (user.failedLoginAttempts >= 5) {
      try {
        await auditService.createAuditLog({
          user: user._id,
          action: "LOGIN_FAILED",
          resource: "auth",
          resourceId: user._id,
          description: "Login blocked: too many failed attempts",
          email: user.email,
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        });
      } catch (error) {
        console.error("Blocked login audit error:", error);
      }

      return res.status(429).json({
        message: "Too many failed login attempts. Please try again later.",
        status: "Failed",
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      // Start the 15-minute window on the first failed attempt
      if (user.failedLoginAttempts === 0) {
        user.failedLoginAt = new Date();
      }

      user.failedLoginAttempts += 1;

      await user.save();

      try {
        await auditService.createAuditLog({
          user: user._id,
          action: "LOGIN_FAILED",
          resource: "auth",
          resourceId: user._id,
          description: "Login failed: incorrect password",
          email: user.email,
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        });
      } catch (error) {
        console.error("Failed login audit error:", error);
      }

      if (user.failedLoginAttempts >= 5) {
        return res.status(429).json({
          message: "Too many failed login attempts. Please try again later.",
          status: "Failed",
        });
      }

      return res.status(401).json({
        message: "Invalid email or password",
        status: "Failed",
      });
    }

    // Successful login → reset failed login attempts
    user.failedLoginAttempts = 0;
    user.failedLoginAt = null;

    await user.save();

    // Validate JWT configuration
    if (!process.env.JWT_SECRETKEY) {
      console.error("JWT_SECRETKEY is not configured");

      return res.status(500).json({
        message: "Something went wrong. Please try again later.",
        status: "Failed",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRETKEY,
      {
        expiresIn: "7d",
      },
    );

    // Store JWT in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Create successful login audit log
    try {
      await auditService.createAuditLog({
        user: user._id,
        action: "LOGIN",
        resource: "auth",
        resourceId: user._id,
        description: "User logged in successfully",
        email: user.email,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
    } catch (error) {
      console.error("Login audit error:", error);
    }

    // Send response without exposing JWT
    return res.status(200).json({
      message: "Login successful",
      status: "Success",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Something went wrong. Please try again later.",
        status: "Failed",
      });
    }
  }
}

async function logoutUser(req, res) {
  try {
    const userId = req.user.id;

    // Clear JWT cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Create logout audit log
    try {
      await auditService.createAuditLog({
        user: userId,
        action: "LOGOUT",
        resource: "auth",
        resourceId: userId,
        description: "User logged out successfully",
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
    } catch (error) {
      console.error("Logout audit error:", error);
    }

    return res.status(200).json({
      message: "Logout successful",
      status: "Success",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      message: "Something went wrong. Please try again later.",
      status: "Failed",
    });
  }
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
