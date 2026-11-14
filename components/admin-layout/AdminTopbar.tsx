"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  LayoutGrid,
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { adminNavItems } from "@/lib/admin-nav";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { stripLocale } from "@/lib/i18n/paths";
import { clearSession, getName } from "@/lib/auth-client";
import { logoutApi } from "@/lib/api/auth";
import {
  getNotifications,
  getNotificationStats,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type Notification,
} from "@/lib/api/notifications";
import { isApiConfigured } from "@/lib/is-api-configured";

export default function AdminTopbar({
  onMenuClick,
  isMenuOpen = false,
}: {
  onMenuClick: () => void;
  isMenuOpen?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, lang, href } = useLanguage();
  const current = adminNavItems.find(
    (i) => i.href === stripLocale(pathname || "/"),
  );
  const [name, setName] = useState("Admin");
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const n = getName();
    if (n) setName(n);
  }, []);

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

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
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
    }

    setShowNotifications(false);
    if (
      notification.actionUrl?.startsWith("/") &&
      !notification.actionUrl.startsWith("//")
    ) {
      router.push(notification.actionUrl);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Failed to log out:", error);
    } finally {
      localStorage.removeItem("se-one-admin-session");
      clearSession();
      router.push(href("/admin-login"));
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 mb-6 lg:mb-7">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          type="button"
          aria-label={
            lang === "fa"
              ? isMenuOpen
                ? "بستن منو"
                : "بازکردن منو"
              : isMenuOpen
                ? "Close menu"
                : "Open menu"
          }
          aria-controls="admin-dashboard-sidebar"
          aria-expanded={isMenuOpen}
          className={`relative z-[60] grid h-12 w-12 shrink-0 place-items-center rounded-2xl border shadow-card transition-all lg:hidden ${isMenuOpen ? "border-blue bg-blue text-white" : "border-line bg-gradient-to-br from-[#FCFBF8] to-[#F0F2F9] text-blue hover:border-blue/40 hover:shadow-md"}`}
        >
          {isMenuOpen ? <X size={19} /> : <Menu size={20} />}
        </button>
        <h1 className="text-[19px] sm:text-[22px] font-semibold m-0 truncate">
          {current ? t(current.titleKey) : t("adminNav.titles.overview")}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
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
              {notifications.length === 0 ? (
                <div className="p-5 text-center text-muted text-[13px]">
                  {lang === "fa"
                    ? "اعلان جدیدی ندارید"
                    : "No new notifications"}
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto divide-y divide-line">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => void handleNotificationClick(notification)}
                      className={`w-full px-4 py-3 text-start transition-colors hover:bg-cream ${notification.isRead ? "bg-white" : "bg-blue/5"}`}
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
        <button className="hidden sm:flex w-10 h-10 rounded-full bg-white border border-line items-center justify-center text-ink70">
          <LayoutGrid size={17} />
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu((visible) => !visible)}
            aria-label={lang === "fa" ? "منوی حساب مدیر" : "Admin account menu"}
            aria-haspopup="menu"
            aria-expanded={showProfileMenu}
            className="flex items-center gap-2 rounded-full border border-line bg-white py-1 ps-1 pe-2 transition-colors hover:border-ink sm:gap-2.5 sm:pe-3"
          >
            <Image
              src="https://i.pravatar.cc/64?img=5"
              alt={name}
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
            <span className="hidden text-start sm:block">
              <span className="block text-[13.5px] font-semibold leading-tight">
                {name}
              </span>
              <span className="block text-[11px] leading-tight text-muted">
                {t("adminNav.badge")}
              </span>
            </span>
            <ChevronDown
              size={14}
              className={`hidden transition-transform sm:block ${showProfileMenu ? "rotate-180" : ""}`}
            />
          </button>
          {showProfileMenu && (
            <div
              role="menu"
              className="absolute end-0 top-full z-[70] mt-2 w-52 overflow-hidden rounded-xl border border-line bg-white p-1.5 shadow-card"
            >
              <div className="border-b border-line px-3 py-2">
                <div className="truncate text-[12px] font-semibold">{name}</div>
                <div className="text-[10px] text-muted">
                  {t("adminNav.badge")}
                </div>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setShowProfileMenu(false);
                  router.push(href("/admin/settings"));
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-start text-[12px] text-ink70 hover:bg-cream"
              >
                <Settings size={15} />
                {lang === "fa" ? "تنظیمات حساب" : "Account settings"}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => void handleLogout()}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-start text-[12px] text-danger hover:bg-danger/5"
              >
                <LogOut size={15} />
                {t("adminNav.logout")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
