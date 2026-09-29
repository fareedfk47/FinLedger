/**
 * Format a number as Indian Rupee currency string.
 * e.g. 124500 → "₹1,24,500.00"
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date string or Date object to a readable format.
 * e.g. "2026-09-30T01:00:00.000Z" → "30 Sep 2026, 6:30 AM"
 */
export function formatDate(dateInput) {
  if (!dateInput) return "—";
  const date = new Date(dateInput);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format a date to short date only (no time).
 * e.g. "30 Sep 2026"
 */
export function formatDateShort(dateInput) {
  if (!dateInput) return "—";
  const date = new Date(dateInput);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Mask an account number, showing only the last 4 digits.
 * e.g. "500104821942" → "•••• 1942"
 */
export function maskAccountNumber(accountNumber) {
  if (!accountNumber) return "•••• ••••";
  const str = String(accountNumber);
  const last4 = str.slice(-4);
  return `•••• ${last4}`;
}

/**
 * Get initials from a full name (max 2 chars).
 * e.g. "Fareed Khan" → "FK", "Fareed" → "F"
 */
export function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Get a user-friendly label for transaction type.
 */
export function getTransactionTypeLabel(type) {
  const labels = {
    deposit: "Deposit",
    withdraw: "Withdrawal",
    transfer: "Transfer",
  };
  return labels[type] || type;
}

/**
 * Get a user-friendly label for audit log actions.
 */
export function getAuditActionLabel(action) {
  const labels = {
    LOGIN: "Signed In",
    LOGIN_FAILED: "Failed Login Attempt",
    LOGOUT: "Signed Out",
    ACCOUNT_CREATED: "Account Created",
    DEPOSIT: "Deposit",
    WITHDRAW: "Withdrawal",
    TRANSFER: "Transfer",
    ACCOUNT_BLOCKED: "Account Blocked",
    ACCOUNT_UNBLOCKED: "Account Unblocked",
    ACCOUNT_CLOSED: "Account Closed",
  };
  return labels[action] || action;
}
