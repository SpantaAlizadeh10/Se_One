"use client";

import { useEffect, useState } from "react";
import { CalendarClock, History } from "lucide-react";
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

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
import CourseCard from "@/components/dashboard/CourseCard";
import StudyChart from "@/components/dashboard/StudyChart";
import Calendar from "@/components/dashboard/Calendar";
import ClassPanel from "@/components/dashboard/ClassPanel";
import { formatApiDate, parseApiDate } from "@/lib/date-utils";

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
  const { lang } = useLanguage();
  const [name, setName] = useState("");
  const [courses, setCourses] = useState<DashboardCourse[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<PanelItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<PanelItem[]>([]);

  useEffect(() => {
    setName(getName() || "");
    let active = true;
    Promise.all([
      getCourses(lang),
      getUserEnrollments(),
      getDashboardOverview(),
    ])
      .then(([catalog, enrollments, overview]) => {
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
          overview.upcomingClasses.map((item) => classToPanelItem(item, lang)),
        );
        setRecentActivity(
          overview.recentActivity.map((item) =>
            activityToPanelItem(item, lang),
          ),
        );
      })
      .catch(() => {
        if (active) {
          setCourses([]);
          setUpcomingClasses([]);
          setRecentActivity([]);
        }
      });
    return () => {
      active = false;
    };
  }, [lang]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-[27px] font-semibold mb-1">
          Welcome back{name ? `, ${name}` : ""} 👋
        </h2>
        <p className="text-muted text-[14px] m-0">
          Your academic work is now a digital asset.
        </p>
      </div>

      <MilestoneBanner />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        <div className="min-w-0">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-[21px] font-semibold relative inline-block after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-1.5 after:h-[3px] after:bg-gold after:rounded">
              My Courses
            </h2>
            <a href="#" className="text-[13px] font-semibold text-blue">
              See all courses
            </a>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4.5 mb-7"
            style={{ gap: 18 }}
          >
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          <StudyChart />
        </div>

        <div className="flex flex-col gap-5">
          <Calendar />
          <ClassPanel
            title="Upcoming Class"
            icon={CalendarClock}
            items={upcomingClasses}
            withTabs
          />
          <ClassPanel
            title="Recent Activity"
            icon={History}
            items={recentActivity}
          />
        </div>
      </div>
    </div>
  );
}
