import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { getInitials } from "../../utils/formatters";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/accounts": "Accounts",
  "/transfer": "Transfer",
  "/transactions": "Transactions",
  "/ledger": "Ledger",
  "/audit-logs": "Audit Logs",
  "/profile": "Profile",
};

function TopBar() {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();

  const subtitle =
    pageTitles[location.pathname] ||
    (location.pathname.startsWith("/accounts/") ? "Account Details" : "FinLedger");

  const initials = getInitials(user?.name || "");

  return (
    <header className="fixed top-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
      <div className="h-16 px-4 flex items-center justify-between">
        {/* Logo + page title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px] text-on-primary">
              account_balance
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-primary tracking-tight">
              FinLedger
            </span>
            <span className="text-[11px] font-medium text-on-surface-variant">
              {subtitle}
            </span>
          </div>
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-on-primary-container">
            {initials}
          </span>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
