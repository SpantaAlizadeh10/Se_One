import { apiFetch } from "./client";

export type ClassSlotStatus = "active" | "draft" | "cancelled" | "completed";
export type ClassType = "public" | "semi_private" | "private";
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
  term?: string;
  language?: string;
  classGroupId?: string;
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

export type AdminAssignableTeacher = {
  id: string;
  name: string;
  teachingLanguage: string;
  subject: string;
  matchedAvailability: string;
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
  classGroupId?: string;
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
  const normalizedClassType = classTypeRaw.replace(/[\s-]+/g, "_");
  const classType: ClassType =
    normalizedClassType === "semi_private" ||
    normalizedClassType === "semiprivate"
      ? "semi_private"
      : normalizedClassType === "private"
        ? "private"
        : "public";
  const defaultCapacity =
    classType === "semi_private" ? 4 : classType === "private" ? 1 : 10;
  const requestedCapacity =
    numberValue(record, "capacity", "Capacity") || defaultCapacity;
  const capacity =
    classType === "semi_private"
      ? 4
      : Math.max(1, requestedCapacity);
  const enrolledCount = numberValue(
    record,
    "enrolledCount",
    "EnrolledCount",
    "activeEnrollmentCount",
    "ActiveEnrollmentCount",
  );
  const reportedRemainingSeats = value(
    record,
    "remainingSeats",
    "RemainingSeats",
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
    term: text(record, "term", "Term", "termName", "TermName") || undefined,
    language:
      text(record, "language", "Language", "courseLanguage", "CourseLanguage") ||
      undefined,
    classGroupId:
      text(record, "classGroupId", "ClassGroupId", "groupId", "GroupId") ||
      undefined,
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
      classType === "semi_private" || reportedRemainingSeats === undefined
        ? capacity - enrolledCount
        : numberValue(record, "remainingSeats", "RemainingSeats"),
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
    classGroupId:
      text(record, "classGroupId", "ClassGroupId", "groupId", "GroupId") ||
      slot.classGroupId,
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
    classGroupId:
      text(record, "classGroupId", "ClassGroupId", "groupId", "GroupId") ||
      slot.classGroupId,
  };
}

export type CreateClassSlotInput = Pick<
  AdminClassSlot,
  | "title"
  | "description"
  | "level"
  | "classType"
  | "teacherRole"
  | "startsAt"
  | "endsAt"
> & {
  capacity?: number;
  courseId?: string;
  timeZone?: string;
  term?: string;
  language?: string;
  basePrice?: number;
  currency?: string;
};

export type AdminClassEnrollment = {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: StudentEnrollmentStatus;
  enrolledAt: string;
};

/** Admin-only list. The API computes seat counts from active enrollments. */
export async function listAdminClassSlots(): Promise<AdminClassSlot[]> {
  return unwrapList(
    await apiFetch<unknown>("/api/admin/class-slots", { cache: "no-store" }),
  ).map(normalizeClassSlot);
}

/** Admin-only create using the admin-selected class capacity. */
export async function createAdminClassSlot(
  input: CreateClassSlotInput,
): Promise<AdminClassSlot> {
  const capacity =
    input.classType === "semi_private"
      ? 4
      : Math.max(1, Math.floor(input.capacity ?? 10));
  const data = await apiFetch<unknown>("/api/admin/class-slots", {
    method: "POST",
    body: { ...input, capacity },
  });
  return normalizeClassSlot(data);
}

/** Admin-only update of a scheduled class and its capacity/pricing. */
export async function updateAdminClassSlot(
  slotId: string,
  input: Partial<CreateClassSlotInput>,
): Promise<AdminClassSlot> {
  const body =
    input.classType === "semi_private"
      ? { ...input, capacity: 4 }
      : input;
  const data = await apiFetch<unknown>(
    `/api/admin/class-slots/${encodeURIComponent(slotId)}`,
    {
      method: "PATCH",
      body,
    },
  );
  return normalizeClassSlot(data);
}

function normalizeAdminClassEnrollment(raw: unknown): AdminClassEnrollment {
  const record = (raw ?? {}) as ApiRecord;
  return {
    id: text(record, "id", "Id", "enrollmentId", "EnrollmentId"),
    assignmentId: text(record, "assignmentId", "AssignmentId"),
    studentId: text(record, "studentId", "StudentId"),
    studentName: text(record, "studentName", "StudentName", "fullName", "FullName"),
    studentEmail: text(record, "studentEmail", "StudentEmail", "email", "Email"),
    status: (text(record, "status", "Status") ||
      "active") as StudentEnrollmentStatus,
    enrolledAt: text(record, "enrolledAt", "EnrolledAt"),
  };
}

