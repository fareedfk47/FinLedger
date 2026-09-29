const auditLogModel = require("../models/auditLog.model");

async function createAuditLog({
  user,
  action,
  resource,
  resourceId,
  description,
  email,
  ipAddress,
  userAgent,
  session,
}) {
  console.log("AUDIT SERVICE CALLED");

  const auditLog = new auditLogModel({
    user,
    action,
    resource,
    resourceId,
    description,
    email,
    ipAddress,
    userAgent,
  });

  await auditLog.save({ session });

  console.log("AUDIT LOG CREATED:", auditLog._id);

  return auditLog;
}

module.exports = {
  createAuditLog,
};