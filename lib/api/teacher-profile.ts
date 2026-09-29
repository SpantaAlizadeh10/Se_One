import { apiFetch } from "./client";

/**
 * Teacher Profile API client
 * Handle teacher profile completion and settings updates
 */

export type TeacherProfileData = {
  subject: string;
  level: string;
  teachingLanguage: "english" | "german";
  bio: string;
  avatarUrl?: string;
  videoUrl?: string;
};

export type TeacherProfileResponse = {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  teachingLanguage: "english" | "german";
  subject: string;
  level: string;
  rating: number;
  bio: string;
  videoUrl?: string;
  status: "pending" | "active" | "suspended";
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

function numberValue(record: ApiRecord, ...keys: string[]): number {
  const n = Number(value(record, ...keys) ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function normalizeTeacherLanguage(raw: unknown): "english" | "german" {
  const v = String(raw ?? "english").toLowerCase();
  return v.includes("german") || v.includes("de") ? "german" : "english";
}

function normalizeTeacherProfile(raw: unknown): TeacherProfileResponse {
  const record = (raw ?? {}) as ApiRecord;
  const statusRaw = text(record, "status", "Status").toLowerCase();
  const status: "pending" | "active" | "suspended" =
    statusRaw === "pending" || statusRaw === "suspended" ? statusRaw : "active";

  return {
    id: text(record, "id", "Id"),
    userId: text(record, "userId", "UserId"),
    fullName: text(record, "fullName", "FullName", "name", "Name"),
    email: text(record, "email", "Email"),
    avatarUrl: text(record, "avatarUrl", "AvatarUrl", "avatar", "Avatar"),
    teachingLanguage: normalizeTeacherLanguage(
      value(record, "teachingLanguage", "TeachingLanguage"),
    ),
    subject: text(record, "subject", "Subject"),
    level: text(record, "level", "Level"),
    rating: numberValue(record, "rating", "Rating"),
    bio: text(record, "bio", "Bio"),
    videoUrl: text(record, "videoUrl", "VideoUrl") || undefined,
    status,
  };
}

/**
 * GET /api/teacher/profile
 * Get current teacher's profile
 */
export async function getTeacherProfile(): Promise<TeacherProfileResponse> {
  const data = await apiFetch<unknown>("/api/teacher/profile");
  return normalizeTeacherProfile(data);
}

/**
 * POST /api/teacher/profile/complete
 * Complete teacher profile (after registration)
 */
export async function completeTeacherProfile(
  data: Omit<TeacherProfileData, "videoUrl">
): Promise<TeacherProfileResponse> {
  const response = await apiFetch<unknown>("/api/teacher/profile/complete", {
    method: "POST",
    body: {
      subject: data.subject,
      level: data.level,
      teachingLanguage: data.teachingLanguage,
      bio: data.bio,
      avatarUrl: data.avatarUrl,
    },
  });
  return normalizeTeacherProfile(response);
}

/**
 * PATCH /api/teacher/profile
 * Update teacher profile settings (including video)
 */
export async function updateTeacherProfile(
  data: Partial<TeacherProfileData>
): Promise<TeacherProfileResponse> {
  const response = await apiFetch<unknown>("/api/teacher/profile", {
    method: "PATCH",
    body: data,
  });
  return normalizeTeacherProfile(response);
}

/**
 * POST /api/teacher/profile/avatar
 * Upload teacher avatar image
 */
export async function uploadTeacherAvatar(file: File): Promise<{ avatarUrl: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const data = await apiFetch<unknown>("/api/teacher/profile/avatar", {
    method: "POST",
    body: formData,
  });

  return {
    avatarUrl: text(data as ApiRecord, "avatarUrl", "AvatarUrl"),
  };
}

/**
 * POST /api/teacher/profile/video
 * Upload teacher introduction video
 */
export async function uploadTeacherVideo(file: File): Promise<{ videoUrl: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const data = await apiFetch<unknown>("/api/teacher/profile/video", {
    method: "POST",
    body: formData,
  });

  return {
    videoUrl: text(data as ApiRecord, "videoUrl", "VideoUrl"),
  };
}
