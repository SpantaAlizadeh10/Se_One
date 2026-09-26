import { apiFetch } from "./client";

/**
 * ---------------------------------------------------------------------
 * Enrollment API client
 * 
 * Assumed endpoints:
 *   POST /api/enrollment/{courseId}              -> EnrollmentResponse
 *   GET  /api/enrollment/user                    -> Enrollment[]
 *   GET  /api/enrollment/{enrollmentId}         -> Enrollment
 *   DELETE /api/enrollment/{enrollmentId}       -> 204
 *   GET  /api/enrollment/{enrollmentId}/progress -> Progress
 * ---------------------------------------------------------------------
 */

export type Enrollment = {
  id: string;
  courseId: string;
  userId: string;
  enrolledAt: string;
  status: "active" | "completed" | "cancelled";
  progress?: number;
};

export type EnrollmentResponse = {
  enrollment: Enrollment;
  paymentRequired?: boolean;
  paymentUrl?: string;
};

export type CourseProgress = {
  enrollmentId: string;
  courseId: string;
  completedModules: number;
  totalModules: number;
  completedLessons: number;
  totalLessons: number;
  overallProgress: number;
  lastAccessedAt?: string;
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

function normalizeEnrollment(raw: unknown): Enrollment {
  const record = (raw ?? {}) as ApiRecord;
  return {
    id: text(record, "id", "Id", "enrollmentId", "EnrollmentId"),
    courseId: text(record, "courseId", "CourseId", "course_id"),
    userId: text(record, "userId", "UserId", "user_id"),
    enrolledAt: text(record, "enrolledAt", "EnrolledAt", "enrolled_at", "createdAt", "CreatedAt"),
    status: (text(record, "status", "Status") as Enrollment["status"]) || "active",
    progress: Number(value(record, "progress", "Progress") ?? 0),
  };
}

function normalizeProgress(raw: unknown): CourseProgress {
  const record = (raw ?? {}) as ApiRecord;
  return {
    enrollmentId: text(record, "enrollmentId", "EnrollmentId"),
    courseId: text(record, "courseId", "CourseId"),
    completedModules: Number(value(record, "completedModules", "CompletedModules") ?? 0),
    totalModules: Number(value(record, "totalModules", "TotalModules") ?? 0),
    completedLessons: Number(value(record, "completedLessons", "CompletedLessons") ?? 0),
    totalLessons: Number(value(record, "totalLessons", "TotalLessons") ?? 0),
    overallProgress: Number(value(record, "overallProgress", "OverallProgress", "progress", "Progress") ?? 0),
    lastAccessedAt: text(record, "lastAccessedAt", "LastAccessedAt") || undefined,
  };
}

export async function enrollInCourse(courseId: string): Promise<EnrollmentResponse> {
  const data = await apiFetch<any>(`/api/enrollment/${courseId}`, {
    method: "POST",
  });
  
  return {
    enrollment: normalizeEnrollment(data.enrollment ?? data),
    paymentRequired: data.paymentRequired ?? false,
    paymentUrl: data.paymentUrl,
  };
}

export async function getUserEnrollments(): Promise<Enrollment[]> {
  const response = await apiFetch<unknown>("/api/enrollment/user", {
    cache: "no-store",
  });
  
  const enrollments = Array.isArray(response) ? response : 
    (response as any).data ?? (response as any).enrollments ?? [];
  
  return enrollments.map(normalizeEnrollment);
}

export async function getEnrollment(enrollmentId: string): Promise<Enrollment> {
  const data = await apiFetch<any>(`/api/enrollment/${enrollmentId}`);
  return normalizeEnrollment(data);
}

export async function cancelEnrollment(enrollmentId: string): Promise<void> {
  await apiFetch(`/api/enrollment/${enrollmentId}`, {
    method: "DELETE",
  });
}

export async function getEnrollmentProgress(enrollmentId: string): Promise<CourseProgress> {
  const data = await apiFetch<any>(`/api/enrollment/${enrollmentId}/progress`);
  return normalizeProgress(data);
}