import { apiFetch } from "./client";
import type {
  AvailabilitySlot,
  TeacherProfile,
} from "@/lib/teachers-directory";

export type TeachersResponse =
  | TeacherProfile[]
  | { data?: unknown; items?: unknown; teachers?: unknown };

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

function normalizeLanguage(raw: unknown): TeacherProfile["teachingLanguage"] {
  const language = String(raw ?? "english").toLowerCase();
  return language.includes("german") ||
    language.includes("deutsch") ||
    language.includes("آلمانی")
    ? "german"
    : "english";
}

function normalizeSlots(raw: unknown): AvailabilitySlot[] {
  if (!Array.isArray(raw)) return [];

  return raw.map((slot, index) => {
    const record = (slot ?? {}) as ApiRecord;
    return {
      id: text(record, "id", "Id") || `api-slot-${index}`,
      day: text(record, "day", "Day", "dayOfWeek", "DayOfWeek"),
      time: text(record, "time", "Time", "timeRange", "TimeRange"),
      booked: Boolean(
        value(record, "booked", "Booked", "isBooked", "IsBooked"),
      ),
    };
  });
}

function unwrap(response: TeachersResponse): unknown[] {
  if (Array.isArray(response)) return response;
  const record = response as ApiRecord;
  const nested = value(
    record,
    "data",
    "items",
    "teachers",
    "Data",
    "Items",
    "Teachers",
  );
  return Array.isArray(nested) ? nested : [];
}

function normalizeTeacher(raw: unknown, index: number): TeacherProfile | null {
  const record = (raw ?? {}) as ApiRecord;
  const id =
    text(record, "id", "Id", "teacherId", "TeacherId") ||
    `api-teacher-${index}`;
  const name = text(record, "name", "Name", "fullName", "FullName");
  if (!name) return null;

  const slots = value(
    record,
    "slots",
    "Slots",
    "availabilitySlots",
    "AvailabilitySlots",
  );
  const rating = Number(
    value(record, "rating", "Rating", "averageRating", "AverageRating") ?? 0,
  );

  return {
    id,
    name,
    avatar:
      text(
        record,
        "avatar",
        "Avatar",
        "avatarUrl",
        "AvatarUrl",
        "profileImageUrl",
        "ProfileImageUrl",
        "imageUrl",
        "ImageUrl",
      ) || "/images/Teacher.jpeg",
    teachingLanguage: normalizeLanguage(
      value(
        record,
        "teachingLanguage",
        "TeachingLanguage",
        "language",
        "Language",
      ),
    ),
    subject: text(
      record,
      "subject",
      "Subject",
      "specialty",
      "Specialty",
      "expertise",
      "Expertise",
    ),
    level: text(record, "level", "Level", "levels", "Levels"),
    rating: Number.isFinite(rating) ? rating : 0,
    bio: text(
      record,
      "bio",
      "Bio",
      "description",
      "Description",
      "about",
      "About",
    ),
    slots: normalizeSlots(slots),
  };
}

export async function getTeachers(): Promise<TeacherProfile[]> {
  const response = await apiFetch<TeachersResponse>("/api/teachers", {
    cache: "no-store",
  });
  return unwrap(response)
    .map(normalizeTeacher)
    .filter((teacher): teacher is TeacherProfile => teacher !== null);
}
