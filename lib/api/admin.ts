import { apiFetch } from "./client";
import type { Enrollment } from "./enrollment";

/**
 * Admin API client — mirrors ADMIN_API_SPECIFICATION.md
 * All routes require role Admin on the ASP.NET Core backend.
 */

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

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type ListQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
};

function toQuery(params: ListQuery = {}): string {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.pageSize != null) q.set("pageSize", String(params.pageSize));
  if (params.search) q.set("search", params.search);
  if (params.status) q.set("status", params.status);
  const s = q.toString();
  return s ? `?${s}` : "";
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

function unwrapPaged<T>(
  response: unknown,
  normalize: (raw: unknown, index: number) => T | null,
): PagedResult<T> {
  const record = (response ?? {}) as ApiRecord;
  const items = unwrapList(response, normalize);
  return {
    items,
    page: numberValue(record, "page", "Page") || 1,
    pageSize: numberValue(record, "pageSize", "PageSize") || items.length,
    totalCount: numberValue(record, "totalCount", "TotalCount") || items.length,
    totalPages: numberValue(record, "totalPages", "TotalPages") || 1,
  };
}

// --- Dashboard ---

export type AdminDashboardStats = {
  studentsCount: number;
  teachersCount: number;
  coursesCount: number;
  activeDiscountsCount: number;
  publishedBlogPostsCount: number;
  activeEnrollmentsCount: number;
  pendingTeachersCount: number;
};

function normalizeDashboardStats(raw: unknown): AdminDashboardStats {
  const r = (raw ?? {}) as ApiRecord;
  return {
    studentsCount: numberValue(r, "studentsCount", "StudentsCount"),
    teachersCount: numberValue(r, "teachersCount", "TeachersCount"),
    coursesCount: numberValue(r, "coursesCount", "CoursesCount"),
    activeDiscountsCount: numberValue(
      r,
      "activeDiscountsCount",
      "ActiveDiscountsCount",
    ),
    publishedBlogPostsCount: numberValue(
      r,
      "publishedBlogPostsCount",
      "PublishedBlogPostsCount",
    ),
    activeEnrollmentsCount: numberValue(
      r,
      "activeEnrollmentsCount",
      "ActiveEnrollmentsCount",
    ),
    pendingTeachersCount: numberValue(
      r,
      "pendingTeachersCount",
      "PendingTeachersCount",
    ),
  };
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const data = await apiFetch<unknown>("/api/admin/dashboard/stats");
  return normalizeDashboardStats(data);
}

// --- Students ---

export type StudentAccountStatus = "active" | "suspended" | "banned";

export type AdminStudent = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  joinedAt: string;
  status: StudentAccountStatus;
  coursesEnrolled: number;
};

function normalizeStudent(raw: unknown, index: number): AdminStudent | null {
  const r = (raw ?? {}) as ApiRecord;
  const id = text(r, "id", "Id", "userId", "UserId", "studentId", "StudentId");
  const fullName = text(r, "fullName", "FullName", "name", "Name");
  if (!id && !fullName) return null;
  const statusRaw = text(r, "status", "Status").toLowerCase();
  const status: StudentAccountStatus =
    statusRaw === "suspended" || statusRaw === "banned" ? statusRaw : "active";
  return {
    id: id || `student-${index}`,
    fullName,
    email: text(r, "email", "Email"),
    avatarUrl: text(r, "avatarUrl", "AvatarUrl", "avatar", "Avatar"),
    joinedAt: text(
      r,
      "joinedAt",
      "JoinedAt",
      "joinedDate",
      "JoinedDate",
      "createdAt",
      "CreatedAt",
    ),
    status,
    coursesEnrolled: numberValue(r, "coursesEnrolled", "CoursesEnrolled"),
  };
}

export async function listAdminStudents(
  query: ListQuery = {},
): Promise<PagedResult<AdminStudent>> {
  const data = await apiFetch<unknown>(`/api/admin/students${toQuery(query)}`);
  return unwrapPaged(data, normalizeStudent);
}

