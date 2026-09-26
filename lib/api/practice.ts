import { apiFetch } from "./client";

/**
 * Practice / Exercises API client
 * Handle practice content, questions, attempts, scores, and streak tracking
 */

export type PracticeQuestion = {
  id: string;
  practiceId: string;
  question: string;
  type: "multiple_choice" | "fill_blank" | "matching" | "translation" | "listening";
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  order: number;
  points: number;
};

export type PracticeContent = {
  id: string;
  courseId: string;
  courseTitle: string;
  moduleId?: string;
  moduleTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  title: string;
  description: string;
  language: "english" | "german";
  level: string;
  category: string;
  questions: PracticeQuestion[];
  timeLimit?: number; // in seconds
  passingScore: number;
  createdAt: string;
  updatedAt: string;
};

export type PracticeAttempt = {
  id: string;
  practiceId: string;
  practiceTitle: string;
  userId: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  startedAt: string;
  completedAt: string;
  timeSpent: number; // in seconds
  answers: {
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
    pointsEarned: number;
  }[];
};

export type PracticeHistory = {
  practiceId: string;
  practiceTitle: string;
  totalAttempts: number;
  bestScore: number;
  averageScore: number;
  lastAttemptAt: string;
  bestAttemptId?: string;
};

export type StreakInfo = {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string;
  streakHistory: {
    date: string;
    practicesCompleted: number;
  }[];
};

export type CreatePracticeInput = {
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  title: string;
  description: string;
  language: "english" | "german";
  level: string;
  category: string;
  questions: Omit<PracticeQuestion, "id" | "practiceId">[];
  timeLimit?: number;
  passingScore: number;
};

export type StartAttemptInput = {
  practiceId: string;
};

