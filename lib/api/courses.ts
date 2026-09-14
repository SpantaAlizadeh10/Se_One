import { apiFetch } from "./client";

export type Course = {
  id: string;
  title: string;
  level: string;
  desc: string;
  lessons: number;
  students: number;
  price: string;
  image?: string;
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

function unwrap(response: unknown): unknown[] {
  if (Array.isArray(response)) return response;
  const record = (response ?? {}) as ApiRecord;
  const nested = value(
    record,
    "data",
    "items",
    "courses",
    "Data",
    "Items",
    "Courses",
  );
  return Array.isArray(nested) ? nested : [];
}

function normalizeCourse(raw: unknown, index: number): Course | null {
  const record = (raw ?? {}) as ApiRecord;
  const id =
    text(record, "id", "Id", "courseId", "CourseId") || `api-course-${index}`;
  const title = text(record, "title", "Title", "name", "Name");
  if (!title) return null;

  return {
    id,
    title,
    level: text(record, "level", "Level", "levelName", "LevelName"),
    desc: text(
      record,
      "desc",
      "Desc",
      "description",
      "Description",
      "summary",
      "Summary",
    ),
    lessons: numberValue(
      record,
      "lessons",
      "Lessons",
      "lessonCount",
      "LessonCount",
    ),
    students: numberValue(
      record,
      "students",
      "Students",
      "studentCount",
      "StudentCount",
      "enrollmentCount",
      "EnrollmentCount",
    ),
    price: text(record, "price", "Price", "formattedPrice", "FormattedPrice"),
    image:
      text(
        record,
        "image",
        "Image",
        "imageUrl",
        "ImageUrl",
        "coverImage",
        "CoverImage",
        "coverImageUrl",
        "CoverImageUrl",
      ) || undefined,
  };
}

export async function getCourses(lang: string): Promise<Course[]> {
  const response = await apiFetch<unknown>(
    `/api/courses?lang=${encodeURIComponent(lang)}`,
    { cache: "no-store" },
  );
  return unwrap(response)
    .map(normalizeCourse)
    .filter((course): course is Course => course !== null);
}
