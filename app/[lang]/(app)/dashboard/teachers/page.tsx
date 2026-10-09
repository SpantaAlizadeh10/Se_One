"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Star, Clock, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useTeachers } from "@/lib/use-teachers";
import { bookTeacherSlot } from "@/lib/api/availability";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function FindTeacherPage() {
  const { t, href } = useLanguage();
  const p = t("findTeacherPage");
  const { teachers, refresh } = useTeachers();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (teachers.length > 0)
      setExpandedId((current) => current ?? teachers[0].id);
  }, [teachers]);

  const bookedSlots = teachers.flatMap((teacher) =>
    teacher.slots.filter((s) => s.booked).map((s) => ({ teacher, slot: s })),
  );

  const bookSlot = async (teacherId: string, slotId: string) => {
    try {
      await bookTeacherSlot(teacherId, slotId);
      refresh();
      setToast(p.bookedSuccess);
      setTimeout(() => setToast(null), 2500);
    } catch {
      setToast("Could not book this slot. Please try again.");
      setTimeout(() => setToast(null), 2500);
    }
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div className="flex items-center gap-2.5 bg-sage text-sageDeep text-[13px] font-semibold rounded-xl px-4 py-3 mb-5">
          <Check size={16} className="shrink-0" />
          {toast}
        </div>
      )}

      {bookedSlots.length > 0 && (
        <div className="bg-white border border-line rounded-lg shadow-card p-4 mb-6">
          <h3 className="text-[13.5px] font-bold mb-3">{p.myBookings}</h3>
          <div className="flex flex-col gap-2">
            {bookedSlots.map(({ teacher, slot }) => (
              <div
                key={slot.id}
                className="flex items-center gap-3 bg-cream rounded-xl p-2.5 flex-wrap"
              >
                <Image
                  src={teacher.avatar}
                  alt={teacher.name}
                  width={32}
                  height={32}
                  className="rounded-full object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-semibold truncate">
                    {teacher.name}
                  </div>
                  <div className="text-[11px] text-muted">
                    {slot.day} · {slot.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {teachers.map((teacher) => {
          const isExpanded = expandedId === teacher.id;
          return (
            <div
              key={teacher.id}
              className="bg-white border border-line rounded-lg shadow-card overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : teacher.id)}
                className="w-full flex items-center gap-4 p-4 text-start"
              >
                <Image
                  src={teacher.avatar}
                  alt={teacher.name}
                  width={52}
                  height={52}
                  className="rounded-full object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[14.5px] font-semibold">
                      {teacher.name}
                    </span>
                    <span className="flex items-center gap-1 text-[11.5px] font-bold text-goldDeep bg-goldSoft px-2 py-0.5 rounded-full">
                      <Star size={11} fill="currentColor" /> {teacher.rating}
                    </span>
                  </div>
                  <div className="text-[12px] text-muted mt-0.5">
                    {teacher.subject} · {teacher.level}
                  </div>
                  <p className="text-[12px] text-ink70 mt-1 leading-relaxed hidden sm:block">
                    {teacher.bio}
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronUp size={18} className="text-ink70 shrink-0" />
                ) : (
                  <ChevronDown size={18} className="text-ink70 shrink-0" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-line p-4">
                  <p className="text-[12px] font-semibold text-ink70 mb-3 flex items-center gap-1.5">
                    <Clock size={13} /> {p.viewSlots}
                  </p>
                  {teacher.slots.length === 0 ? (
                    <p className="text-[13px] text-muted">{p.noSlots}</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
                      {teacher.slots.map((slot) => (
                        <div
                          key={slot.id}
                          className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 ${
                            slot.booked
                              ? "bg-cream border-line"
                              : "bg-white border-sage"
                          }`}
                        >
                          <div>
                            <div className="text-[12.5px] font-semibold">
                              {slot.day}
                            </div>
                            <div className="text-[11px] text-muted">
                              {slot.time}
                            </div>
                          </div>
                          <button
                            disabled={slot.booked}
                            onClick={() => bookSlot(teacher.id, slot.id)}
                            className={`text-[11px] font-bold px-3 py-1.5 rounded-full shrink-0 transition-colors ${
                              slot.booked
                                ? "bg-line text-muted cursor-not-allowed"
                                : "bg-blue text-white hover:bg-blueDeep"
                            }`}
                          >
                            {slot.booked ? p.bookedBtn : p.bookBtn}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
