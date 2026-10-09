import { apiFetch } from "./client";
import type { Role } from "@/lib/auth-client";

/**
 * ---------------------------------------------------------------------
 * These endpoint paths and field names are a best guess at a conventional
 * ASP.NET Core Web API auth controller. They are the ONE place you should
 * need to edit to match your real .NET API — every component that calls
 * login()/register()/fetchCurrentUser() only depends on the AuthUser /
 * AuthResponse shapes below, not on these exact URLs or field names.
 *
 * Assumed endpoints:
 *   POST /api/auth/login    { email, password }        -> AuthResponse
 *   POST /api/auth/register { fullName, email,
 *                             password, role }          -> AuthResponse
 *   GET  /api/auth/me       (auth required)             -> AuthUser
 *   POST /api/auth/logout   (auth required)             -> 204 / ignored
 *
 * If your API's JSON uses PascalCase (common in ASP.NET) instead of
 * camelCase, either enable camelCase JSON output on the server
 * (System.Text.Json PropertyNamingPolicy.CamelCase, or Newtonsoft's
 * CamelCasePropertyNamesContractResolver), or adjust the field lookups
 * below (e.g. data.FullName ?? data.fullName).
 * ---------------------------------------------------------------------
 */

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

function normalizeRole(raw: unknown): Role {
  const value = String(raw).toLowerCase();
  if (value === "teacher") return "teacher";
  if (value === "admin") return "admin";
  return "student";
}

function fullNameFrom(...records: any[]): string {
  for (const record of records) {
    if (!record) continue;
    const fullName =
      record.fullName ?? record.FullName ?? record.name ?? record.Name;
    if (typeof fullName === "string" && fullName.trim()) return fullName.trim();
    const firstName =
      record.firstName ??
      record.FirstName ??
      record.givenName ??
      record.GivenName;
    const lastName =
      record.lastName ??
      record.LastName ??
      record.familyName ??
      record.FamilyName;
    const combined = [firstName, lastName]
      .filter((part) => typeof part === "string" && part.trim())
      .join(" ")
      .trim();
    if (combined) return combined;
  }
  return "";
}

function toAuthResponse(
  data: any,
  fallback: { fullName?: string; email?: string; role?: Role } = {},
): AuthResponse {
  return {
    token: data.token ?? data.accessToken ?? "",
    user: {
      id: data.user?.id ?? data.id ?? "",
      fullName: fullNameFrom(data.user, data) || fallback.fullName || "",
      email: data.user?.email ?? data.email ?? fallback.email ?? "",
      role: normalizeRole(data.user?.role ?? data.role ?? fallback.role),
    },
  };
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const data = await apiFetch<any>("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
  return toAuthResponse(data, { email });
}

export async function register(input: {
  fullName: string;
  email: string;
  password: string;
  role: Role;
  dateOfBirth?: string;
  parentalConsent?: boolean;
}): Promise<AuthResponse> {
  const nameParts = input.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const familyName = nameParts.slice(1).join(" ") || "-";

  const data = await apiFetch<any>("/api/auth/register", {
    method: "POST",
    body: {
      firstName,
      familyName,
      email: input.email,
      password: input.password,
      ...(input.role === "student"
        ? {
            dateOfBirth: input.dateOfBirth,
            parentalConsent: input.parentalConsent ?? false,
          }
        : {}),
      // Adjust casing here if your .NET enum expects "Student"/"Teacher"
      // vs. lowercase — this sends the capitalized form since that's the
      // more common ASP.NET convention.
      role: input.role === "teacher" ? "Teacher" : "Student",
    },
  });
  return toAuthResponse(data, {
    fullName: input.fullName,
    email: input.email,
    role: input.role,
  });
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const data = await apiFetch<any>("/api/auth/me");
  const user = data.user ?? data;
  return {
    id: user.id ?? user.Id ?? "",
    fullName: fullNameFrom(user, data),
    email: user.email ?? user.Email ?? "",
    role: normalizeRole(user.role ?? user.Role),
  };
}

export async function logoutApi(): Promise<void> {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } catch {
    // best-effort — the local session is cleared regardless of whether
    // the server call succeeds
  }
}

/**
 * Phone/OTP login — assumed endpoints (adjust to match your API):
 *   POST /api/auth/otp/request { phone }        -> 204, sends the SMS code
 *   POST /api/auth/otp/verify  { phone, code }  -> AuthResponse, same shape as login()
 */
export async function requestOtp(phone: string): Promise<void> {
  await apiFetch("/api/auth/otp/request", {
    method: "POST",
    body: { phone },
  });
}

export async function verifyOtp(
  phone: string,
  code: string,
): Promise<AuthResponse> {
  const data = await apiFetch<any>("/api/auth/otp/verify", {
    method: "POST",
    body: { phone, code },
  });
  return toAuthResponse(data);
}

/**
 * Assumed endpoint: POST /api/auth/forgot-password { email } -> 204
 */
export async function requestPasswordReset(email: string): Promise<void> {
  await apiFetch("/api/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}
