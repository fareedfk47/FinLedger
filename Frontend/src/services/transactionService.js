import axiosInstance from "./axiosInstance";

/**
 * Generate a unique idempotency key (UUID v4).
 * Required for deposit, withdraw, and transfer.
 */
function generateIdempotencyKey() {
  return crypto.randomUUID();
}

/**
 * POST /api/transactions/deposit
 * Headers: Idempotency-Key
 * Body: { accountNumber, amount, description? }
 * Returns: { user, transaction }
 */
export async function deposit(accountNumber, amount, description = "") {
  const response = await axiosInstance.post(
    "/transactions/deposit",
    { accountNumber, amount, description },
    { headers: { "Idempotency-Key": generateIdempotencyKey() } }
  );
  return response.data;
}

/**
 * POST /api/transactions/withdraw
 * Headers: Idempotency-Key
 * Body: { accountNumber, amount, description? }
 * Returns: { user, transaction }
 */
export async function withdraw(accountNumber, amount, description = "") {
  const response = await axiosInstance.post(
    "/transactions/withdraw",
    { accountNumber, amount, description },
    { headers: { "Idempotency-Key": generateIdempotencyKey() } }
  );
  return response.data;
}

/**
 * POST /api/transactions/transfer
 * Headers: Idempotency-Key
 * Body: { fromAccountNumber, toAccountNumber, amount, description? }
 * Returns: { user, transaction }
 */
export async function transfer(
  fromAccountNumber,
  toAccountNumber,
  amount,
  description = ""
) {
  const response = await axiosInstance.post(
    "/transactions/transfer",
    { fromAccountNumber, toAccountNumber, amount, description },
    { headers: { "Idempotency-Key": generateIdempotencyKey() } }
  );
  return response.data;
}

/**
 * GET /api/transactions?page=&limit=
 * Returns: { transactions[], pagination }
 */
export async function getMyTransactions(page = 1, limit = 10) {
  const response = await axiosInstance.get("/transactions", {
    params: { page, limit },
  });
  return response.data;
}

/**
 * GET /api/transactions/ledger?page=&limit=
 * Returns: { ledger[], pagination }
 */
export async function getMyLedger(page = 1, limit = 10) {
  const response = await axiosInstance.get("/transactions/ledger", {
    params: { page, limit },
  });
  return response.data;
}

/**
 * GET /api/transactions/audit-logs?page=&limit=
 * Returns: { auditLogs[], pagination }
 */
export async function getMyAuditLogs(page = 1, limit = 10) {
  const response = await axiosInstance.get("/transactions/audit-logs", {
    params: { page, limit },
  });
  return response.data;
}
