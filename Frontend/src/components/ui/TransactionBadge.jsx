/**
 * TransactionBadge — renders transaction type with credit/debit color coding.
 * type: "deposit" | "withdraw" | "transfer"
 * ledgerType: "credit" | "debit" (for ledger entries)
 */
function TransactionBadge({ type, ledgerType }) {
  // For ledger entries (credit/debit)
  if (ledgerType) {
    const ledgerStyles = {
      credit:
        "bg-emerald-50 text-emerald-700 border border-emerald-200",
      debit:
        "bg-red-50 text-red-700 border border-red-200",
    };
    const ledgerLabels = { credit: "Credit", debit: "Debit" };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase ${ledgerStyles[ledgerType] || ledgerStyles.debit}`}
      >
        {ledgerLabels[ledgerType] || ledgerType}
      </span>
    );
  }

  // For transaction types
  const styles = {
    deposit: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    withdraw: "bg-red-50 text-red-700 border border-red-200",
    transfer: "bg-blue-50 text-blue-700 border border-blue-200",
  };

  const labels = {
    deposit: "Deposit",
    withdraw: "Withdrawal",
    transfer: "Transfer",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase ${styles[type] || styles.transfer}`}
    >
      {labels[type] || type}
    </span>
  );
}

export default TransactionBadge;
