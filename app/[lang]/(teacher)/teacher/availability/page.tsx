"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Check,
  Clock,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { AvailabilitySlot } from "@/lib/teachers-directory";
import { getTeachers } from "@/lib/api/teachers";
import {
  getMyAvailability,
  replaceMyAvailability,
  type AvailabilityInput,
} from "@/lib/api/availability";
import { getName } from "@/lib/auth-client";

const dayOptions = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const initialStartTime = "09:00";
const initialEndTime = "10:00";

function parseTimeRange(
  time: string,
): { startTime: string; endTime: string } | null {
  const match = time.match(
    /(\d{1,2}:\d{2})\s*(AM|PM)?\s*[-–]\s*(\d{1,2}:\d{2})\s*(AM|PM)?/i,
  );
  if (!match) return null;
  const to24Hour = (value: string, suffix?: string) => {
    if (!suffix) return value.padStart(5, "0");
    let [hour, minute] = value.split(":").map(Number);
    const meridiem = suffix.toUpperCase();
    if (meridiem === "AM" && hour === 12) hour = 0;
    else if (meridiem === "PM" && hour !== 12) hour += 12;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  };
  return {
    startTime: to24Hour(match[1], match[2]),
    endTime: to24Hour(match[3], match[4] || match[2]),
  };
}

function minutes(time: string): number {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
}

function toApiSlots(slots: AvailabilitySlot[]): AvailabilityInput[] {
  return slots.map((slot) => {
    const range = parseTimeRange(slot.time);
    if (!range)
      throw new Error("Could not read an existing availability time.");
    return {
      id:
        slot.id.startsWith("draft-") || slot.id.startsWith("availability-")
          ? undefined
          : slot.id,
      day: slot.day,
      ...range,
    };
  });
}

