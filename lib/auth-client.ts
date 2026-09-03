"use client";

import { setToken } from "./api/client";
import type { AuthResponse } from "./api/auth";

export type Role = "student" | "teacher" | "admin";

const ROLE_KEY = "se-one-role";
const NAME_KEY = "se-one-name";
const EMAIL_KEY = "se-one-email";

/** Call this after a successful login()/register() API call. */
export function storeAuth(auth: AuthResponse) {
  if (typeof window === "undefined") return;
  setToken(auth.token || null);
  window.localStorage.setItem(ROLE_KEY, auth.user.role);
  window.localStorage.setItem(NAME_KEY, auth.user.fullName || "");
  window.localStorage.setItem(EMAIL_KEY, auth.user.email || "");
}

export function getRole(): Role | null {
  if (typeof window === "undefined") return null;
  const r = window.localStorage.getItem(ROLE_KEY);
  return r === "student" || r === "teacher" || r === "admin" ? r : null;
}

export function getName(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(NAME_KEY);
}

export function getEmail(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(EMAIL_KEY);
}

export function clearSession() {
  if (typeof window === "undefined") return;
  setToken(null);
  window.localStorage.removeItem(ROLE_KEY);
  window.localStorage.removeItem(NAME_KEY);
  window.localStorage.removeItem(EMAIL_KEY);
}

export function dashboardPathFor(role: Role) {
  if (role === "teacher") return "/teacher";
  if (role === "admin") return "/admin";
  return "/dashboard";
}
