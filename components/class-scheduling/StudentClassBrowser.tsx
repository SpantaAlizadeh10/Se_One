"use client";

import { useState } from "react";
import {
  BookOpen,
  CalendarDays,
  Clock3,
  Users,
  CheckCircle2,
} from "lucide-react";

const initialClasses = [
  {
    id: "class-1",
    teacherName: "Nora Johnson",
    title: "Conversation Practice",
    description: "Practical speaking class with a small group.",
    startsAt: "2026-10-14T10:00:00",
    endsAt: "2026-10-14T11:00:00",
    capacity: 10,
    remainingSeats: 4,
  },
  {
    id: "class-2",
    teacherName: "Nora Johnson",
    title: "IELTS Speaking Lab",
    description: "Boost speaking fluency and confidence for interviews.",
    startsAt: "2026-10-15T18:30:00",
    endsAt: "2026-10-15T19:30:00",
    capacity: 10,
    remainingSeats: 1,
  },
  {
    id: "class-3",
    teacherName: "Alex Martin",
    title: "Public Grammar Clinic",
    description: "Quick grammar review and structured feedback.",
    startsAt: "2026-10-16T09:00:00",
    endsAt: "2026-10-16T10:00:00",
    capacity: 10,
    remainingSeats: 0,
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

export default function StudentClassBrowser() {
  const [classes] = useState(initialClasses);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="mb-1 font-serif text-[23px] font-semibold">
          Classes from your teacher
        </h2>
        <p className="m-0 text-[13px] text-muted">
          See each public class, capacity, available seats, and schedule before
          enrolling.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {classes.map((item) => {
          const available = item.remainingSeats > 0;
          return (
            <div
              key={item.id}
              className="rounded-2xl border border-line bg-white p-4 shadow-card"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted">
                    {item.teacherName}
                  </div>
                  <h3 className="font-semibold text-ink">{item.title}</h3>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                    available
                      ? "bg-success/10 text-success"
                      : "bg-danger/10 text-danger"
                  }`}
                >
                  {available ? `${item.remainingSeats} seats left` : "Full"}
                </span>
              </div>

              <p className="mb-3 text-[12.5px] text-muted">
                {item.description}
              </p>

              <div className="space-y-2 text-[12.5px] text-muted">
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} />
                  <span>{dateLabel(item.startsAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock3 size={14} />
                  <span>
                    {timeLabel(item.startsAt)} - {timeLabel(item.endsAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} />
                  <span>
                    {item.remainingSeats}/{item.capacity} seats available
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={!available}
                className="mt-4 w-full rounded-xl bg-blue px-3.5 py-2.5 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {available ? "Enroll now" : "No seats left"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-line bg-cream p-4">
        <div className="flex items-center gap-2 text-[12.5px] font-medium text-success">
          <CheckCircle2 size={16} />
          Students can see date, time, remaining seats, and teacher before
          booking.
        </div>
      </div>
    </div>
  );
}
