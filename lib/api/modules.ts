import { apiFetch } from "./client";

/**
 * ---------------------------------------------------------------------
 * Modules API client
 * 
 * Assumed endpoints:
 *   GET  /api/courses/{courseId}/modules            -> Module[]
 *   GET  /api/modules/{moduleId}                    -> Module
 *   GET  /api/modules/{moduleId}/lessons            -> Lesson[]
 * ---------------------------------------------------------------------
 */

export type Module = {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  lessonCount: number;
  completedLessons?: number;
  isCompleted?: boolean;
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

function unwrap(response: unknown): unknown[] {
  if (Array.isArray(response)) return response;
  const record = (response ?? {}) as ApiRecord;
  const nested = value(
    record,
    "data",
    "items",
    "modules",
    "Data",
    "Items",
    "Modules",
  );
  return Array.isArray(nested) ? nested : [];
}

export async function getCourseModules(courseId: string): Promise<Module[]> {
  const response = await apiFetch<unknown>(`/api/courses/${courseId}/modules`, {
    cache: "no-store",
  });
  
  return unwrap(response)
    .map(normalizeModule)
    .filter((module): module is Module => module !== null);
}

export async function getModule(moduleId: string): Promise<Module> {
  const data = await apiFetch<any>(`/api/modules/${moduleId}`);
  return normalizeModule(data);
}