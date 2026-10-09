"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  History,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { getName } from "@/lib/auth-client";
import { getCourses } from "@/lib/api/courses";
import { getUserEnrollments } from "@/lib/api/enrollment";
import {
  getDashboardOverview,
  type UpcomingClass,
  type RecentActivity,
} from "@/lib/api/student-dashboard";
import MilestoneBanner from "@/components/dashboard/MilestoneBanner";
import AnnouncementsFeed from "@/components/dashboard/AnnouncementsFeed";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
import CourseCard from "@/components/dashboard/CourseCard";
import StudyChart from "@/components/dashboard/StudyChart";
import LiveDashboardCalendar from "@/components/dashboard/LiveDashboardCalendar";
import ClassPanel from "@/components/dashboard/ClassPanel";
import { formatApiDate, parseApiDate } from "@/lib/date-utils";
import {
  getStudentAssignments,
  getStudentSubmissions,
  type Assignment,
} from "@/lib/api/assignments";
import Link from "next/link";
import { useStudentExperience } from "@/components/shared/StudentExperienceProvider";

const gradients = [
  "from-[#CFE7E4] to-[#9FCFC9]",
  "from-[#D9D2F0] to-[#B7A8E6]",
  "from-[#CDE0D6] to-[#9CC4AC]",
];

type DashboardCourse = {
  id: string;
  title: string;
  level: string;
  progress: number;
  gradient: string;
  price?: string;
};
type PanelItem = {
  id: string;
  title: string;
  level: string;
  day: string;
  date: string;
  time: string;
  kind: "speak" | "grammar" | "write";
};

function classToPanelItem(item: UpcomingClass, lang: "fa" | "en"): PanelItem {
  const start = parseApiDate(item.scheduledDate);
  return {
    id: item.id,
    title: item.subject || item.courseTitle,
    level: item.courseTitle,
    day: start ? formatApiDate(item.scheduledDate, lang) : "",
    date: item.scheduledDate,
    time: item.startTime,
    kind: /grammar/i.test(item.subject)
      ? "grammar"
      : /writ/i.test(item.subject)
        ? "write"
        : "speak",
  };
}

function activityToPanelItem(
  item: RecentActivity,
  lang: "fa" | "en",
): PanelItem {
  const date = parseApiDate(item.timestamp);
  return {
    id: item.id,
    title: item.title,
    level: item.description,
    day: date ? formatApiDate(item.timestamp, lang) : "",
    date: item.timestamp,
    time: "",
    kind: /assignment/i.test(item.type) ? "write" : "grammar",
  };
}

