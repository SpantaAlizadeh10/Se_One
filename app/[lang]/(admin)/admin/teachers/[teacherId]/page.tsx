"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  GraduationCap,
  Users,
  Plus,
  Save,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  getAdminTeacher,
  getAdminTeacherAvailability,
  getAdminTeacherStudents,
  setAdminTeacherAvailability,
  type AdminAvailabilitySlot,
  type AdminTeacher,
  type AdminTeacherStudentLink,
} from "@/lib/api/admin";

export default function AdminTeacherDashboardPage() {
  const { href } = useLanguage();
  const params = useParams<{ teacherId: string }>();
  const [teacher, setTeacher] = useState<AdminTeacher | null>(null);
  const [students, setStudents] = useState<AdminTeacherStudentLink[]>([]);
  const [availability, setAvailability] = useState<AdminAvailabilitySlot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: "Monday",
    startTime: "09:00",
    endTime: "10:00",
  });
  const [savingAvailability, setSavingAvailability] = useState(false);

  useEffect(() => {
    if (!params.teacherId) return;
    Promise.all([
      getAdminTeacher(params.teacherId),
      getAdminTeacherStudents(params.teacherId),
      getAdminTeacherAvailability(params.teacherId),
    ])
      .then(([profile, linkedStudents, slots]) => {
        setTeacher(profile);
        setStudents(linkedStudents);
        setAvailability(slots);
      })
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Could not load teacher dashboard",
        ),
      );
  }, [params.teacherId]);

  const addSlot = () => {
    setAvailability((current) => [
      ...current,
      { ...newSlot, id: `draft-${Date.now()}`, isBooked: false },
    ]);
  };

  const saveAvailability = async () => {
    if (!params.teacherId) return;
    setSavingAvailability(true);
    try {
      const saved = await setAdminTeacherAvailability(
        params.teacherId,
        availability.map(({ dayOfWeek, startTime, endTime }) => ({
          dayOfWeek,
          startTime,
          endTime,
        })),
      );
      setAvailability(saved);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not save availability",
      );
    } finally {
      setSavingAvailability(false);
    }
  };

  if (error) return <p className="text-danger text-[14px]">{error}</p>;
  if (!teacher)
    return (
      <p className="text-muted text-[14px]">Loading teacher dashboard...</p>
    );

  return (
    <div className="space-y-5">
      <Link
        href={href("/admin/teachers")}
        className="inline-flex items-center gap-2 text-[13px] font-semibold text-blue"
      >
        <ArrowLeft size={15} className="rtl:rotate-180" /> Back to teachers
      </Link>

      <section className="bg-white border border-line rounded-lg shadow-card p-5 flex flex-wrap items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-sage flex items-center justify-center text-sageDeep">
          <GraduationCap size={26} />
        </div>
        <div className="flex-1 min-w-[220px]">
          <h2 className="font-serif text-[24px] font-semibold">
            {teacher.fullName}
          </h2>
          <p className="text-muted text-[13px]">
            {teacher.subject} · {teacher.level} · {teacher.teachingLanguage}
          </p>
        </div>
        <span className="text-[12px] font-bold px-3 py-1.5 rounded-full bg-sage text-sageDeep">
          {teacher.status}
        </span>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-line rounded-lg shadow-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users size={17} /> Assigned students
          </h3>
          <div className="space-y-3">
            {students.length === 0 && (
              <p className="text-muted text-[13px]">
                No linked students returned by the API.
              </p>
            )}
            {students.map((student) => (
              <div
                key={`${student.studentId}-${student.courseId}`}
                className="border border-line rounded-xl p-3"
              >
                <div className="text-[13px] font-semibold">
                  {student.fullName}
                </div>
                <div className="text-[12px] text-muted mt-1">
                  {student.courseTitle || student.courseId} · Progress:{" "}
                  {student.progress}%
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-line rounded-lg shadow-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <CalendarClock size={17} /> Availability
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 mb-4">
            <select
              value={newSlot.dayOfWeek}
              onChange={(event) =>
                setNewSlot({ ...newSlot, dayOfWeek: event.target.value })
              }
              className="border border-line rounded-lg px-2 py-2 text-[12px] bg-cream"
            >
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((day) => (
                <option key={day}>{day}</option>
              ))}
            </select>
            <input
              type="time"
              value={newSlot.startTime}
              onChange={(event) =>
                setNewSlot({ ...newSlot, startTime: event.target.value })
              }
              className="border border-line rounded-lg px-2 py-2 text-[12px] bg-cream"
            />
            <input
              type="time"
              value={newSlot.endTime}
              onChange={(event) =>
                setNewSlot({ ...newSlot, endTime: event.target.value })
              }
              className="border border-line rounded-lg px-2 py-2 text-[12px] bg-cream"
            />
            <button
              type="button"
              onClick={addSlot}
              className="inline-flex items-center justify-center gap-1 bg-blue text-white rounded-lg px-3 py-2 text-[12px] font-semibold"
            >
              <Plus size={14} /> Add
            </button>
          </div>
          <div className="space-y-3">
            {availability.length === 0 && (
              <p className="text-muted text-[13px]">
                No availability returned by the API.
              </p>
            )}
            {availability.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between gap-3 border border-line rounded-xl p-3 text-[13px]"
              >
                <span className="font-semibold">{slot.dayOfWeek}</span>
                <span className="text-muted">
                  {slot.startTime} - {slot.endTime}
                </span>
                <span
                  className={slot.isBooked ? "text-danger" : "text-sageDeep"}
                >
                  {slot.isBooked ? "Booked" : "Open"}
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={saveAvailability}
            disabled={savingAvailability}
            className="mt-4 inline-flex items-center gap-1.5 bg-ink text-white rounded-lg px-4 py-2.5 text-[12px] font-semibold disabled:opacity-50"
          >
            <Save size={14} />{" "}
            {savingAvailability ? "Saving..." : "Save availability"}
          </button>
        </div>
      </section>
    </div>
  );
}
