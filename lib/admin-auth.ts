/**
 * Admin session flag for the admin shell (localStorage).
 * When NEXT_PUBLIC_API_BASE_URL is set, sign-in uses POST /api/auth/login
 * with role Admin — see admin-login page and ADMIN_API_SPECIFICATION.md.
 * Demo username/password below apply only when no API URL is configured.
 */

const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "seone2024" // Change this in production!
};

const ADMIN_SESSION_KEY = "se-one-admin-session";

export function validateAdminCredentials(username: string, password: string): boolean {
  return username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password;
}

export function setAdminSession(): void {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return;
  localStorage.setItem(ADMIN_SESSION_KEY, "true");
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return;
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return false;
  return localStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

export function getAdminCredentials() {
  return { ...ADMIN_CREDENTIALS };
}