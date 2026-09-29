import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearUser } from "../../store/authSlice";
import { clearAccounts } from "../../store/accountsSlice";
import { logout } from "../../services/authService";
import { getMyAuditLogs } from "../../services/transactionService";
import { getInitials, formatDate, getAuditActionLabel } from "../../utils/formatters";
import Spinner from "../../components/ui/Spinner";
import { useToast } from "../../components/ui/useToast";

function Profile() {
  const user = useSelector((state) => state.auth.user);
  const accounts = useSelector((state) => state.accounts.accounts) || [];
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { ToastComponent } = useToast();

  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    async function loadLogs() {
      setIsLoadingLogs(true);
      try {
        const data = await getMyAuditLogs(1, 10);
        if (data.auditLogs) {
          setAuditLogs(data.auditLogs);
        }
      } catch {
        // Silently handled
      } finally {
        setIsLoadingLogs(false);
      }
    }

    loadLogs();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      // Proceed to clear state even if logout request fails
    } finally {
      dispatch(clearUser());
      dispatch(clearAccounts());
      navigate("/login", { replace: true });
    }
  };

  const initials = getInitials(user?.name || "Client User");

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 py-4 gap-4 pb-16">
      {ToastComponent}

      {/* Profile Identity Card */}
      <section className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-primary-fixed/30 blur-2xl pointer-events-none"></div>

        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3.5">
            {/* Initials Avatar */}
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xl sm:text-2xl shadow-sm ring-4 ring-surface-container-low">
                {initials}
              </div>
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary text-[10px] shadow-sm">
                <span className="material-symbols-outlined text-[12px] font-bold">
                  check
                </span>
              </span>
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-on-surface truncate">
                  {user?.name || "FinLedger User"}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-container/15 text-tertiary text-[11px] font-semibold">
                  <span
                    className="material-symbols-outlined text-[13px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  Active Tier
                </span>
              </div>
              <span className="text-xs text-on-surface-variant font-mono mt-0.5">
                {user?.email || "user@finledger.com"}
              </span>
            </div>
          </div>
        </div>

        {/* Membership pill bar */}
        <div className="mt-4 pt-3 bg-surface-container-low rounded-xl p-3 flex items-center justify-between border border-outline-variant/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-xs">
              <span className="material-symbols-outlined text-[18px]">
                shield
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-on-surface">
                Session Active & Authenticated
              </span>
              <span className="text-[11px] text-on-surface-variant">
                HTTP-only Secure Cookie Authorization
              </span>
            </div>
          </div>
          <span className="text-[11px] text-primary font-bold">Encrypted</span>
        </div>
      </section>

      {/* Quick Stat Highlights */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface-container-lowest p-3.5 rounded-2xl shadow-sm border border-outline-variant/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-tertiary-container/15 flex items-center justify-center text-tertiary shrink-0">
            <span className="material-symbols-outlined text-[20px]">
              security
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] text-on-surface-variant">
              Security Health
            </span>
            <span className="text-sm font-bold text-tertiary truncate">
              100% Secure
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-3.5 rounded-2xl shadow-sm border border-outline-variant/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[20px]">
              account_balance
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] text-on-surface-variant">
              Active Accounts
            </span>
            <span className="text-sm font-bold text-on-surface">
              {accounts.length} {accounts.length === 1 ? "Account" : "Accounts"}
            </span>
          </div>
        </div>
      </div>

      {/* Official Identity Information Card */}
      <section className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30 space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-surface-container-low">
          <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[16px]">badge</span>
          </div>
          <h2 className="text-sm font-bold text-on-surface">
            Registered Account Credentials
          </h2>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low/70">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant shrink-0">
                person
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-on-surface-variant uppercase font-semibold">
                  Account Holder Name
                </span>
                <span className="text-xs font-bold text-on-surface truncate">
                  {user?.name || "FinLedger Client"}
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-tertiary-container/15 text-tertiary text-[11px] font-semibold shrink-0">
              <span className="material-symbols-outlined text-[12px]">
                check_circle
              </span>
              Verified
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low/70">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant shrink-0">
                alternate_email
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-on-surface-variant uppercase font-semibold">
                  Registered Email Address
                </span>
                <span className="text-xs font-bold text-on-surface truncate">
                  {user?.email || "user@example.com"}
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-primary-fixed text-primary text-[11px] font-semibold shrink-0">
              Primary
            </span>
          </div>
        </div>
      </section>

      {/* Real Security Audit Logs Trail */}
      <section className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30 space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-surface-container-low">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[16px]">
                history
              </span>
            </div>
            <h2 className="text-sm font-bold text-on-surface">
              Security & Audit Trail
            </h2>
          </div>
          <span className="text-[11px] text-on-surface-variant font-mono">
            Immutable
          </span>
        </div>

        <div className="flex flex-col divide-y divide-surface-container-low">
          {isLoadingLogs ? (
            <div className="py-6 flex justify-center">
              <Spinner size="sm" />
            </div>
          ) : auditLogs.length === 0 ? (
            <p className="text-xs text-on-surface-variant text-center py-4">
              No audit records generated yet.
            </p>
          ) : (
            auditLogs.map((log) => (
              <div key={log._id} className="py-2.5 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">
                    {log.action?.includes("LOGIN")
                      ? "login"
                      : log.action?.includes("ACCOUNT")
                      ? "account_balance"
                      : "security"}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-on-surface truncate">
                      {getAuditActionLabel(log.action)}
                    </span>
                    <span className="text-[11px] text-on-surface-variant truncate">
                      {log.description || "Activity recorded"}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-on-surface-variant font-mono shrink-0">
                  {formatDate(log.createdAt)}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Account Session Controls & Log Out */}
      <section className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30 space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-surface-container-low">
          <div className="w-7 h-7 rounded-lg bg-error-container text-error flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">logout</span>
          </div>
          <h2 className="text-sm font-bold text-error">Session Controls</h2>
        </div>

        <p className="text-xs text-on-surface-variant leading-relaxed">
          Logging out will invalidate your current session cookie. You will need
          to enter your password again to access your accounts.
        </p>

        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-error text-on-error hover:bg-error/90 active:scale-[0.99] transition-all text-xs font-bold shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>Log Out of FinLedger</span>
        </button>
      </section>

      {/* Institutional Compliance Footnote */}
      <footer className="flex flex-col items-center justify-center gap-1 pt-2 pb-4 text-center">
        <div className="flex items-center gap-1.5 text-on-surface-variant text-xs font-semibold">
          <span className="material-symbols-outlined text-[16px] text-tertiary">
            verified_user
          </span>
          FinLedger Cryptographic Banking Architecture
        </div>
        <span className="text-[10px] text-outline">
          256-bit AES End-to-End Encrypted • Strict Cookie Auth
        </span>
      </footer>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 shadow-2xl border border-outline-variant/30 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-full bg-error-container/40 text-error flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[28px]">
                power_settings_new
              </span>
            </div>
            <h3 className="text-lg font-bold text-on-surface">
              Log Out of FinLedger?
            </h3>
            <p className="text-xs text-on-surface-variant mt-1 mb-5">
              Are you sure you want to end your secure session on this device?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-surface-container text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 py-2.5 rounded-xl bg-error text-on-error text-xs font-bold shadow-sm hover:bg-error/90 transition-colors flex items-center justify-center gap-1.5"
              >
                {isLoggingOut && <Spinner size="sm" />}
                <span>{isLoggingOut ? "Logging out..." : "Log Out"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