/** Admin-only roster for a scheduled class. */
export async function listAdminClassEnrollments(
  slotId: string,
): Promise<AdminClassEnrollment[]> {
  return unwrapList(
    await apiFetch<unknown>(
      `/api/admin/class-slots/${encodeURIComponent(slotId)}/enrollments`,
      { cache: "no-store" },
    ),
  ).map(normalizeAdminClassEnrollment);
}

/** Admin-only add of a student to a scheduled class. */
export async function addAdminStudentToClass(
  slotId: string,
  studentId: string,
): Promise<AdminClassEnrollment> {
  const data = await apiFetch<unknown>(
    `/api/admin/class-slots/${encodeURIComponent(slotId)}/enrollments`,
    {
      method: "POST",
      body: { studentId },
    },
  );
  return normalizeAdminClassEnrollment(data);
}

/** Admin-only atomic transfer that preserves the student's active enrollment. */
export async function moveAdminClassEnrollment(
  enrollmentId: string,
  targetSlotId: string,
): Promise<AdminClassEnrollment> {
  const data = await apiFetch<unknown>(
    `/api/admin/class-enrollments/${encodeURIComponent(enrollmentId)}/move`,
    {
      method: "POST",
      body: { targetSlotId },
    },
  );
  return normalizeAdminClassEnrollment(data);
}

/** Admin-only atomic teacher replacement for an existing scheduled class. */
export async function replaceAdminClassTeacher(
  slotId: string,
  teacherId: string | null,
): Promise<void> {
  await apiFetch(
    `/api/admin/class-slots/${encodeURIComponent(slotId)}/teacher`,
    {
      method: "PUT",
      body: { teacherId },
    },
  );
}

/** Admin-only list of approved teachers whose saved availability matches a class. */
export async function listAvailableTeachersForClass(
  slotId: string,
): Promise<AdminAssignableTeacher[]> {
  const data = await apiFetch<unknown>(
    `/api/admin/class-slots/${encodeURIComponent(slotId)}/available-teachers`,
    { cache: "no-store" },
  );
  return unwrapList(data)
    .map((item): AdminAssignableTeacher | null => {
      const record = (item ?? {}) as ApiRecord;
      const id = text(record, "id", "Id", "teacherId", "TeacherId");
      const name = text(record, "name", "Name", "fullName", "FullName");
      if (!id || !name) return null;
      return {
        id,
        name,
        teachingLanguage: text(
          record,
          "teachingLanguage",
          "TeachingLanguage",
        ),
        subject: text(record, "subject", "Subject"),
        matchedAvailability: text(
          record,
          "matchedAvailability",
          "MatchedAvailability",
          "availabilityLabel",
          "AvailabilityLabel",
        ),
      };
    })
    .filter((teacher): teacher is AdminAssignableTeacher => teacher !== null);
}

/** Admin-only direct assignment. The server must validate approval and schedule conflicts. */
export async function assignTeacherToClassSlot(
  slotId: string,
  teacherId: string,
): Promise<TeacherClassAssignment> {
  const data = await apiFetch<unknown>("/api/admin/class-slot-assignments", {
    method: "POST",
    body: { slotId, teacherId },
  });
  const record = (data ?? {}) as ApiRecord;
  const id = text(record, "id", "Id", "assignmentId", "AssignmentId");
  if (!id) throw new Error("The server returned an invalid class assignment.");
  return {
    id,
    slotId: text(record, "slotId", "SlotId") || slotId,
    teacherId: text(record, "teacherId", "TeacherId") || teacherId,
    teacherName: text(record, "teacherName", "TeacherName") || undefined,
    status: "confirmed",
    selectedAt: text(record, "selectedAt", "SelectedAt", "createdAt", "CreatedAt"),
  };
}

/** Lists admin-created classes and this teacher's assignment state. */
export async function listTeacherClassSlots(): Promise<TeacherClassSlot[]> {
  return unwrapList(
    await apiFetch<unknown>("/api/teacher/class-slots", { cache: "no-store" }),
  ).map(normalizeTeacherClass);
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
