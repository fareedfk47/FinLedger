const jwt = require("jsonwebtoken");

async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized. Please login first.",
        status: "Failed",
      });
    }

    if (!process.env.JWT_SECRETKEY) {
      console.error("JWT_SECRETKEY is not configured");

      return res.status(500).json({
        message: "Something went wrong. Please try again later.",
        status: "Failed",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);

    req.user = decoded;

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    return res.status(401).json({
      message: "Invalid or expired token. Please login again.",
      status: "Failed",
    });
  }
}

module.exports = { authMiddleware };