export default function DashboardPage() {
  const { lang, href } = useLanguage();
  const { isChildMode } = useStudentExperience();
  const [name, setName] = useState("");
  const [courses, setCourses] = useState<DashboardCourse[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<PanelItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<PanelItem[]>([]);
  const [nextAssignment, setNextAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    setName(getName() || "");
    let active = true;
    Promise.all([
      getCourses(lang).catch(() => []),
      getUserEnrollments().catch(() => []),
      getDashboardOverview().catch(() => null),
      getStudentAssignments().catch(() => []),
      getStudentSubmissions().catch(() => []),
    ]).then(([catalog, enrollments, overview, assignments, submissions]) => {
      if (!active) return;
      const coursesList = enrollments
        .filter((enrollment) => enrollment.status === "active")
        .map((enrollment, index) => {
          const course = catalog.find(
            (item) => item.id === enrollment.courseId,
          );
          return course
            ? ({
                id: course.id,
                title: course.title,
                level: course.level,
                progress: enrollment.progress ?? 0,
                gradient: gradients[index % gradients.length],
                price: course.price,
              } as DashboardCourse | null)
            : null;
        })
        .filter((course): course is DashboardCourse => course !== null);
      setCourses(coursesList);
      setUpcomingClasses(
        (overview?.upcomingClasses ?? []).map((item) =>
          classToPanelItem(item, lang),
        ),
      );
      setRecentActivity(
        (overview?.recentActivity ?? []).map((item) =>
          activityToPanelItem(item, lang),
        ),
      );
      const availableAssignments = assignments
        .filter((assignment) => assignment.isPublished)
        .filter((assignment) => {
          const submission = submissions.find(
            (item) => item.assignmentId === assignment.id,
          );
          return (
            !submission ||
            submission.status === "draft" ||
            submission.status === "returned"
          );
        })
        .sort((a, b) => {
          const aDue = a.dueDate
            ? new Date(a.dueDate).getTime()
            : Number.MAX_SAFE_INTEGER;
          const bDue = b.dueDate
            ? new Date(b.dueDate).getTime()
            : Number.MAX_SAFE_INTEGER;
          return aDue - bDue;
        });
      setNextAssignment(availableAssignments[0] ?? null);
    });
    return () => {
      active = false;
    };
  }, [lang]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-[27px] font-semibold mb-1">
          {isChildMode
            ? lang === "fa"
              ? `سلام ${name || "قهرمان کوچولو"}! 👋`
              : `Hi ${name || "learning star"}! 👋`
            : `Welcome back${name ? `, ${name}` : ""} 👋`}
        </h2>
        <p className="text-muted text-[14px] m-0">
          {lang === "fa"
            ? isChildMode
              ? "آماده‌ای؟ امروز با یک تمرین کوچولو شروع کنیم!"
              : "برای ادامه، یک قدم کوچک انتخاب کن."
            : isChildMode
              ? "Ready? Let’s start with one little practice today!"
              : "Pick one small step to keep learning today."}
        </p>
      </div>

      <MilestoneBanner />
      <AnnouncementsFeed lang={lang} />

      <section className="mb-6 flex flex-col gap-4 rounded-2xl border border-blue/15 bg-gradient-to-r from-[#EEF3FF] via-white to-[#EAF5F1] p-4 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue shadow-sm">
            {nextAssignment ? (
              <CheckCircle2 size={20} />
            ) : (
              <Sparkles size={20} />
            )}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wide text-blue">
              {isChildMode
                ? lang === "fa"
                  ? "مأموریت امروز"
                  : "TODAY’S MISSION"
                : lang === "fa"
                  ? "قدم بعدی تو"
                  : "YOUR NEXT STEP"}
            </div>
            <h2 className="mb-1 mt-1 truncate text-[16px] font-semibold">
              {nextAssignment?.title ??
                (lang === "fa"
                  ? isChildMode
                    ? "یک تمرین کوتاه و باحال"
                    : "یک تمرین کوتاه انجام بده"
                  : isChildMode
                    ? "A quick, fun practice"
                    : "Try a short practice session")}
            </h2>
            <p className="m-0 flex items-center gap-1.5 text-[12px] text-muted">
              {nextAssignment ? (
                <>
                  <Clock3 size={13} />
                  {nextAssignment.courseTitle}
                  {nextAssignment.dueDate
                    ? ` · ${lang === "fa" ? "مهلت" : "Due"} ${new Date(nextAssignment.dueDate).toLocaleDateString(lang === "fa" ? "fa-IR" : "en-US")}`
                    : ""}
                </>
              ) : lang === "fa" ? (
                isChildMode ? (
                  "چند دقیقه تمرین کنیم و یک ستاره به تلاش امروزت اضافه کنیم!"
                ) : (
                  "۵ تا ۱۰ دقیقه تمرین، پیوستگی یادگیری را حفظ می‌کند."
                )
              ) : isChildMode ? (
                "A few minutes of practice adds a star to today’s effort!"
              ) : (
                "A 5–10 minute drill keeps your learning momentum going."
              )}
            </p>
          </div>
        </div>
        <Link
          href={
            nextAssignment
              ? href(
                  `/dashboard/assignments?assignment=${encodeURIComponent(nextAssignment.id)}`,
                )
              : href("/dashboard/practice")
          }
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-blueDeep"
        >
          {nextAssignment
            ? lang === "fa"
              ? "ادامه تکلیف"
              : "Continue assignment"
            : lang === "fa"
              ? isChildMode
                ? "شروع مأموریت من"
                : "شروع تمرین"
              : isChildMode
                ? "Start my mission"
                : "Start practice"}
          <ArrowRight size={15} className="rtl:rotate-180" />
        </Link>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        <div className="min-w-0">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-[21px] font-semibold relative inline-block after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-1.5 after:h-[3px] after:bg-gold after:rounded">
              {lang === "fa" ? "دوره‌های من" : "My Courses"}
            </h2>
            <Link
              href={href("/courses")}
              className="text-[13px] font-semibold text-blue"
            >
              {lang === "fa" ? "مشاهده همه دوره‌ها" : "Browse courses"}
            </Link>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4.5 mb-7"
            style={{ gap: 18 }}
          >
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                href={href(`/courses/${course.id}`)}
                label={
                  isChildMode
                    ? lang === "fa"
                      ? "بزن بریم!"
                      : "Let’s go!"
                    : lang === "fa"
                      ? "مشاهده دوره"
                      : "View course"
                }
              />
            ))}
            {courses.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-line bg-white p-6 text-center">
                <p className="mb-3 mt-0 text-[13px] text-muted">
                  {lang === "fa"
                    ? "هنوز در دوره‌ای ثبت‌نام نکرده‌ای."
                    : "You are not enrolled in a course yet."}
                </p>
                <Link
                  href={href("/courses")}
                  className="inline-flex items-center gap-2 rounded-full bg-blue px-4 py-2 text-[12px] font-semibold text-white"
                >
                  {lang === "fa" ? "پیدا کردن دوره" : "Find a course"}
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>

          <StudyChart />
        </div>

        <div className="flex flex-col gap-5">
          <LiveDashboardCalendar audience="student" />
          <ClassPanel
            title={
              isChildMode
                ? lang === "fa"
                  ? "کلاس بعدی من"
                  : "My next class"
                : lang === "fa"
                  ? "کلاس پیش رو"
                  : "Upcoming Class"
            }
            icon={CalendarClock}
            items={upcomingClasses}
            withTabs
            href={href("/dashboard/classes")}
          />
          <ClassPanel
            title={
              isChildMode
                ? lang === "fa"
                  ? "ستاره‌هایی که گرفتم"
                  : "My learning wins"
                : lang === "fa"
                  ? "فعالیت‌های اخیر"
                  : "Recent Activity"
            }
            icon={History}
            items={recentActivity}
          />
        </div>
      </div>
    </div>
  );
}
