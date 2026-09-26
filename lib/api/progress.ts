import { apiFetch } from "./client";

/**
 * ---------------------------------------------------------------------
 * Progress API client
 * 
 * Assumed endpoints:
 *   GET  /api/progress/user                        -> UserProgress
 *   GET  /api/progress/course/{courseId}           -> CourseProgress
 *   GET  /api/progress/achievements                 -> Achievement[]
 *   POST /api/progress/achievements/{id}/claim      -> Achievement
 * ---------------------------------------------------------------------
 */

export type UserProgress = {
  userId: string;
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  totalLessonsCompleted: number;
  totalStudyTime: number;
  currentStreak: number;
  longestStreak: number;
  weeklyStudyTime: number[];
  recentlyActiveCourses: CourseProgressSummary[];
};

export type CourseProgressSummary = {
  courseId: string;
  courseTitle: string;
  enrollmentId: string;
  progress: number;
  lastAccessedAt: string;
  completedLessons: number;
  totalLessons: number;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  target?: number;
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
  const result = Number(value(record, ...keys) ?? 0);
  return Number.isFinite(result) ? result : 0;
}

function normalizeCourseProgressSummary(raw: unknown): CourseProgressSummary {
  const record = (raw ?? {}) as ApiRecord;
  return {
    courseId: text(record, "courseId", "CourseId"),
    courseTitle: text(record, "courseTitle", "CourseTitle", "title", "Title"),
    enrollmentId: text(record, "enrollmentId", "EnrollmentId"),
    progress: numberValue(record, "progress", "Progress"),
    lastAccessedAt: text(record, "lastAccessedAt", "LastAccessedAt"),
    completedLessons: numberValue(record, "completedLessons", "CompletedLessons"),
    totalLessons: numberValue(record, "totalLessons", "TotalLessons"),
  };
}

function normalizeAchievement(raw: unknown): Achievement {
  const record = (raw ?? {}) as ApiRecord;
  return {
    id: text(record, "id", "Id", "achievementId", "AchievementId"),
    title: text(record, "title", "Title", "name", "Name"),
    description: text(record, "description", "Description", "desc", "Desc"),
    icon: text(record, "icon", "Icon", "badge", "Badge"),
    isUnlocked: Boolean(value(record, "isUnlocked", "IsUnlocked", "unlocked", "Unlocked")),
    unlockedAt: text(record, "unlockedAt", "UnlockedAt") || undefined,
    progress: numberValue(record, "progress", "Progress"),
    target: numberValue(record, "target", "Target"),
  };
}

function unwrapArray(response: unknown): unknown[] {
  if (Array.isArray(response)) return response;
  const record = (response ?? {}) as ApiRecord;
  const nested = value(
    record,
    "data",
    "items",
    "achievements",
    "Data",
    "Items",
    "Achievements",
  );
  return Array.isArray(nested) ? nested : [];
}

export async function getUserProgress(): Promise<UserProgress> {
  const data = await apiFetch<any>("/api/progress/user", {
    cache: "no-store",
  });
  
  const record = (data ?? {}) as ApiRecord;
  const recentlyActiveCoursesRaw = value(
    record,
    "recentlyActiveCourses",
    "RecentlyActiveCourses",
    "activeCourses",
    "ActiveCourses",
  );
  
  return {
    userId: text(record, "userId", "UserId"),
    totalCoursesEnrolled: numberValue(record, "totalCoursesEnrolled", "TotalCoursesEnrolled"),
    totalCoursesCompleted: numberValue(record, "totalCoursesCompleted", "TotalCoursesCompleted"),
    totalLessonsCompleted: numberValue(record, "totalLessonsCompleted", "TotalLessonsCompleted"),
    totalStudyTime: numberValue(record, "totalStudyTime", "TotalStudyTime"),
    currentStreak: numberValue(record, "currentStreak", "CurrentStreak"),
    longestStreak: numberValue(record, "longestStreak", "LongestStreak"),
    weeklyStudyTime: Array.isArray(value(record, "weeklyStudyTime", "WeeklyStudyTime"))
      ? (value(record, "weeklyStudyTime", "WeeklyStudyTime") as number[]).map(Number)
      : [],
    recentlyActiveCourses: Array.isArray(recentlyActiveCoursesRaw)
      ? (recentlyActiveCoursesRaw as unknown[]).map(normalizeCourseProgressSummary)
      : [],
  };
}

export async function getCourseProgress(courseId: string): Promise<CourseProgressSummary> {
  const data = await apiFetch<any>(`/api/progress/course/${courseId}`);
  return normalizeCourseProgressSummary(data);
}

export async function getAchievements(): Promise<Achievement[]> {
  const response = await apiFetch<unknown>("/api/progress/achievements", {
    cache: "no-store",
  });
  
  return unwrapArray(response)
    .map(normalizeAchievement)
    .filter((achievement): achievement is Achievement => achievement !== null);
}

export async function claimAchievement(achievementId: string): Promise<Achievement> {
  const data = await apiFetch<any>(`/api/progress/achievements/${achievementId}/claim`, {
    method: "POST",
  });
  return normalizeAchievement(data);
}