export async function getAdminStudent(
  studentId: string,
): Promise<AdminStudent> {
  const data = await apiFetch<unknown>(`/api/admin/students/${studentId}`);
  return normalizeStudent(data, 0)!;
}

export async function createAdminStudent(body: {
  fullName: string;
  email: string;
  password: string;
  sendWelcomeEmail?: boolean;
}): Promise<AdminStudent> {
  const data = await apiFetch<unknown>("/api/admin/students", {
    method: "POST",
    body,
  });
  return normalizeStudent(data, 0)!;
}

export async function updateAdminStudent(
  studentId: string,
  body: Partial<Pick<AdminStudent, "fullName" | "email" | "avatarUrl">>,
): Promise<AdminStudent> {
  const data = await apiFetch<unknown>(`/api/admin/students/${studentId}`, {
    method: "PATCH",
    body,
  });
  return normalizeStudent(data, 0)!;
}

export async function setAdminStudentStatus(
  studentId: string,
  status: StudentAccountStatus,
): Promise<AdminStudent> {
  const data = await apiFetch<unknown>(
    `/api/admin/students/${studentId}/status`,
    {
      method: "PATCH",
      body: { status },
    },
  );
  return normalizeStudent(data, 0)!;
}

export async function deleteAdminStudent(studentId: string): Promise<void> {
  await apiFetch(`/api/admin/students/${studentId}`, { method: "DELETE" });
}

function normalizeEnrollment(raw: unknown): Enrollment {
  const record = (raw ?? {}) as ApiRecord;
  return {
    id: text(record, "id", "Id", "enrollmentId", "EnrollmentId"),
    courseId: text(record, "courseId", "CourseId"),
    userId: text(record, "userId", "UserId"),
    enrolledAt: text(record, "enrolledAt", "EnrolledAt"),
    status:
      (text(record, "status", "Status") as Enrollment["status"]) || "active",
    progress: numberValue(record, "progress", "Progress"),
  };
}

export async function getAdminStudentEnrollments(
  studentId: string,
): Promise<Enrollment[]> {
  const data = await apiFetch<unknown>(
    `/api/admin/students/${studentId}/enrollments`,
  );
  return unwrapList(data, (raw) => normalizeEnrollment(raw));
}

export type AdminStudentProgress = {
  courseId: string;
  courseTitle: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lastActivityAt: string;
};

function normalizeStudentProgress(raw: unknown): AdminStudentProgress {
  const r = (raw ?? {}) as ApiRecord;
  return {
    courseId: text(r, "courseId", "CourseId"),
    courseTitle: text(r, "courseTitle", "CourseTitle", "title", "Title"),
    progress: numberValue(r, "progress", "Progress"),
    completedLessons: numberValue(r, "completedLessons", "CompletedLessons"),
    totalLessons: numberValue(r, "totalLessons", "TotalLessons"),
    lastActivityAt: text(r, "lastActivityAt", "LastActivityAt"),
  };
}

export async function getAdminStudentProgress(
  studentId: string,
): Promise<AdminStudentProgress[]> {
  const data = await apiFetch<unknown>(
    `/api/admin/students/${studentId}/progress`,
  );
  return unwrapList(data, (raw) => normalizeStudentProgress(raw));
}

export async function adminEnrollStudent(
  studentId: string,
  courseId: string,
  waivePayment = true,
): Promise<Enrollment> {
  const data = await apiFetch<unknown>(
    `/api/admin/students/${studentId}/enrollments`,
    {
      method: "POST",
      body: { courseId, waivePayment },
    },
  );
  const record = (data ?? {}) as ApiRecord;
  const nested = value(record, "enrollment", "Enrollment") ?? data;
  return normalizeEnrollment(nested);
}

export async function adminCancelStudentEnrollment(
  studentId: string,
  enrollmentId: string,
): Promise<void> {
  await apiFetch(
    `/api/admin/students/${studentId}/enrollments/${enrollmentId}`,
    {
      method: "DELETE",
    },
  );
}

