import { apiFetch } from "./client";

/**
 * Assignments API client
 * Handle teacher-created assignments and student submissions
 */

export type Assignment = {
  id: string;
  courseId: string;
  courseTitle: string;
  moduleId?: string;
  moduleTitle?: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description: string;
  instructions?: string;
  dueDate: string;
  maxPoints: number;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
};

export type Submission = {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  content: string;
  attachments?: string[];
  submittedAt: string;
  grade?: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: string;
  gradedByName?: string;
  status: "draft" | "submitted" | "graded" | "returned";
};

export type CreateAssignmentInput = {
  courseId: string;
  moduleId?: string;
  title: string;
  description: string;
  instructions?: string;
  dueDate: string;
  maxPoints: number;
  attachments?: string[];
  isPublished?: boolean;
};

export type UpdateAssignmentInput = Partial<
  Pick<
    Assignment,
    | "title"
    | "description"
    | "instructions"
    | "dueDate"
    | "maxPoints"
    | "attachments"
    | "isPublished"
  >
>;

export type CreateSubmissionInput = {
  content: string;
  attachments?: string[];
};

export type GradeSubmissionInput = {
  grade: number;
  feedback?: string;
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

function normalizeAssignment(raw: unknown, index: number): Assignment | null {
  const record = (raw ?? {}) as ApiRecord;
  const id = text(record, "id", "Id", "assignmentId", "AssignmentId");
  const courseId = text(record, "courseId", "CourseId");
  if (!courseId) return null;

  return {
    id: id || `assignment-${index}`,
    courseId,
    courseTitle: text(record, "courseTitle", "CourseTitle"),
    moduleId: text(record, "moduleId", "ModuleId") || undefined,
    moduleTitle: text(record, "moduleTitle", "ModuleTitle") || undefined,
    teacherId: text(record, "teacherId", "TeacherId"),
    teacherName: text(record, "teacherName", "TeacherName"),
    title: text(record, "title", "Title"),
    description: text(record, "description", "Description"),
    instructions: text(record, "instructions", "Instructions") || undefined,
    dueDate: text(record, "dueDate", "DueDate"),
    maxPoints: numberValue(record, "maxPoints", "MaxPoints"),
    attachments:
      (value(record, "attachments", "Attachments") as string[]) || undefined,
    createdAt: text(record, "createdAt", "CreatedAt"),
    updatedAt: text(record, "updatedAt", "UpdatedAt"),
    isPublished: Boolean(value(record, "isPublished", "IsPublished")),
  };
}

function normalizeSubmission(raw: unknown, index: number): Submission | null {
  const record = (raw ?? {}) as ApiRecord;
  const id = text(record, "id", "Id", "submissionId", "SubmissionId");
  const assignmentId = text(record, "assignmentId", "AssignmentId");
  if (!assignmentId) return null;

  const statusRaw = text(record, "status", "Status").toLowerCase();
  const status: Submission["status"] =
    statusRaw === "draft" ||
    statusRaw === "submitted" ||
    statusRaw === "graded" ||
    statusRaw === "returned"
      ? statusRaw
      : "draft";

  return {
    id: id || `submission-${index}`,
    assignmentId,
    studentId: text(record, "studentId", "StudentId"),
    studentName: text(record, "studentName", "StudentName"),
    studentAvatar: text(record, "studentAvatar", "StudentAvatar") || undefined,
    content: text(record, "content", "Content"),
    attachments:
      (value(record, "attachments", "Attachments") as string[]) || undefined,
    submittedAt: text(record, "submittedAt", "SubmittedAt"),
    grade: value(record, "grade", "Grade") as number | undefined,
    feedback: text(record, "feedback", "Feedback") || undefined,
    gradedAt: text(record, "gradedAt", "GradedAt") || undefined,
    gradedBy: text(record, "gradedBy", "GradedBy") || undefined,
    gradedByName: text(record, "gradedByName", "GradedByName") || undefined,
    status,
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

// --- Teacher operations ---

/**
 * GET /api/teacher/assignments
 * Get assignments created by the current teacher
 */
export async function getTeacherAssignments(): Promise<Assignment[]> {
  const data = await apiFetch<unknown>("/api/teacher/assignments");
  return unwrapList(data, normalizeAssignment);
}

/**
 * POST /api/teacher/assignments
 * Create a new assignment
 */
export async function createAssignment(
  input: CreateAssignmentInput,
): Promise<Assignment> {
  const data = await apiFetch<unknown>("/api/teacher/assignments", {
    method: "POST",
    body: input,
  });
  return normalizeAssignment(data, 0)!;
}

/**
 * GET /api/teacher/assignments/{assignmentId}
 * Get a specific assignment
 */
export async function getAssignment(assignmentId: string): Promise<Assignment> {
  const data = await apiFetch<unknown>(
    `/api/teacher/assignments/${assignmentId}`,
  );
  return normalizeAssignment(data, 0)!;
}

/**
 * PATCH /api/teacher/assignments/{assignmentId}
 * Update an assignment
 */
export async function updateAssignment(
  assignmentId: string,
  input: UpdateAssignmentInput,
): Promise<Assignment> {
  const data = await apiFetch<unknown>(
    `/api/teacher/assignments/${assignmentId}`,
    {
      method: "PATCH",
      body: input,
    },
  );
  return normalizeAssignment(data, 0)!;
}

/**
 * DELETE /api/teacher/assignments/{assignmentId}
 * Delete an assignment
 */
export async function deleteAssignment(assignmentId: string): Promise<void> {
  await apiFetch(`/api/teacher/assignments/${assignmentId}`, {
    method: "DELETE",
  });
}

/**
 * GET /api/teacher/assignments/{assignmentId}/submissions
 * Get all submissions for an assignment
 */
export async function getAssignmentSubmissions(
  assignmentId: string,
): Promise<Submission[]> {
  const data = await apiFetch<unknown>(
    `/api/teacher/assignments/${assignmentId}/submissions`,
  );
  return unwrapList(data, normalizeSubmission);
}

/**
 * PATCH /api/teacher/submissions/{submissionId}/grade
 * Grade a submission
 */
export async function gradeSubmission(
  submissionId: string,
  input: GradeSubmissionInput,
): Promise<Submission> {
  const data = await apiFetch<unknown>(
    `/api/teacher/submissions/${submissionId}/grade`,
    {
      method: "PATCH",
      body: input,
    },
  );
  return normalizeSubmission(data, 0)!;
}

// --- Student operations ---

/**
 * GET /api/student/assignments
 * Get assignments for the current student
 */
export async function getStudentAssignments(): Promise<Assignment[]> {
  const data = await apiFetch<unknown>("/api/student/assignments");
  return unwrapList(data, normalizeAssignment);
}

/**
 * GET /api/student/assignments/{assignmentId}
 * Get assignment details for student
 */
export async function getStudentAssignment(assignmentId: string): Promise<{
  assignment: Assignment;
  submission?: Submission;
}> {
  const data = await apiFetch<unknown>(
    `/api/student/assignments/${assignmentId}`,
  );
  const record = (data ?? {}) as ApiRecord;
  return {
    assignment: normalizeAssignment(
      value(record, "assignment", "Assignment"),
      0,
    )!,
    submission: value(record, "submission", "Submission")
      ? normalizeSubmission(value(record, "submission", "Submission"), 0)!
      : undefined,
  };
}

/**
 * POST /api/student/assignments/{assignmentId}/submissions
 * Submit an assignment
 */
export async function submitAssignment(
  assignmentId: string,
  input: CreateSubmissionInput,
): Promise<Submission> {
  const data = await apiFetch<unknown>(
    `/api/student/assignments/${assignmentId}/submissions`,
    {
      method: "POST",
      body: input,
    },
  );
  return normalizeSubmission(data, 0)!;
}

/**
 * POST /api/student/assignments/{assignmentId}/submissions/upload-grant
 * Request a short-lived, single-file Supabase Storage upload URL.
 */
export async function uploadStudentAssignmentFile(
  assignmentId: string,
  file: File,
): Promise<string> {
  const grant = (await apiFetch<unknown>(
    `/api/student/assignments/${encodeURIComponent(assignmentId)}/submissions/upload-grant`,
    {
      method: "POST",
      body: {
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        size: file.size,
      },
    },
  )) as ApiRecord;
  const bucket = text(grant, "bucket", "Bucket");
  const path = text(grant, "path", "Path");
  const token = text(
    grant,
    "token",
    "Token",
    "signedUploadToken",
    "SignedUploadToken",
  );
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!bucket || !path || !token || !supabaseUrl || !anonKey) {
    throw new Error("Secure assignment upload is not configured.");
  }

  const { createClient } = await import("@supabase/supabase-js");
  const storage = createClient(supabaseUrl, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  const { error } = await storage.storage
    .from(bucket)
    .uploadToSignedUrl(path, token, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
  if (error) throw new Error(error.message);
  return path;
}

/** GET /api/student/attachments/download-url?path=... — short-lived authorized download URL. */
export async function getStudentAttachmentDownloadUrl(
  path: string,
): Promise<string> {
  const data = (await apiFetch<unknown>(
    `/api/student/attachments/download-url?path=${encodeURIComponent(path)}`,
  )) as ApiRecord;
  const url = text(data, "url", "Url", "downloadUrl", "DownloadUrl");
  if (!/^https:\/\//i.test(url))
    throw new Error("A secure download link is not available.");
  return url;
}

/**
 * PUT /api/student/assignments/{assignmentId}/submissions/draft
 * Save or update a draft without submitting it to the teacher.
 */
export async function saveStudentAssignmentDraft(
  assignmentId: string,
  input: CreateSubmissionInput,
): Promise<Submission> {
  const data = await apiFetch<unknown>(
    `/api/student/assignments/${encodeURIComponent(assignmentId)}/submissions/draft`,
    { method: "PUT", body: input },
  );
  return normalizeSubmission(data, 0)!;
}

/** POST /api/student/submissions/{submissionId}/submit — submit or resubmit saved work. */
export async function finalizeStudentSubmission(
  submissionId: string,
  input: CreateSubmissionInput,
): Promise<Submission> {
  const data = await apiFetch<unknown>(
    `/api/student/submissions/${encodeURIComponent(submissionId)}/submit`,
    { method: "POST", body: input },
  );
  return normalizeSubmission(data, 0)!;
}

/**
 * GET /api/student/submissions
 * Get student's submission history
 */
export async function getStudentSubmissions(): Promise<Submission[]> {
  const data = await apiFetch<unknown>("/api/student/submissions");
  return unwrapList(data, normalizeSubmission);
}

/**
 * GET /api/student/submissions/{submissionId}
 * Get a specific submission
 */
export async function getSubmission(submissionId: string): Promise<Submission> {
  const data = await apiFetch<unknown>(
    `/api/student/submissions/${submissionId}`,
  );
  return normalizeSubmission(data, 0)!;
}

/**
 * PATCH /api/student/submissions/{submissionId}
 * Update a draft submission
 */
export async function updateSubmission(
  submissionId: string,
  input: Partial<CreateSubmissionInput>,
): Promise<Submission> {
  const data = await apiFetch<unknown>(
    `/api/student/submissions/${submissionId}`,
    {
      method: "PATCH",
      body: input,
    },
  );
  return normalizeSubmission(data, 0)!;
}
