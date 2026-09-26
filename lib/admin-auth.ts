/** Client-side admin UI session flag; authorization remains enforced by the API. */

const ADMIN_SESSION_KEY = "se-one-admin-session";

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