// --- Teachers ---

export type TeacherWorkflowStatus = "pending" | "active" | "suspended";

export type AdminTeacher = {
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
  status: TeacherWorkflowStatus;
};

function normalizeTeacherLanguage(raw: unknown): "english" | "german" {
  const v = String(raw ?? "english").toLowerCase();
  return v.includes("german") || v.includes("de") ? "german" : "english";
}

function normalizeTeacher(raw: unknown, index: number): AdminTeacher | null {
  const r = (raw ?? {}) as ApiRecord;
  const id = text(r, "id", "Id", "teacherId", "TeacherId");
  const fullName = text(r, "fullName", "FullName", "name", "Name");
  if (!id && !fullName) return null;
  const statusRaw = text(r, "status", "Status").toLowerCase();
  const status: TeacherWorkflowStatus =
    statusRaw === "pending" || statusRaw === "suspended" ? statusRaw : "active";
  return {
    id: id || `teacher-${index}`,
    userId: text(r, "userId", "UserId"),
    fullName,
    email: text(r, "email", "Email"),
    avatarUrl: text(r, "avatarUrl", "AvatarUrl", "avatar", "Avatar"),
    teachingLanguage: normalizeTeacherLanguage(
      value(r, "teachingLanguage", "TeachingLanguage"),
    ),
    subject: text(r, "subject", "Subject"),
    level: text(r, "level", "Level"),
    rating: numberValue(r, "rating", "Rating"),
    bio: text(r, "bio", "Bio"),
    videoUrl: text(r, "videoUrl", "VideoUrl") || undefined,
    status,
  };
}

export async function listAdminTeachers(
  query: ListQuery = {},
): Promise<PagedResult<AdminTeacher>> {
  const data = await apiFetch<unknown>(`/api/admin/teachers${toQuery(query)}`);
  return unwrapPaged(data, normalizeTeacher);
}

export async function getAdminTeacher(
  teacherId: string,
): Promise<AdminTeacher> {
  const data = await apiFetch<unknown>(`/api/admin/teachers/${teacherId}`);
  return normalizeTeacher(data, 0)!;
}

export async function createAdminTeacher(
  body: Record<string, unknown>,
): Promise<AdminTeacher> {
  const data = await apiFetch<unknown>("/api/admin/teachers", {
    method: "POST",
    body,
  });
  return normalizeTeacher(data, 0)!;
}

export async function updateAdminTeacher(
  teacherId: string,
  body: Partial<Omit<AdminTeacher, "id" | "userId">>,
): Promise<AdminTeacher> {
  const data = await apiFetch<unknown>(`/api/admin/teachers/${teacherId}`, {
    method: "PATCH",
    body,
  });
  return normalizeTeacher(data, 0)!;
}

export async function setAdminTeacherStatus(
  teacherId: string,
  status: TeacherWorkflowStatus,
): Promise<AdminTeacher> {
  const data = await apiFetch<unknown>(
    `/api/admin/teachers/${teacherId}/status`,
    {
      method: "PATCH",
      body: { status },
    },
  );
  return normalizeTeacher(data, 0)!;
}

export async function deleteAdminTeacher(teacherId: string): Promise<void> {
  await apiFetch(`/api/admin/teachers/${teacherId}`, { method: "DELETE" });
}

// --- Teacher withdrawals ---

export type AdminWithdrawalStatus = "pending" | "approved" | "rejected";

export type AdminWithdrawalRequest = {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  amount: number;
  currency: string;
  iban: string;
  status: AdminWithdrawalStatus;
  requestedAt: string;
};

