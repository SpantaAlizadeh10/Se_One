"use client";

/**
 * Cross-tab persistence for teacher availability slots, using
 * localStorage. This is a stand-in for a real backend — it lets you
 * genuinely test the "teacher adds/books a slot in one tab, the other
 * role's tab picks it up" flow on one device/browser, via the
 * `storage` event (which fires in *other* tabs of the same origin,
 * not the tab that made the write).
 *
 * Swap this out once there's a real backend: replace `loadSlots` with
 * a fetch to GET /api/teachers/:id/slots, and call the mutation
 * endpoints instead of `saveSlots` — the rest of the app (the
 * useTeacherSlots hook and both dashboard pages) doesn't need to
 * change shape, just where the data comes from.
 */

import type { AvailabilitySlot } from "./teachers-directory";

export function slotsStorageKey(teacherId: string): string {
  return `se-one-slots-${teacherId}`;
}

export function loadSlots(teacherId: string, seed: AvailabilitySlot[]): AvailabilitySlot[] {
  if (typeof window === "undefined") return seed;
  const raw = window.localStorage.getItem(slotsStorageKey(teacherId));
  if (raw) {
    try {
      return JSON.parse(raw) as AvailabilitySlot[];
    } catch {
      // fall through to reseed on corrupt data
    }
  }
  window.localStorage.setItem(slotsStorageKey(teacherId), JSON.stringify(seed));
  return seed;
}

export function saveSlots(teacherId: string, slots: AvailabilitySlot[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(slotsStorageKey(teacherId), JSON.stringify(slots));
}
