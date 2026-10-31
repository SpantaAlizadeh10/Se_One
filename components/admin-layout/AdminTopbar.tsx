"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LayoutGrid, ChevronDown, Menu, X } from "lucide-react";
import { adminNavItems } from "@/lib/admin-nav";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { stripLocale } from "@/lib/i18n/paths";
import { getName } from "@/lib/auth-client";
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
  const { t, lang } = useLanguage();
  const current = adminNavItems.find(
    (i) => i.href === stripLocale(pathname || "/"),
  );
  const [name, setName] = useState("Admin");
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

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

  return (
    <div className="flex items-center justify-between gap-3 mb-6 lg:mb-7">
      <div className="flex items-center gap-3 min-w-0">
        {!isMenuOpen && (
          <button
            onClick={onMenuClick}
            type="button"
            aria-label="Open menu"
            aria-controls="admin-dashboard-sidebar"
            aria-expanded={false}
            className="relative z-[60] lg:hidden w-10 h-10 shrink-0 rounded-full bg-white border border-line flex items-center justify-center text-ink70 shadow-sm"
          >
            <Menu size={18} />
          </button>
        )}
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
        <div className="flex items-center gap-2 sm:gap-2.5 bg-white border border-line rounded-full ps-1 pe-2 sm:pe-3 py-1">
          <Image
            src="https://i.pravatar.cc/64?img=5"
            alt={name}
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
          <div className="hidden sm:block">
            <div className="text-[13.5px] font-semibold leading-tight">
              {name}
            </div>
            <div className="text-[11px] text-muted leading-tight">
              {t("adminNav.badge")}
            </div>
          </div>
          <ChevronDown size={14} className="hidden sm:block" />
        </div>
      </div>
    </div>
  );
}