function normalizeWithdrawal(
  raw: unknown,
  index: number,
): AdminWithdrawalRequest | null {
  const r = (raw ?? {}) as ApiRecord;
  const id = text(r, "id", "Id", "withdrawalId", "WithdrawalId");
  if (!id) return null;
  const rawStatus = text(r, "status", "Status").toLowerCase();
  const status: AdminWithdrawalStatus =
    rawStatus === "approved" || rawStatus === "rejected"
      ? rawStatus
      : "pending";
  return {
    id: id || `withdrawal-${index}`,
    teacherId: text(r, "teacherId", "TeacherId"),
    teacherName: text(r, "teacherName", "TeacherName", "fullName", "FullName"),
    teacherEmail: text(r, "teacherEmail", "TeacherEmail", "email", "Email"),
    amount: numberValue(r, "amount", "Amount"),
    currency: text(r, "currency", "Currency") || "IRR",
    iban: text(r, "iban", "Iban", "IBAN"),
    status,
    requestedAt: text(
      r,
      "requestedAt",
      "RequestedAt",
      "createdAt",
      "CreatedAt",
    ),
  };
}

export async function listAdminWithdrawals(
  query: ListQuery = {},
): Promise<PagedResult<AdminWithdrawalRequest>> {
  const data = await apiFetch<unknown>(
    `/api/admin/withdrawals${toQuery(query)}`,
  );
  return unwrapPaged(data, normalizeWithdrawal);
}

export async function setAdminWithdrawalStatus(
  withdrawalId: string,
  status: Exclude<AdminWithdrawalStatus, "pending">,
): Promise<AdminWithdrawalRequest> {
  const data = await apiFetch<unknown>(
    `/api/admin/withdrawals/${encodeURIComponent(withdrawalId)}/status`,
    { method: "PATCH", body: { status } },
  );
  return (
    normalizeWithdrawal(data, 0) ?? {
      id: withdrawalId,
      teacherId: "",
      teacherName: "",
      teacherEmail: "",
      amount: 0,
      currency: "IRR",
      iban: "",
      status,
      requestedAt: "",
    }
  );
}

export type AdminTeacherStudentLink = {
  studentId: string;
  fullName: string;
  email: string;
  courseId: string;
  courseTitle: string;
  progress: number;
};

function normalizeTeacherStudent(
  raw: unknown,
  index: number,
): AdminTeacherStudentLink | null {
  const r = (raw ?? {}) as ApiRecord;
  const studentId = text(r, "studentId", "StudentId", "id", "Id");
  if (!studentId) return null;
  return {
    studentId,
    fullName: text(r, "fullName", "FullName", "name", "Name"),
    email: text(r, "email", "Email"),
    courseId: text(r, "courseId", "CourseId"),
    courseTitle: text(r, "courseTitle", "CourseTitle"),
    progress: numberValue(r, "progress", "Progress"),
  };
}

export async function getAdminTeacherStudents(
  teacherId: string,
): Promise<AdminTeacherStudentLink[]> {
  const data = await apiFetch<unknown>(
    `/api/admin/teachers/${teacherId}/students`,
  );
  return unwrapList(data, normalizeTeacherStudent);
}

export type AdminAvailabilitySlot = {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
};

function normalizeSlot(
  raw: unknown,
  index: number,
): AdminAvailabilitySlot | null {
  const r = (raw ?? {}) as ApiRecord;
  return {
    id: text(r, "id", "Id") || `slot-${index}`,
    dayOfWeek: text(r, "dayOfWeek", "DayOfWeek", "day", "Day"),
    startTime: text(r, "startTime", "StartTime"),
    endTime: text(r, "endTime", "EndTime"),
    isBooked: Boolean(value(r, "isBooked", "IsBooked", "booked", "Booked")),
  };
}

export async function getAdminTeacherAvailability(
  teacherId: string,
): Promise<AdminAvailabilitySlot[]> {
  const data = await apiFetch<unknown>(
    `/api/admin/teachers/${teacherId}/availability`,
  );
  return unwrapList(data, normalizeSlot);
}

