import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/authSlice";
import { setAccounts } from "../../store/accountsSlice";
import { login } from "../../services/authService";
import { getMyAccounts } from "../../services/accountService";
import Spinner from "../../components/ui/Spinner";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 1. Call login API
      const data = await login(email.trim().toLowerCase(), password);

      // 2. Fetch user accounts to hydrate Redux
      let userAccounts = [];
      try {
        const accountsData = await getMyAccounts();
        userAccounts = accountsData.accounts || [];
      } catch {
        // Handled silently; accounts will load on dashboard
      }

      // 3. Update Redux store
      dispatch(setUser(data.user));
      dispatch(setAccounts(userAccounts));

      // 4. Navigate to dashboard
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Invalid email or password. Please check your credentials.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 no-underline">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <span className="material-symbols-outlined text-[24px]">
                account_balance
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                FinLedger
              </h1>
              <p className="hidden text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400 sm:block">
                Banking Management System
              </p>
            </div>
          </Link>

          {/* Security badge */}
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 sm:flex">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">
              verified_user
            </span>
            <span className="text-xs font-semibold text-slate-600">
              Secure Authentication
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] sm:p-8">
            {/* Heading */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                <span className="material-symbols-outlined text-[28px] text-blue-600">
                  lock
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Welcome Back
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to securely access your FinLedger account.
              </p>
            </div>

            {/* Error message alert */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <span className="material-symbols-outlined mt-0.5 text-[18px] text-red-600 shrink-0">
                  error
                </span>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[21px] text-slate-400">
                    mail
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    disabled={isLoading}
                    className="h-12 w-full rounded-lg border border-slate-300 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[21px] text-slate-400">
                    lock
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    disabled={isLoading}
                    className="h-12 w-full rounded-lg border border-slate-300 bg-white pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined text-[21px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" />
                    <span>Signing In Securely…</span>
                  </>
                ) : (
                  <>
                    <span>Sign In Securely</span>
                    <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-0.5">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Security Information */}
            <div className="mt-7 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <div className="flex gap-3">
                <span className="material-symbols-outlined mt-0.5 text-[20px] text-blue-600">
                  shield
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Your account is protected
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    FinLedger uses secure cookie-based authentication and
                    protected API access to help keep your account data safe.
                  </p>
                </div>
              </div>
            </div>

            {/* Register link */}
            <div className="mt-7 text-center">
              <p className="text-sm text-slate-500">
                Don&apos;t have an account?{" "}
                <Link
                  to="/register"
                  className="font-bold text-blue-600 transition hover:text-blue-700"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-7 text-center">
            <div className="mb-3 flex items-center justify-center gap-5 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">
                  security
                </span>
                Secure Authentication
              </span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">
                  history
                </span>
                Audit Logging
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              © 2026 FinLedger. Banking Management System.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;