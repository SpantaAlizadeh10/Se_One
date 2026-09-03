"use client";

import { CalendarClock, History } from "lucide-react";
import MilestoneBanner from "@/components/dashboard/MilestoneBanner";
import CourseCard from "@/components/dashboard/CourseCard";
import StudyChart from "@/components/dashboard/StudyChart";
import Calendar from "@/components/dashboard/Calendar";
import ClassPanel from "@/components/dashboard/ClassPanel";
import { courses, upcomingClasses, recentActivity } from "@/lib/data";

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-[27px] font-semibold mb-1">
          Welcome back, Sepanta 👋
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
