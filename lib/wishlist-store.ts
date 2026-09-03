"use client";

/**
 * A student's saved/wishlisted courses, persisted to localStorage.
 * Same "swap for a real backend later" pattern as the rest of the
 * mock data layer: replace with GET/POST/DELETE /api/wishlist once
 * there's a real account to attach it to.
 */

const KEY = "se-one-wishlist";

export function getWishlist(): string[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function saveWishlist(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(ids));
}

export function isWishlisted(courseId: string): boolean {
  return getWishlist().includes(courseId);
}

export function toggleWishlist(courseId: string): string[] {
  const current = getWishlist();
  const next = current.includes(courseId) ? current.filter((id) => id !== courseId) : [...current, courseId];
  saveWishlist(next);
  return next;
}
