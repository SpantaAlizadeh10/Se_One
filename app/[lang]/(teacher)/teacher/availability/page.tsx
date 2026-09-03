"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Plus, Trash2, User, Video } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { teacherDirectory, CURRENT_TEACHER_ID } from "@/lib/teachers-directory";
import { useTeacherSlots } from "@/lib/use-teacher-slots";
import { getRoomId } from "@/lib/video-call";

const dayOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function TeacherAvailabilityPage() {
  const { t, href } = useLanguage();
  const a = t("teacherAvailabilityPage");

  const me = teacherDirectory.find((tp) => tp.id === CURRENT_TEACHER_ID) ?? teacherDirectory[0];
  const [slots, updateSlots] = useTeacherSlots(me.id, me.slots);
  const [day, setDay] = useState(dayOptions[0]);
  const [time, setTime] = useState("");

  const addSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!time.trim()) return;
    updateSlots((prev) => [...prev, { id: `slot-${Date.now()}`, day, time: time.trim(), booked: false }]);
    setTime("");
  };

  const removeSlot = (id: string) => {
    updateSlots((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-[22px] sm:text-[25px] font-semibold mb-1">{a.heading}</h2>
        <p className="text-muted text-[14px] m-0">{a.sub}</p>
      </div>

      <div className="bg-white border border-line rounded-lg shadow-card p-4 sm:p-5 mb-6">
        <h3 className="text-[13.5px] font-bold mb-4">{a.addSlot}</h3>
        <form onSubmit={addSlot} className="flex flex-col sm:flex-row gap-3">
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="border border-line rounded-xl px-3.5 py-2.5 text-[13.5px] bg-cream outline-none focus:border-gold sm:w-[160px]"
          >
            {dayOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder={a.timePlaceholder}
            className="flex-1 border border-line rounded-xl px-3.5 py-2.5 text-[13.5px] bg-cream outline-none focus:border-gold"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 bg-ink text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-blueDeep transition-colors shrink-0"
          >
            <Plus size={15} /> {a.add}
          </button>
        </form>
      </div>

      <div className="bg-white border border-line rounded-lg shadow-card divide-y divide-line">
        {slots.length === 0 && <div className="p-6 text-center text-[13.5px] text-muted">{a.noSlots}</div>}
        {slots.map((slot) => (
          <div key={slot.id} className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 rounded-full bg-[#E4ECFF] text-blue flex items-center justify-center shrink-0">
              <Clock size={17} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-semibold">{slot.day}</div>
              <div className="text-[12px] text-muted">{slot.time}</div>
            </div>
            {slot.booked ? (
              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-goldDeep bg-goldSoft px-3 py-1.5 rounded-full">
                  <User size={11} /> {a.bookedByStudent}
                </span>
                <Link
                  href={href(`/teacher/call/${getRoomId(me.id, slot.id)}`)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-blue hover:bg-blueDeep px-3 py-1.5 rounded-full transition-colors"
                >
                  <Video size={12} />
                  {a.joinCall}
                </Link>
              </div>
            ) : (
              <>
                <span className="text-[11px] font-bold text-sageDeep bg-sage px-3 py-1.5 rounded-full shrink-0">{a.available}</span>
                <button
                  onClick={() => removeSlot(slot.id)}
                  aria-label={a.remove}
                  className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-danger hover:bg-danger/10 transition-colors shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
