"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  getTeacherSchedule,
  type TeacherClass,
} from "@/lib/api/teacher-dashboard";
import { formatApiWeekday } from "@/lib/date-utils";

export default function TeacherSchedulePage() {
  const { t, lang } = useLanguage();
  const d = t("teacherDashboard");
  const [weeklySchedule, setWeeklySchedule] = useState<TeacherClass[]>([]);
  useEffect(() => {
    let active = true;
    getTeacherSchedule()
      .then((items) => {
        if (active) setWeeklySchedule(items);
      })
      .catch(() => {
        if (active) setWeeklySchedule([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const getDay = (date: string) => (date ? formatApiWeekday(date, lang) : "");
  const days = Array.from(
    new Set(weeklySchedule.map((item) => getDay(item.scheduledDate))),
  ).filter(Boolean);

  return (
    <div>
      <p className="text-muted text-[14px] mb-6">{d.scheduleHeading}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {days.map((day) => (
          <div
            key={day}
            className="bg-white border border-line rounded-lg shadow-card p-4"
          >
            <h3 className="text-[14.5px] font-bold mb-3">{day}</h3>
            <div className="flex flex-col gap-3">
              {weeklySchedule
                .filter((s) => getDay(s.scheduledDate) === day)
                .map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 bg-cream rounded-xl p-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue text-white flex items-center justify-center shrink-0">
                      <Clock size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold truncate">
                        {s.courseTitle}
                      </div>
                      <div className="text-[11.5px] text-muted">
                        {s.startTime}
                        {s.endTime ? ` – ${s.endTime}` : ""} · {s.subject}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
