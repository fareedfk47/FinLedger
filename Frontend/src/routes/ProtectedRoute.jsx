import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { FullPageSpinner } from "../components/ui/Spinner";

/**
 * ProtectedRoute — blocks unauthenticated users.
 * While isLoading (session check pending), shows a spinner.
 * Once resolved: authenticated → render children; else → /login.
 */
function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
