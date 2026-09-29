import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthInitializer from "../components/AuthInitializer";
import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";
import AppLayout from "../layouts/AppLayout";

// Auth pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Authenticated pages
import Dashboard from "../pages/dashboard/Dashboard";
import Accounts from "../pages/accounts/Accounts";
import AccountDetails from "../pages/accounts/AccountDetails";
import Transfer from "../pages/transactions/Transfer";
import Transactions from "../pages/transactions/Transactions";
import Ledger from "../pages/ledger/Ledger";
import Profile from "../pages/profile/Profile";

function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthInitializer>
        <Routes>
          {/* Default: redirect / → /login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public-only routes (redirect to /dashboard if logged in) */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected routes (redirect to /login if not logged in) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/accounts/:accountNumber" element={<AccountDetails />} />
              <Route path="/transfer" element={<Transfer />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/ledger" element={<Ledger />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthInitializer>
    </BrowserRouter>
  );
}

export default AppRoutes;