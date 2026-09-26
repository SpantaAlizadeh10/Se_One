"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  Tag,
  FileText,
  Activity,
  Clock,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { isApiConfigured } from "@/lib/is-api-configured";
import { getAdminDashboardStats } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import AdminDataSourceBanner from "@/components/admin/AdminDataSourceBanner";

export default function AdminOverviewPage() {
  const { t } = useLanguage();
  const d = t("adminDashboard");
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiStats, setApiStats] = useState<{
    students: string;
    teachers: string;
    courses: string;
    discounts: string;
    publishedPosts: string;
    enrollments: string;
    pendingTeachers: string;
  } | null>(null);

  const loadStats = useCallback(async () => {
    if (!isApiConfigured()) {
      setApiStats(null);
      setApiError(
        "Backend API URL is not configured. Dashboard data is unavailable.",
      );
      return;
    }
    setApiError(null);
    try {
      const s = await getAdminDashboardStats();
      setApiStats({
        students: String(s.studentsCount),
        teachers: String(s.teachersCount),
        courses: String(s.coursesCount),
        discounts: String(s.activeDiscountsCount),
        publishedPosts: String(s.publishedBlogPostsCount),
        enrollments: String(s.activeEnrollmentsCount),
        pendingTeachers: String(s.pendingTeachersCount),
      });
    } catch (e) {
      setApiError(
        e instanceof ApiError ? e.message : "Could not load dashboard stats",
      );
      setApiStats(null);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const values = apiStats ?? {
    students: "—",
    teachers: "—",
    courses: "—",
    discounts: "—",
    publishedPosts: "—",
    enrollments: "—",
    pendingTeachers: "—",
  };

  const stats = [
    {
      label: d.stats.students,
      value: values.students,
      icon: Users,
      bg: "bg-[#E4ECFF]",
      text: "text-blue",
    },
    {
      label: d.stats.teachers,
      value: values.teachers,
      icon: GraduationCap,
      bg: "bg-sage",
      text: "text-sageDeep",
    },
    {
      label: d.stats.courses,
      value: values.courses,
      icon: BookOpen,
      bg: "bg-goldSoft",
      text: "text-goldDeep",
    },
    {
      label: d.stats.discounts,
      value: values.discounts,
      icon: Tag,
      bg: "bg-danger/10",
      text: "text-danger",
    },
    {
      label: "Published blog posts",
      value: values.publishedPosts,
      icon: FileText,
      bg: "bg-[#E9E4FF]",
      text: "text-[#6752B8]",
    },
    {
      label: "Active enrollments",
      value: values.enrollments,
      icon: Activity,
      bg: "bg-[#E4F4F0]",
      text: "text-[#227A68]",
    },
    {
      label: "Pending teachers",
      value: values.pendingTeachers,
      icon: Clock,
      bg: "bg-[#FFF1D6]",
      text: "text-[#B8792E]",
    },
  ];

  return (
    <div>
      <AdminDataSourceBanner apiError={apiError} onRetry={loadStats} />
      <div className="mb-6">
        <h2 className="font-serif text-[24px] sm:text-[27px] font-semibold mb-1">
          {d.welcome} 👋
        </h2>
        <p className="text-muted text-[14px] m-0">{d.sub}</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-line rounded-md p-4 shadow-card flex items-center gap-3.5"
          >
            <div
              className={`w-11 h-11 rounded-[11px] flex items-center justify-center shrink-0 ${s.bg} ${s.text}`}
            >
              <s.icon size={19} />
            </div>
            <div>
              <div className="font-serif text-[22px] font-semibold leading-none">
                {s.value}
              </div>
              <div className="text-[11.5px] text-muted mt-1">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
