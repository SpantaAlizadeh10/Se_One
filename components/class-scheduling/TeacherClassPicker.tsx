"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Clock3, Sparkles, Users } from "lucide-react";

const initialSlots = [
  {
    id: "slot-1",
    title: "Conversation Practice",
    description: "Small-group speaking class for daily communication.",
    teacherName: "Nora Johnson",
    startsAt: "2026-10-14T10:00:00",
    endsAt: "2026-10-14T11:00:00",
    capacity: 10,
    remainingSeats: 4,
    teacherRole: "English",
  },
  {
    id: "slot-2",
    title: "IELTS Speaking Lab",
    description: "Focused speaking workshop with guided feedback.",
    teacherName: "Nora Johnson",
    startsAt: "2026-10-15T18:30:00",
    endsAt: "2026-10-15T19:30:00",
    capacity: 10,
    remainingSeats: 1,
    teacherRole: "English",
  },
  {
    id: "slot-3",
    title: "Public Grammar Clinic",
    description: "Review grammar patterns in a live group session.",
    teacherName: "Alex Martin",
    startsAt: "2026-10-16T09:00:00",
    endsAt: "2026-10-16T10:00:00",
    capacity: 10,
    remainingSeats: 10,
    teacherRole: "English",
  },
];

const dateLabel = (value: string) =>
  new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(value));

const timeLabel = (value: string) =>
  new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export default function TeacherClassPicker() {
  const [selected, setSelected] = useState<string>(initialSlots[0]?.id ?? "");
  const [slots] = useState(initialSlots);

  const selectedSlot = useMemo(
    () => slots.find((slot) => slot.id === selected) ?? slots[0],
    [selected, slots],
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="mb-1 font-serif text-[23px] font-semibold">
          Available public class slots
        </h2>
        <p className="m-0 text-[13px] text-muted">
          Admin creates the available slots. You can only choose a time that
          does not overlap with your current schedule.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          {slots.map((slot) => {
            const isSelected = slot.id === selectedSlot?.id;
            const isAvailable = slot.remainingSeats > 0;

            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => setSelected(slot.id)}
                className={`w-full rounded-2xl border p-4 text-left shadow-card transition ${
                  isSelected
                    ? "border-blue bg-blue/5"
                    : "border-line bg-white hover:border-blue/40"
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-cream px-2.5 py-1 text-[11px] font-medium text-muted">
                      <Sparkles size={12} />
                      {slot.teacherRole}
                    </div>
                    <h3 className="font-semibold text-ink">{slot.title}</h3>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      isAvailable
                        ? "bg-success/10 text-success"
                        : "bg-danger/10 text-danger"
                    }`}
                  >
                    {isAvailable ? `${slot.remainingSeats} seats left` : "Full"}
                  </span>
                </div>

                <p className="mb-3 text-[12.5px] text-muted">
                  {slot.description}
                </p>

                <div className="grid gap-2 text-[12.5px] text-muted sm:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={14} />
                    <span>{dateLabel(slot.startsAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock3 size={14} />
                    <span>
                      {timeLabel(slot.startsAt)} - {timeLabel(slot.endsAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    <span>{slot.capacity} capacity</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-serif text-[22px] font-semibold">
              Selected class
            </h3>
            <span className="rounded-full bg-blue/10 px-2 py-1 text-[11px] font-medium text-blue">
              {selectedSlot?.remainingSeats ?? 0} left
            </span>
          </div>

          {selectedSlot && (
            <div className="space-y-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  Teacher
                </div>
                <div className="mt-1 text-[15px] font-semibold text-ink">
                  {selectedSlot.teacherName}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  Class
                </div>
                <div className="mt-1 text-[15px] font-semibold text-ink">
                  {selectedSlot.title}
                </div>
              </div>

              <div className="rounded-xl bg-cream p-3 text-[12.5px] text-muted">
                {dateLabel(selectedSlot.startsAt)} ·{" "}
                {timeLabel(selectedSlot.startsAt)} -{" "}
                {timeLabel(selectedSlot.endsAt)}
              </div>

              <button
                type="button"
                disabled={selectedSlot.remainingSeats <= 0}
                className="w-full rounded-xl bg-blue px-4 py-3 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {selectedSlot.remainingSeats > 0
                  ? "Choose this class"
                  : "Class is full"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
