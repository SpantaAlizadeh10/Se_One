import { apiFetch } from "./client";

/**
 * Teacher Dashboard Data API client
 * Handle teacher classes, schedule, student list, progress, earnings, and analytics
 */

export type TeacherClass = {
  id: string;
  courseId: string;
  courseTitle: string;
  teacherId: string;
  subject: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  status: "scheduled" | "ongoing" | "completed" | "cancelled";
  type: "one_on_one" | "group";
  meetingUrl?: string;
  notes?: string;
};

export type TeacherStudent = {
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lastActivity: string;
  upcomingClass?: {
    id: string;
    scheduledDate: string;
    startTime: string;
  };
};

export type TeacherEarnings = {
  teacherId: string;
  period: string;
  totalEarnings: number;
  /** Earnings not already paid or reserved by a pending withdrawal. */
  availableBalance: number;
  currency: string;
  completedClasses: number;
  totalHours: number;
  hourlyRate: number;
  breakdown: {
    date: string;
    earnings: number;
    hours: number;
    classes: number;
  }[];
};

export type TeacherAnalytics = {
  totalStudents: number;
  activeStudents: number;
  totalClasses: number;
  completedClasses: number;
  cancelledClasses: number;
  averageRating: number;
  totalHoursTaught: number;
  currentMonthEarnings: number;
  lastMonthEarnings: number;
  earningsGrowth: number; // percentage
  studentProgressRate: number; // average progress percentage
  classCompletionRate: number; // percentage
  upcomingClasses: number;
  weeklySchedule: {
    day: string;
    classes: number;
    hours: number;
  }[];
  monthlyTrends: {
    month: string;
    earnings: number;
    classes: number;
    students: number;
  }[];
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

function normalizeTeacherClass(
  raw: unknown,
  index: number,
): TeacherClass | null {
  const record = (raw ?? {}) as ApiRecord;
  const id = text(record, "id", "Id", "classId", "ClassId");
  const courseId = text(record, "courseId", "CourseId");
  if (!courseId) return null;

  const statusRaw = text(record, "status", "Status").toLowerCase();
  const status: TeacherClass["status"] =
    statusRaw === "scheduled" ||
    statusRaw === "ongoing" ||
    statusRaw === "completed" ||
    statusRaw === "cancelled"
      ? statusRaw
      : "scheduled";

  const typeRaw = text(record, "type", "Type").toLowerCase();
  const type: TeacherClass["type"] =
    typeRaw === "one_on_one" || typeRaw === "group" ? typeRaw : "one_on_one";

  return {
    id: id || `class-${index}`,
    courseId,
    courseTitle: text(record, "courseTitle", "CourseTitle"),
    teacherId: text(record, "teacherId", "TeacherId"),
    subject: text(record, "subject", "Subject"),
    scheduledDate: text(
      record,
      "scheduledDate",
      "ScheduledDate",
      "date",
      "Date",
    ),
    startTime: text(record, "startTime", "StartTime"),
    endTime: text(record, "endTime", "EndTime"),
    studentId: text(record, "studentId", "StudentId"),
    studentName: text(record, "studentName", "StudentName"),
    studentAvatar: text(record, "studentAvatar", "StudentAvatar") || undefined,
    status,
    type,
    meetingUrl: text(record, "meetingUrl", "MeetingUrl") || undefined,
    notes: text(record, "notes", "Notes") || undefined,
  };
}

function normalizeTeacherStudent(
  raw: unknown,
  index: number,
): TeacherStudent | null {
  const record = (raw ?? {}) as ApiRecord;
  const studentId = text(record, "studentId", "StudentId");
  if (!studentId) return null;

  const upcomingClass = value(record, "upcomingClass", "UpcomingClass") as
    | ApiRecord
    | undefined;

  return {
    studentId,
    studentName: text(record, "studentName", "StudentName"),
    studentAvatar: text(record, "studentAvatar", "StudentAvatar") || undefined,
    studentEmail: text(record, "studentEmail", "StudentEmail"),
    courseId: text(record, "courseId", "CourseId"),
    courseTitle: text(record, "courseTitle", "CourseTitle"),
    enrolledAt: text(record, "enrolledAt", "EnrolledAt"),
    progress: numberValue(record, "progress", "Progress"),
    completedLessons: numberValue(
      record,
      "completedLessons",
      "CompletedLessons",
    ),
    totalLessons: numberValue(record, "totalLessons", "TotalLessons"),
    lastActivity: text(record, "lastActivity", "LastActivity"),
    upcomingClass: upcomingClass
      ? {
          id: text(upcomingClass, "id", "Id"),
          scheduledDate: text(upcomingClass, "scheduledDate", "ScheduledDate"),
          startTime: text(upcomingClass, "startTime", "StartTime"),
        }
      : undefined,
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

/**
 * GET /api/teacher/dashboard/classes
 * Get teacher's classes
 */
export async function getTeacherClasses(filters?: {
  status?: TeacherClass["status"];
  startDate?: string;
  endDate?: string;
}): Promise<TeacherClass[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.startDate) params.set("startDate", filters.startDate);
  if (filters?.endDate) params.set("endDate", filters.endDate);

  const query = params.toString();
  const data = await apiFetch<unknown>(
    `/api/teacher/dashboard/classes${query ? `?${query}` : ""}`,
  );
  return unwrapList(data, normalizeTeacherClass);
}

/**
 * GET /api/teacher/dashboard/schedule
 * Get teacher's schedule
 */
export async function getTeacherSchedule(
  startDate?: string,
  endDate?: string,
): Promise<TeacherClass[]> {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);

  const query = params.toString();
  const data = await apiFetch<unknown>(
    `/api/teacher/dashboard/schedule${query ? `?${query}` : ""}`,
  );
  return unwrapList(data, normalizeTeacherClass);
}

/**
 * GET /api/teacher/dashboard/students
 * Get teacher's students
 */
export async function getTeacherStudents(filters?: {
  courseId?: string;
  activeOnly?: boolean;
}): Promise<TeacherStudent[]> {
  const params = new URLSearchParams();
  if (filters?.courseId) params.set("courseId", filters.courseId);
  if (filters?.activeOnly) params.set("activeOnly", "true");

  const query = params.toString();
  const data = await apiFetch<unknown>(
    `/api/teacher/dashboard/students${query ? `?${query}` : ""}`,
  );
  return unwrapList(data, normalizeTeacherStudent);
}

/**
 * GET /api/teacher/dashboard/earnings
 * Get teacher's earnings
 */
export async function getTeacherEarnings(
  period?: string,
): Promise<TeacherEarnings> {
  const query = period ? `?period=${period}` : "";
  const data = await apiFetch<unknown>(
    `/api/teacher/dashboard/earnings${query}`,
  );
  const record = (data ?? {}) as ApiRecord;

  const breakdown =
    (value(record, "breakdown", "Breakdown") as unknown[]) || [];

  return {
    teacherId: text(record, "teacherId", "TeacherId"),
    period: text(record, "period", "Period"),
    totalEarnings: numberValue(record, "totalEarnings", "TotalEarnings"),
    availableBalance: numberValue(
      record,
      "availableBalance",
      "AvailableBalance",
    ),
    currency: text(record, "currency", "Currency"),
    completedClasses: numberValue(
      record,
      "completedClasses",
      "CompletedClasses",
    ),
    totalHours: numberValue(record, "totalHours", "TotalHours"),
    hourlyRate: numberValue(record, "hourlyRate", "HourlyRate"),
    breakdown: breakdown.map((item: unknown) => {
      const r = (item ?? {}) as ApiRecord;
      return {
        date: text(r, "date", "Date"),
        earnings: numberValue(r, "earnings", "Earnings"),
        hours: numberValue(r, "hours", "Hours"),
        classes: numberValue(r, "classes", "Classes"),
      };
    }),
  };
}

/**
 * POST /api/teacher/dashboard/withdrawals
 * Submit a withdrawal request for the authenticated teacher
 */
export async function requestTeacherWithdrawal(
  amount: number,
  iban: string,
): Promise<void> {
  await apiFetch<void>("/api/teacher/dashboard/withdrawals", {
    method: "POST",
    body: { amount, iban },
  });
}

/**
 * GET /api/teacher/dashboard/analytics
 * Get teacher's analytics
 */
export async function getTeacherAnalytics(): Promise<TeacherAnalytics> {
  const data = await apiFetch<unknown>("/api/teacher/dashboard/analytics");
  const record = (data ?? {}) as ApiRecord;

  const weeklySchedule =
    (value(record, "weeklySchedule", "WeeklySchedule") as unknown[]) || [];
  const monthlyTrends =
    (value(record, "monthlyTrends", "MonthlyTrends") as unknown[]) || [];

  return {
    totalStudents: numberValue(record, "totalStudents", "TotalStudents"),
    activeStudents: numberValue(record, "activeStudents", "ActiveStudents"),
    totalClasses: numberValue(record, "totalClasses", "TotalClasses"),
    completedClasses: numberValue(
      record,
      "completedClasses",
      "CompletedClasses",
    ),
    cancelledClasses: numberValue(
      record,
      "cancelledClasses",
      "CancelledClasses",
    ),
    averageRating: numberValue(record, "averageRating", "AverageRating"),
    totalHoursTaught: numberValue(
      record,
      "totalHoursTaught",
      "TotalHoursTaught",
    ),
    currentMonthEarnings: numberValue(
      record,
      "currentMonthEarnings",
      "CurrentMonthEarnings",
    ),
    lastMonthEarnings: numberValue(
      record,
      "lastMonthEarnings",
      "LastMonthEarnings",
    ),
    earningsGrowth: numberValue(record, "earningsGrowth", "EarningsGrowth"),
    studentProgressRate: numberValue(
      record,
      "studentProgressRate",
      "StudentProgressRate",
    ),
    classCompletionRate: numberValue(
      record,
      "classCompletionRate",
      "ClassCompletionRate",
    ),
    upcomingClasses: numberValue(record, "upcomingClasses", "UpcomingClasses"),
    weeklySchedule: weeklySchedule.map((item: unknown) => {
      const r = (item ?? {}) as ApiRecord;
      return {
        day: text(r, "day", "Day"),
        classes: numberValue(r, "classes", "Classes"),
        hours: numberValue(r, "hours", "Hours"),
      };
    }),
    monthlyTrends: monthlyTrends.map((item: unknown) => {
      const r = (item ?? {}) as ApiRecord;
      return {
        month: text(r, "month", "Month"),
        earnings: numberValue(r, "earnings", "Earnings"),
        classes: numberValue(r, "classes", "Classes"),
        students: numberValue(r, "students", "Students"),
      };
    }),
  };
}

/**
 * GET /api/teacher/dashboard/overview
 * Get complete dashboard overview
 */
export async function getTeacherDashboardOverview(): Promise<{
  classes: TeacherClass[];
  students: TeacherStudent[];
  earnings: TeacherEarnings;
  analytics: TeacherAnalytics;
}> {
  const data = await apiFetch<unknown>("/api/teacher/dashboard/overview");
  const record = (data ?? {}) as ApiRecord;

  const earnings = value(record, "earnings", "Earnings") as
    | ApiRecord
    | undefined;
  const analytics = value(record, "analytics", "Analytics") as
    | ApiRecord
    | undefined;

  return {
    classes: unwrapList(
      value(record, "classes", "Classes"),
      normalizeTeacherClass,
    ),
    students: unwrapList(
      value(record, "students", "Students"),
      normalizeTeacherStudent,
    ),
    earnings: earnings
      ? (() => {
          const breakdown =
            (value(earnings, "breakdown", "Breakdown") as unknown[]) || [];
          return {
            teacherId: text(earnings, "teacherId", "TeacherId"),
            period: text(earnings, "period", "Period"),
            totalEarnings: numberValue(
              earnings,
              "totalEarnings",
              "TotalEarnings",
            ),
            availableBalance: numberValue(
              earnings,
              "availableBalance",
              "AvailableBalance",
            ),
            currency: text(earnings, "currency", "Currency"),
            completedClasses: numberValue(
              earnings,
              "completedClasses",
              "CompletedClasses",
            ),
            totalHours: numberValue(earnings, "totalHours", "TotalHours"),
            hourlyRate: numberValue(earnings, "hourlyRate", "HourlyRate"),
            breakdown: breakdown.map((item: unknown) => {
              const r = (item ?? {}) as ApiRecord;
              return {
                date: text(r, "date", "Date"),
                earnings: numberValue(r, "earnings", "Earnings"),
                hours: numberValue(r, "hours", "Hours"),
                classes: numberValue(r, "classes", "Classes"),
              };
            }),
          };
        })()
      : {
          teacherId: "",
          period: "",
          totalEarnings: 0,
          availableBalance: 0,
          currency: "IRR",
          completedClasses: 0,
          totalHours: 0,
          hourlyRate: 0,
          breakdown: [],
        },
    analytics: analytics
      ? (() => {
          const weeklySchedule =
            (value(
              analytics,
              "weeklySchedule",
              "WeeklySchedule",
            ) as unknown[]) || [];
          const monthlyTrends =
            (value(analytics, "monthlyTrends", "MonthlyTrends") as unknown[]) ||
            [];

          return {
            totalStudents: numberValue(
              analytics,
              "totalStudents",
              "TotalStudents",
            ),
            activeStudents: numberValue(
              analytics,
              "activeStudents",
              "ActiveStudents",
            ),
            totalClasses: numberValue(
              analytics,
              "totalClasses",
              "TotalClasses",
            ),
            completedClasses: numberValue(
              analytics,
              "completedClasses",
              "CompletedClasses",
            ),
            cancelledClasses: numberValue(
              analytics,
              "cancelledClasses",
              "CancelledClasses",
            ),
            averageRating: numberValue(
              analytics,
              "averageRating",
              "AverageRating",
            ),
            totalHoursTaught: numberValue(
              analytics,
              "totalHoursTaught",
              "TotalHoursTaught",
            ),
            currentMonthEarnings: numberValue(
              analytics,
              "currentMonthEarnings",
              "CurrentMonthEarnings",
            ),
            lastMonthEarnings: numberValue(
              analytics,
              "lastMonthEarnings",
              "LastMonthEarnings",
            ),
            earningsGrowth: numberValue(
              analytics,
              "earningsGrowth",
              "EarningsGrowth",
            ),
            studentProgressRate: numberValue(
              analytics,
              "studentProgressRate",
              "StudentProgressRate",
            ),
            classCompletionRate: numberValue(
              analytics,
              "classCompletionRate",
              "ClassCompletionRate",
            ),
            upcomingClasses: numberValue(
              analytics,
              "upcomingClasses",
              "UpcomingClasses",
            ),
            weeklySchedule: weeklySchedule.map((item: unknown) => {
              const r = (item ?? {}) as ApiRecord;
              return {
                day: text(r, "day", "Day"),
                classes: numberValue(r, "classes", "Classes"),
                hours: numberValue(r, "hours", "Hours"),
              };
            }),
            monthlyTrends: monthlyTrends.map((item: unknown) => {
              const r = (item ?? {}) as ApiRecord;
              return {
                month: text(r, "month", "Month"),
                earnings: numberValue(r, "earnings", "Earnings"),
                classes: numberValue(r, "classes", "Classes"),
                students: numberValue(r, "students", "Students"),
              };
            }),
          };
        })()
      : {
          totalStudents: 0,
          activeStudents: 0,
          totalClasses: 0,
          completedClasses: 0,
          cancelledClasses: 0,
          averageRating: 0,
          totalHoursTaught: 0,
          currentMonthEarnings: 0,
          lastMonthEarnings: 0,
          earningsGrowth: 0,
          studentProgressRate: 0,
          classCompletionRate: 0,
          upcomingClasses: 0,
          weeklySchedule: [],
          monthlyTrends: [],
        },
  };
}