export default function TeacherAvailabilityPage() {
  const { t } = useLanguage();
  const a = t("teacherAvailabilityPage");

  const [teacherId, setTeacherId] = useState("");
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([dayOptions[0]]);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    getMyAvailability()
      .then((availability) => {
        if (!active) return;
        setSlots(availability);
      })
      .catch((loadError) => {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : a.loadFailed);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    getTeachers()
      .then((teachers) => {
        if (!active) return;
        const currentTeacher = teachers.find(
          (teacher) => teacher.name === getName(),
        );
        setTeacherId(currentTeacher?.id ?? "");
      })
      .catch(() => {
        // The availability editor works even when the public directory is temporarily unavailable.
      });
    return () => {
      active = false;
    };
  }, [a.loadFailed]);

  const addSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (minutes(startTime) >= minutes(endTime)) {
      setError(a.invalidTimeRange);
      return;
    }
    if (selectedDays.length === 0) {
      setError(a.selectDay);
      return;
    }
    if (slots.some((slot) => !parseTimeRange(slot.time))) {
      setError(a.legacyTimeError);
      return;
    }
    const conflicts = selectedDays.filter((selectedDay) =>
      slots.some((slot) => {
        if (slot.day !== selectedDay) return false;
        const existing = parseTimeRange(slot.time);
        return (
          existing != null &&
          minutes(startTime) < minutes(existing.endTime) &&
          minutes(endTime) > minutes(existing.startTime)
        );
      }),
    );
    const daysToAdd = selectedDays.filter(
      (selectedDay) => !conflicts.includes(selectedDay),
    );
    if (daysToAdd.length === 0) {
      setError(a.overlappingSlot);
      return;
    }

    const nextSlots = [
      ...slots,
      ...daysToAdd.map((selectedDay) => ({
        id: `draft-${selectedDay}-${startTime}-${endTime}`,
        day: selectedDay,
        time: `${startTime} - ${endTime}`,
        booked: false,
      })),
    ];
    setSaving(true);
    try {
      const saved = await replaceMyAvailability(toApiSlots(nextSlots));
      setSlots(saved);
      setSuccess(a.saved);
      if (conflicts.length > 0) setError(a.overlappingSomeDays);
      setEndTime(
        `${String(Math.min(23, Number(startTime.slice(0, 2)) + 1)).padStart(2, "0")}:${startTime.slice(3)}`,
      );
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : a.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const removeSlot = async (slotId: string) => {
    setError("");
    setSuccess("");
    const nextSlots = slots.filter((slot) => slot.id !== slotId);
    if (nextSlots.some((slot) => !parseTimeRange(slot.time))) {
      setError(a.legacyTimeError);
      return;
    }
    setSaving(true);
    try {
      const saved = await replaceMyAvailability(toApiSlots(nextSlots));
      setSlots(saved);
      setSuccess(a.saved);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : a.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const sortedSlots = [...slots].sort((left, right) => {
    const dayOrder =
      dayOptions.indexOf(left.day) - dayOptions.indexOf(right.day);
    if (dayOrder !== 0) return dayOrder;
    return (
      minutes(parseTimeRange(left.time)?.startTime || "00:00") -
      minutes(parseTimeRange(right.time)?.startTime || "00:00")
    );
  });

  const toggleDay = (selectedDay: string) => {
    setSelectedDays((current) =>
      current.includes(selectedDay)
        ? current.filter((item) => item !== selectedDay)
        : [...current, selectedDay],
    );
    setError("");
    setSuccess("");
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-[22px] sm:text-[25px] font-semibold mb-1">
          {a.heading}
        </h2>
        <p className="text-muted text-[14px] m-0">{a.sub}</p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-xl border border-danger/25 bg-danger/10 px-4 py-3 text-[13px] text-danger"
        >
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div
          role="status"
          className="mb-4 flex items-center gap-2 rounded-xl border border-sage/60 bg-sage/40 px-4 py-3 text-[13px] font-medium text-sageDeep"
        >
          <Check size={16} className="shrink-0" />
          {success}
        </div>
      )}

      <div className="mb-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
        <section className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue/10 text-blue">
              <CalendarDays size={20} />
            </div>
            <div>
              <h3 className="m-0 text-[16px] font-semibold">{a.addSlot}</h3>
              <p className="mb-0 mt-1 text-[12px] text-muted">{a.formHint}</p>
            </div>
          </div>
          <form onSubmit={addSlot} className="space-y-4">
            <div role="group" aria-label={a.day}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[12px] font-semibold text-ink70">
                  {a.day}
                </span>
                <div className="flex gap-3 text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDays(dayOptions);
                      setError("");
                    }}
                    className="text-blue hover:text-blueDeep"
                  >
                    {a.selectAllDays}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDays([]);
                      setError("");
                    }}
                    className="text-muted hover:text-ink"
                  >
                    {a.clearDays}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {dayOptions.map((option) => {
                  const isSelected = selectedDays.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => toggleDay(option)}
                      className={`min-h-11 rounded-xl border px-3 py-2.5 text-[12px] font-semibold transition-colors ${isSelected ? "border-blue bg-blue text-white shadow-sm" : "border-line bg-cream text-ink70 hover:border-blue/40 hover:bg-blue/5"}`}
                    >
                      {isSelected && (
                        <Check
                          size={13}
                          className="me-1 inline-block align-[-2px]"
                        />
                      )}
                      {a.days[option.toLowerCase()]}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-[12px] font-semibold text-ink70">
                {a.startTime}
                <input
                  type="time"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  required
                  className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-3 text-[13px] outline-none focus:border-blue focus:bg-white"
                />
              </label>
              <label className="block text-[12px] font-semibold text-ink70">
                {a.endTime}
                <input
                  type="time"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  required
                  className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-3 text-[13px] outline-none focus:border-blue focus:bg-white"
                />
              </label>
            </div>
            <div className="rounded-xl bg-cream px-3.5 py-3 text-[12px] text-ink70">
              <Clock
                size={14}
                className="me-1.5 inline-block align-[-2px] text-blue"
              />
              {a.slotPreview}:{" "}
              <strong>
                {selectedDays.length > 0
                  ? selectedDays
                      .map((selectedDay) => a.days[selectedDay.toLowerCase()])
                      .join("، ")
                  : a.noDaysSelected}
                {selectedDays.length > 0 && ` · ${startTime} – ${endTime}`}
              </strong>
            </div>
            <button
              type="submit"
              disabled={saving || loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-blueDeep disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {saving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <Plus size={16} />
              )}
              {saving ? a.saving : a.add}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-line bg-gradient-to-br from-[#F3F6FF] to-white p-5 sm:p-6">
          <h3 className="mb-2 mt-0 text-[15px] font-semibold">{a.howTitle}</h3>
          <p className="mb-4 mt-0 text-[12.5px] leading-6 text-muted">
            {a.howDescription}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white bg-white/80 p-3.5">
              <div className="text-[20px] font-bold text-ink">
                {slots.length}
              </div>
              <div className="mt-1 text-[11px] text-muted">{a.totalSlots}</div>
            </div>
            <div className="rounded-xl border border-white bg-white/80 p-3.5">
              <div className="text-[20px] font-bold text-sageDeep">
                {slots.filter((slot) => !slot.booked).length}
              </div>
              <div className="mt-1 text-[11px] text-muted">{a.openSlots}</div>
            </div>
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4">
          <div>
            <h3 className="m-0 text-[15px] font-semibold">{a.weeklyList}</h3>
            <p className="mb-0 mt-1 text-[11.5px] text-muted">
              {a.weeklyListHint}
            </p>
          </div>
          <span className="rounded-full bg-blue/10 px-3 py-1.5 text-[11px] font-bold text-blue">
            {slots.length} {a.slotsLabel}
          </span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-[13px] text-muted">
            {a.loading}
          </div>
        ) : sortedSlots.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-cream text-muted">
              <CalendarDays size={21} />
            </div>
            <p className="m-0 text-[13px] font-semibold">{a.noSlots}</p>
            <p className="mb-0 mt-1 text-[12px] text-muted">{a.emptyHint}</p>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {sortedSlots.map((slot) => (
              <div
                key={slot.id}
                className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:px-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E4ECFF] text-blue">
                  <Clock size={17} />
                </div>
                <div className="min-w-[110px] flex-1">
                  <div className="text-[13px] font-semibold">
                    {a.days[slot.day.toLowerCase()] || slot.day}
                  </div>
                  <div className="mt-0.5 text-[12px] text-muted" dir="ltr">
                    {slot.time}
                  </div>
                </div>
                {slot.booked ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-goldSoft px-3 py-1.5 text-[10.5px] font-bold text-goldDeep">
                      <User size={12} />
                      {a.bookedByStudent}
                    </span>
                  </div>
                ) : (
                  <>
                    <span className="rounded-full bg-sage px-3 py-1.5 text-[10.5px] font-bold text-sageDeep">
                      {a.available}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSlot(slot.id)}
                      disabled={saving}
                      aria-label={`${a.remove} ${a.days[slot.day.toLowerCase()]}, ${slot.time}`}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