export async function setAdminTeacherAvailability(
  teacherId: string,
  slots: Omit<AdminAvailabilitySlot, "id" | "isBooked">[],
): Promise<AdminAvailabilitySlot[]> {
  const data = await apiFetch<unknown>(
    `/api/admin/teachers/${teacherId}/availability`,
    {
      method: "PUT",
      body: { slots },
    },
  );
  const record = (data ?? {}) as ApiRecord;
  const nested = value(record, "slots", "Slots") ?? data;
  return unwrapList(nested, normalizeSlot);
}

// --- Courses & pricing ---

export type AdminCourse = {
  id: string;
  title: string;
  level: string;
  basePrice: number;
  currency: string;
  discountPercent: number;
  isPublished: boolean;
  studentCount: number;
  lessonCount: number;
  description?: string;
  duration?: string;
  imageUrl?: string;
  category?: string;
  language?: string;
  teacherId?: string;
  isFeatured?: boolean;
};

export type CreateCourseInput = {
  title: string;
  description: string;
  level: string;
  basePrice: number;
  currency?: string;
  duration?: string;
  imageUrl?: string;
  category?: string;
  language?: string;
  teacherId?: string;
  discountPercent?: number;
  isFeatured?: boolean;
};

function normalizeAdminCourse(raw: unknown, index: number): AdminCourse | null {
  const r = (raw ?? {}) as ApiRecord;
  const id = text(r, "id", "Id", "courseId", "CourseId");
  const title = text(r, "title", "Title");
  if (!id && !title) return null;
  return {
    id: id || `course-${index}`,
    title,
    level: text(r, "level", "Level"),
    basePrice: numberValue(r, "basePrice", "BasePrice"),
    currency: text(r, "currency", "Currency") || "IRR",
    discountPercent: numberValue(r, "discountPercent", "DiscountPercent"),
    isPublished: Boolean(value(r, "isPublished", "IsPublished") ?? true),
    studentCount: numberValue(
      r,
      "studentCount",
      "StudentCount",
      "students",
      "Students",
    ),
    lessonCount: numberValue(
      r,
      "lessonCount",
      "LessonCount",
      "lessons",
      "Lessons",
    ),
    description: text(r, "description", "Description") || undefined,
    duration: text(r, "duration", "Duration") || undefined,
    imageUrl: text(r, "imageUrl", "ImageUrl") || undefined,
    category: text(r, "category", "Category") || undefined,
    language: text(r, "language", "Language") || undefined,
    teacherId: text(r, "teacherId", "TeacherId") || undefined,
    isFeatured: Boolean(value(r, "isFeatured", "IsFeatured")),
  };
}

export async function listAdminCourses(): Promise<AdminCourse[]> {
  const data = await apiFetch<unknown>("/api/admin/courses");
  return unwrapList(data, normalizeAdminCourse);
}

export async function createAdminCourse(
  body: CreateCourseInput,
): Promise<AdminCourse> {
  const data = await apiFetch<unknown>("/api/admin/courses", {
    method: "POST",
    body,
  });
  return normalizeAdminCourse(data, 0)!;
}

export async function uploadCourseImage(
  file: File,
): Promise<{ imageUrl: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const data = await apiFetch<unknown>("/api/admin/courses/upload-image", {
    method: "POST",
    body: formData,
  });

  return {
    imageUrl: text(data as ApiRecord, "imageUrl", "ImageUrl"),
  };
}

export async function patchAdminCoursePricing(
  courseId: string,
  body: { basePrice?: number; discountPercent?: number; currency?: string },
): Promise<AdminCourse> {
  const data = await apiFetch<unknown>(
    `/api/admin/courses/${courseId}/pricing`,
    {
      method: "PATCH",
      body,
    },
  );
  return normalizeAdminCourse(data, 0)!;
}

export async function updateAdminCourse(
  courseId: string,
  body: Partial<
    Pick<AdminCourse, "title" | "level" | "isPublished" | "isFeatured">
  >,
): Promise<AdminCourse> {
  const data = await apiFetch<unknown>(`/api/admin/courses/${courseId}`, {
    method: "PATCH",
    body,
  });
  return normalizeAdminCourse(data, 0)!;
}

