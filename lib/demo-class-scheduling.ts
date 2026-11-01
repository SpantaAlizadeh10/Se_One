import { getName, getUserId } from "@/lib/auth-client";
import type {
  AdminClassSlot,
  StudentAvailableClass,
  TeacherClassAssignment,
  TeacherClassSlot,
  TeacherAssignmentStatus,
} from "@/lib/api/class-scheduling";

const ASSIGNMENTS_KEY = "se-one-demo-class-assignments";
const ENROLLMENTS_KEY = "se-one-demo-class-enrollments";
const CHANGE_EVENT = "se-one-demo-class-scheduling-change";

type DemoClassSlot = AdminClassSlot & { courseTitle: string; isDemo: true };
type DemoTeacherAssignment = TeacherClassAssignment & { teacherName: string };
type DemoEnrollments = Record<string, string[]>;

function publishChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  publishChange();
}

export function onDemoClassSchedulingChange(listener: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export function getDemoClassSlots(): DemoClassSlot[] {
  const makeSlot = (
    id: string,
    courseId: string,
    courseTitle: string,
    title: string,
    classType: "public" | "private",
    daysFromNow: number,
    hour: number,
    capacity: number,
    enrolledCount: number,
  ): DemoClassSlot => {
    const start = new Date();
    start.setDate(start.getDate() + daysFromNow);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return {
      id,
      courseId,
      title,
      courseTitle,
      description: courseTitle,
      classType,
      teacherRole: courseId.includes("german") ? "german" : "english",
      capacity,
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      status: "active",
      createdBy: "demo",
      remainingSeats: capacity - enrolledCount,
      enrolledCount,
      isDemo: true,
    };
  };

  return [
    makeSlot(
      "mock-class-conversation",
      "mock-course-conversation",
      "Practical English",
      "Everyday Conversation Club",
      "public",
      2,
      18,
      10,
      4,
    ),
    makeSlot(
      "mock-class-beginners",
      "mock-course-beginners",
      "English Foundations",
      "English for Beginners",
      "public",
      3,
      16,
      10,
      6,
    ),
    makeSlot(
      "mock-class-ielts",
      "mock-course-ielts",
      "IELTS Preparation",
      "IELTS Writing Workshop",
      "private",
      4,
      17,
      2,
      1,
    ),
    makeSlot(
      "mock-class-german",
      "mock-course-german",
      "Travel German",
      "German for Travel",
      "private",
      5,
      15,
      2,
      0,
    ),
  ];
}

export function getDemoTeacherAssignments(
  slotId?: string,
): DemoTeacherAssignment[] {
  const assignments = readJson<DemoTeacherAssignment[]>(ASSIGNMENTS_KEY, []);
  return slotId
    ? assignments.filter((item) => item.slotId === slotId)
    : assignments;
}

export function requestDemoTeacherClass(
  slotId: string,
  teacherId: string,
  teacherName: string,
): DemoTeacherAssignment {
  const assignments = getDemoTeacherAssignments();
  const existing = assignments.find(
    (item) => item.slotId === slotId && item.teacherId === teacherId,
  );
  if (existing) return existing;

  const assignment: DemoTeacherAssignment = {
    id: `demo-assignment-${slotId}-${teacherId}`,
    slotId,
    teacherId,
    teacherName,
    status: "pending",
    selectedAt: new Date().toISOString(),
  };
  writeJson(ASSIGNMENTS_KEY, [...assignments, assignment]);
  return assignment;
}

export function reviewDemoTeacherClass(
  assignmentId: string,
  status: Extract<TeacherAssignmentStatus, "confirmed" | "cancelled">,
) {
  const assignments = getDemoTeacherAssignments();
  writeJson(
    ASSIGNMENTS_KEY,
    assignments.map((item) =>
      item.id === assignmentId ? { ...item, status } : item,
    ),
  );
}

export function getDemoTeacherClassSlots(
  teacherId: string,
): TeacherClassSlot[] {
  const assignments = getDemoTeacherAssignments();
  return getDemoClassSlots().map((slot) => {
    const assignment = assignments.find(
      (item) => item.slotId === slot.id && item.teacherId === teacherId,
    );
    return {
      ...slot,
      assignmentStatus: assignment?.status ?? "available",
      assignmentId: assignment?.id,
      teacherId,
      teacherName: assignment?.teacherName,
    };
  });
}

export function getDemoAdminClassSlots() {
  return getDemoClassSlots().map((slot) => ({
    ...slot,
    teacherAssignments: getDemoTeacherAssignments(slot.id),
  }));
}

export function getDemoStudentClasses(
  studentId = getUserId() ?? "demo-student",
) {
  const assignments = getDemoTeacherAssignments().filter(
    (item) => item.status === "confirmed",
  );
  const enrollments = readJson<DemoEnrollments>(ENROLLMENTS_KEY, {});

  return assignments.flatMap((assignment): StudentAvailableClass[] => {
    const slot = getDemoClassSlots().find(
      (item) => item.id === assignment.slotId,
    );
    if (!slot) return [];
    const enrolledStudents = enrollments[assignment.id] ?? [];
    const capacity = slot.capacity;
    const enrolledCount = Math.min(
      capacity,
      slot.enrolledCount + enrolledStudents.length,
    );
    return [
      {
        ...slot,
        assignmentId: assignment.id,
        teacherId: assignment.teacherId,
        teacherName: assignment.teacherName,
        enrolled: enrolledStudents.includes(studentId),
        enrolledCount,
        remainingSeats: Math.max(capacity - enrolledCount, 0),
      },
    ];
  });
}

export function enrollInDemoClass(
  assignmentId: string,
  studentId = getUserId() ?? "demo-student",
) {
  const assignments = getDemoTeacherAssignments();
  const assignment = assignments.find(
    (item) => item.id === assignmentId && item.status === "confirmed",
  );
  if (!assignment) throw new Error("This class is not approved for booking.");

  const slot = getDemoClassSlots().find(
    (item) => item.id === assignment.slotId,
  );
  if (!slot) throw new Error("Demo class not found.");

  const enrollments = readJson<DemoEnrollments>(ENROLLMENTS_KEY, {});
  const existingStudents = enrollments[assignmentId] ?? [];
  if (existingStudents.includes(studentId)) return;
  if (slot.enrolledCount + existingStudents.length >= slot.capacity) {
    throw new Error("This demo class is full.");
  }

  writeJson(ENROLLMENTS_KEY, {
    ...enrollments,
    [assignmentId]: [...existingStudents, studentId],
  });
}

export function getCurrentDemoTeacherIdentity() {
  return {
    teacherId: getUserId() ?? "demo-teacher",
    teacherName: getName() ?? "Demo Teacher",
  };
}
