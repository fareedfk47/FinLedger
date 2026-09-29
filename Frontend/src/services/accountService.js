import axiosInstance from "./axiosInstance";

/**
 * GET /api/accounts
 * Returns: { user: { name, email }, accounts[] }
 */
export async function getMyAccounts() {
  const response = await axiosInstance.get("/accounts");
  return response.data;
}

/**
 * GET /api/accounts/:accountNumber
 * Returns: { user: { name, email }, account }
 */
export async function getAccountByNumber(accountNumber) {
  const response = await axiosInstance.get(`/accounts/${accountNumber}`);
  return response.data;
}

/**
 * POST /api/accounts
 * Body: { accountType } — "savings" | "current"
 * Returns: { account }
 */
export async function createAccount(accountType = "savings") {
  const response = await axiosInstance.post("/accounts", { accountType });
  return response.data;
}

/**
 * PATCH /api/accounts/:accountNumber/block
 * Manager/admin only.
 */
export async function blockAccount(accountNumber) {
  const response = await axiosInstance.patch(
    `/accounts/${accountNumber}/block`
  );
  return response.data;
}

/**
 * PATCH /api/accounts/:accountNumber/unblock
 * Manager/admin only.
 */
export async function unblockAccount(accountNumber) {
  const response = await axiosInstance.patch(
    `/accounts/${accountNumber}/unblock`
  );
  return response.data;
}