export type AdminCourseModule = {
  id: string;
  title: string;
  description: string;
  order: number;
};

function normalizeModule(
  raw: unknown,
  index: number,
): AdminCourseModule | null {
  const r = (raw ?? {}) as ApiRecord;
  const id = text(r, "id", "Id", "moduleId", "ModuleId");
  if (!id && !text(r, "title", "Title", "name", "Name")) return null;
  return {
    id: id || `module-${index}`,
    title: text(r, "title", "Title", "name", "Name"),
    description: text(r, "description", "Description"),
    order: numberValue(r, "order", "Order", "sortOrder", "SortOrder"),
  };
}

export async function listAdminCourseModules(
  courseId: string,
): Promise<AdminCourseModule[]> {
  const data = await apiFetch<unknown>(
    `/api/admin/courses/${courseId}/modules`,
  );
  return unwrapList(data, normalizeModule);
}

export async function createAdminCourseModule(
  courseId: string,
  body: Pick<AdminCourseModule, "title" | "description" | "order">,
): Promise<AdminCourseModule> {
  const data = await apiFetch<unknown>(
    `/api/admin/courses/${courseId}/modules`,
    { method: "POST", body },
  );
  return normalizeModule(data, 0)!;
}

export async function updateAdminCourseModule(
  moduleId: string,
  body: Partial<Pick<AdminCourseModule, "title" | "description" | "order">>,
): Promise<AdminCourseModule> {
  const data = await apiFetch<unknown>(`/api/admin/modules/${moduleId}`, {
    method: "PATCH",
    body,
  });
  return normalizeModule(data, 0)!;
}

export async function deleteAdminCourseModule(moduleId: string): Promise<void> {
  await apiFetch(`/api/admin/modules/${moduleId}`, { method: "DELETE" });
}

export type AdminLesson = {
  id: string;
  title: string;
  body: string;
  videoUrl: string;
  order: number;
};

function normalizeLesson(raw: unknown, index: number): AdminLesson | null {
  const r = (raw ?? {}) as ApiRecord;
  const id = text(r, "id", "Id", "lessonId", "LessonId");
  if (!id && !text(r, "title", "Title", "name", "Name")) return null;
  return {
    id: id || `lesson-${index}`,
    title: text(r, "title", "Title", "name", "Name"),
    body: text(r, "body", "Body", "content", "Content"),
    videoUrl: text(r, "videoUrl", "VideoUrl", "videoURL", "VideoURL"),
    order: numberValue(r, "order", "Order", "sortOrder", "SortOrder"),
  };
}

export async function listAdminModuleLessons(
  moduleId: string,
): Promise<AdminLesson[]> {
  const data = await apiFetch<unknown>(
    `/api/admin/modules/${moduleId}/lessons`,
  );
  return unwrapList(data, normalizeLesson);
}

export async function createAdminModuleLesson(
  moduleId: string,
  body: Omit<AdminLesson, "id">,
): Promise<AdminLesson> {
  const data = await apiFetch<unknown>(
    `/api/admin/modules/${moduleId}/lessons`,
    { method: "POST", body },
  );
  return normalizeLesson(data, 0)!;
}

export async function updateAdminLesson(
  lessonId: string,
  body: Partial<Omit<AdminLesson, "id">>,
): Promise<AdminLesson> {
  const data = await apiFetch<unknown>(`/api/admin/lessons/${lessonId}`, {
    method: "PATCH",
    body,
  });
  return normalizeLesson(data, 0)!;
}

export async function deleteAdminLesson(lessonId: string): Promise<void> {
  await apiFetch(`/api/admin/lessons/${lessonId}`, { method: "DELETE" });
}

// --- Blog ---

export type AdminBlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  status: "published" | "draft";
  publishedAt: string;
  readTimeMinutes: number;
  imageUrl: string;
  views: number;
  lang: string;
};

