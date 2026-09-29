import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateAccount } from "../../store/accountsSlice";
import { getAccountByNumber } from "../../services/accountService";
import { deposit, withdraw } from "../../services/transactionService";
import { formatCurrency, formatDate, maskAccountNumber } from "../../utils/formatters";
import Spinner from "../../components/ui/Spinner";
import StatusBadge from "../../components/ui/StatusBadge";
import { useToast } from "../../components/ui/useToast";

function AccountDetails() {
  const { accountNumber } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast, ToastComponent } = useToast();

  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Tab: "deposit" | "withdraw"
  const defaultAction = searchParams.get("action") === "withdraw" ? "withdraw" : "deposit";
  const [activeTab, setActiveTab] = useState(defaultAction);

  // Form states
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    async function loadAccount() {
      setIsLoading(true);
      setError("");
      try {
        const res = await getAccountByNumber(accountNumber);
        if (res.account) {
          setAccount(res.account);
          dispatch(updateAccount(res.account));
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load account details."
        );
      } finally {
        setIsLoading(false);
      }
    }

    if (accountNumber) {
      loadAccount();
    }
  }, [accountNumber, dispatch]);

  const handleTransaction = async (e) => {
    e.preventDefault();
    setFormError("");

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError("Amount must be greater than zero.");
      return;
    }

    if (activeTab === "withdraw" && account && numAmount > account.balance) {
      setFormError(
        `Insufficient balance. Maximum withdrawable amount is ${formatCurrency(
          account.balance
        )}.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      if (activeTab === "deposit") {
        await deposit(accountNumber, numAmount, description.trim());
        showToast(
          `Deposit of ${formatCurrency(numAmount)} completed successfully!`,
          "success"
        );
        // Refresh account info
        const updated = await getAccountByNumber(accountNumber);
        if (updated.account) {
          setAccount(updated.account);
          dispatch(updateAccount(updated.account));
        }
      } else {
        await withdraw(accountNumber, numAmount, description.trim());
        showToast(
          `Withdrawal of ${formatCurrency(numAmount)} completed successfully!`,
          "success"
        );
        // Refresh account info
        const updated = await getAccountByNumber(accountNumber);
        if (updated.account) {
          setAccount(updated.account);
          dispatch(updateAccount(updated.account));
        }
      }

      setAmount("");
      setDescription("");
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          `Failed to process ${activeTab}. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (account?.accountNumber) {
      navigator.clipboard.writeText(account.accountNumber);
      showToast("Account number copied to clipboard", "success");
    }
  };

  const quickPillAmounts = [500, 1000, 2000, 5000, 10000];

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="w-14 h-14 rounded-full bg-error-container/40 text-error flex items-center justify-center mx-auto mb-3">
          <span className="material-symbols-outlined text-[28px]">error</span>
        </div>
        <h2 className="text-lg font-bold text-on-surface mb-1">
          Account Not Found
        </h2>
        <p className="text-xs text-on-surface-variant mb-4">
          {error || "We could not find the account you requested."}
        </p>
        <button
          onClick={() => navigate("/accounts")}
          className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-sm"
        >
          ← Back to Accounts
        </button>
      </div>
    );
  }

  const isCurrent = account.accountType === "current";

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 py-4 gap-4 pb-12">
      {ToastComponent}

      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/accounts")}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <span className="material-symbols-outlined text-[16px]">
            arrow_back
          </span>
          Back to Accounts
        </button>
        <StatusBadge status={account.status} />
      </div>

      {/* Account Header Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-container via-primary to-on-primary-fixed text-on-primary p-5 shadow-sm">
        <div className="relative z-10 flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-on-primary">
                <span className="material-symbols-outlined text-[18px]">
                  {isCurrent ? "domain" : "savings"}
                </span>
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-on-primary-container">
                {isCurrent ? "Current Commercial Account" : "Premium Savings Account"}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-on-primary-container uppercase">
              {account.currency || "INR"}
            </span>
          </div>

          <div className="pt-2">
            <span className="text-xs text-on-primary-container">Available Balance</span>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-primary mt-0.5 tabular-nums">
              {formatCurrency(account.balance)}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-on-primary/90 font-medium">
                {revealed ? account.accountNumber : maskAccountNumber(account.accountNumber)}
              </span>
              <button
                type="button"
                onClick={() => setRevealed(!revealed)}
                className="hover:text-tertiary-fixed transition-colors"
                title="Toggle visibility"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {revealed ? "visibility_off" : "visibility"}
                </span>
              </button>
              <button
                type="button"
                onClick={copyToClipboard}
                className="hover:text-tertiary-fixed transition-colors"
                title="Copy account number"
              >
                <span className="material-symbols-outlined text-[16px]">
                  content_copy
                </span>
              </button>
            </div>
            <span className="text-on-primary-container text-[11px]">
              Opened {formatDate(account.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Transaction Action Card (Deposit / Withdraw) */}
      <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm border border-outline-variant/30 space-y-4">
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-surface-container-low rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab("deposit");
              setFormError("");
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "deposit"
                ? "bg-surface-container-lowest text-tertiary shadow-xs"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">south</span>
            <span>Deposit Funds</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("withdraw");
              setFormError("");
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "withdraw"
                ? "bg-surface-container-lowest text-error shadow-xs"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">north</span>
            <span>Withdraw Funds</span>
          </button>
        </div>

        {formError && (
          <div className="p-3 rounded-xl bg-error-container/50 border border-error/20 flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-error shrink-0 mt-0.5">
              error
            </span>
            <span className="text-xs text-on-error-container font-medium">
              {formError}
            </span>
          </div>
        )}

        <form onSubmit={handleTransaction} className="space-y-4">
          {/* Amount input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">
              Amount to {activeTab === "deposit" ? "Deposit" : "Withdraw"}
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-base font-bold text-on-surface-variant">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full h-12 pl-9 pr-3 rounded-xl bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-bold text-lg tabular-nums placeholder:text-outline/50 outline-none focus:ring-2 focus:ring-primary transition-all border border-outline-variant/30"
              />
            </div>
          </div>

          {/* Quick Amount Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {quickPillAmounts.map((pill) => (
              <button
                key={pill}
                type="button"
                onClick={() => setAmount(pill.toString())}
                className="shrink-0 px-3 py-1 rounded-full bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
              >
                +₹{pill.toLocaleString("en-IN")}
              </button>
            ))}
          </div>

          {/* Optional Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">
              Description / Memo (Optional)
            </label>
            <input
              type="text"
              maxLength={200}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Salary, ATM Cash, Bill Payment"
              className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low focus:bg-surface-container-lowest text-xs text-on-surface placeholder:text-outline/50 outline-none focus:ring-2 focus:ring-primary transition-all border border-outline-variant/30"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || account.status !== "active"}
            className={`w-full h-12 rounded-xl text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${
              activeTab === "deposit"
                ? "bg-tertiary-container hover:bg-tertiary"
                : "bg-error hover:bg-error/90"
            }`}
          >
            {isSubmitting ? (
              <Spinner size="sm" />
            ) : (
              <span className="material-symbols-outlined text-[20px]">
                {activeTab === "deposit" ? "check_circle" : "arrow_forward"}
              </span>
            )}
            <span>
              {isSubmitting
                ? "Processing..."
                : account.status !== "active"
                ? "Account Not Active"
                : activeTab === "deposit"
                ? "Complete Deposit"
                : "Confirm Withdrawal"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default AccountDetails;
