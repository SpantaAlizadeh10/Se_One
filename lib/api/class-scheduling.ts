import { apiFetch } from "./client";

export type ClassSlotStatus = "active" | "draft" | "cancelled" | "completed";
export type ClassType = "public" | "private";
export type TeacherAssignmentStatus = "pending" | "confirmed" | "cancelled";
export type StudentEnrollmentStatus = "active" | "cancelled";

export type AdminClassSlot = {
  id: string;
  title: string;
  description: string;
  classType: ClassType;
  teacherRole: string;
  capacity: number;
  startsAt: string;
  endsAt: string;
  status: ClassSlotStatus;
  createdBy: string;
  remainingSeats: number;
  enrolledCount: number;
};

export type TeacherClassAssignment = {
  id: string;
  slotId: string;
  teacherId: string;
  status: TeacherAssignmentStatus;
  selectedAt: string;
};

export type StudentClassEnrollment = {
  id: string;
  assignmentId: string;
  studentId: string;
  enrolledAt: string;
  status: StudentEnrollmentStatus;
};

export type TeacherClassSlot = AdminClassSlot & {
  assignmentStatus: "available" | "pending" | "confirmed" | "cancelled";
  assignmentId?: string;
  teacherId?: string;
  teacherName?: string;
};

export type StudentAvailableClass = AdminClassSlot & {
  assignmentId: string;
  teacherId: string;
  teacherName: string;
  enrolled: boolean;
};

type ApiRecord = Record<string, unknown>;

function value(record: ApiRecord, ...keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key];
  }
  return undefined;
}

function text(record: ApiRecord, ...keys: string[]): string {
  const result = value(record, ...keys);
  return result == null ? "" : String(result);
}

function numberValue(record: ApiRecord, ...keys: string[]): number {
  const result = Number(value(record, ...keys) ?? 0);
  return Number.isFinite(result) ? result : 0;
}

function unwrapList(response: unknown): unknown[] {
  if (Array.isArray(response)) return response;
  const record = (response ?? {}) as ApiRecord;
  const list = value(
    record,
    "items",
    "Items",
    "data",
    "Data",
    "slots",
    "Slots",
    "classes",
    "Classes",
  );
  return Array.isArray(list) ? list : [];
}

function normalizeClassSlot(raw: unknown): AdminClassSlot {
  const record = (raw ?? {}) as ApiRecord;
  const classTypeRaw = text(
    record,
    "classType",
    "ClassType",
    "type",
    "Type",
  ).toLowerCase();
  const classType: ClassType =
    classTypeRaw === "private" ? "private" : "public";
  const maxCapacity = classType === "private" ? 2 : 10;
  const requestedCapacity =
    numberValue(record, "capacity", "Capacity") || maxCapacity;
  const capacity = Math.min(maxCapacity, Math.max(1, requestedCapacity));
  const enrolledCount = numberValue(
    record,
    "enrolledCount",
    "EnrolledCount",
    "activeEnrollmentCount",
    "ActiveEnrollmentCount",
  );
  return {
    id: text(record, "id", "Id", "slotId", "SlotId"),
    title: text(record, "title", "Title", "name", "Name"),
    description: text(record, "description", "Description"),
    classType,
    teacherRole:
      text(record, "teacherRole", "TeacherRole", "subject", "Subject") || "all",
    capacity,
    startsAt: text(record, "startsAt", "StartsAt", "startDate", "StartDate"),
    endsAt: text(record, "endsAt", "EndsAt", "endDate", "EndDate"),
    status: (text(record, "status", "Status") || "active") as ClassSlotStatus,
    createdBy: text(record, "createdBy", "CreatedBy"),
    enrolledCount,
    remainingSeats: Math.max(
      0,
      numberValue(record, "remainingSeats", "RemainingSeats") ||
        capacity - enrolledCount,
    ),
  };
}

function normalizeTeacherClass(raw: unknown): TeacherClassSlot {
  const record = (raw ?? {}) as ApiRecord;
  const slot = normalizeClassSlot(value(record, "slot", "Slot") ?? record);
  const assignmentStatusRaw = text(
    record,
    "assignmentStatus",
    "AssignmentStatus",
    "status",
    "Status",
  ).toLowerCase();
  const assignmentStatus: TeacherClassSlot["assignmentStatus"] =
    assignmentStatusRaw === "confirmed" || assignmentStatusRaw === "accepted"
      ? "confirmed"
      : assignmentStatusRaw === "pending" || assignmentStatusRaw === "cancelled"
        ? assignmentStatusRaw
        : "available";
  return {
    ...slot,
    assignmentStatus,
    assignmentId:
      text(record, "assignmentId", "AssignmentId", "id", "Id") || undefined,
    teacherId: text(record, "teacherId", "TeacherId") || undefined,
    teacherName: text(record, "teacherName", "TeacherName") || undefined,
  };
}

