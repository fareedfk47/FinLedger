import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser, setLoading } from "../store/authSlice";
import { setAccounts } from "../store/accountsSlice";
import { getMyAccounts } from "../services/accountService";

/**
 * AuthInitializer
 *
 * Runs once on app mount to restore session from the HTTP-only cookie
 * on a fresh page load or browser refresh.
 *
 * - If Redux already has authenticated state (user just logged in), we
 *   skip the server round-trip entirely — the login flow already
 *   hydrated the store.
 * - If Redux has no state (fresh load / page refresh), we call
 *   GET /api/accounts to check if the cookie is still valid:
 *     200 → set user + accounts in Redux (isAuthenticated = true)
 *     401 → clear user (isAuthenticated = false)
 */
function AuthInitializer({ children }) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    // Already authenticated (e.g. just logged in) — skip server check
    if (isAuthenticated && user) {
      dispatch(setLoading(false));
      return;
    }

    // Fresh page load or refresh — verify session with server
    async function checkSession() {
      try {
        const data = await getMyAccounts();
        dispatch(setUser(data.user));
        dispatch(setAccounts(data.accounts));
      } catch {
        dispatch(clearUser());
      }
    }

    checkSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return children;
}

export default AuthInitializer;
