import { apiFetch } from "./client";

/**
 * ---------------------------------------------------------------------
 * Lessons API client
 * 
 * Assumed endpoints:
 *   GET  /api/modules/{moduleId}/lessons            -> Lesson[]
 *   GET  /api/lessons/{lessonId}                    -> Lesson
 *   POST /api/lessons/{lessonId}/complete           -> LessonProgress
 *   GET  /api/lessons/{lessonId}/progress           -> LessonProgress
 * ---------------------------------------------------------------------
 */

export type Lesson = {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  description: string;
  content?: string;
  videoUrl?: string;
  audioUrl?: string;
  order: number;
  duration?: number;
  isCompleted?: boolean;
};

export type LessonProgress = {
  lessonId: string;
  moduleId: string;
  isCompleted: boolean;
  completedAt?: string;
  timeSpent?: number;
  lastPosition?: number;
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

function normalizeLesson(raw: unknown): Lesson {
  const record = (raw ?? {}) as ApiRecord;
  return {
    id: text(record, "id", "Id", "lessonId", "LessonId"),
    moduleId: text(record, "moduleId", "ModuleId", "module_id"),
    courseId: text(record, "courseId", "CourseId", "course_id"),
    title: text(record, "title", "Title", "name", "Name"),
    description: text(record, "description", "Description", "desc", "Desc"),
    content: text(record, "content", "Content") || undefined,
    videoUrl: text(record, "videoUrl", "VideoUrl", "video_url") || undefined,
    audioUrl: text(record, "audioUrl", "AudioUrl", "audio_url") || undefined,
    order: numberValue(record, "order", "Order", "sequence", "Sequence"),
    duration: numberValue(record, "duration", "Duration") || undefined,
    isCompleted: Boolean(value(record, "isCompleted", "IsCompleted", "completed", "Completed")),
  };
}

function normalizeLessonProgress(raw: unknown): LessonProgress {
  const record = (raw ?? {}) as ApiRecord;
  return {
    lessonId: text(record, "lessonId", "LessonId"),
    moduleId: text(record, "moduleId", "ModuleId"),
    isCompleted: Boolean(value(record, "isCompleted", "IsCompleted", "completed", "Completed")),
    completedAt: text(record, "completedAt", "CompletedAt", "completed_at") || undefined,
    timeSpent: numberValue(record, "timeSpent", "TimeSpent"),
    lastPosition: numberValue(record, "lastPosition", "LastPosition"),
  };
}

function unwrap(response: unknown): unknown[] {
  if (Array.isArray(response)) return response;
  const record = (response ?? {}) as ApiRecord;
  const nested = value(
    record,
    "data",
    "items",
    "lessons",
    "Data",
    "Items",
    "Lessons",
  );
  return Array.isArray(nested) ? nested : [];
}

export async function getModuleLessons(moduleId: string): Promise<Lesson[]> {
  const response = await apiFetch<unknown>(`/api/modules/${moduleId}/lessons`, {
    cache: "no-store",
  });
  
  return unwrap(response)
    .map(normalizeLesson)
    .filter((lesson): lesson is Lesson => lesson !== null);
}

export async function getLesson(lessonId: string): Promise<Lesson> {
  const data = await apiFetch<any>(`/api/lessons/${lessonId}`);
  return normalizeLesson(data);
}

export async function completeLesson(lessonId: string): Promise<LessonProgress> {
  const data = await apiFetch<any>(`/api/lessons/${lessonId}/complete`, {
    method: "POST",
  });
  return normalizeLessonProgress(data);
}

export async function getLessonProgress(lessonId: string): Promise<LessonProgress> {
  const data = await apiFetch<any>(`api/lessons/${lessonId}/progress`);
  return normalizeLessonProgress(data);
}

export async function updateLessonProgress(
  lessonId: string,
  progress: { timeSpent?: number; lastPosition?: number }
): Promise<LessonProgress> {
  const data = await apiFetch<any>(`/api/lessons/${lessonId}/progress`, {
    method: "PATCH",
    body: progress,
  });
  return normalizeLessonProgress(data);
}