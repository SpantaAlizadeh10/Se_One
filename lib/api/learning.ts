import { apiFetch } from "./client";
import type { Lesson } from "./lessons";
import type { Module } from "./modules";

/**
 * ---------------------------------------------------------------------
 * Learning API client
 * 
 * Assumed endpoints:
 *   GET  /api/learning/current                      -> CurrentLearningState
 *   POST /api/learning/start/{courseId}            -> LearningSession
 *   POST /api/learning/continue/{lessonId}         -> LearningSession
 *   POST /api/learning/session/{sessionId}/end     -> SessionSummary
 *   GET  /api/learning/recommendations             -> Recommendation[]
 * ---------------------------------------------------------------------
 */

export type CurrentLearningState = {
  activeCourseId?: string;
  activeEnrollmentId?: string;
  currentLessonId?: string;
  currentModuleId?: string;
  suggestedNextLesson?: Lesson;
  totalStudyTimeToday: number;
  dailyGoal: number;
  dailyGoalProgress: number;
};

export type LearningSession = {
  sessionId: string;
  courseId: string;
  enrollmentId: string;
  lessonId: string;
  moduleId: string;
  startedAt: string;
  lesson: Lesson;
  module: Module;
  nextLesson?: Lesson;
  previousLesson?: Lesson;
};

export type SessionSummary = {
  sessionId: string;
  lessonId: string;
  moduleId: string;
  courseId: string;
  duration: number;
  completed: boolean;
  timeSpent: number;
  progressBefore: number;
  progressAfter: number;
};

