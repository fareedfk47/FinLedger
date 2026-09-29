import axiosInstance from "./axiosInstance";

/**
 * POST /api/auth/register
 * Body: { name, email, password, confirmPassword }
 * Returns: { status, user: { id, name, email } }
 */
export async function register(name, email, password, confirmPassword) {
  const response = await axiosInstance.post("/auth/register", {
    name,
    email,
    password,
    confirmPassword,
  });
  return response.data;
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: { status, user: { id, name, email } }
 */
export async function login(email, password) {
  const response = await axiosInstance.post("/auth/login", { email, password });
  return response.data;
}

/**
 * POST /api/auth/logout
 * Auth required. Clears the HTTP-only token cookie.
 * Returns: { status, message }
 */
export async function logout() {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
}
