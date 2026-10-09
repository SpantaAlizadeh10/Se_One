import { apiFetch } from "./client";

export type ClassroomStatus =
  | "scheduled"
  | "ongoing"
  | "completed"
  | "cancelled";

export type ClassroomMaterial = {
  id: string;
  name: string;
  category: "course_material" | "homework" | "submission";
  contentType: string;
  size: number;
  createdAt: string;
  downloadUrl?: string;
};

export type ClassroomAttendance = {
  studentId: string;
  studentName: string;
  status: "present" | "late" | "absent";
  joinedAt?: string;
  leftAt?: string;
};

export type ClassroomSession = {
  id: string;
  courseId: string;
  courseTitle: string;
  teacherId: string;
  teacherName: string;
  scheduledAt: string;
  duration: number;
  status: ClassroomStatus;
  provider: string;
  meetingUrl?: string;
  recordingUrl?: string;
  materials: ClassroomMaterial[];
  notes?: string;
  attendance: ClassroomAttendance[];
};

export type CreateClassroomSession = {
  courseId: string;
  scheduledAt: string;
  duration: number;
  provider?: string;
  meetingUrl?: string;
  notes?: string;
};

export type ClassroomFileCategory = ClassroomMaterial["category"];

type RecordValue = Record<string, unknown>;

function record(value: unknown): RecordValue {
  return value && typeof value === "object" ? (value as RecordValue) : {};
}

function text(source: RecordValue, ...keys: string[]): string {
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null) return String(value);
  }
  return "";
}

function list(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const source = record(value);
  const items = source.items ?? source.Items ?? source.data ?? source.Data;
  return Array.isArray(items) ? items : [];
}

function normalizeMaterial(raw: unknown): ClassroomMaterial {
  const source = record(raw);
  const category = text(source, "category", "Category").toLowerCase();
  return {
    id: text(source, "id", "Id"),
    name: text(source, "name", "Name", "fileName", "FileName"),
    category:
      category === "homework" || category === "submission"
        ? category
        : "course_material",
    contentType: text(source, "contentType", "ContentType"),
    size: Number(source.size ?? source.Size ?? 0),
    createdAt: text(source, "createdAt", "CreatedAt"),
    downloadUrl: text(source, "downloadUrl", "DownloadUrl") || undefined,
  };
}

function normalizeSession(raw: unknown): ClassroomSession {
  const source = record(raw);
  const attendance = list(source.attendance ?? source.Attendance).map(
    (entry) => {
      const item = record(entry);
      const status = text(item, "status", "Status").toLowerCase();
      return {
        studentId: text(item, "studentId", "StudentId"),
        studentName: text(item, "studentName", "StudentName"),
        status: status === "late" || status === "absent" ? status : "present",
        joinedAt: text(item, "joinedAt", "JoinedAt") || undefined,
        leftAt: text(item, "leftAt", "LeftAt") || undefined,
      } satisfies ClassroomAttendance;
    },
  );
  const rawStatus = text(source, "status", "Status").toLowerCase();
  const status: ClassroomStatus =
    rawStatus === "ongoing" ||
    rawStatus === "completed" ||
    rawStatus === "cancelled"
      ? rawStatus
      : "scheduled";

  return {
    id: text(source, "id", "Id", "sessionId", "SessionId"),
    courseId: text(source, "courseId", "CourseId", "course_id"),
    courseTitle: text(source, "courseTitle", "CourseTitle"),
    teacherId: text(source, "teacherId", "TeacherId", "teacher_id"),
    teacherName: text(source, "teacherName", "TeacherName"),
    scheduledAt: text(source, "scheduledAt", "ScheduledAt", "scheduled_at"),
    duration: Number(source.duration ?? source.Duration ?? 0),
    status,
    provider:
      text(source, "provider", "Provider", "providerKey", "ProviderKey") ||
      "adobe_connect",
    meetingUrl:
      text(
        source,
        "meetingUrl",
        "MeetingUrl",
        "classroomUrl",
        "ClassroomUrl",
      ) || undefined,
    recordingUrl: text(source, "recordingUrl", "RecordingUrl") || undefined,
    materials: list(source.materials ?? source.Materials).map(
      normalizeMaterial,
    ),
    notes: text(source, "notes", "Notes") || undefined,
    attendance,
  };
}

export async function getClassroomSessions(): Promise<ClassroomSession[]> {
  const response = await apiFetch<unknown>("/api/classrooms/sessions", {
    cache: "no-store",
  });
  return list(response).map(normalizeSession);
}

export async function createClassroomSession(
  input: CreateClassroomSession,
): Promise<ClassroomSession> {
  const response = await apiFetch<unknown>("/api/classrooms/sessions", {
    method: "POST",
    body: { ...input, provider: input.provider ?? "adobe_connect" },
  });
  return normalizeSession(response);
}

export async function updateClassroomSession(
  sessionId: string,
  updates: Partial<
    Pick<ClassroomSession, "status" | "meetingUrl" | "recordingUrl" | "notes">
  >,
): Promise<ClassroomSession> {
  const response = await apiFetch<unknown>(
    `/api/classrooms/sessions/${encodeURIComponent(sessionId)}`,
    { method: "PATCH", body: updates },
  );
  return normalizeSession(response);
}

/** The API enforces access and records the attendance event before returning the provider URL. */
export async function joinClassroomSession(sessionId: string): Promise<string> {
  const response = record(
    await apiFetch<unknown>(
      `/api/classrooms/sessions/${encodeURIComponent(sessionId)}/join`,
      { method: "POST", body: {} },
    ),
  );
  const url = text(
    response,
    "meetingUrl",
    "MeetingUrl",
    "classroomUrl",
    "ClassroomUrl",
  );
  if (!isSafeClassroomUrl(url)) {
    throw new Error("This session does not have a valid classroom URL yet.");
  }
  return url;
}

export function isSafeClassroomUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function uploadClassroomFile(
  sessionId: string,
  file: File,
  category: ClassroomFileCategory,
): Promise<ClassroomMaterial> {
  const grant = record(
    await apiFetch<unknown>(
      `/api/classrooms/sessions/${encodeURIComponent(sessionId)}/files/upload-grant`,
      {
        method: "POST",
        body: {
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          size: file.size,
          category,
        },
      },
    ),
  );
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const bucket = text(grant, "bucket", "Bucket");
  const path = text(grant, "path", "Path");
  const token = text(
    grant,
    "token",
    "Token",
    "signedUploadToken",
    "SignedUploadToken",
  );
  if (!supabaseUrl || !anonKey || !bucket || !path || !token) {
    throw new Error("The secure course-file upload service is not configured.");
  }

  const { createClient } = await import("@supabase/supabase-js");
  const storageClient = createClient(supabaseUrl, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  const { error } = await storageClient.storage
    .from(bucket)
    .uploadToSignedUrl(path, token, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
  if (error) throw new Error(error.message);

  const saved = await apiFetch<unknown>(
    `/api/classrooms/sessions/${encodeURIComponent(sessionId)}/files`,
    {
      method: "POST",
      body: {
        path,
        fileName: file.name,
        contentType: file.type,
        size: file.size,
        category,
      },
    },
  );
  return normalizeMaterial(saved);
}
