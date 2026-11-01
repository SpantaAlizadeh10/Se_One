import { apiFetch } from "./client";

export type ClassSlotStatus = "active" | "draft" | "cancelled" | "completed";
export type ClassType = "public" | "private";
export type TeacherAssignmentStatus = "pending" | "confirmed" | "cancelled";
export type StudentEnrollmentStatus =
  | "pending"
  | "active"
  | "confirmed"
  | "cancelled"
  | "completed";

export type AdminClassSlot = {
  id: string;
  courseId?: string;
  courseTitle?: string;
  level?: string;
  basePrice?: number;
  finalPrice?: number;
  currency?: string;
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
  teacherAssignments?: TeacherClassAssignment[];
};

export type TeacherClassAssignment = {
  id: string;
  slotId: string;
  teacherId: string;
  status: TeacherAssignmentStatus;
  selectedAt: string;
  teacherName?: string;
};

export type StudentClassEnrollment = {
  id: string;
  assignmentId: string;
  studentId: string;
  enrolledAt: string;
  status: StudentEnrollmentStatus;
  finalPrice?: number;
  currency?: string;
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
  const assignmentsRaw = value(
    record,
    "teacherAssignments",
    "TeacherAssignments",
    "assignments",
    "Assignments",
  );
  const teacherAssignments = Array.isArray(assignmentsRaw)
    ? assignmentsRaw
        .map((item): TeacherClassAssignment | null => {
          const assignment = (item ?? {}) as ApiRecord;
          const id = text(
            assignment,
            "id",
            "Id",
            "assignmentId",
            "AssignmentId",
          );
          const teacherId = text(assignment, "teacherId", "TeacherId");
          if (!id || !teacherId) return null;
          const statusRaw = text(assignment, "status", "Status").toLowerCase();
          const status: TeacherAssignmentStatus =
            statusRaw === "confirmed" || statusRaw === "cancelled"
              ? statusRaw
              : "pending";
          return {
            id,
            slotId:
              text(assignment, "slotId", "SlotId") || text(record, "id", "Id"),
            teacherId,
            teacherName:
              text(assignment, "teacherName", "TeacherName") || undefined,
            status,
            selectedAt: text(
              assignment,
              "selectedAt",
              "SelectedAt",
              "createdAt",
              "CreatedAt",
            ),
          };
        })
        .filter((item): item is TeacherClassAssignment => item !== null)
    : undefined;
  return {
    id: text(record, "id", "Id", "slotId", "SlotId"),
    courseId: text(record, "courseId", "CourseId") || undefined,
    courseTitle: text(record, "courseTitle", "CourseTitle") || undefined,
    level: text(record, "level", "Level") || undefined,
    basePrice: numberValue(record, "basePrice", "BasePrice"),
    finalPrice: numberValue(record, "finalPrice", "FinalPrice"),
    currency: text(record, "currency", "Currency") || undefined,
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
    teacherAssignments,
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
> & { capacity?: number; courseId?: string };

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

/** Creates a pending teacher request; admin approval is required before students can book. */
export async function requestTeacherClassSlot(slotId: string): Promise<void> {
  await apiFetch(
    `/api/teacher/class-slots/${encodeURIComponent(slotId)}/request`,
    {
      method: "POST",
    },
  );
}

/** Admin approval/rejection of a teacher's class request. */
export async function reviewAdminTeacherClassAssignment(
  assignmentId: string,
  status: Extract<TeacherAssignmentStatus, "confirmed" | "cancelled">,
): Promise<void> {
  await apiFetch(
    `/api/admin/class-slot-assignments/${encodeURIComponent(assignmentId)}`,
    {
      method: "PATCH",
      body: { status },
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
): Promise<StudentClassEnrollment> {
  const data = await apiFetch<unknown>(
    `/api/student/class-slots/${encodeURIComponent(assignmentId)}/enroll`,
    {
      method: "POST",
    },
  );
  const record = (data ?? {}) as ApiRecord;
  return {
    id: text(record, "id", "Id", "enrollmentId", "EnrollmentId"),
    assignmentId: text(record, "assignmentId", "AssignmentId") || assignmentId,
    studentId: text(record, "studentId", "StudentId"),
    enrolledAt: text(record, "enrolledAt", "EnrolledAt"),
    status: (text(record, "status", "Status") ||
      "active") as StudentEnrollmentStatus,
    finalPrice: numberValue(record, "finalPrice", "FinalPrice"),
    currency: text(record, "currency", "Currency") || undefined,
  };
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
