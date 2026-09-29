import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setAccounts } from "../../store/accountsSlice";
import { getMyAccounts } from "../../services/accountService";
import { getMyTransactions } from "../../services/transactionService";
import { formatCurrency, formatDateShort, maskAccountNumber } from "../../utils/formatters";
import Spinner from "../../components/ui/Spinner";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";

function Dashboard() {
  const user = useSelector((state) => state.auth.user);
  const accounts = useSelector((state) => state.accounts.accounts) || [];
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showBalance, setShowBalance] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isLoadingTxns, setIsLoadingTxns] = useState(true);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  // Calculate totals
  const totalBalance = accounts.reduce((acc, curr) => acc + (curr.balance || 0), 0);
  const savingsAccount = accounts.find((a) => a.accountType === "savings");
  const currentAccount = accounts.find((a) => a.accountType === "current");

  const savingsBalance = savingsAccount?.balance || 0;
  const currentBalance = currentAccount?.balance || 0;

  // Fetch updated accounts & recent transactions on mount
  useEffect(() => {
    async function loadData() {
      setIsLoadingAccounts(true);
      try {
        const accData = await getMyAccounts();
        if (accData.accounts) {
          dispatch(setAccounts(accData.accounts));
        }
      } catch {
        // Silently handled in UI state
      } finally {
        setIsLoadingAccounts(false);
      }

      setIsLoadingTxns(true);
      try {
        const txnData = await getMyTransactions(1, 5);
        if (txnData.transactions) {
          setRecentTransactions(txnData.transactions);
        }
      } catch {
        // Silently handled in UI state
      } finally {
        setIsLoadingTxns(false);
      }
    }

    loadData();
  }, [dispatch]);

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 py-4 gap-4 pb-12">
      {/* Greeting Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            {greeting}, {user?.name?.split(" ")[0] || "Client"} 👋
          </h1>
          <p className="text-sm text-on-surface-variant">
            Financial health is looking strong today
          </p>
        </div>
        <div className="flex items-center">
          <Link
            to="/profile"
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
            title="Profile & Activity"
          >
            <span className="material-symbols-outlined text-[20px]">
              manage_accounts
            </span>
          </Link>
        </div>
      </div>

      {/* Balance Summary Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-container text-on-primary p-5 shadow-sm">
        {/* Subtle Geometric Watermark SVG */}
        <svg
          className="absolute -right-6 -bottom-8 w-44 h-44 text-on-primary/10 pointer-events-none"
          fill="currentColor"
          viewBox="0 0 200 200"
        >
          <circle cx="100" cy="100" fill="none" opacity="0.4" r="90" stroke="currentColor" strokeWidth="4" />
          <path d="M100 20 A80 80 0 0 1 180 100 L100 100 Z" opacity="0.25" />
          <circle cx="100" cy="100" fill="none" r="45" stroke="currentColor" strokeWidth="2" />
          <rect fill="none" height="90" opacity="0.3" rx="16" stroke="currentColor" strokeWidth="3" transform="rotate(45 100 100)" width="90" x="55" y="55" />
        </svg>

        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-on-primary-container">
                Total Net Balance
              </span>
              <button
                type="button"
                aria-label="Toggle balance visibility"
                onClick={() => setShowBalance(!showBalance)}
                className="text-on-primary-container hover:text-on-primary transition-colors flex items-center"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showBalance ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-sm text-on-primary text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed"></span>
              {accounts.length} {accounts.length === 1 ? "Account" : "Accounts"}
            </span>
          </div>

          <div className="flex items-baseline gap-1 my-1">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums">
              {showBalance ? formatCurrency(totalBalance) : "₹ ••••••••"}
            </span>
          </div>

          {/* Account Breakdown Pills */}
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            {savingsAccount && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-on-primary/10 backdrop-blur-sm text-on-primary text-xs">
                <span className="w-2 h-2 rounded-full bg-tertiary-fixed"></span>
                <span>Savings:</span>
                <span className="font-semibold tabular-nums">
                  {showBalance ? formatCurrency(savingsBalance) : "••••"}
                </span>
              </div>
            )}
            {currentAccount && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-on-primary/10 backdrop-blur-sm text-on-primary text-xs">
                <span className="w-2 h-2 rounded-full bg-secondary-fixed"></span>
                <span>Current:</span>
                <span className="font-semibold tabular-nums">
                  {showBalance ? formatCurrency(currentBalance) : "••••"}
                </span>
              </div>
            )}
            {accounts.length === 0 && !isLoadingAccounts && (
              <span className="text-xs text-on-primary-container italic">
                No active accounts yet. Open one below!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-4 gap-2.5">
        <button
          onClick={() => {
            if (accounts.length > 0) {
              navigate(`/accounts/${accounts[0].accountNumber}?action=deposit`);
            } else {
              navigate("/accounts");
            }
          }}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-surface-container-lowest shadow-sm hover:bg-surface-container-low transition-all active:scale-95 group border border-outline-variant/30"
        >
          <div className="w-11 h-11 rounded-full bg-tertiary-fixed/30 flex items-center justify-center text-tertiary transition-transform group-hover:scale-105">
            <span className="material-symbols-outlined text-[22px]">south</span>
          </div>
          <span className="text-xs font-semibold text-on-surface mt-2">Deposit</span>
        </button>

        <button
          onClick={() => {
            if (accounts.length > 0) {
              navigate(`/accounts/${accounts[0].accountNumber}?action=withdraw`);
            } else {
              navigate("/accounts");
            }
          }}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-surface-container-lowest shadow-sm hover:bg-surface-container-low transition-all active:scale-95 group border border-outline-variant/30"
        >
          <div className="w-11 h-11 rounded-full bg-error-container/40 flex items-center justify-center text-error transition-transform group-hover:scale-105">
            <span className="material-symbols-outlined text-[22px]">north</span>
          </div>
          <span className="text-xs font-semibold text-on-surface mt-2">Withdraw</span>
        </button>

        <button
          onClick={() => navigate("/transfer")}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-surface-container-lowest shadow-sm hover:bg-surface-container-low transition-all active:scale-95 group border border-outline-variant/30"
        >
          <div className="w-11 h-11 rounded-full bg-secondary-container flex items-center justify-center text-primary transition-transform group-hover:scale-105">
            <span className="material-symbols-outlined text-[22px]">sync_alt</span>
          </div>
          <span className="text-xs font-semibold text-on-surface mt-2">Transfer</span>
        </button>

        <button
          onClick={() => navigate("/ledger")}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-surface-container-lowest shadow-sm hover:bg-surface-container-low transition-all active:scale-95 group border border-outline-variant/30"
        >
          <div className="w-11 h-11 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed-variant transition-transform group-hover:scale-105">
            <span className="material-symbols-outlined text-[22px]">receipt_long</span>
          </div>
          <span className="text-xs font-semibold text-on-surface mt-2">Ledger</span>
        </button>
      </div>

      {/* Linked Accounts Quick Overview */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold text-on-surface">Linked Accounts</h2>
          <Link
            to="/accounts"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Manage Accounts →
          </Link>
        </div>

        {isLoadingAccounts ? (
          <div className="py-8 flex justify-center">
            <Spinner size="md" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 text-center">
            <p className="text-sm text-on-surface-variant mb-3">
              You do not have any active bank accounts yet.
            </p>
            <Link
              to="/accounts"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Open New Account
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {accounts.map((acc) => (
              <div
                key={acc._id || acc.accountNumber}
                onClick={() => navigate(`/accounts/${acc.accountNumber}`)}
                className="flex flex-col justify-between p-4 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md border border-outline-variant/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary-fixed transition-colors">
                    <span className="material-symbols-outlined text-[20px]">
                      {acc.accountType === "current" ? "domain" : "savings"}
                    </span>
                  </div>
                  <StatusBadge status={acc.status} />
                </div>
                <div>
                  <span className="text-xs text-on-surface-variant block font-mono">
                    {acc.accountType === "savings" ? "Savings" : "Current"} • {maskAccountNumber(acc.accountNumber)}
                  </span>
                  <span className="text-xl font-bold text-on-surface mt-1 block tabular-nums">
                    {showBalance ? formatCurrency(acc.balance) : "₹ ••••••"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Transactions List */}
      <div className="flex flex-col gap-2 mt-1">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold text-on-surface">Recent Transactions</h2>
          <Link
            to="/transactions"
            className="text-xs font-semibold text-primary hover:underline"
          >
            See All ({recentTransactions.length})
          </Link>
        </div>

        <div className="flex flex-col rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 overflow-hidden divide-y divide-surface-container-low">
          {isLoadingTxns ? (
            <div className="py-10 flex justify-center">
              <Spinner size="md" />
            </div>
          ) : recentTransactions.length === 0 ? (
            <EmptyState
              icon="receipt"
              title="No transactions yet"
              message="When you deposit, withdraw, or transfer funds, they will appear here."
              action={{
                label: "Deposit Funds",
                onClick: () => {
                  if (accounts.length > 0) {
                    navigate(`/accounts/${accounts[0].accountNumber}?action=deposit`);
                  } else {
                    navigate("/accounts");
                  }
                },
              }}
            />
          ) : (
            recentTransactions.map((txn) => {
              const isDeposit = txn.type === "deposit";
              const isWithdraw = txn.type === "withdraw";

              return (
                <div
                  key={txn._id}
                  className="flex items-center justify-between p-3.5 hover:bg-surface-container-low/40 transition-colors"
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
                          ? "shopping_bag"
                          : "sync_alt"}
                      </span>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-on-surface truncate">
                        {txn.description ||
                          (isDeposit
                            ? "Deposit to Account"
                            : isWithdraw
                            ? "Cash Withdrawal"
                            : "Account Transfer")}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-on-surface-variant">
                          {formatDateShort(txn.createdAt)}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-on-surface-variant/40"></span>
                        <span
                          className={`text-[11px] font-medium capitalize ${
                            txn.status === "completed"
                              ? "text-tertiary"
                              : txn.status === "failed"
                              ? "text-error"
                              : "text-amber-600"
                          }`}
                        >
                          {txn.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-sm font-bold shrink-0 tabular-nums ${
                      isDeposit ? "text-tertiary" : "text-on-surface"
                    }`}
                  >
                    {isDeposit ? "+" : "-"}
                    {formatCurrency(txn.amount)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;