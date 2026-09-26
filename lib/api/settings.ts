import { apiFetch } from "./client";

/**
 * User Settings/Profile API client
 * Handle user profile updates, password changes, avatar management, 2FA, and account deletion
 */

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  country?: string;
  language: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
};

export type NotificationPreferences = {
  email: {
    booking: boolean;
    payment: boolean;
    assignment: boolean;
    message: boolean;
    promotion: boolean;
    newsletter: boolean;
  };
  push: {
    booking: boolean;
    payment: boolean;
    assignment: boolean;
    message: boolean;
    promotion: boolean;
  };
  inApp: {
    booking: boolean;
    payment: boolean;
    assignment: boolean;
    message: boolean;
    promotion: boolean;
  };
};

export type TwoFactorStatus = {
  enabled: boolean;
  method: "sms" | "app" | "email";
  phoneNumber?: string;
  email?: string;
  backupCodes?: string[];
};

export type UpdateProfileInput = Partial<Pick<UserProfile,
  "fullName" | "bio" | "dateOfBirth" | "phoneNumber" | "country" | "language" | "timezone"
>>;

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type ApiRecord = Record<string, unknown>;

function value(record: ApiRecord, ...keys: string[]) {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key];
  }
  return undefined;
}

function text(record: ApiRecord, ...keys: string[]): string {
  const result = value(record, ...keys);
  return typeof result === "string"
    ? result
    : result == null
      ? ""
      : String(result);
}

function normalizeProfile(raw: unknown): UserProfile {
  const record = (raw ?? {}) as ApiRecord;
  return {
    id: text(record, "id", "Id", "userId", "UserId"),
    fullName: text(record, "fullName", "FullName", "name", "Name"),
    email: text(record, "email", "Email"),
    avatarUrl: text(record, "avatarUrl", "AvatarUrl", "avatar", "Avatar") || undefined,
    bio: text(record, "bio", "Bio", "about", "About") || undefined,
    dateOfBirth: text(record, "dateOfBirth", "DateOfBirth", "dob", "Dob") || undefined,
    phoneNumber: text(record, "phoneNumber", "PhoneNumber", "phone", "Phone") || undefined,
    country: text(record, "country", "Country") || undefined,
    language: text(record, "language", "Language", "locale", "Locale"),
    timezone: text(record, "timezone", "Timezone"),
    createdAt: text(record, "createdAt", "CreatedAt"),
    updatedAt: text(record, "updatedAt", "UpdatedAt"),
  };
}

function normalizeNotificationPreferences(raw: unknown): NotificationPreferences {
  const record = (raw ?? {}) as ApiRecord;
  const email = (value(record, "email", "Email") as ApiRecord) || {};
  const push = (value(record, "push", "Push") as ApiRecord) || {};
  const inApp = (value(record, "inApp", "InApp", "in_app", "In_app") as ApiRecord) || {};

  return {
    email: {
      booking: Boolean(value(email, "booking", "Booking")),
      payment: Boolean(value(email, "payment", "Payment")),
      assignment: Boolean(value(email, "assignment", "Assignment")),
      message: Boolean(value(email, "message", "Message")),
      promotion: Boolean(value(email, "promotion", "Promotion")),
      newsletter: Boolean(value(email, "newsletter", "Newsletter")),
    },
    push: {
      booking: Boolean(value(push, "booking", "Booking")),
      payment: Boolean(value(push, "payment", "Payment")),
      assignment: Boolean(value(push, "assignment", "Assignment")),
      message: Boolean(value(push, "message", "Message")),
      promotion: Boolean(value(push, "promotion", "Promotion")),
    },
    inApp: {
      booking: Boolean(value(inApp, "booking", "Booking")),
      payment: Boolean(value(inApp, "payment", "Payment")),
      assignment: Boolean(value(inApp, "assignment", "Assignment")),
      message: Boolean(value(inApp, "message", "Message")),
      promotion: Boolean(value(inApp, "promotion", "Promotion")),
    },
  };
}

function normalizeTwoFactorStatus(raw: unknown): TwoFactorStatus {
  const record = (raw ?? {}) as ApiRecord;
  return {
    enabled: Boolean(value(record, "enabled", "Enabled")),
    method: (value(record, "method", "Method") as TwoFactorStatus["method"]) || "app",
    phoneNumber: text(record, "phoneNumber", "PhoneNumber") || undefined,
    email: text(record, "email", "Email") || undefined,
    backupCodes: (value(record, "backupCodes", "BackupCodes") as string[]) || undefined,
  };
}

// --- Profile ---

/**
 * GET /api/user/profile
 * Get current user's profile
 */
