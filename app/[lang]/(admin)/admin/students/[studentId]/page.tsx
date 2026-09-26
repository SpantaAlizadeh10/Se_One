"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Mail,
  UserRound,
  Plus,
  Trash2,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  getAdminStudent,
  getAdminStudentEnrollments,
  getAdminStudentProgress,
  adminCancelStudentEnrollment,
  adminEnrollStudent,
  type AdminStudent,
  type AdminStudentProgress,
} from "@/lib/api/admin";
import type { Enrollment } from "@/lib/api/enrollment";

export default function AdminStudentDashboardPage() {
  const { href } = useLanguage();
  const params = useParams<{ studentId: string }>();
  const [student, setStudent] = useState<AdminStudent | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progress, setProgress] = useState<AdminStudentProgress[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [courseId, setCourseId] = useState("");
  const [savingEnrollment, setSavingEnrollment] = useState(false);

  useEffect(() => {
    if (!params.studentId) return;
    Promise.all([
      getAdminStudent(params.studentId),
      getAdminStudentEnrollments(params.studentId),
      getAdminStudentProgress(params.studentId),
    ])
      .then(([profile, studentEnrollments, studentProgress]) => {
        setStudent(profile);
        setEnrollments(studentEnrollments);
        setProgress(studentProgress);
      })
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Could not load student dashboard",
        ),
      );
  }, [params.studentId]);

  const enroll = async () => {
    if (!courseId.trim() || !params.studentId) return;
    setSavingEnrollment(true);
    try {
      const enrollment = await adminEnrollStudent(
        params.studentId,
        courseId.trim(),
      );
      setEnrollments((current) => [...current, enrollment]);
      setCourseId("");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not enroll student",
      );
    } finally {
      setSavingEnrollment(false);
    }
  };

  const cancelEnrollment = async (enrollmentId: string) => {
    if (!params.studentId || !window.confirm("Cancel this enrollment?")) return;
    try {
      await adminCancelStudentEnrollment(params.studentId, enrollmentId);
      setEnrollments((current) =>
        current.filter((item) => item.id !== enrollmentId),
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not cancel enrollment",
      );
    }
  };

  if (error) return <p className="text-danger text-[14px]">{error}</p>;
  if (!student)
    return (
      <p className="text-muted text-[14px]">Loading student dashboard...</p>
    );

  return (
    <div className="space-y-5">
      <Link
        href={href("/admin/students")}
        className="inline-flex items-center gap-2 text-[13px] font-semibold text-blue"
      >
        <ArrowLeft size={15} className="rtl:rotate-180" /> Back to students
      </Link>

      <section className="bg-white border border-line rounded-lg shadow-card p-5 flex flex-wrap items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-blue/10 flex items-center justify-center text-blue">
          <UserRound size={26} />
        </div>
        <div className="flex-1 min-w-[220px]">
          <h2 className="font-serif text-[24px] font-semibold">
            {student.fullName}
          </h2>
          <p className="text-muted text-[13px] flex items-center gap-1.5">
            <Mail size={13} /> {student.email}
          </p>
        </div>
        <span className="text-[12px] font-bold px-3 py-1.5 rounded-full bg-sage text-sageDeep">
          {student.status}
        </span>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-line rounded-lg shadow-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BookOpen size={17} /> Enrollments
          </h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                value={courseId}
                onChange={(event) => setCourseId(event.target.value)}
                placeholder="Course ID"
                className="min-w-0 flex-1 border border-line rounded-lg px-3 py-2 text-[13px] bg-cream outline-none focus:border-blue"
              />
              <button
                type="button"
                onClick={enroll}
                disabled={savingEnrollment || !courseId.trim()}
                className="inline-flex items-center gap-1.5 bg-blue text-white rounded-lg px-3 py-2 text-[12px] font-semibold disabled:opacity-50"
              >
                <Plus size={14} /> Enroll
              </button>
            </div>
            {enrollments.length === 0 && (
              <p className="text-muted text-[13px]">
                No enrollments returned by the API.
              </p>
            )}
            {enrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="border border-line rounded-xl p-3 flex items-center gap-3"
              >
                <div className="flex-1">
                  <div className="text-[13px] font-semibold">
                    Course: {enrollment.courseId}
                  </div>
                  <div className="text-[12px] text-muted mt-1">
                    Status: {enrollment.status} · Progress:{" "}
                    {enrollment.progress}%
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => cancelEnrollment(enrollment.id)}
                  className="w-8 h-8 rounded-full bg-danger/10 text-danger flex items-center justify-center"
                  title="Cancel enrollment"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-line rounded-lg shadow-card p-5">
          <h3 className="font-semibold mb-4">Learning progress</h3>
          <div className="space-y-4">
            {progress.length === 0 && (
              <p className="text-muted text-[13px]">
                No progress returned by the API.
              </p>
            )}
            {progress.map((item) => (
              <div key={item.courseId}>
                <div className="flex justify-between gap-3 text-[13px] mb-1.5">
                  <span className="font-semibold">
                    {item.courseTitle || item.courseId}
                  </span>
                  <span className="text-muted">{item.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-cream overflow-hidden">
                  <div
                    className="h-full bg-blue rounded-full"
                    style={{
                      width: `${Math.min(100, Math.max(0, item.progress))}%`,
                    }}
                  />
                </div>
                <div className="text-[11px] text-muted mt-1">
                  {item.completedLessons} / {item.totalLessons} lessons
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