function normalizeBlogPost(raw: unknown, index: number): AdminBlogPost | null {
  const r = (raw ?? {}) as ApiRecord;
  const id = text(r, "id", "Id");
  const title = text(r, "title", "Title");
  if (!id && !title) return null;
  const statusRaw = text(r, "status", "Status").toLowerCase();
  return {
    id: id || `post-${index}`,
    slug: text(r, "slug", "Slug", "url", "Url", "permalink", "Permalink"),
    title,
    excerpt: text(r, "excerpt", "Excerpt"),
    content: text(
      r,
      "content",
      "Content",
      "body",
      "Body",
      "bodyHtml",
      "BodyHtml",
      "bodyMarkdown",
      "BodyMarkdown",
    ),
    author: text(r, "author", "Author"),
    category: text(r, "category", "Category"),
    status: statusRaw === "published" ? "published" : "draft",
    publishedAt: text(r, "publishedAt", "PublishedAt", "date", "Date"),
    readTimeMinutes: numberValue(r, "readTimeMinutes", "ReadTimeMinutes"),
    imageUrl: text(r, "imageUrl", "ImageUrl", "image", "Image"),
    views: numberValue(r, "views", "Views"),
    lang: text(r, "lang", "Lang", "language", "Language") || "en",
  };
}

export async function listAdminBlogPosts(
  query: ListQuery = {},
): Promise<PagedResult<AdminBlogPost>> {
  const data = await apiFetch<unknown>(
    `/api/admin/blog/posts${toQuery(query)}`,
  );
  return unwrapPaged(data, normalizeBlogPost);
}

export async function createAdminBlogPost(
  body: Record<string, unknown>,
): Promise<AdminBlogPost> {
  const data = await apiFetch<unknown>("/api/admin/blog/posts", {
    method: "POST",
    body,
  });
  return normalizeBlogPost(data, 0)!;
}

export async function updateAdminBlogPost(
  postId: string,
  body: Record<string, unknown>,
): Promise<AdminBlogPost> {
  const data = await apiFetch<unknown>(`/api/admin/blog/posts/${postId}`, {
    method: "PATCH",
    body,
  });
  return normalizeBlogPost(data, 0)!;
}

export async function deleteAdminBlogPost(postId: string): Promise<void> {
  await apiFetch(`/api/admin/blog/posts/${postId}`, { method: "DELETE" });
}

export async function setAdminBlogPostStatus(
  postId: string,
  status: "published" | "draft",
): Promise<AdminBlogPost> {
  const data = await apiFetch<unknown>(
    `/api/admin/blog/posts/${postId}/status`,
    {
      method: "PATCH",
      body: { status },
    },
  );
  return normalizeBlogPost(data, 0)!;
}

// --- Settings ---

export type AdminSiteSettings = {
  siteName: string;
  supportEmail: string;
  defaultLocale: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
};

function normalizeSettings(raw: unknown): AdminSiteSettings {
  const r = (raw ?? {}) as ApiRecord;
  return {
    siteName: text(r, "siteName", "SiteName"),
    supportEmail: text(r, "supportEmail", "SupportEmail"),
    defaultLocale: text(r, "defaultLocale", "DefaultLocale") || "fa",
    maintenanceMode: Boolean(value(r, "maintenanceMode", "MaintenanceMode")),
    allowRegistration: Boolean(
      value(r, "allowRegistration", "AllowRegistration") ?? true,
    ),
  };
}

export async function getAdminSettings(): Promise<AdminSiteSettings> {
  const data = await apiFetch<unknown>("/api/admin/settings");
  return normalizeSettings(data);
}

export async function patchAdminSettings(
  body: Partial<AdminSiteSettings>,
): Promise<AdminSiteSettings> {
  const data = await apiFetch<unknown>("/api/admin/settings", {
    method: "PATCH",
    body,
  });
  return normalizeSettings(data);
}
