import { apiFetch } from "./client";

/**
 * Course Reviews & Ratings API client
 */

export type Review = {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  helpfulCount: number;
  isHelpful: boolean;
};

export type CourseRatingSummary = {
  courseId: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
};

export type CreateReviewInput = {
  courseId: string;
  rating: number;
  title: string;
  content: string;
};

export type UpdateReviewInput = Partial<Pick<Review, "rating" | "title" | "content">>;

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

function normalizeReview(raw: unknown, index: number): Review | null {
  const record = (raw ?? {}) as ApiRecord;
  const id = text(record, "id", "Id", "reviewId", "ReviewId");
  const courseId = text(record, "courseId", "CourseId");
  if (!courseId) return null;

  return {
    id: id || `review-${index}`,
    courseId,
    userId: text(record, "userId", "UserId"),
    userName: text(record, "userName", "UserName", "author", "Author"),
    userAvatar: text(
      record,
      "userAvatar",
      "UserAvatar",
      "authorAvatar",
      "AuthorAvatar",
    ) || undefined,
    rating: numberValue(record, "rating", "Rating"),
    title: text(record, "title", "Title"),
    content: text(record, "content", "Content", "text", "Text"),
    createdAt: text(record, "createdAt", "CreatedAt", "date", "Date"),
    updatedAt: text(record, "updatedAt", "UpdatedAt"),
    helpfulCount: numberValue(record, "helpfulCount", "HelpfulCount"),
    isHelpful: Boolean(value(record, "isHelpful", "IsHelpful")),
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
  const nested = value(record, "items", "Items", "data", "Data", "reviews", "Reviews");
  if (Array.isArray(nested)) {
    return nested.map(normalize).filter((x): x is T => x != null);
  }
  return [];
}

/**
 * GET /api/reviews/course/{courseId}
 * Get reviews for a course
 */
export async function getCourseReviews(courseId: string): Promise<Review[]> {
  const data = await apiFetch<unknown>(`/api/reviews/course/${courseId}`);
  return unwrapList(data, normalizeReview);
}

/**
 * GET /api/reviews/course/{courseId}/summary
 * Get rating summary for a course
 */
export async function getCourseRatingSummary(
  courseId: string,
): Promise<CourseRatingSummary> {
  const data = await apiFetch<unknown>(`/api/reviews/course/${courseId}/summary`);
  const record = (data ?? {}) as ApiRecord;
  const distribution = value(record, "ratingDistribution", "RatingDistribution") as Record<string, number> || {};
  
  return {
    courseId: text(record, "courseId", "CourseId"),
    averageRating: numberValue(record, "averageRating", "AverageRating"),
    totalReviews: numberValue(record, "totalReviews", "TotalReviews"),
    ratingDistribution: {
      5: distribution[5] || 0,
      4: distribution[4] || 0,
      3: distribution[3] || 0,
      2: distribution[2] || 0,
      1: distribution[1] || 0,
    },
  };
}

/**
 * POST /api/reviews
 * Create a new review
 */
export async function createReview(input: CreateReviewInput): Promise<Review> {
  const data = await apiFetch<unknown>("/api/reviews", {
    method: "POST",
    body: input,
  });
  return normalizeReview(data, 0)!;
}

/**
 * GET /api/reviews/user
 * Get current user's reviews
 */
export async function getUserReviews(): Promise<Review[]> {
  const data = await apiFetch<unknown>("/api/reviews/user");
  return unwrapList(data, normalizeReview);
}

/**
 * GET /api/reviews/{reviewId}
 * Get a specific review
 */
export async function getReview(reviewId: string): Promise<Review> {
  const data = await apiFetch<unknown>(`/api/reviews/${reviewId}`);
  return normalizeReview(data, 0)!;
}

/**
 * PATCH /api/reviews/{reviewId}
 * Update a review
 */
export async function updateReview(
  reviewId: string,
  input: UpdateReviewInput,
): Promise<Review> {
  const data = await apiFetch<unknown>(`/api/reviews/${reviewId}`, {
    method: "PATCH",
    body: input,
  });
  return normalizeReview(data, 0)!;
}

/**
 * DELETE /api/reviews/{reviewId}
 * Delete a review
 */
export async function deleteReview(reviewId: string): Promise<void> {
  await apiFetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
}

/**
 * POST /api/reviews/{reviewId}/helpful
 * Mark review as helpful
 */
export async function markReviewHelpful(reviewId: string): Promise<void> {
  await apiFetch(`/api/reviews/${reviewId}/helpful`, { method: "POST" });
}

/**
 * DELETE /api/reviews/{reviewId}/helpful
 * Remove helpful mark
 */
export async function unmarkReviewHelpful(reviewId: string): Promise<void> {
  await apiFetch(`/api/reviews/${reviewId}/helpful`, { method: "DELETE" });
}
