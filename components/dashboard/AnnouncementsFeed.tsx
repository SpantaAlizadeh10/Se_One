"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Check, ExternalLink, Megaphone, X } from "lucide-react";
import {
  getDashboardAnnouncements,
  markAnnouncementRead,
  dismissAnnouncement,
  type Announcement,
} from "@/lib/api/announcements";
import { isApiConfigured } from "@/lib/is-api-configured";

export default function AnnouncementsFeed({ lang }: { lang: "fa" | "en" }) {
  const fa = lang === "fa";
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isApiConfigured()) {
      setLoading(false);
      return;
    }
    try {
      const announcements = await getDashboardAnnouncements(5);
      setItems(announcements.filter((item) => !item.isDismissed));
    } catch {
      // Keep the dashboard useful when announcements are not enabled on the API yet.
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const markRead = async (item: Announcement) => {
    if (item.isRead) return;
    setItems((current) =>
      current.map((entry) =>
        entry.id === item.id ? { ...entry, isRead: true } : entry,
      ),
    );
    try {
      await markAnnouncementRead(item.id);
    } catch {
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id ? { ...entry, isRead: false } : entry,
        ),
      );
    }
  };

  const dismiss = async (item: Announcement) => {
    setItems((current) => current.filter((entry) => entry.id !== item.id));
    try {
      await dismissAnnouncement(item.id);
    } catch {
      setItems((current) =>
        [item, ...current].sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt),
        ),
      );
    }
  };

  if (loading || items.length === 0) return null;

  const styleByKind = {
    info: "border-blue/20 bg-blue/[0.04]",
    success: "border-sage/60 bg-sage/30",
    warning: "border-gold/40 bg-goldSoft/50",
    urgent: "border-danger/25 bg-danger/[0.04]",
  };
  const iconByKind = {
    info: "text-blue",
    success: "text-sageDeep",
    warning: "text-goldDeep",
    urgent: "text-danger",
  };

  return (
    <section
      aria-label={fa ? "اطلاعیه‌های جدید" : "Latest announcements"}
      className="mb-6 space-y-3"
    >
      {items.map((item) => {
        const external = Boolean(
          item.actionUrl && /^https?:\/\//i.test(item.actionUrl),
        );
        return (
          <article
            key={item.id}
            className={`flex items-start gap-3 rounded-2xl border p-4 transition-shadow hover:shadow-card ${styleByKind[item.kind]} ${item.isRead ? "opacity-90" : ""}`}
          >
            <div
              className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 ${iconByKind[item.kind]}`}
            >
              {item.kind === "urgent" ? (
                <Bell size={18} />
              ) : (
                <Megaphone size={18} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="m-0 text-[14px] font-semibold">{item.title}</h3>
                {!item.isRead && (
                  <span className="rounded-full bg-blue px-2 py-0.5 text-[9px] font-bold text-white">
                    {fa ? "جدید" : "NEW"}
                  </span>
                )}
              </div>
              <p className="mb-0 mt-1 whitespace-pre-wrap text-[12.5px] leading-6 text-ink70">
                {item.message}
              </p>
              {item.actionUrl &&
                item.actionLabel &&
                (external ? (
                  <a
                    href={item.actionUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => void markRead(item)}
                    className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-blue"
                  >
                    {item.actionLabel}
                    <ExternalLink size={13} />
                  </a>
                ) : (
                  <Link
                    href={item.actionUrl}
                    onClick={() => void markRead(item)}
                    className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-blue"
                  >
                    {item.actionLabel}
                    <span aria-hidden="true">←</span>
                  </Link>
                ))}
              {item.expiresAt && (
                <span className="mt-1 block text-[10px] text-muted">
                  {fa ? "تا " : "Available until "}
                  {new Date(item.expiresAt).toLocaleDateString(
                    fa ? "fa-IR" : "en-US",
                  )}
                </span>
              )}
            </div>
            {!item.isRead && (
              <button
                type="button"
                title={fa ? "خوانده شد" : "Mark as read"}
                aria-label={
                  fa ? "علامت‌گذاری به‌عنوان خوانده‌شده" : "Mark as read"
                }
                onClick={() => void markRead(item)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-blue transition-colors hover:bg-white"
              >
                <Check size={16} />
              </button>
            )}
            <button
              type="button"
              aria-label={fa ? "بستن اطلاعیه" : "Dismiss announcement"}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void dismiss(item);
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-white hover:text-ink"
            >
              <X size={16} />
            </button>
          </article>
        );
      })}
    </section>
  );
}
