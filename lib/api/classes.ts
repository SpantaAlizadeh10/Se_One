import { apiFetch } from "./client";

/**
 * Classes API client
 * Handle class enrollment, filtering, and management
 */

export type ClassType = "public" | "private";
export type ClassStatus = "scheduled" | "ongoing" | "completed" | "cancelled";
export type EnrollmentStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface TeacherBasic {
  id: string;
  name: string;
  avatar: string;
  rating: number;
}

export interface CourseBasic {
  id: string;
  title: string;
  imageUrl: string;
}

export interface CourseClass {
  id: string;
  title: string;
  description: string;
  level: string;
  term?: string;
  language?: string;
  subject: string;
  type: ClassType;
  maxCapacity: number;
  currentEnrollment: number;
  remainingCapacity: number;
  basePrice: number;
  finalPrice: number;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  timeZone: string;
  meetingUrl?: string;
  status: ClassStatus;
  teacher: TeacherBasic;
  course: CourseBasic;
}

export interface Enrollment {
  id: string;
  classId: string;
  studentId: string;
  finalPrice: number;
  discountPercent: number;
  status: EnrollmentStatus;
  inviteCode?: string;
  invitedByStudentId?: string;
  enrolledAt: string;
  cancelledAt?: string;
}

export interface ClassFilters {
  teacherId?: string;
  type?: ClassType;
  availableOnly?: boolean;
  level?: string;
  subject?: string;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface EnrollInClassRequest {
  inviteCode?: string;
  invitedByStudentId?: string;
}

export interface InviteCodeDto {
  inviteCode: string;
  inviteUrl: string;
}

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

function normalizeClassType(raw: unknown): ClassType {
  const value = String(raw).toLowerCase();
  if (value === "private") return "private";
  return "public";
}

function normalizeClassStatus(raw: unknown): ClassStatus {
  const value = String(raw).toLowerCase();
  if (value === "ongoing") return "ongoing";
  if (value === "completed") return "completed";
  if (value === "cancelled") return "cancelled";
  return "scheduled";
}

function normalizeEnrollmentStatus(raw: unknown): EnrollmentStatus {
  const value = String(raw).toLowerCase();
  if (value === "confirmed") return "confirmed";
  if (value === "cancelled") return "cancelled";
  if (value === "completed") return "completed";
  return "pending";
}

function normalizeTeacherBasic(raw: unknown): TeacherBasic {
  const record = (raw ?? {}) as ApiRecord;
  return {
    id: text(record, "id", "Id"),
    name: text(record, "name", "Name", "fullName", "FullName"),
    avatar: text(record, "avatar", "Avatar", "avatarUrl", "AvatarUrl") || "/images/Teacher.jpeg",
    rating: numberValue(record, "rating", "Rating", "averageRating", "AverageRating"),
  };
}

function normalizeCourseBasic(raw: unknown): CourseBasic {
  const record = (raw ?? {}) as ApiRecord;
  return {
    id: text(record, "id", "Id"),
    title: text(record, "title", "Title"),
    imageUrl: text(record, "imageUrl", "ImageUrl", "image", "Image") || "/images/course-placeholder.jpg",
  };
}

function normalizeCourseClass(raw: unknown, index: number): CourseClass | null {
  const record = (raw ?? {}) as ApiRecord;
  const id = text(record, "id", "Id", "classId", "ClassId");
  if (!id) return null;

  const teacherRaw = value(record, "teacher", "Teacher");
  const courseRaw = value(record, "course", "Course");

  return {
    id,
    title: text(record, "title", "Title"),
    description: text(record, "description", "Description"),
    level: text(record, "level", "Level"),
    term: text(record, "term", "Term", "termName", "TermName") || undefined,
    language:
      text(record, "language", "Language", "courseLanguage", "CourseLanguage") ||
      undefined,
    subject: text(record, "subject", "Subject"),
    type: normalizeClassType(value(record, "type", "Type")),
    maxCapacity: numberValue(record, "maxCapacity", "MaxCapacity"),
    currentEnrollment: numberValue(record, "currentEnrollment", "CurrentEnrollment"),
    remainingCapacity: numberValue(record, "remainingCapacity", "RemainingCapacity"),
    basePrice: numberValue(record, "basePrice", "BasePrice"),
    finalPrice: numberValue(record, "finalPrice", "FinalPrice"),
    scheduledDate: text(record, "scheduledDate", "ScheduledDate", "date", "Date"),
    startTime: text(record, "startTime", "StartTime"),
    endTime: text(record, "endTime", "EndTime"),
    timeZone: text(record, "timeZone", "TimeZone") || "UTC",
    meetingUrl: text(record, "meetingUrl", "MeetingUrl") || undefined,
    status: normalizeClassStatus(value(record, "status", "Status")),
    teacher: teacherRaw ? normalizeTeacherBasic(teacherRaw) : { id: "", name: "", avatar: "", rating: 0 },
    course: courseRaw ? normalizeCourseBasic(courseRaw) : { id: "", title: "", imageUrl: "" },
  };
}

function normalizeEnrollment(raw: unknown, index: number): Enrollment | null {
  const record = (raw ?? {}) as ApiRecord;
  const id = text(record, "id", "Id", "enrollmentId", "EnrollmentId");
  const classId = text(record, "classId", "ClassId");
  if (!classId) return null;

  return {
    id: id || `enrollment-${index}`,
    classId,
    studentId: text(record, "studentId", "StudentId"),
    finalPrice: numberValue(record, "finalPrice", "FinalPrice"),
    discountPercent: numberValue(record, "discountPercent", "DiscountPercent"),
    status: normalizeEnrollmentStatus(value(record, "status", "Status")),
    inviteCode: text(record, "inviteCode", "InviteCode") || undefined,
    invitedByStudentId: text(record, "invitedByStudentId", "InvitedByStudentId") || undefined,
    enrolledAt: text(record, "enrolledAt", "EnrolledAt"),
    cancelledAt: text(record, "cancelledAt", "CancelledAt") || undefined,
  };
}

function unwrapList<T>(
  response: unknown,
  normalize: (raw: unknown, index: number) => T | null,
): T[] {
  if (Array.isArray(response)) {
    return response.map(normalize).filter((x): x is T => x != null);
  }
  const record = (response ?? {}) as ApiRecord;
  const nested = value(record, "items", "Items", "data", "Data");
  if (Array.isArray(nested)) {
    return nested.map(normalize).filter((x): x is T => x != null);
  }
  return [];
}

/**
 * GET /api/classes
 * Get classes with filters
 */
export async function getClasses(filters?: ClassFilters): Promise<PagedResult<CourseClass>> {
  const params = new URLSearchParams();
  if (filters?.teacherId) params.set("teacherId", filters.teacherId);
  if (filters?.type) params.set("type", filters.type);
  if (filters?.availableOnly !== undefined) params.set("availableOnly", filters.availableOnly.toString());
  if (filters?.level) params.set("level", filters.level);
  if (filters?.subject) params.set("subject", filters.subject);
  params.set("page", (filters?.page || 1).toString());
  params.set("pageSize", (filters?.pageSize || 20).toString());

  const query = params.toString();
  const data = await apiFetch<unknown>(`/api/classes${query ? `?${query}` : ""}`);
  const record = (data ?? {}) as ApiRecord;

  const itemsRaw = value(record, "items", "Items", "data", "Data");
  const items = Array.isArray(itemsRaw)
    ? itemsRaw.map(normalizeCourseClass).filter((x): x is CourseClass => x != null)
    : [];

  return {
    items,
    totalCount: numberValue(record, "totalCount", "TotalCount"),
    page: numberValue(record, "page", "Page"),
    pageSize: numberValue(record, "pageSize", "PageSize"),
  };
}

/**
 * POST /api/classes/{classId}/enroll
 * Enroll in a class
 */
export async function enrollInClass(
  classId: string,
  request: EnrollInClassRequest,
): Promise<Enrollment> {
  const data = await apiFetch<unknown>(`/api/classes/${classId}/enroll`, {
    method: "POST",
    body: request,
  });
  return normalizeEnrollment(data, 0)!;
}

/**
 * POST /api/classes/{classId}/invite
 * Create invite code for private class
 */
export async function createInviteCode(classId: string): Promise<InviteCodeDto> {
  const data = await apiFetch<unknown>(`/api/classes/${classId}/invite`, {
    method: "POST",
  });
  const record = (data ?? {}) as ApiRecord;
  return {
    inviteCode: text(record, "inviteCode", "InviteCode"),
    inviteUrl: text(record, "inviteUrl", "InviteUrl"),
  };
}

/**
 * GET /api/classes/{classId}/check-conflict
 * Check schedule conflict for teacher
 */
export async function checkScheduleConflict(classId: string): Promise<{ hasConflict: boolean }> {
  const data = await apiFetch<unknown>(`/api/classes/${classId}/check-conflict`);
  const record = (data ?? {}) as ApiRecord;
  return {
    hasConflict: Boolean(value(record, "hasConflict", "HasConflict")),
  };
}

/**
 * GET /api/enrollments
 * Get user's enrollments
 */
export async function getMyEnrollments(): Promise<Enrollment[]> {
  const data = await apiFetch<unknown>("/api/enrollments");
  return unwrapList(data, normalizeEnrollment);
}
