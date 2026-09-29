import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "../store/authSlice";
import { setAccounts } from "../store/accountsSlice";
import { getMyAccounts } from "../services/accountService";

/**
 * AuthInitializer
 *
 * Runs once on app mount. Calls GET /api/accounts to check if the
 * HTTP-only cookie is still valid (this doubles as a session check
 * since there is no /api/auth/me endpoint).
 *
 * - 200 → set user + accounts in Redux (isAuthenticated = true)
 * - 401 → clear user (isAuthenticated = false, redirected by Axios interceptor)
 * - Other errors → clear user (treat as unauthenticated)
 */
function AuthInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    async function checkSession() {
      try {
        const data = await getMyAccounts();
        // data = { user: { name, email }, accounts[] }
        dispatch(setUser(data.user));
        dispatch(setAccounts(data.accounts));
      } catch {
        dispatch(clearUser());
      }
    }

    checkSession();
  }, [dispatch]);

  return children;
}

export default AuthInitializer;
