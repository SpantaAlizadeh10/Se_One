import { apiFetch } from "./client";

/**
 * Student Dashboard Data API client
 * Handle upcoming classes, calendar events, recent activity, and study statistics
 */

export type UpcomingClass = {
  id: string;
  courseId: string;
  courseTitle: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar?: string;
  subject: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  location?: string;
  meetingUrl?: string;
  status: "scheduled" | "ongoing" | "completed" | "cancelled";
  type: "one_on_one" | "group" | "practice";
};

export type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  type: "class" | "assignment_due" | "exam" | "practice" | "other";
  courseId?: string;
  courseTitle?: string;
  color?: string;
};

export type RecentActivity = {
  id: string;
  type: "lesson_completed" | "course_enrolled" | "assignment_submitted" | "practice_completed" | "booking_created";
  title: string;
  description: string;
  courseId?: string;
  courseTitle?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
};

export type StudyStatistics = {
  totalStudyTime: number; // in minutes
  todayStudyTime: number;
  weekStudyTime: number;
  monthStudyTime: number;
  dailyGoal: number;
  dailyGoalProgress: number; // percentage
  currentStreak: number;
  longestStreak: number;
  lessonsCompleted: number;
  coursesInProgress: number;
  coursesCompleted: number;
  averageScore: number;
  weeklyActivity: {
    date: string;
    minutes: number;
  }[];
  activityByType: {
    lessons: number;
    practice: number;
    assignments: number;
    classes: number;
  };
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

function normalizeUpcomingClass(raw: unknown, index: number): UpcomingClass | null {
  const record = (raw ?? {}) as ApiRecord;
  const id = text(record, "id", "Id", "classId", "ClassId");
  const courseId = text(record, "courseId", "CourseId");
  if (!courseId) return null;

  const statusRaw = text(record, "status", "Status").toLowerCase();
  const status: UpcomingClass["status"] =
    statusRaw === "scheduled" || statusRaw === "ongoing" || statusRaw === "completed" || statusRaw === "cancelled"
      ? statusRaw
      : "scheduled";

  const typeRaw = text(record, "type", "Type").toLowerCase();
  const type: UpcomingClass["type"] =
    typeRaw === "one_on_one" || typeRaw === "group" || typeRaw === "practice"
      ? typeRaw
      : "one_on_one";

  return {
    id: id || `class-${index}`,
    courseId,
    courseTitle: text(record, "courseTitle", "CourseTitle"),
    teacherId: text(record, "teacherId", "TeacherId"),
    teacherName: text(record, "teacherName", "TeacherName"),
    teacherAvatar: text(record, "teacherAvatar", "TeacherAvatar") || undefined,
    subject: text(record, "subject", "Subject"),
    scheduledDate: text(record, "scheduledDate", "ScheduledDate", "date", "Date"),
    startTime: text(record, "startTime", "StartTime"),
    endTime: text(record, "endTime", "EndTime"),
    location: text(record, "location", "Location") || undefined,
    meetingUrl: text(record, "meetingUrl", "MeetingUrl") || undefined,
    status,
    type,
  };
}

function normalizeCalendarEvent(raw: unknown, index: number): CalendarEvent | null {
  const record = (raw ?? {}) as ApiRecord;
  const id = text(record, "id", "Id", "eventId", "EventId");
  const title = text(record, "title", "Title");
  if (!title) return null;

  const typeRaw = text(record, "type", "Type").toLowerCase();
  const type: CalendarEvent["type"] =
    typeRaw === "class" || typeRaw === "assignment_due" || typeRaw === "exam" ||
      typeRaw === "practice" || typeRaw === "other"
      ? typeRaw
      : "other";

  return {
    id: id || `event-${index}`,
    title,
    description: text(record, "description", "Description") || undefined,
    start: text(record, "start", "Start", "startDate", "StartDate"),
    end: text(record, "end", "End", "endDate", "EndDate"),
    type,
    courseId: text(record, "courseId", "CourseId") || undefined,
    courseTitle: text(record, "courseTitle", "CourseTitle") || undefined,
    color: text(record, "color", "Color") || undefined,
  };
}

function normalizeRecentActivity(raw: unknown, index: number): RecentActivity | null {
  const record = (raw ?? {}) as ApiRecord;
  const id = text(record, "id", "Id", "activityId", "ActivityId");
  const title = text(record, "title", "Title");
  if (!title) return null;

  const typeRaw = text(record, "type", "Type").toLowerCase();
  const type: RecentActivity["type"] =
    typeRaw === "lesson_completed" ? "lesson_completed" :
      typeRaw === "course_enrolled" ? "course_enrolled" :
        typeRaw === "assignment_submitted" ? "assignment_submitted" :
          typeRaw === "practice_completed" ? "practice_completed" :
            typeRaw === "booking_created" ? "booking_created" :
              "lesson_completed"; // fallback to a valid type

  return {
    id: id || `activity-${index}`,
    type,
    title,
    description: text(record, "description", "Description"),
    courseId: text(record, "courseId", "CourseId") || undefined,
    courseTitle: text(record, "courseTitle", "CourseTitle") || undefined,
    timestamp: text(record, "timestamp", "Timestamp", "createdAt", "CreatedAt"),
    metadata: (value(record, "metadata", "Metadata") as Record<string, unknown>) || undefined,
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
 * GET /api/student/dashboard/upcoming-classes
 * Get upcoming classes for student
 */
export async function getUpcomingClasses(limit?: number): Promise<UpcomingClass[]> {
  const query = limit ? `?limit=${limit}` : "";
  const data = await apiFetch<unknown>(`/api/student/dashboard/upcoming-classes${query}`);
  return unwrapList(data, normalizeUpcomingClass);
}

/**
 * GET /api/student/dashboard/calendar
 * Get calendar events for a date range
 */
export async function getCalendarEvents(params?: {
  startDate?: string;
  endDate?: string;
  type?: CalendarEvent["type"];
}): Promise<CalendarEvent[]> {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.set("startDate", params.startDate);
  if (params?.endDate) queryParams.set("endDate", params.endDate);
  if (params?.type) queryParams.set("type", params.type);

  const query = queryParams.toString();
  const data = await apiFetch<unknown>(`/api/student/dashboard/calendar${query ? `?${query}` : ""}`);
  return unwrapList(data, normalizeCalendarEvent);
}

/**
 * GET /api/student/dashboard/recent-activity
 * Get recent activity
 */
export async function getRecentActivity(limit?: number): Promise<RecentActivity[]> {
  const query = limit ? `?limit=${limit}` : "";
  const data = await apiFetch<unknown>(`/api/student/dashboard/recent-activity${query}`);
  return unwrapList(data, normalizeRecentActivity);
}

/**
 * GET /api/student/dashboard/statistics
 * Get study statistics
 */
export async function getStudyStatistics(): Promise<StudyStatistics> {
  const data = await apiFetch<unknown>("/api/student/dashboard/statistics");
  const record = (data ?? {}) as ApiRecord;

  const weeklyActivity = (value(record, "weeklyActivity", "WeeklyActivity") as unknown[]) || [];
  const activityByType = (value(record, "activityByType", "ActivityByType") as ApiRecord) || {};

  return {
    totalStudyTime: numberValue(record, "totalStudyTime", "TotalStudyTime"),
    todayStudyTime: numberValue(record, "todayStudyTime", "TodayStudyTime"),
    weekStudyTime: numberValue(record, "weekStudyTime", "WeekStudyTime"),
    monthStudyTime: numberValue(record, "monthStudyTime", "MonthStudyTime"),
    dailyGoal: numberValue(record, "dailyGoal", "DailyGoal"),
    dailyGoalProgress: numberValue(record, "dailyGoalProgress", "DailyGoalProgress"),
    currentStreak: numberValue(record, "currentStreak", "CurrentStreak"),
    longestStreak: numberValue(record, "longestStreak", "LongestStreak"),
    lessonsCompleted: numberValue(record, "lessonsCompleted", "LessonsCompleted"),
    coursesInProgress: numberValue(record, "coursesInProgress", "CoursesInProgress"),
    coursesCompleted: numberValue(record, "coursesCompleted", "CoursesCompleted"),
    averageScore: numberValue(record, "averageScore", "AverageScore"),
    weeklyActivity: weeklyActivity.map((item: unknown) => {
      const r = (item ?? {}) as ApiRecord;
      return {
        date: text(r, "date", "Date"),
        minutes: numberValue(r, "minutes", "Minutes"),
      };
    }),
    activityByType: {
      lessons: numberValue(activityByType, "lessons", "Lessons"),
      practice: numberValue(activityByType, "practice", "Practice"),
      assignments: numberValue(activityByType, "assignments", "Assignments"),
      classes: numberValue(activityByType, "classes", "Classes"),
    },
  };
}

/**
 * GET /api/student/dashboard/overview
 * Get complete dashboard overview
 */
export async function getDashboardOverview(): Promise<{
  upcomingClasses: UpcomingClass[];
  recentActivity: RecentActivity[];
  statistics: StudyStatistics;
}> {
  const data = await apiFetch<unknown>("/api/student/dashboard/overview");
  const record = (data ?? {}) as ApiRecord;

  return {
    upcomingClasses: unwrapList(value(record, "upcomingClasses", "UpcomingClasses"), normalizeUpcomingClass),
    recentActivity: unwrapList(value(record, "recentActivity", "RecentActivity"), normalizeRecentActivity),
    statistics: (() => {
      const stats = value(record, "statistics", "Statistics") as ApiRecord | undefined;
      if (!stats) {
        // Return empty stats if not provided
        return {
          totalStudyTime: 0,
          todayStudyTime: 0,
          weekStudyTime: 0,
          monthStudyTime: 0,
          dailyGoal: 0,
          dailyGoalProgress: 0,
          currentStreak: 0,
          longestStreak: 0,
          lessonsCompleted: 0,
          coursesInProgress: 0,
          coursesCompleted: 0,
          averageScore: 0,
          weeklyActivity: [],
          activityByType: { lessons: 0, practice: 0, assignments: 0, classes: 0 },
        };
      }

      const weeklyActivity = (value(stats, "weeklyActivity", "WeeklyActivity") as unknown[]) || [];
      const activityByType = (value(stats, "activityByType", "ActivityByType") as ApiRecord) || {};

      return {
        totalStudyTime: numberValue(stats, "totalStudyTime", "TotalStudyTime"),
        todayStudyTime: numberValue(stats, "todayStudyTime", "TodayStudyTime"),
        weekStudyTime: numberValue(stats, "weekStudyTime", "WeekStudyTime"),
        monthStudyTime: numberValue(stats, "monthStudyTime", "MonthStudyTime"),
        dailyGoal: numberValue(stats, "dailyGoal", "DailyGoal"),
        dailyGoalProgress: numberValue(stats, "dailyGoalProgress", "DailyGoalProgress"),
        currentStreak: numberValue(stats, "currentStreak", "CurrentStreak"),
        longestStreak: numberValue(stats, "longestStreak", "LongestStreak"),
        lessonsCompleted: numberValue(stats, "lessonsCompleted", "LessonsCompleted"),
        coursesInProgress: numberValue(stats, "coursesInProgress", "CoursesInProgress"),
        coursesCompleted: numberValue(stats, "coursesCompleted", "CoursesCompleted"),
        averageScore: numberValue(stats, "averageScore", "AverageScore"),
        weeklyActivity: weeklyActivity.map((item: unknown) => {
          const r = (item ?? {}) as ApiRecord;
          return {
            date: text(r, "date", "Date"),
            minutes: numberValue(r, "minutes", "Minutes"),
          };
        }),
        activityByType: {
          lessons: numberValue(activityByType, "lessons", "Lessons"),
          practice: numberValue(activityByType, "practice", "Practice"),
          assignments: numberValue(activityByType, "assignments", "Assignments"),
          classes: numberValue(activityByType, "classes", "Classes"),
        },
      };
    })(),
  };
}
