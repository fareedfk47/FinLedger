import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/dashboard", icon: "home", label: "Home" },
  { to: "/accounts", icon: "account_balance_wallet", label: "Accounts" },
  { to: "/transfer", icon: "sync_alt", label: "Transfer" },
  { to: "/ledger", icon: "receipt_long", label: "Ledger" },
  { to: "/profile", icon: "person", label: "Profile" },
];

function BottomTabBar() {
  return (
    <nav className="fixed bottom-0 w-full z-50 bg-surface-container-lowest/95 backdrop-blur-xl border-t border-outline-variant pb-safe">
      <div className="flex items-stretch h-16">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 gap-0.5 transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`flex items-center justify-center w-12 h-7 rounded-full transition-colors ${
                    isActive ? "bg-secondary-container" : ""
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[22px]"
                    style={{
                      fontVariationSettings: isActive
                        ? "'FILL' 1, 'wght' 500"
                        : "'FILL' 0, 'wght' 400",
                    }}
                  >
                    {tab.icon}
                  </span>
                </div>
                <span className="text-[10px] font-semibold leading-none tracking-wide">
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default BottomTabBar;
