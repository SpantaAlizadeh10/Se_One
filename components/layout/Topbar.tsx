"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  LayoutGrid,
  ChevronDown,
  Menu,
  X,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  MessageSquare,
  Settings,
  Ticket,
} from "lucide-react";
import { navItems } from "@/lib/nav";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { stripLocale } from "@/lib/i18n/paths";
import {
  getNotificationStats,
  markAllNotificationsAsRead,
} from "@/lib/api/notifications";
import { isApiConfigured } from "@/lib/is-api-configured";
import { useStudentExperience } from "@/components/shared/StudentExperienceProvider";
import { getEmail, getName } from "@/lib/auth-client";
import { getUserProfile } from "@/lib/api/settings";

export default function Topbar({
  onMenuClick,
  isMenuOpen = false,
}: {
  onMenuClick: () => void;
  isMenuOpen?: boolean;
}) {
  const pathname = usePathname();
  const { t, lang, href } = useLanguage();
  const { isChildMode } = useStudentExperience();
  const current = navItems.find((i) => i.href === stripLocale(pathname || "/"));
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLauncher, setShowLauncher] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const childTitles: Record<string, { fa: string; en: string }> = {
    "/dashboard": { fa: "یادگیری من", en: "My learning" },
    "/dashboard/classes": { fa: "کلاس‌های من", en: "My classes" },
    "/dashboard/practice": { fa: "تمرین‌های کوتاه", en: "Quick practice" },
    "/dashboard/assignments": { fa: "کارهای من", en: "My assignments" },
    "/dashboard/teachers": { fa: "معلم‌ها", en: "My teachers" },
    "/dashboard/messages": { fa: "پیام به معلم", en: "Ask my teacher" },
  };

  useEffect(() => {
    setStudentName(getName() || "");
    setStudentEmail(getEmail() || "");
    if (!isApiConfigured()) return;
    let active = true;
    getUserProfile()
      .then((profile) => {
        if (!active) return;
        if (profile.fullName) setStudentName(profile.fullName);
        if (profile.email) setStudentEmail(profile.email);
        if (profile.avatarUrl) setAvatarUrl(profile.avatarUrl);
      })
      .catch(() => {
        // Keep the signed-in name and email if profile API is unavailable.
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isApiConfigured()) return;

    const loadNotifications = async () => {
      try {
        const stats = await getNotificationStats();
        setUnreadCount(stats.unread);
      } catch (error) {
        console.error("Failed to load notifications:", error);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!showLauncher && !showAccountMenu && !showNotifications) return;
    const closeMenus = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-student-header-menu]")) {
        setShowLauncher(false);
        setShowAccountMenu(false);
        setShowNotifications(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowLauncher(false);
        setShowAccountMenu(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener("pointerdown", closeMenus);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeMenus);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [showLauncher, showAccountMenu, showNotifications]);

  const shortcuts = [
    {
      href: "/dashboard",
      icon: LayoutGrid,
      en: "My learning",
      fa: "یادگیری من",
      childEn: "My learning",
      childFa: "یادگیری من",
    },
    {
      href: "/dashboard/classes",
      icon: CalendarDays,
      en: "Classes",
      fa: "کلاس‌ها",
      childEn: "My classes",
      childFa: "کلاس‌های من",
    },
    {
      href: "/dashboard/assignments",
      icon: ClipboardCheck,
      en: "Assignments",
      fa: "تکالیف",
      childEn: "My work",
      childFa: "کارهای من",
    },
    {
      href: "/dashboard/practice",
      icon: BookOpen,
      en: "Practice",
      fa: "تمرین",
      childEn: "Quick practice",
      childFa: "تمرین کوتاه",
    },
    {
      href: "/dashboard/teachers",
      icon: GraduationCap,
      en: "Teachers",
      fa: "مدرسان",
      childEn: "My teachers",
      childFa: "معلم‌های من",
    },
    {
      href: "/dashboard/messages",
      icon: MessageSquare,
      en: "Messages",
      fa: "پیام‌ها",
      childEn: "Ask my teacher",
      childFa: "پیام به معلم",
    },
  ];

  const handleProfileClick = () => {
    setShowLauncher(false);
    setShowNotifications(false);
    setShowAccountMenu((open) => !open);
  };

  const handleLauncherClick = () => {
    setShowAccountMenu(false);
    setShowNotifications(false);
    setShowLauncher((open) => !open);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 mb-6 lg:mb-7">
      <div className="flex items-center gap-3 min-w-0">
        {!isMenuOpen && (
          <button
            onClick={onMenuClick}
            type="button"
            aria-label="Open menu"
            aria-controls="student-dashboard-sidebar"
            aria-expanded={false}
            className="relative z-[60] lg:hidden w-10 h-10 shrink-0 rounded-full bg-white border border-line flex items-center justify-center text-ink70 shadow-sm"
          >
            <Menu size={18} />
          </button>
        )}
        <h1 className="text-[19px] sm:text-[22px] font-semibold m-0 truncate">
          {isChildMode && current && childTitles[current.href]
            ? childTitles[current.href][lang]
            : current
              ? t(current.titleKey)
              : t("studentNav.titles.dashboard")}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="relative" data-student-header-menu>
          <button
            onClick={() => {
              setShowLauncher(false);
              setShowAccountMenu(false);
              setShowNotifications((open) => !open);
            }}
            type="button"
            aria-label={lang === "fa" ? "اعلان‌ها" : "Notifications"}
            aria-expanded={showNotifications}
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-line flex items-center justify-center text-ink70 hover:border-ink transition-colors"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-[8px] end-[8px] sm:top-[9px] sm:end-[9px] w-[7px] h-[7px] rounded-full bg-danger border-[1.5px] border-white" />
            )}
          </button>
          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-80 max-w-[calc(100vw-1.5rem)] bg-white border border-line rounded-lg shadow-card z-50">
              <div className="p-4 border-b border-line flex items-center justify-between">
                <h3 className="text-[13.5px] font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[12px] text-blue hover:text-blueDeep font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="p-4 text-center text-muted text-[13px]">
                {unreadCount === 0
                  ? "No new notifications"
                  : `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`}
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-cream"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
        <div className="relative" data-student-header-menu>
          <button
            type="button"
            onClick={handleLauncherClick}
            aria-label={
              lang === "fa" ? "میانبرهای داشبورد" : "Dashboard shortcuts"
            }
            aria-haspopup="menu"
            aria-expanded={showLauncher}
            title={lang === "fa" ? "میانبرهای داشبورد" : "Dashboard shortcuts"}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink70 transition-colors hover:border-blue hover:text-blue sm:h-10 sm:w-10"
          >
            <LayoutGrid size={17} />
          </button>
          {showLauncher && (
            <div
              role="menu"
              className="absolute end-0 top-full z-[70] mt-2 w-[min(19rem,calc(100vw-1.5rem))] rounded-2xl border border-line bg-white p-3 shadow-card"
            >
              <div className="mb-2 px-1 text-[11px] font-bold text-muted">
                {lang === "fa" ? "رفتن به بخش" : "GO TO"}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {shortcuts.map(
                  ({
                    href: path,
                    icon: Icon,
                    en,
                    fa: faLabel,
                    childEn,
                    childFa,
                  }) => (
                    <Link
                      key={path}
                      role="menuitem"
                      href={href(path)}
                      onClick={() => setShowLauncher(false)}
                      className="flex min-w-0 items-center gap-2 rounded-xl border border-line px-2.5 py-2.5 text-start text-[11px] font-semibold text-ink70 transition-colors hover:border-blue/30 hover:bg-blue/[0.04] hover:text-blue"
                    >
                      <Icon size={15} className="shrink-0" />
                      <span className="truncate">
                        {isChildMode
                          ? lang === "fa"
                            ? childFa
                            : childEn
                          : lang === "fa"
                            ? faLabel
                            : en}
                      </span>
                    </Link>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
        <div className="relative" data-student-header-menu>
          <button
            type="button"
            onClick={handleProfileClick}
            aria-label={lang === "fa" ? "حساب کاربری" : "Account menu"}
            aria-haspopup="menu"
            aria-expanded={showAccountMenu}
            className="flex items-center gap-2 rounded-full border border-line bg-white py-1 ps-1 pe-2 transition-colors hover:border-blue sm:gap-2.5 sm:pe-3"
          >
            <Image
              src={avatarUrl || "/images/Teacher.jpeg"}
              alt={studentName || (lang === "fa" ? "دانش‌آموز" : "Student")}
              width={32}
              height={32}
              unoptimized
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="hidden min-w-0 text-start sm:block">
              <span className="block max-w-28 truncate text-[12px] font-semibold leading-tight">
                {studentName || (lang === "fa" ? "دانش‌آموز" : "Student")}
              </span>
              <span className="block text-[10px] leading-tight text-muted">
                {t("auth.signup.student")}
              </span>
            </span>
            <ChevronDown
              size={13}
              className={`hidden transition-transform sm:block ${showAccountMenu ? "rotate-180" : ""}`}
            />
          </button>
          {showAccountMenu && (
            <div
              role="menu"
              className="absolute end-0 top-full z-[70] mt-2 w-[min(17rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-line bg-white shadow-card"
            >
              <div className="border-b border-line bg-cream/60 px-4 py-3">
                <div className="truncate text-[12px] font-bold">
                  {studentName || (lang === "fa" ? "دانش‌آموز" : "Student")}
                </div>
                {studentEmail && (
                  <div
                    className="mt-0.5 truncate text-[10px] text-muted"
                    dir="ltr"
                  >
                    {studentEmail}
                  </div>
                )}
              </div>
              <Link
                role="menuitem"
                href={href("/dashboard/settings")}
                onClick={() => setShowAccountMenu(false)}
                className="flex items-center gap-2.5 px-4 py-3 text-[11px] font-semibold text-ink70 hover:bg-cream"
              >
                <Settings size={15} />
                {lang === "fa" ? "تنظیمات و پروفایل" : "Profile & settings"}
              </Link>
              <Link
                role="menuitem"
                href={href("/dashboard/tickets")}
                onClick={() => setShowAccountMenu(false)}
                className="flex items-center gap-2.5 border-t border-line px-4 py-3 text-[11px] font-semibold text-ink70 hover:bg-cream"
              >
                <Ticket size={15} />
                {lang === "fa" ? "کمک و پشتیبانی" : "Help & support"}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