export type SubmitAttemptInput = {
  answers: {
    questionId: string;
    userAnswer: string;
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

function normalizeQuestion(raw: unknown, index: number): PracticeQuestion | null {
  const record = (raw ?? {}) as ApiRecord;
  const id = text(record, "id", "Id", "questionId", "QuestionId");
  const practiceId = text(record, "practiceId", "PracticeId");
  if (!practiceId) return null;

  return {
    id: id || `question-${index}`,
    practiceId,
    question: text(record, "question", "Question"),
    type: (value(record, "type", "Type") as PracticeQuestion["type"]) || "multiple_choice",
    options: (value(record, "options", "Options") as string[]) || undefined,
    correctAnswer: value(record, "correctAnswer", "CorrectAnswer") as string | string[],
    explanation: text(record, "explanation", "Explanation") || undefined,
    order: numberValue(record, "order", "Order"),
    points: numberValue(record, "points", "Points"),
  };
}

function normalizePractice(raw: unknown, index: number): PracticeContent | null {
  const record = (raw ?? {}) as ApiRecord;
  const id = text(record, "id", "Id", "practiceId", "PracticeId");
  const courseId = text(record, "courseId", "CourseId");
  if (!courseId) return null;

  const questions = (value(record, "questions", "Questions") as unknown[]) || [];
  
  return {
    id: id || `practice-${index}`,
    courseId,
    courseTitle: text(record, "courseTitle", "CourseTitle"),
    moduleId: text(record, "moduleId", "ModuleId") || undefined,
    moduleTitle: text(record, "moduleTitle", "ModuleTitle") || undefined,
    lessonId: text(record, "lessonId", "LessonId") || undefined,
    lessonTitle: text(record, "lessonTitle", "LessonTitle") || undefined,
    title: text(record, "title", "Title"),
    description: text(record, "description", "Description"),
    language: (value(record, "language", "Language") as "english" | "german") || "english",
    level: text(record, "level", "Level"),
    category: text(record, "category", "Category"),
    questions: questions.map((q, i) => normalizeQuestion(q, i)).filter((q): q is PracticeQuestion => q !== null),
    timeLimit: value(record, "timeLimit", "TimeLimit") as number | undefined,
    passingScore: numberValue(record, "passingScore", "PassingScore"),
    createdAt: text(record, "createdAt", "CreatedAt"),
    updatedAt: text(record, "updatedAt", "UpdatedAt"),
  };
}

function normalizeAttempt(raw: unknown, index: number): PracticeAttempt | null {
  const record = (raw ?? {}) as ApiRecord;
  const id = text(record, "id", "Id", "attemptId", "AttemptId");
  const practiceId = text(record, "practiceId", "PracticeId");
  if (!practiceId) return null;

  const answers = (value(record, "answers", "Answers") as unknown[]) || [];
  const normalizedAnswers = answers.map((a: unknown) => {
    const answer = (a ?? {}) as ApiRecord;
    return {
      questionId: text(answer, "questionId", "QuestionId"),
      userAnswer: text(answer, "userAnswer", "UserAnswer"),
      isCorrect: Boolean(value(answer, "isCorrect", "IsCorrect")),
      pointsEarned: numberValue(answer, "pointsEarned", "PointsEarned"),
    };
  });

  return {
    id: id || `attempt-${index}`,
    practiceId,
    practiceTitle: text(record, "practiceTitle", "PracticeTitle"),
    userId: text(record, "userId", "UserId"),
    score: numberValue(record, "score", "Score"),
    maxScore: numberValue(record, "maxScore", "MaxScore"),
    percentage: numberValue(record, "percentage", "Percentage"),
    passed: Boolean(value(record, "passed", "Passed")),
    startedAt: text(record, "startedAt", "StartedAt"),
    completedAt: text(record, "completedAt", "CompletedAt"),
    timeSpent: numberValue(record, "timeSpent", "TimeSpent"),
    answers: normalizedAnswers,
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
 * GET /api/practice
 * Get available practice content
 */
export async function getPracticeContent(filters?: {
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  language?: string;
  level?: string;
  category?: string;
}): Promise<PracticeContent[]> {
  const params = new URLSearchParams();
  if (filters?.courseId) params.set("courseId", filters.courseId);
  if (filters?.moduleId) params.set("moduleId", filters.moduleId);
  if (filters?.lessonId) params.set("lessonId", filters.lessonId);
  if (filters?.language) params.set("language", filters.language);
  if (filters?.level) params.set("level", filters.level);
  if (filters?.category) params.set("category", filters.category);
  
  const query = params.toString();
  const data = await apiFetch<unknown>(`/api/practice${query ? `?${query}` : ""}`);
  return unwrapList(data, normalizePractice);
}

/**
 * GET /api/practice/{practiceId}
 * Get specific practice content
 */
export async function getPractice(practiceId: string): Promise<PracticeContent> {
  const data = await apiFetch<unknown>(`/api/practice/${practiceId}`);
  return normalizePractice(data, 0)!;
}

/**
 * POST /api/practice
 * Create practice content (teacher/admin)
 */
export async function createPractice(input: CreatePracticeInput): Promise<PracticeContent> {
  const data = await apiFetch<unknown>("/api/practice", {
    method: "POST",
    body: input,
  });
  return normalizePractice(data, 0)!;
}

/**
 * PATCH /api/practice/{practiceId}
 * Update practice content
 */
export async function updatePractice(
  practiceId: string,
  input: Partial<CreatePracticeInput>,
): Promise<PracticeContent> {
  const data = await apiFetch<unknown>(`/api/practice/${practiceId}`, {
    method: "PATCH",
    body: input,
  });
  return normalizePractice(data, 0)!;
}

/**
 * DELETE /api/practice/{practiceId}
 * Delete practice content
 */
export async function deletePractice(practiceId: string): Promise<void> {
  await apiFetch(`/api/practice/${practiceId}`, { method: "DELETE" });
}

/**
 * POST /api/practice/attempts
 * Start a practice attempt
 */
export async function startAttempt(input: StartAttemptInput): Promise<{
  attemptId: string;
  practice: PracticeContent;
  startedAt: string;
}> {
  const data = await apiFetch<unknown>("/api/practice/attempts", {
    method: "POST",
    body: input,
  });
  const record = (data ?? {}) as ApiRecord;
  return {
    attemptId: text(record, "attemptId", "AttemptId"),
    practice: normalizePractice(value(record, "practice", "Practice"), 0)!,
    startedAt: text(record, "startedAt", "StartedAt"),
  };
}

/**
 * POST /api/practice/attempts/{attemptId}/submit
 * Submit practice attempt
 */
export async function submitAttempt(
  attemptId: string,
  input: SubmitAttemptInput,
): Promise<PracticeAttempt> {
  const data = await apiFetch<unknown>(`/api/practice/attempts/${attemptId}/submit`, {
    method: "POST",
    body: input,
  });
  return normalizeAttempt(data, 0)!;
}

/**
 * GET /api/practice/attempts
 * Get user's practice attempts
 */
export async function getPracticeAttempts(practiceId?: string): Promise<PracticeAttempt[]> {
  const query = practiceId ? `?practiceId=${practiceId}` : "";
  const data = await apiFetch<unknown>(`/api/practice/attempts${query}`);
  return unwrapList(data, normalizeAttempt);
}

/**
 * GET /api/practice/attempts/{attemptId}
 * Get specific attempt
 */
export async function getAttempt(attemptId: string): Promise<PracticeAttempt> {
  const data = await apiFetch<unknown>(`/api/practice/attempts/${attemptId}`);
  return normalizeAttempt(data, 0)!;
}

/**
 * GET /api/practice/history
 * Get practice history summary
 */
export async function getPracticeHistory(): Promise<PracticeHistory[]> {
  const data = await apiFetch<unknown>("/api/practice/history");
  if (Array.isArray(data)) {
    return data.map((item: unknown) => {
      const record = (item ?? {}) as ApiRecord;
      return {
        practiceId: text(record, "practiceId", "PracticeId"),
        practiceTitle: text(record, "practiceTitle", "PracticeTitle"),
        totalAttempts: numberValue(record, "totalAttempts", "TotalAttempts"),
        bestScore: numberValue(record, "bestScore", "BestScore"),
        averageScore: numberValue(record, "averageScore", "AverageScore"),
        lastAttemptAt: text(record, "lastAttemptAt", "LastAttemptAt"),
        bestAttemptId: text(record, "bestAttemptId", "BestAttemptId") || undefined,
      };
    });
  }
  return [];
}

/**
 * GET /api/practice/streak
 * Get user's streak information
 */
export async function getStreakInfo(): Promise<StreakInfo> {
  const data = await apiFetch<unknown>("/api/practice/streak");
  const record = (data ?? {}) as ApiRecord;
  
  const history = (value(record, "streakHistory", "StreakHistory") as unknown[]) || [];
  const normalizedHistory = history.map((h: unknown) => {
    const item = (h ?? {}) as ApiRecord;
    return {
      date: text(item, "date", "Date"),
      practicesCompleted: numberValue(item, "practicesCompleted", "PracticesCompleted"),
    };
  });

  return {
    currentStreak: numberValue(record, "currentStreak", "CurrentStreak"),
    longestStreak: numberValue(record, "longestStreak", "LongestStreak"),
    lastPracticeDate: text(record, "lastPracticeDate", "LastPracticeDate"),
    streakHistory: normalizedHistory,
  };
}

/**
 * GET /api/practice/leaderboard/{practiceId}
 * Get leaderboard for a practice
 */
export async function getPracticeLeaderboard(practiceId: string): Promise<{
  userId: string;
  userName: string;
  score: number;
  percentage: number;
  completedAt: string;
}[]> {
  const data = await apiFetch<unknown>(`/api/practice/leaderboard/${practiceId}`);
  if (Array.isArray(data)) {
    return data.map((item: unknown) => {
      const record = (item ?? {}) as ApiRecord;
      return {
        userId: text(record, "userId", "UserId"),
        userName: text(record, "userName", "UserName"),
        score: numberValue(record, "score", "Score"),
        percentage: numberValue(record, "percentage", "Percentage"),
        completedAt: text(record, "completedAt", "CompletedAt"),
      };
    });
  }
  return [];
}
