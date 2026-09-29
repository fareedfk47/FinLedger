import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setAccounts } from "../../store/accountsSlice";
import { getMyAccounts } from "../../services/accountService";
import { transfer } from "../../services/transactionService";
import { formatCurrency, maskAccountNumber } from "../../utils/formatters";
import Spinner from "../../components/ui/Spinner";
import { useToast } from "../../components/ui/useToast";

function Transfer() {
  const accounts = useSelector((state) => state.accounts.accounts) || [];
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();

  const activeAccounts = accounts.filter((a) => a.status === "active");

  const [fromAccountNumber, setFromAccountNumber] = useState(
    activeAccounts[0]?.accountNumber || ""
  );
  const [toAccountNumber, setToAccountNumber] = useState("");
  const [confirmToAccountNumber, setConfirmToAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successReceipt, setSuccessReceipt] = useState(null);

  const selectedSourceAccount = accounts.find(
    (a) => a.accountNumber === fromAccountNumber
  );

  const isMatching =
    toAccountNumber &&
    confirmToAccountNumber &&
    toAccountNumber === confirmToAccountNumber;

  const quickPillAmounts = [500, 1000, 2500, 5000, 10000];

  const handleTransfer = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!fromAccountNumber) {
      setFormError("Please select a source account.");
      return;
    }

    if (!toAccountNumber || !confirmToAccountNumber) {
      setFormError("Please enter and confirm the beneficiary account number.");
      return;
    }

    if (toAccountNumber !== confirmToAccountNumber) {
      setFormError("Beneficiary account numbers do not match.");
      return;
    }

    if (fromAccountNumber === toAccountNumber) {
      setFormError("Source and destination accounts must be different.");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError("Amount must be greater than zero.");
      return;
    }

    if (selectedSourceAccount && numAmount > selectedSourceAccount.balance) {
      setFormError(
        `Insufficient balance. Available balance is ${formatCurrency(
          selectedSourceAccount.balance
        )}.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await transfer(
        fromAccountNumber,
        toAccountNumber.trim(),
        numAmount,
        description.trim()
      );

      // Refresh accounts in Redux
      const accData = await getMyAccounts();
      if (accData.accounts) {
        dispatch(setAccounts(accData.accounts));
      }

      setSuccessReceipt({
        amount: numAmount,
        fromAccount: fromAccountNumber,
        toAccount: toAccountNumber,
        ref: res.transaction?._id,
        createdAt: new Date().toISOString(),
      });

      showToast("Transfer completed successfully!", "success");
      setAmount("");
      setToAccountNumber("");
      setConfirmToAccountNumber("");
      setDescription("");
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          "Transfer failed. Please check the recipient account number and balance."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 py-4 gap-4 pb-12">
      {ToastComponent}

      {/* Header Banner Card */}
      <div className="bg-gradient-to-br from-primary via-primary-container to-primary-fixed-dim rounded-2xl p-5 text-on-primary shadow-sm relative overflow-hidden">
        <div className="absolute -right-4 -bottom-6 w-28 h-28 bg-surface-container-lowest/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="flex items-start justify-between relative z-10">
          <div className="flex flex-col gap-0.5 max-w-[85%]">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-tertiary-fixed">
                verified_user
              </span>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-tertiary-fixed">
                Instant Settlement
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-on-primary">
              Transfer Money
            </h1>
            <p className="text-xs text-on-primary-container leading-tight mt-0.5">
              Real-time funds transfer with FinLedger atomic debit and credit
              ledger verification.
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-container-lowest/15 backdrop-blur-md flex items-center justify-center text-on-primary shadow-inner">
            <span className="material-symbols-outlined text-[24px]">send</span>
          </div>
        </div>
      </div>

      {formError && (
        <div className="p-3.5 rounded-xl bg-error-container/50 border border-error/20 flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[20px] text-error shrink-0 mt-0.5">
            error
          </span>
          <span className="text-xs text-on-error-container font-medium leading-relaxed">
            {formError}
          </span>
        </div>
      )}

      <form onSubmit={handleTransfer} className="space-y-4">
        {/* Step 1: Source Account Selection */}
        <section className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 shadow-sm border border-outline-variant/30 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary-fixed text-primary text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                Debit Source Account
              </span>
            </div>
            <span className="text-[11px] text-tertiary-container bg-surface-container-high px-2 py-0.5 rounded-full font-semibold">
              Verified
            </span>
          </div>

          {activeAccounts.length === 0 ? (
            <p className="text-xs text-error font-medium">
              You do not have any active accounts. Please open one first.
            </p>
          ) : (
            <>
              {/* Account Switcher Chips */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container-low rounded-xl">
                {activeAccounts.map((acc) => {
                  const isSelected = acc.accountNumber === fromAccountNumber;
                  return (
                    <button
                      key={acc.accountNumber}
                      type="button"
                      onClick={() => setFromAccountNumber(acc.accountNumber)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-surface-container-lowest text-primary shadow-xs"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {acc.accountType === "current" ? "domain" : "savings"}
                      </span>
                      <span className="truncate">
                        {acc.accountType === "savings" ? "Savings" : "Current"} (
                        {maskAccountNumber(acc.accountNumber)})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Account Detailed Info */}
              {selectedSourceAccount && (
                <div className="bg-surface-container-low rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">
                        {selectedSourceAccount.accountType === "current"
                          ? "domain"
                          : "savings"}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-on-surface truncate">
                        {selectedSourceAccount.accountType === "savings"
                          ? "Premium Savings Account"
                          : "Current Commercial Account"}
                      </span>
                      <span className="text-[11px] text-on-surface-variant font-mono">
                        {selectedSourceAccount.accountNumber}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-on-surface-variant block">
                      Available Balance
                    </span>
                    <span className="text-sm font-bold text-primary tabular-nums">
                      {formatCurrency(selectedSourceAccount.balance)}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* Step 2: Beneficiary Details */}
        <section className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 shadow-sm border border-outline-variant/30 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary-fixed text-primary text-xs flex items-center justify-center font-bold">
                2
              </span>
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                Beneficiary Details
              </span>
            </div>
            {/* Quick self-transfer option if user has more than 1 account */}
            {activeAccounts.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  const other = activeAccounts.find(
                    (a) => a.accountNumber !== fromAccountNumber
                  );
                  if (other) {
                    setToAccountNumber(other.accountNumber);
                    setConfirmToAccountNumber(other.accountNumber);
                  }
                }}
                className="text-primary text-xs font-bold hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">
                  swap_horiz
                </span>
                Transfer to own account
              </button>
            )}
          </div>

          <div className="space-y-3">
            {/* Beneficiary Account Number */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface-variant">
                Beneficiary Account Number
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[18px] text-outline">
                  credit_card
                </span>
                <input
                  type="text"
                  required
                  value={toAccountNumber}
                  onChange={(e) => setToAccountNumber(e.target.value.trim())}
                  placeholder="Enter 12-digit account number"
                  className="w-full h-11 pl-9 pr-3 bg-surface-container-low focus:bg-surface-container-lowest rounded-xl text-sm font-mono text-on-surface placeholder:text-outline outline-none focus:ring-2 focus:ring-primary transition-all border border-outline-variant/30"
                />
              </div>
            </div>

            {/* Confirm Account Number */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-on-surface-variant">
                  Confirm Beneficiary Account Number
                </label>
                {toAccountNumber && confirmToAccountNumber && (
                  <span
                    className={`text-[11px] font-semibold flex items-center gap-0.5 ${
                      isMatching ? "text-tertiary" : "text-error"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {isMatching ? "check_circle" : "cancel"}
                    </span>
                    {isMatching ? "Matches" : "Does not match"}
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[18px] text-outline">
                  lock
                </span>
                <input
                  type="text"
                  required
                  value={confirmToAccountNumber}
                  onChange={(e) =>
                    setConfirmToAccountNumber(e.target.value.trim())
                  }
                  placeholder="Re-enter account number"
                  className="w-full h-11 pl-9 pr-3 bg-surface-container-low focus:bg-surface-container-lowest rounded-xl text-sm font-mono text-on-surface placeholder:text-outline outline-none focus:ring-2 focus:ring-primary transition-all border border-outline-variant/30"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Step 3: Transfer Amount & Description */}
        <section className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 shadow-sm border border-outline-variant/30 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary-fixed text-primary text-xs flex items-center justify-center font-bold">
                3
              </span>
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                Transfer Amount
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-lg font-bold text-on-surface-variant">
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
                className="w-full h-12 pl-9 pr-3 rounded-xl bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-bold text-xl tabular-nums placeholder:text-outline/50 outline-none focus:ring-2 focus:ring-primary transition-all border border-outline-variant/30"
              />
            </div>

            {/* Quick Pills */}
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

            {/* Description */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface-variant">
                Payment Remark / Memo (Optional)
              </label>
              <input
                type="text"
                maxLength={200}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Rent, Vendor Payment, Personal"
                className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low focus:bg-surface-container-lowest text-xs text-on-surface placeholder:text-outline/50 outline-none focus:ring-2 focus:ring-primary transition-all border border-outline-variant/30"
              />
            </div>
          </div>

          {/* Transfer Button */}
          <button
            type="submit"
            disabled={isSubmitting || !isMatching}
            className="w-full mt-2 h-12 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Spinner size="sm" />
            ) : (
              <span className="material-symbols-outlined text-[20px]">
                arrow_forward
              </span>
            )}
            <span>{isSubmitting ? "Settling Transfer..." : "Transfer Funds"}</span>
          </button>
        </section>
      </form>

      {/* Success Modal / Receipt */}
      {successReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 shadow-2xl border border-outline-variant/30 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-full bg-tertiary-fixed/40 text-tertiary flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[36px]">
                check_circle
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-on-surface">
              Transfer Successful!
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">
              Funds have been transferred and recorded on the immutable ledger.
            </p>

            <div className="my-5 p-3.5 rounded-xl bg-surface-container-low space-y-2 text-left">
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">Amount:</span>
                <span className="font-bold text-on-surface tabular-nums">
                  {formatCurrency(successReceipt.amount)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">From Account:</span>
                <span className="font-mono text-on-surface">
                  {maskAccountNumber(successReceipt.fromAccount)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">To Account:</span>
                <span className="font-mono text-on-surface">
                  {maskAccountNumber(successReceipt.toAccount)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">Reference ID:</span>
                <span className="font-mono text-[10px] text-primary truncate max-w-[150px]">
                  {successReceipt.ref}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSuccessReceipt(null)}
                className="flex-1 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface transition-colors"
              >
                Make Another
              </button>
              <button
                onClick={() => navigate("/ledger")}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-sm hover:bg-primary-container transition-colors"
              >
                View Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transfer;
