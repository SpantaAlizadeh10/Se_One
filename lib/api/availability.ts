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
  return {
    id: text(record, "id", "Id") || `slot-${index}`,
    day: text(record, "day", "Day", "dayOfWeek", "DayOfWeek"),
    time: text(record, "time", "Time", "timeRange", "TimeRange"),
    booked: Boolean(value(record, "booked", "Booked", "isBooked", "IsBooked")),
  };
}

function unwrapList(response: unknown): AvailabilitySlot[] {
  if (Array.isArray(response)) return response.map(normalizeSlot);
  const record = (response ?? {}) as ApiRecord;
  const items = value(record, "items", "Items", "slots", "Slots", "data", "Data");
  return Array.isArray(items) ? items.map(normalizeSlot) : [];
}

export async function getMyAvailability(): Promise<AvailabilitySlot[]> {
  return unwrapList(await apiFetch<unknown>("/api/teacher/availability"));
}

export async function createAvailabilitySlot(input: Pick<AvailabilitySlot, "day" | "time">): Promise<AvailabilitySlot> {
  return normalizeSlot(await apiFetch<unknown>("/api/teacher/availability", { method: "POST", body: input }), 0);
}

export async function deleteAvailabilitySlot(slotId: string): Promise<void> {
  await apiFetch(`/api/teacher/availability/${encodeURIComponent(slotId)}`, { method: "DELETE" });
}

export async function bookTeacherSlot(teacherId: string, slotId: string): Promise<void> {
  await apiFetch("/api/bookings", { method: "POST", body: { teacherId, slotId } });
}
