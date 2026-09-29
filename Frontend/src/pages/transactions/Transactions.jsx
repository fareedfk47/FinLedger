import { useState, useEffect } from "react";
import { getMyTransactions } from "../../services/transactionService";
import { formatCurrency, formatDate, getTransactionTypeLabel } from "../../utils/formatters";
import Spinner from "../../components/ui/Spinner";
import Pagination from "../../components/ui/Pagination";
import EmptyState from "../../components/ui/EmptyState";
import TransactionBadge from "../../components/ui/TransactionBadge";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState("all"); // "all" | "deposit" | "withdraw" | "transfer"
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadTransactions() {
      setIsLoading(true);
      setError("");
      try {
        const data = await getMyTransactions(page, 10);
        if (data.transactions) {
          setTransactions(data.transactions);
          setPagination(data.pagination);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load transactions history."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadTransactions();
  }, [page]);

  // Client-side filtering by type and search query
  const filtered = transactions.filter((txn) => {
    const matchesType =
      filterType === "all" ? true : txn.type === filterType;
    const matchesSearch =
      !searchQuery ||
      (txn.description &&
        txn.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      txn._id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 py-4 gap-4 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">
          Transaction History
        </h1>
        <p className="text-xs text-on-surface-variant">
          Complete log of all deposits, withdrawals, and account transfers
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-2.5">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-outline">
            search
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by description or transaction ID..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-container-lowest text-xs text-on-surface placeholder:text-outline outline-none focus:ring-2 focus:ring-primary shadow-xs border border-outline-variant/30"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {["all", "deposit", "withdraw", "transfer"].map((type) => {
            const isSelected = filterType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                  isSelected
                    ? "bg-primary text-on-primary shadow-xs"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {type === "all" ? "All Types" : getTransactionTypeLabel(type)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex flex-col rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 overflow-hidden divide-y divide-surface-container-low">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <Spinner size="md" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-error font-medium">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="receipt_long"
            title="No Transactions Found"
            message={
              searchQuery || filterType !== "all"
                ? "Try clearing your search or changing the filter."
                : "You haven't made any transactions yet."
            }
          />
        ) : (
          filtered.map((txn) => {
            const isDeposit = txn.type === "deposit";
            const isWithdraw = txn.type === "withdraw";

            return (
              <div
                key={txn._id}
                className="flex items-center justify-between p-4 hover:bg-surface-container-low/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isDeposit
                        ? "bg-tertiary-fixed/30 text-tertiary"
                        : isWithdraw
                        ? "bg-error-container/40 text-error"
                        : "bg-secondary-container text-primary"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {isDeposit
                        ? "payments"
                        : isWithdraw
                        ? "north"
                        : "sync_alt"}
                    </span>
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-on-surface truncate">
                        {txn.description || getTransactionTypeLabel(txn.type)}
                      </span>
                      <TransactionBadge type={txn.type} />
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-on-surface-variant font-mono">
                        {formatDate(txn.createdAt)}
                      </span>
                      {txn.balanceAfter !== undefined && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-on-surface-variant/40"></span>
                          <span className="text-[11px] text-on-surface-variant">
                            Bal: {formatCurrency(txn.balanceAfter)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 pl-2">
                  <span
                    className={`text-sm sm:text-base font-bold tabular-nums ${
                      isDeposit ? "text-tertiary" : "text-on-surface"
                    }`}
                  >
                    {isDeposit ? "+" : "-"}
                    {formatCurrency(txn.amount)}
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-mono truncate max-w-[100px]">
                    ID: {txn._id.slice(-6)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {pagination && (
        <Pagination
          pagination={pagination}
          onNext={() => setPage((p) => p + 1)}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
        />
      )}
    </div>
  );
}

export default Transactions;