export async function getUserProfile(): Promise<UserProfile> {
  const data = await apiFetch<unknown>("/api/user/profile");
  return normalizeProfile(data);
}

/**
 * PATCH /api/user/profile
 * Update user profile
 */
export async function updateUserProfile(input: UpdateProfileInput): Promise<UserProfile> {
  const data = await apiFetch<unknown>("/api/user/profile", {
    method: "PATCH",
    body: input,
  });
  return normalizeProfile(data);
}

/**
 * POST /api/user/profile/avatar
 * Upload avatar
 */
export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  const formData = new FormData();
  formData.append("avatar", file);
  
  const data = await apiFetch<{ avatarUrl: string }>("/api/user/profile/avatar", {
    method: "POST",
    body: formData as any, // FormData needs special handling
    headers: undefined, // Let browser set Content-Type for FormData
  });
  return data;
}

/**
 * DELETE /api/user/profile/avatar
 * Remove avatar
 */
export async function removeAvatar(): Promise<void> {
  await apiFetch("/api/user/profile/avatar", { method: "DELETE" });
}

// --- Password ---

/**
 * POST /api/user/password/change
 * Change password
 */
export async function changePassword(input: ChangePasswordInput): Promise<void> {
  await apiFetch("/api/user/password/change", {
    method: "POST",
    body: input,
  });
}

// --- 2FA ---

/**
 * GET /api/user/2fa/status
 * Get 2FA status
 */
export async function getTwoFactorStatus(): Promise<TwoFactorStatus> {
  const data = await apiFetch<unknown>("/api/user/2fa/status");
  return normalizeTwoFactorStatus(data);
}

/**
 * POST /api/user/2fa/enable
 * Enable 2FA
 */
export async function enableTwoFactor(method: "sms" | "app" | "email"): Promise<{
  secret?: string;
  qrCodeUrl?: string;
  backupCodes?: string[];
}> {
  const data = await apiFetch<unknown>("/api/user/2fa/enable", {
    method: "POST",
    body: { method },
  });
  const record = (data ?? {}) as ApiRecord;
  return {
    secret: text(record, "secret", "Secret") || undefined,
    qrCodeUrl: text(record, "qrCodeUrl", "QrCodeUrl") || undefined,
    backupCodes: (value(record, "backupCodes", "BackupCodes") as string[]) || undefined,
  };
}

/**
 * POST /api/user/2fa/verify
 * Verify 2FA setup
 */
export async function verifyTwoFactor(code: string): Promise<void> {
  await apiFetch("/api/user/2fa/verify", {
    method: "POST",
    body: { code },
  });
}

/**
 * POST /api/user/2fa/disable
 * Disable 2FA
 */
export async function disableTwoFactor(password: string): Promise<void> {
  await apiFetch("/api/user/2fa/disable", {
    method: "POST",
    body: { password },
  });
}

/**
 * POST /api/user/2fa/backup/regenerate
 * Regenerate backup codes
 */
export async function regenerateBackupCodes(password: string): Promise<string[]> {
  const data = await apiFetch<{ backupCodes: string[] }>("/api/user/2fa/backup/regenerate", {
    method: "POST",
    body: { password },
  });
  return data.backupCodes || [];
}

// --- Notification Preferences ---

/**
 * GET /api/user/notifications/preferences
 * Get notification preferences
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const data = await apiFetch<unknown>("/api/user/notifications/preferences");
  return normalizeNotificationPreferences(data);
}

/**
 * PATCH /api/user/notifications/preferences
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
  const data = await apiFetch<unknown>("/api/user/notifications/preferences", {
    method: "PATCH",
    body: preferences,
  });
  return normalizeNotificationPreferences(data);
}

// --- Account Deletion ---

/**
 * POST /api/user/account/delete
 * Request account deletion
 */
export async function requestAccountDeletion(password: string): Promise<{
  deletionToken: string;
  scheduledDate: string;
}> {
  const data = await apiFetch<{
    deletionToken: string;
    scheduledDate: string;
  }>("/api/user/account/delete", {
    method: "POST",
    body: { password },
  });
  return data;
}

/**
 * DELETE /api/user/account/delete/{token}
 * Confirm account deletion
 */
export async function confirmAccountDeletion(token: string): Promise<void> {
  await apiFetch(`/api/user/account/delete/${token}`, { method: "DELETE" });
}

/**
 * POST /api/user/account/delete/cancel
 * Cancel pending account deletion
 */
export async function cancelAccountDeletion(): Promise<void> {
  await apiFetch("/api/user/account/delete/cancel", { method: "POST" });
}