export type Recommendation = {
  type: "lesson" | "course" | "practice" | "review";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  courseId?: string;
  lessonId?: string;
  estimatedTime?: number;
  reason: string;
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

function normalizeModule(raw: unknown): Module {
  const record = (raw ?? {}) as ApiRecord;
  return {
    id: text(record, "id", "Id", "moduleId", "ModuleId"),
    courseId: text(record, "courseId", "CourseId", "course_id"),
    title: text(record, "title", "Title", "name", "Name"),
    description: text(record, "description", "Description", "desc", "Desc"),
    order: numberValue(record, "order", "Order", "sequence", "Sequence"),
    lessonCount: numberValue(record, "lessonCount", "LessonCount", "lessons", "Lessons"),
    completedLessons: numberValue(record, "completedLessons", "CompletedLessons"),
    isCompleted: Boolean(value(record, "isCompleted", "IsCompleted", "completed", "Completed")),
  };
}

function normalizeRecommendation(raw: unknown): Recommendation {
  const record = (raw ?? {}) as ApiRecord;
  return {
    type: (text(record, "type", "Type") as Recommendation["type"]) || "lesson",
    priority: (text(record, "priority", "Priority") as Recommendation["priority"]) || "medium",
    title: text(record, "title", "Title", "name", "Name"),
    description: text(record, "description", "Description", "desc", "Desc"),
    courseId: text(record, "courseId", "CourseId") || undefined,
    lessonId: text(record, "lessonId", "LessonId") || undefined,
    estimatedTime: numberValue(record, "estimatedTime", "EstimatedTime") || undefined,
    reason: text(record, "reason", "Reason", "why", "Why"),
  };
}

function unwrapArray(response: unknown): unknown[] {
  if (Array.isArray(response)) return response;
  const record = (response ?? {}) as ApiRecord;
  const nested = value(
    record,
    "data",
    "items",
    "recommendations",
    "Data",
    "Items",
    "Recommendations",
  );
  return Array.isArray(nested) ? nested : [];
}

export async function getCurrentLearningState(): Promise<CurrentLearningState> {
  const data = await apiFetch<any>("/api/learning/current", {
    cache: "no-store",
  });
  
  const record = (data ?? {}) as ApiRecord;
  const suggestedNextLessonRaw = value(record, "suggestedNextLesson", "SuggestedNextLesson");
  
  return {
    activeCourseId: text(record, "activeCourseId", "ActiveCourseId") || undefined,
    activeEnrollmentId: text(record, "activeEnrollmentId", "ActiveEnrollmentId") || undefined,
    currentLessonId: text(record, "currentLessonId", "CurrentLessonId") || undefined,
    currentModuleId: text(record, "currentModuleId", "CurrentModuleId") || undefined,
    suggestedNextLesson: suggestedNextLessonRaw ? normalizeLesson(suggestedNextLessonRaw) : undefined,
    totalStudyTimeToday: numberValue(record, "totalStudyTimeToday", "TotalStudyTimeToday"),
    dailyGoal: numberValue(record, "dailyGoal", "DailyGoal"),
    dailyGoalProgress: numberValue(record, "dailyGoalProgress", "DailyGoalProgress"),
  };
}

export async function startLearningSession(courseId: string): Promise<LearningSession> {
  const data = await apiFetch<any>(`/api/learning/start/${courseId}`, {
    method: "POST",
  });
  
  const record = (data ?? {}) as ApiRecord;
  const nextLessonRaw = value(record, "nextLesson", "NextLesson");
  const previousLessonRaw = value(record, "previousLesson", "PreviousLesson");
  
  return {
    sessionId: text(record, "sessionId", "SessionId"),
    courseId: text(record, "courseId", "CourseId"),
    enrollmentId: text(record, "enrollmentId", "EnrollmentId"),
    lessonId: text(record, "lessonId", "LessonId"),
    moduleId: text(record, "moduleId", "ModuleId"),
    startedAt: text(record, "startedAt", "StartedAt"),
    lesson: normalizeLesson(value(record, "lesson", "Lesson")),
    module: normalizeModule(value(record, "module", "Module")),
    nextLesson: nextLessonRaw ? normalizeLesson(nextLessonRaw) : undefined,
    previousLesson: previousLessonRaw ? normalizeLesson(previousLessonRaw) : undefined,
  };
}

export async function continueLearningSession(lessonId: string): Promise<LearningSession> {
  const data = await apiFetch<any>(`/api/learning/continue/${lessonId}`, {
    method: "POST",
  });
  
  const record = (data ?? {}) as ApiRecord;
  const nextLessonRaw = value(record, "nextLesson", "NextLesson");
  const previousLessonRaw = value(record, "previousLesson", "PreviousLesson");
  
  return {
    sessionId: text(record, "sessionId", "SessionId"),
    courseId: text(record, "courseId", "CourseId"),
    enrollmentId: text(record, "enrollmentId", "EnrollmentId"),
    lessonId: text(record, "lessonId", "LessonId"),
    moduleId: text(record, "moduleId", "ModuleId"),
    startedAt: text(record, "startedAt", "StartedAt"),
    lesson: normalizeLesson(value(record, "lesson", "Lesson")),
    module: normalizeModule(value(record, "module", "Module")),
    nextLesson: nextLessonRaw ? normalizeLesson(nextLessonRaw) : undefined,
    previousLesson: previousLessonRaw ? normalizeLesson(previousLessonRaw) : undefined,
  };
}

export async function endLearningSession(sessionId: string): Promise<SessionSummary> {
  const data = await apiFetch<any>(`/api/learning/session/${sessionId}/end`, {
    method: "POST",
  });
  
  const record = (data ?? {}) as ApiRecord;
  return {
    sessionId: text(record, "sessionId", "SessionId"),
    lessonId: text(record, "lessonId", "LessonId"),
    moduleId: text(record, "moduleId", "ModuleId"),
    courseId: text(record, "courseId", "CourseId"),
    duration: numberValue(record, "duration", "Duration"),
    completed: Boolean(value(record, "completed", "Completed")),
    timeSpent: numberValue(record, "timeSpent", "TimeSpent"),
    progressBefore: numberValue(record, "progressBefore", "ProgressBefore"),
    progressAfter: numberValue(record, "progressAfter", "ProgressAfter"),
  };
}

export async function getLearningRecommendations(): Promise<Recommendation[]> {
  const response = await apiFetch<unknown>("/api/learning/recommendations", {
    cache: "no-store",
  });
  
  return unwrapArray(response)
    .map(normalizeRecommendation)
    .filter((rec): rec is Recommendation => rec !== null);
}