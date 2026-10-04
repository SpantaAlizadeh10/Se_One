"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Users,
  Wallet,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { stripLocale } from "@/lib/i18n/paths";

type DashboardRole = "student" | "teacher" | "admin";
type MobileNavItem = {
  href: string;
  labelKey: string;
  Icon: typeof LayoutDashboard;
};

const navigation: Record<DashboardRole, MobileNavItem[]> = {
  student: [
    {
      href: "/dashboard",
      labelKey: "dashboardMobileNav.student.dashboard",
      Icon: LayoutDashboard,
    },
    {
      href: "/dashboard/teachers",
      labelKey: "dashboardMobileNav.student.teachers",
      Icon: GraduationCap,
    },
    {
      href: "/dashboard/assignments",
      labelKey: "dashboardMobileNav.student.assignments",
      Icon: ClipboardList,
    },
    {
      href: "/dashboard/practice",
      labelKey: "dashboardMobileNav.student.practice",
      Icon: BookOpen,
    },
    {
      href: "/dashboard/messages",
      labelKey: "dashboardMobileNav.student.messages",
      Icon: MessageSquare,
    },
  ],
  teacher: [
    {
      href: "/teacher",
      labelKey: "dashboardMobileNav.teacher.dashboard",
      Icon: LayoutDashboard,
    },
    {
      href: "/teacher/classes",
      labelKey: "dashboardMobileNav.teacher.classes",
      Icon: BookOpen,
    },
    {
      href: "/teacher/students",
      labelKey: "dashboardMobileNav.teacher.students",
      Icon: Users,
    },
    {
      href: "/teacher/availability",
      labelKey: "dashboardMobileNav.teacher.availability",
      Icon: CalendarDays,
    },
    {
      href: "/teacher/messages",
      labelKey: "dashboardMobileNav.teacher.messages",
      Icon: MessageSquare,
    },
  ],
  admin: [
    {
      href: "/admin",
      labelKey: "dashboardMobileNav.admin.dashboard",
      Icon: LayoutDashboard,
    },
    {
      href: "/admin/students",
      labelKey: "dashboardMobileNav.admin.students",
      Icon: Users,
    },
    {
      href: "/admin/teachers",
      labelKey: "dashboardMobileNav.admin.teachers",
      Icon: GraduationCap,
    },
    {
      href: "/admin/withdrawals",
      labelKey: "dashboardMobileNav.admin.withdrawals",
      Icon: Wallet,
    },
    {
      href: "/admin/courses",
      labelKey: "dashboardMobileNav.admin.courses",
      Icon: BookOpen,
    },
  ],
};

export default function DashboardMobileNav({ role }: { role: DashboardRole }) {
  const pathname = usePathname();
  const currentPath = stripLocale(pathname || "/");
  const { t, href } = useLanguage();

  return (
    <nav
      aria-label={t("dashboardMobileNav.label")}
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 lg:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1 rounded-[24px] border border-white/20 bg-[#182163]/95 p-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        {navigation[role].map(({ href: path, labelKey, Icon }) => {
          const active =
            currentPath === path ||
            (path !== "/dashboard" &&
              path !== "/teacher" &&
              path !== "/admin" &&
              currentPath.startsWith(`${path}/`));
          return (
            <Link
              key={path}
              href={href(path)}
              aria-current={active ? "page" : undefined}
              className={`group flex min-w-0 flex-col items-center justify-center gap-1 rounded-[18px] px-1.5 py-2.5 text-center text-[9px] font-semibold transition-all duration-200 sm:text-[10px] ${active ? "bg-white text-[#182163] shadow-sm" : "text-white hover:bg-white/20"}`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full ${active ? "bg-[#182163] text-white" : "bg-white/20 text-white group-hover:bg-white/30"}`}
              >
                <Icon size={14} strokeWidth={active ? 2.3 : 2} />
              </span>
              <span className="w-full truncate leading-none">
                {t(labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
