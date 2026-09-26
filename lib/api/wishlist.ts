import { apiFetch } from "./client";

/**
 * Wishlist API client
 * Manage course wishlists for students
 */

export type WishlistItem = {
  id: string;
  courseId: string;
  courseTitle: string;
  courseImage?: string;
  coursePrice: string;
  addedAt: string;
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

function normalizeWishlistItem(raw: unknown, index: number): WishlistItem | null {
  const record = (raw ?? {}) as ApiRecord;
  const id = text(record, "id", "Id", "wishlistItemId", "WishlistItemId");
  const courseId = text(record, "courseId", "CourseId");
  if (!courseId) return null;

  return {
    id: id || `wishlist-${index}`,
    courseId,
    courseTitle: text(record, "courseTitle", "CourseTitle", "title", "Title"),
    courseImage: text(
      record,
      "courseImage",
      "CourseImage",
      "imageUrl",
      "ImageUrl",
    ) || undefined,
    coursePrice: text(record, "coursePrice", "CoursePrice", "price", "Price"),
    addedAt: text(record, "addedAt", "AddedAt", "createdAt", "CreatedAt"),
  };
}

/**
 * GET /api/wishlist
 * Get user's wishlist
 */
export async function getWishlist(): Promise<WishlistItem[]> {
  const data = await apiFetch<unknown>("/api/wishlist");
  if (Array.isArray(data)) {
    return data
      .map((item, index) => normalizeWishlistItem(item, index))
      .filter((item): item is WishlistItem => item !== null);
  }
  return [];
}

/**
 * POST /api/wishlist
 * Add course to wishlist
 */
export async function addToWishlist(courseId: string): Promise<WishlistItem> {
  const data = await apiFetch<unknown>("/api/wishlist", {
    method: "POST",
    body: { courseId },
  });
  return normalizeWishlistItem(data, 0)!;
}

/**
 * DELETE /api/wishlist/{courseId}
 * Remove course from wishlist
 */
export async function removeFromWishlist(courseId: string): Promise<void> {
  await apiFetch(`/api/wishlist/${courseId}`, { method: "DELETE" });
}

/**
 * GET /api/wishlist/check/{courseId}
 * Check if course is in wishlist
 */
export async function isInWishlist(courseId: string): Promise<boolean> {
  const data = await apiFetch<{ exists: boolean }>(
    `/api/wishlist/check/${courseId}`,
  );
  return data.exists ?? false;
}
