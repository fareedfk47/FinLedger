import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { FullPageSpinner } from "../components/ui/Spinner";

/**
 * PublicOnlyRoute — prevents authenticated users from accessing /login or /register.
 * While isLoading → spinner.
 * Once resolved: authenticated → /dashboard; else → render page.
 */
function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default PublicOnlyRoute;
