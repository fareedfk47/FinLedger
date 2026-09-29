import { useState, useEffect } from "react";
import { getMyLedger } from "../../services/transactionService";
import { formatCurrency, formatDate } from "../../utils/formatters";
import Spinner from "../../components/ui/Spinner";
import Pagination from "../../components/ui/Pagination";
import EmptyState from "../../components/ui/EmptyState";

function Ledger() {
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState("all"); // "all" | "credit" | "debit"
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadLedger() {
      setIsLoading(true);
      setError("");
      try {
        const data = await getMyLedger(page, 10);
        if (data.ledger) {
          setLedgerEntries(data.ledger);
          setPagination(data.pagination);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load ledger records."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadLedger();
  }, [page]);

  // Compute metrics for current loaded entries
  const totalInflow = ledgerEntries
    .filter((l) => l.type === "credit")
    .reduce((sum, l) => sum + (l.amount || 0), 0);

  const totalOutflow = ledgerEntries
    .filter((l) => l.type === "debit")
    .reduce((sum, l) => sum + (l.amount || 0), 0);

  const netVariance = totalInflow - totalOutflow;

  // Filter entries
  const filtered = ledgerEntries.filter((item) => {
    const matchesType =
      filterType === "all" ? true : item.type === filterType;
    const matchesSearch =
      !searchQuery ||
      (item.description &&
        item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item._id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 py-4 gap-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Financial Ledger
          </h1>
          <p className="text-xs text-on-surface-variant">
            Immutable double-entry transaction audit trail & running balance
            statement
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-primary text-xs font-semibold shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
          Live Sync
        </div>
      </div>

      {/* 3 Metric Cards (Inflow, Outflow, Net) */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col p-3 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30">
          <div className="flex items-center gap-1 text-tertiary">
            <span className="material-symbols-outlined text-[16px]">
              arrow_downward_alt
            </span>
            <span className="text-[10px] uppercase tracking-wider font-bold">
              Inflow
            </span>
          </div>
          <span className="text-base sm:text-lg text-tertiary font-extrabold tracking-tight mt-1 tabular-nums">
            {formatCurrency(totalInflow)}
          </span>
          <span className="text-[10px] text-on-surface-variant mt-0.5">
            Page Credits
          </span>
        </div>

        <div className="flex flex-col p-3 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30">
          <div className="flex items-center gap-1 text-error">
            <span className="material-symbols-outlined text-[16px]">
              arrow_upward_alt
            </span>
            <span className="text-[10px] uppercase tracking-wider font-bold">
              Outflow
            </span>
          </div>
          <span className="text-base sm:text-lg text-error font-extrabold tracking-tight mt-1 tabular-nums">
            {formatCurrency(totalOutflow)}
          </span>
          <span className="text-[10px] text-on-surface-variant mt-0.5">
            Page Debits
          </span>
        </div>

        <div className="flex flex-col p-3 rounded-2xl bg-surface-container-high shadow-sm border border-outline-variant/30">
          <div className="flex items-center gap-1 text-on-surface">
            <span className="material-symbols-outlined text-[16px]">
              account_balance
            </span>
            <span className="text-[10px] uppercase tracking-wider font-bold">
              Net
            </span>
          </div>
          <span className="text-base sm:text-lg text-on-surface font-extrabold tracking-tight mt-1 tabular-nums">
            {netVariance >= 0 ? "+" : ""}
            {formatCurrency(netVariance)}
          </span>
          <span className="text-[10px] text-on-surface-variant mt-0.5">
            Variance
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-2.5">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-outline">
            search
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by description or reference ID..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-container-lowest text-xs text-on-surface placeholder:text-outline outline-none focus:ring-2 focus:ring-primary shadow-xs border border-outline-variant/30"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
              filterType === "all"
                ? "bg-primary text-on-primary shadow-xs"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            All Entries
          </button>
          <button
            type="button"
            onClick={() => setFilterType("credit")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
              filterType === "credit"
                ? "bg-primary text-on-primary shadow-xs"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            Credits Only
          </button>
          <button
            type="button"
            onClick={() => setFilterType("debit")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
              filterType === "debit"
                ? "bg-primary text-on-primary shadow-xs"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            Debits Only
          </button>
        </div>
      </div>

      {/* Ledger Records List */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <Spinner size="md" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-error font-medium">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm border border-outline-variant/30">
            <EmptyState
              icon="receipt_long"
              title="No Ledger Records"
              message={
                searchQuery || filterType !== "all"
                  ? "No ledger lines match your search or filter."
                  : "Immutable ledger records will populate here automatically upon every fund movement."
              }
            />
          </div>
        ) : (
          filtered.map((item) => {
            const isCredit = item.type === "credit";

            return (
              <div
                key={item._id}
                className="flex flex-col p-4 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 transition-transform active:scale-[0.99] gap-2"
              >
                {/* Header row */}
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isCredit
                          ? "bg-tertiary-fixed text-on-tertiary-fixed"
                          : "bg-error-container text-on-error-container"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {isCredit ? "payments" : "north_east"}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-on-surface">
                          REF-{item._id.slice(-6).toUpperCase()}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-semibold uppercase">
                          Settled
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] text-on-surface-variant font-mono">
                    {formatDate(item.createdAt)}
                  </span>
                </div>

                {/* Description */}
                <div className="py-0.5">
                  <p className="text-xs sm:text-sm font-medium text-on-surface leading-snug">
                    {item.description ||
                      (isCredit ? "Credit Allocation" : "Debit Settlement")}
                  </p>
                </div>

                {/* Running Balance & Amount Box */}
                <div className="flex items-center justify-between pt-2 mt-1 rounded-xl px-3 py-2 bg-surface-container-low">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-on-surface-variant uppercase font-semibold">
                      {isCredit ? "Credit Amount" : "Debit Amount"}
                    </span>
                    <span
                      className={`text-sm sm:text-base font-extrabold tracking-tight tabular-nums ${
                        isCredit ? "text-tertiary" : "text-error"
                      }`}
                    >
                      {isCredit ? "+" : "-"}
                      {formatCurrency(item.amount)}
                    </span>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-on-surface-variant uppercase font-semibold">
                      Running Balance
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-on-surface tracking-tight tabular-nums">
                      {formatCurrency(item.balanceAfter)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
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

export default Ledger;
