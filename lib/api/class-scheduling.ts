export type ClassSlotStatus = "active" | "draft" | "cancelled" | "completed";
export type TeacherAssignmentStatus = "pending" | "confirmed" | "cancelled";
export type StudentEnrollmentStatus = "active" | "cancelled";

export type AdminClassSlot = {
  id: string;
  title: string;
  description: string;
  teacherRole: string;
  capacity: number;
  startsAt: string;
  endsAt: string;
  status: ClassSlotStatus;
  createdBy: string;
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
