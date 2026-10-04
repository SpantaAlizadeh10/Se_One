import { apiFetch } from "./client";
import type { AvailabilitySlot } from "@/lib/teachers-directory";

type ApiRecord = Record<string, unknown>;

function value(record: ApiRecord, ...keys: string[]) {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key];
  }
  return undefined;
}

function text(record: ApiRecord, ...keys: string[]): string {
  const result = value(record, ...keys);
  return result == null ? "" : String(result);
}

function normalizeSlot(raw: unknown, index: number): AvailabilitySlot {
  const record = (raw ?? {}) as ApiRecord;
  const startTime = text(record, "startTime", "StartTime");
  const endTime = text(record, "endTime", "EndTime");
  const explicitTime = text(record, "time", "Time", "timeRange", "TimeRange");
  return {
    id: text(record, "id", "Id") || `slot-${index}`,
    day: text(record, "day", "Day", "dayOfWeek", "DayOfWeek"),
    time:
      explicitTime ||
      (startTime && endTime ? `${startTime} - ${endTime}` : startTime),
    booked: Boolean(value(record, "booked", "Booked", "isBooked", "IsBooked")),
  };
}

function unwrapList(response: unknown): AvailabilitySlot[] {
  if (Array.isArray(response)) return response.map(normalizeSlot);
  const record = (response ?? {}) as ApiRecord;
  const items = value(
    record,
    "items",
    "Items",
    "slots",
    "Slots",
    "data",
    "Data",
  );
  return Array.isArray(items) ? items.map(normalizeSlot) : [];
}

export async function getMyAvailability(): Promise<AvailabilitySlot[]> {
  return unwrapList(await apiFetch<unknown>("/api/teacher/availability"));
}

export type AvailabilityInput = {
  id?: string;
  day: string;
  startTime: string;
  endTime: string;
};

/**
 * PUT /api/teacher/availability
 * Replace the teacher's recurring availability using the documented API contract.
 */
export async function replaceMyAvailability(
  slots: AvailabilityInput[],
): Promise<AvailabilitySlot[]> {
  const response = await apiFetch<unknown>("/api/teacher/availability", {
    method: "PUT",
    body: {
      slots: slots.map((slot) => ({
        ...(slot.id ? { id: slot.id } : {}),
        dayOfWeek: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
    },
  });

  // Some APIs return the saved list; accept 204/no-content by using the submitted slots.
  const normalized = unwrapList(response);
  return normalized.length > 0 || slots.length === 0
    ? normalized
    : slots.map((slot, index) => ({
        id: `availability-${index}-${slot.day}-${slot.startTime}`,
        day: slot.day,
        time: `${slot.startTime} - ${slot.endTime}`,
        booked: false,
      }));
}

export async function bookTeacherSlot(
  teacherId: string,
  slotId: string,
): Promise<void> {
  await apiFetch("/api/bookings", {
    method: "POST",
    body: { teacherId, slotId },
  });
}