function normalizeStudentClass(raw: unknown): StudentAvailableClass {
  const record = (raw ?? {}) as ApiRecord;
  const slot = normalizeClassSlot(value(record, "slot", "Slot") ?? record);
  return {
    ...slot,
    assignmentId: text(record, "assignmentId", "AssignmentId"),
    teacherId: text(record, "teacherId", "TeacherId"),
    teacherName: text(record, "teacherName", "TeacherName"),
    enrolled: Boolean(
      value(record, "enrolled", "Enrolled", "isEnrolled", "IsEnrolled"),
    ),
  };
}

export type CreateClassSlotInput = Pick<
  AdminClassSlot,
  "title" | "description" | "classType" | "teacherRole" | "startsAt" | "endsAt"
> & { capacity?: number };

/** Admin-only list. The API computes seat counts from active enrollments. */
export async function listAdminClassSlots(): Promise<AdminClassSlot[]> {
  return unwrapList(
    await apiFetch<unknown>("/api/admin/class-slots", { cache: "no-store" }),
  ).map(normalizeClassSlot);
}

/** Admin-only create. Public classes have 10 seats; private classes have 1 or 2. */
export async function createAdminClassSlot(
  input: CreateClassSlotInput,
): Promise<AdminClassSlot> {
  const capacity =
    input.classType === "private"
      ? Math.min(2, Math.max(1, input.capacity ?? 1))
      : 10;
  const data = await apiFetch<unknown>("/api/admin/class-slots", {
    method: "POST",
    body: { ...input, capacity },
  });
  return normalizeClassSlot(data);
}

/** Lists admin-created classes and this teacher's assignment state. */
export async function listTeacherClassSlots(): Promise<TeacherClassSlot[]> {
  return unwrapList(
    await apiFetch<unknown>("/api/teacher/class-slots", { cache: "no-store" }),
  ).map(normalizeTeacherClass);
}

/** The API must reject an overlapping teacher assignment atomically (HTTP 409). */
export async function acceptTeacherClassSlot(slotId: string): Promise<void> {
  await apiFetch(
    `/api/teacher/class-slots/${encodeURIComponent(slotId)}/accept`,
    {
      method: "POST",
    },
  );
}

/** Lists only classes accepted by a teacher; enrollment counts are authoritative. */
export async function listStudentClassSlots(
  teacherId?: string,
): Promise<StudentAvailableClass[]> {
  const query = teacherId ? `?teacherId=${encodeURIComponent(teacherId)}` : "";
  return unwrapList(
    await apiFetch<unknown>(`/api/student/class-slots${query}`, {
      cache: "no-store",
    }),
  ).map(normalizeStudentClass);
}

/** The API must enforce capacity and prevent duplicate/overlapping enrollments. */
export async function enrollStudentInClass(
  assignmentId: string,
): Promise<void> {
  await apiFetch(
    `/api/student/class-slots/${encodeURIComponent(assignmentId)}/enroll`,
    {
      method: "POST",
    },
  );
}

export function formatDateTime(dateIso: string): string {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return dateIso;

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function toDateTimeLocalValue(dateIso: string): string {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export function overlaps(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  return (
    new Date(startA).getTime() < new Date(endB).getTime() &&
    new Date(endA).getTime() > new Date(startB).getTime()
  );
}

export function remainingSeats(
  slot: AdminClassSlot,
  assignments: TeacherClassAssignment[],
  enrollments: StudentClassEnrollment[],
  teacherId?: string,
): number {
  const slotAssignments = assignments.filter(
    (item) => item.slotId === slot.id && item.status !== "cancelled",
  );

  const targetAssignments = teacherId
    ? slotAssignments.filter((item) => item.teacherId === teacherId)
    : slotAssignments;

  const activeEnrollmentCount = targetAssignments.reduce(
    (count, assignment) => {
      return (
        count +
        enrollments.filter(
          (item) =>
            item.assignmentId === assignment.id && item.status === "active",
        ).length
      );
    },
    0,
  );

  return Math.max(slot.capacity - activeEnrollmentCount, 0);
}
