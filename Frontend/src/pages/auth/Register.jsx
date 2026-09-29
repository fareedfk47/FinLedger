import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/authSlice";
import { setAccounts } from "../../store/accountsSlice";
import { register } from "../../services/authService";
import { getMyAccounts } from "../../services/accountService";
import Spinner from "../../components/ui/Spinner";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (name.trim().length < 3) {
      setError("Name must be at least 3 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const data = await register(
        name.trim(),
        email.trim().toLowerCase(),
        password,
        confirmPassword
      );

      // Fetch accounts to hydrate Redux
      const accountsData = await getMyAccounts();

      dispatch(setUser(data.user));
      dispatch(setAccounts(accountsData.accounts));

      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
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

          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 sm:flex">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">
              verified_user
            </span>
            <span className="text-xs font-semibold text-slate-600">
              Secure Registration
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] sm:p-8">
            {/* Heading */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                <span className="material-symbols-outlined text-[28px] text-blue-600">
                  person_add
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Create Account
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Join FinLedger and take control of your finances.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <span className="material-symbols-outlined mt-0.5 text-[18px] text-red-600 shrink-0">
                  error
                </span>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Full Name
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[21px] text-slate-400">
                    badge
                  </span>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    autoComplete="name"
                    required
                    disabled={isLoading}
                    minLength={3}
                    maxLength={50}
                    className="h-12 w-full rounded-lg border border-slate-300 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                  />
                </div>
              </div>

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
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[21px] text-slate-400">
                    lock
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    disabled={isLoading}
                    className="h-12 w-full rounded-lg border border-slate-300 bg-white pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <span className="material-symbols-outlined text-[21px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[21px] text-slate-400">
                    lock_reset
                  </span>
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    required
                    disabled={isLoading}
                    className="h-12 w-full rounded-lg border border-slate-300 bg-white pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    <span className="material-symbols-outlined text-[21px]">
                      {showConfirm ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" />
                    <span>Creating Account…</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-0.5">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Login link */}
            <div className="mt-7 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-bold text-blue-600 transition hover:text-blue-700"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-7 text-center">
            <p className="text-[11px] text-slate-400">
              © 2026 FinLedger. Banking Management System.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Register;