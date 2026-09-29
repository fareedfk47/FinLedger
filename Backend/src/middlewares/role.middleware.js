const userModel = require("../models/user.model");

function requireRole(...allowedRoles) {
  return async (req, res, next) => {
    try {
      if (allowedRoles.length === 0) {
        return res.status(500).json({
          message: "Role configuration error",
          status: "Failed",
        });
      }

      if (!req.user?.id) {
        return res.status(401).json({
          message: "Unauthorized. Please login first.",
          status: "Failed",
        });
      }

      const user = await userModel
        .findById(req.user.id)
        .select("role");

      if (!user) {
        return res.status(401).json({
          message: "User not found",
          status: "Failed",
        });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          message:
            "Forbidden. You do not have permission to perform this action.",
          status: "Failed",
        });
      }

      req.userRole = user.role;

      next();
    } catch (error) {
      console.error("Role authorization error:", error);

      return res.status(500).json({
        message: "Something went wrong. Please try again later.",
        status: "Failed",
      });
    }
  };
}

module.exports = {
  requireRole,
};