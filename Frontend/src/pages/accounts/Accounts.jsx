import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addAccount } from "../../store/accountsSlice";
import { createAccount } from "../../services/accountService";
import { formatCurrency, maskAccountNumber } from "../../utils/formatters";
import Spinner from "../../components/ui/Spinner";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import { useToast } from "../../components/ui/useToast";

function Accounts() {
  const accounts = useSelector((state) => state.accounts.accounts) || [];
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();

  const [revealedAccounts, setRevealedAccounts] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAccountType, setNewAccountType] = useState("savings");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  const totalBalance = accounts.reduce((acc, curr) => acc + (curr.balance || 0), 0);
  const activeCount = accounts.filter((a) => a.status === "active").length;

  const toggleMask = (accountNumber) => {
    setRevealedAccounts((prev) => ({
      ...prev,
      [accountNumber]: !prev[accountNumber],
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast("Account number copied to clipboard", "success");
  };

  const handleOpenAccount = async (e) => {
    e.preventDefault();
    setModalError("");
    setIsSubmitting(true);

    try {
      const res = await createAccount(newAccountType);
      if (res.account) {
        dispatch(addAccount(res.account));
        showToast(
          `${newAccountType === "savings" ? "Savings" : "Current"} account created successfully!`,
          "success"
        );
        setIsModalOpen(false);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Could not create account. Please try again.";
      setModalError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 py-4 gap-4 pb-12">
      {ToastComponent}

      {/* Header with Title & Open New Account Button */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex flex-col min-w-0 pr-2">
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Bank Accounts
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant truncate">
            Manage your active savings & current checking accounts
          </p>
        </div>
        <button
          onClick={() => {
            setModalError("");
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-sm transition-transform active:scale-95 shrink-0"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Open Account</span>
        </button>
      </div>

      {/* Total Liquidity Summary Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-container via-primary to-on-primary-fixed text-on-primary p-5 shadow-sm">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-primary-container">
              Total Liquidity Summary
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-on-primary text-xs font-medium backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed"></span>
              {activeCount} Active {activeCount === 1 ? "Account" : "Accounts"}
            </span>
          </div>

          <div className="pt-1">
            <span className="text-xs text-on-primary-container">Combined Balance</span>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-primary mt-0.5 tabular-nums">
              {formatCurrency(totalBalance)}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-on-primary-container text-xs">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">
                verified_user
              </span>
              Real-time synchronized ledger
            </span>
            <span
              onClick={() => navigate("/ledger")}
              className="text-on-primary text-xs font-semibold underline cursor-pointer"
            >
              Ledger Trail
            </span>
          </div>
        </div>
      </div>

      {/* Accounts List */}
      <div className="flex flex-col space-y-3">
        {accounts.length === 0 ? (
          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm border border-outline-variant/30">
            <EmptyState
              icon="account_balance_wallet"
              title="No Bank Accounts Found"
              message="Open your first savings or current account to deposit money, make transfers, and keep an immutable ledger."
              action={{
                label: "Open Account",
                onClick: () => setIsModalOpen(true),
              }}
            />
          </div>
        ) : (
          accounts.map((acc) => {
            const isRevealed = revealedAccounts[acc.accountNumber];
            const isCurrent = acc.accountType === "current";

            return (
              <div
                key={acc._id || acc.accountNumber}
                className="rounded-2xl bg-surface-container-lowest p-4 sm:p-5 shadow-sm border border-outline-variant/30 space-y-3"
              >
                {/* Top Info Row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        isCurrent
                          ? "bg-secondary-fixed text-on-secondary-fixed"
                          : "bg-surface-container-high text-primary"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[22px]">
                        {isCurrent ? "domain" : "savings"}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-on-surface">
                          {isCurrent ? "Current Commercial Account" : "Premium Savings Account"}
                        </h3>
                        <StatusBadge status={acc.status} />
                      </div>

                      {/* Account Number with Mask & Copy */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-on-surface-variant font-mono font-medium">
                          {isRevealed
                            ? acc.accountNumber
                            : maskAccountNumber(acc.accountNumber)}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleMask(acc.accountNumber)}
                          className="text-on-surface-variant hover:text-primary transition-colors"
                          title="Toggle account number visibility"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {isRevealed ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(acc.accountNumber)}
                          className="text-on-surface-variant hover:text-primary transition-colors"
                          title="Copy account number"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            content_copy
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Balance & Action Buttons */}
                <div className="flex items-end justify-between pt-2 border-t border-surface-container-low">
                  <div className="flex flex-col">
                    <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                      Available Balance
                    </span>
                    <span className="text-2xl font-extrabold text-on-surface tracking-tight tabular-nums">
                      {formatCurrency(acc.balance)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/accounts/${acc.accountNumber}`)}
                      className="px-3.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary text-xs font-bold transition-colors"
                    >
                      Transact / Details →
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Open Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-xl border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-fixed text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">
                    account_balance
                  </span>
                </div>
                <h2 className="text-lg font-bold text-on-surface">
                  Open New Account
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-error-container/50 border border-error/20 flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-error shrink-0 mt-0.5">
                  error
                </span>
                <span className="text-xs text-on-error-container font-medium">
                  {modalError}
                </span>
              </div>
            )}

            <form onSubmit={handleOpenAccount} className="space-y-4">
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Choose the type of account you wish to open. FinLedger automatically
                generates a cryptographic account number and sets an initial zero balance.
              </p>

              <div className="space-y-2">
                <label
                  onClick={() => setNewAccountType("savings")}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    newAccountType === "savings"
                      ? "border-primary bg-primary-fixed/20 text-on-surface"
                      : "border-outline-variant/50 bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[22px] text-primary">
                      savings
                    </span>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-bold text-on-surface">
                        Savings Account
                      </span>
                      <span className="text-[11px] text-on-surface-variant">
                        Personal deposits, salary, and everyday savings
                      </span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="accountType"
                    checked={newAccountType === "savings"}
                    onChange={() => setNewAccountType("savings")}
                    className="w-4 h-4 text-primary"
                  />
                </label>

                <label
                  onClick={() => setNewAccountType("current")}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    newAccountType === "current"
                      ? "border-primary bg-primary-fixed/20 text-on-surface"
                      : "border-outline-variant/50 bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[22px] text-primary">
                      domain
                    </span>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-bold text-on-surface">
                        Current Account
                      </span>
                      <span className="text-[11px] text-on-surface-variant">
                        High-volume commercial transactions & operations
                      </span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="accountType"
                    checked={newAccountType === "current"}
                    onChange={() => setNewAccountType("current")}
                    className="w-4 h-4 text-primary"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-sm transition-transform active:scale-95 disabled:opacity-60"
                >
                  {isSubmitting && <Spinner size="sm" />}
                  <span>{isSubmitting ? "Creating..." : "Confirm & Open"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Accounts;
