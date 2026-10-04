"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Menu,
  X,
  UserRound,
  MessageSquare,
  CalendarDays,
  LogOut,
} from "lucide-react";
import { teacherNavItems } from "@/lib/teacher-nav";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { stripLocale } from "@/lib/i18n/paths";
import { clearSession, getEmail, getName } from "@/lib/auth-client";
import { fetchCurrentUser, logoutApi } from "@/lib/api/auth";
import { getTeacherProfile } from "@/lib/api/teacher-profile";
import {
  getNotifications,
  getNotificationStats,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type Notification,
} from "@/lib/api/notifications";
import { isApiConfigured } from "@/lib/is-api-configured";

export default function TeacherTopbar({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, href } = useLanguage();
  const current = teacherNavItems.find(
    (i) => i.href === stripLocale(pathname || "/"),
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const n = getName();
    if (n && n.trim().toLowerCase() !== "teacher") setName(n);
    setEmail(getEmail() || "");

    if (!isApiConfigured()) return;
    let active = true;
    Promise.allSettled([getTeacherProfile(), fetchCurrentUser()]).then(
      ([profileResult, userResult]) => {
        if (!active) return;
        if (profileResult.status === "fulfilled") {
          const profile = profileResult.value;
          if (profile.fullName) setName(profile.fullName);
          if (profile.email) setEmail(profile.email);
          if (profile.avatarUrl) setAvatarUrl(profile.avatarUrl);
        }
        if (userResult.status === "fulfilled") {
          const user = userResult.value;
          setName((currentName) => currentName || user.fullName);
          setEmail((currentEmail) => currentEmail || user.email);
        }
      },
    );
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!showAccountMenu) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node))
        setShowAccountMenu(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowAccountMenu(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [showAccountMenu]);

  useEffect(() => {
    if (!isApiConfigured()) return;

    const loadNotifications = async () => {
      try {
        const [stats, items] = await Promise.all([
          getNotificationStats(),
          getNotifications({ limit: 6 }),
        ]);
        setUnreadCount(stats.unread);
        setNotifications(items);
      } catch (error) {
        console.error("Failed to load notifications:", error);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setUnreadCount(0);
      setNotifications((items) =>
        items.map((item) => ({ ...item, isRead: true })),
      );
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleMarkRead = async (notification: Notification) => {
    if (notification.isRead) return;
    try {
      await markNotificationAsRead(notification.id);
      setNotifications((items) =>
        items.map((item) =>
          item.id === notification.id ? { ...item, isRead: true } : item,
        ),
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logoutApi();
    clearSession();
    router.push(href("/login"));
  };

  return (
    <div className="flex items-center justify-between gap-3 mb-6 lg:mb-7">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="lg:hidden w-10 h-10 shrink-0 rounded-full bg-white border border-line flex items-center justify-center text-ink70"
        >
          <Menu size={18} />
        </button>
        <h1 className="text-[19px] sm:text-[22px] font-semibold m-0 truncate">
          {current ? t(current.titleKey) : t("teacherNav.titles.overview")}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="relative">
          <button
            onClick={() => {
              setShowAccountMenu(false);
              setShowNotifications((open) => !open);
            }}
            aria-label={t("teacherNotifications.title")}
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
                <h3 className="text-[13.5px] font-semibold">
                  {t("teacherNotifications.title")}
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[12px] text-blue hover:text-blueDeep font-medium"
                  >
                    {t("teacherNotifications.markAllRead")}
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="p-5 text-center text-muted text-[13px]">
                  {t("teacherNotifications.empty")}
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto divide-y divide-line">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => handleMarkRead(notification)}
                      className={`w-full px-4 py-3 text-start hover:bg-cream ${notification.isRead ? "bg-white" : "bg-blue/5"}`}
                    >
                      <span className="flex items-start gap-2">
                        <span
                          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.isRead ? "bg-transparent" : "bg-blue"}`}
                        />
                        <span className="min-w-0">
                          <span className="block text-[12.5px] font-semibold text-ink">
                            {notification.title}
                          </span>
                          <span className="mt-0.5 block text-[11.5px] leading-relaxed text-muted">
                            {notification.message}
                          </span>
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => setShowNotifications(false)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-cream"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
        <div className="relative" ref={accountMenuRef}>
          <button
            type="button"
            onClick={() => {
              setShowNotifications(false);
              setShowAccountMenu((open) => !open);
            }}
            aria-label={t("teacherAccountMenu.open")}
            aria-haspopup="menu"
            aria-expanded={showAccountMenu}
            className="flex items-center gap-2 sm:gap-2.5 bg-white border border-line rounded-full ps-1 pe-2 sm:pe-3 py-1 hover:border-ink transition-colors"
          >
            <Image
              src={avatarUrl || "https://i.pravatar.cc/64?img=32"}
              alt={name}
              width={32}
              height={32}
              unoptimized
              className="rounded-full object-cover"
            />
            <div className="hidden sm:block text-start">
              <div className="text-[13.5px] font-semibold leading-tight">
                {name || email || t("teacherAccountMenu.profileNameLoading")}
              </div>
            </div>
            <ChevronDown
              size={14}
              className={`hidden sm:block transition-transform ${showAccountMenu ? "rotate-180" : ""}`}
            />
          </button>

          {showAccountMenu && (
            <div
              role="menu"
              className="absolute end-0 top-full mt-2 w-64 overflow-hidden rounded-xl border border-line bg-white shadow-card z-50"
            >
              <div className="border-b border-line px-4 py-3.5">
                <div className="text-[13.5px] font-semibold text-ink truncate">
                  {name}
                </div>
                {email && (
                  <div
                    className="mt-0.5 text-[11.5px] text-muted truncate"
                    dir="ltr"
                  >
                    {email}
                  </div>
                )}
                <div className="mt-1 text-[11px] text-muted">
                  {t("auth.signup.teacher")}
                </div>
              </div>
              <div className="p-1.5">
                <Link
                  href={href("/teacher/settings")}
                  role="menuitem"
                  onClick={() => setShowAccountMenu(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-ink70 hover:bg-cream hover:text-ink"
                >
                  <UserRound size={16} />
                  {t("teacherAccountMenu.profileSettings")}
                </Link>
                <Link
                  href={href("/teacher/messages")}
                  role="menuitem"
                  onClick={() => setShowAccountMenu(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-ink70 hover:bg-cream hover:text-ink"
                >
                  <MessageSquare size={16} />
                  {t("teacherAccountMenu.messages")}
                </Link>
                <Link
                  href={href("/teacher/schedule")}
                  role="menuitem"
                  onClick={() => setShowAccountMenu(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-ink70 hover:bg-cream hover:text-ink"
                >
                  <CalendarDays size={16} />
                  {t("teacherAccountMenu.schedule")}
                </Link>
              </div>
              <div className="border-t border-line p-1.5">
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-danger hover:bg-danger/10 disabled:opacity-60"
                >
                  <LogOut size={16} />
                  {loggingOut
                    ? t("teacherAccountMenu.signingOut")
                    : t("teacherAccountMenu.signOut")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
