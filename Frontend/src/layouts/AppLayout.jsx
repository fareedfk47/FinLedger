import { Outlet } from "react-router-dom";
import TopBar from "../components/ui/TopBar";
import BottomTabBar from "../components/ui/BottomTabBar";

/**
 * AppLayout — wraps all authenticated pages.
 * Provides: fixed TopBar + scrollable content area + fixed BottomTabBar.
 */
function AppLayout() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <TopBar />

      {/* Main content — padded to clear fixed top/bottom bars */}
      <main className="flex-1 pt-16 pb-20">
        <Outlet />
      </main>

      <BottomTabBar />
    </div>
  );
}

export default AppLayout;
