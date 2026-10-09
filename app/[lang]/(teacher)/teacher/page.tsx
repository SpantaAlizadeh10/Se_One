"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  CalendarDays,
  Clock,
  Star,
  ArrowRight,
  WalletCards,
  ArrowDownToLine,
  Video,
  MessageSquare,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import AnnouncementsFeed from "@/components/dashboard/AnnouncementsFeed";
import TeacherGrowthTrack from "@/components/teacher-dashboard/TeacherGrowthTrack";
import LiveDashboardCalendar from "@/components/dashboard/LiveDashboardCalendar";
import { getName } from "@/lib/auth-client";
import {
  getTeacherDashboardOverview,
  requestTeacherWithdrawal,
  type TeacherClass,
  type TeacherAnalytics,
  type TeacherEarnings,
} from "@/lib/api/teacher-dashboard";

export default function TeacherOverviewPage() {
  const { t, href } = useLanguage();
  const d = t("teacherDashboard");
  const [name, setName] = useState("Teacher");
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [analytics, setAnalytics] = useState<TeacherAnalytics | null>(null);
  const [earnings, setEarnings] = useState<TeacherEarnings | null>(null);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [iban, setIban] = useState("");
  const [withdrawalState, setWithdrawalState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [withdrawalError, setWithdrawalError] = useState("");
  const { lang } = useLanguage();

  useEffect(() => {
    const n = getName();
    if (n) setName(n);
    let active = true;
    getTeacherDashboardOverview()
      .then((overview) => {
        if (active) {
          setClasses(overview.classes);
          setAnalytics(overview.analytics);
          setEarnings(overview.earnings);
        }
      })
      .catch(() => {
        if (active) {
          setClasses([]);
          setAnalytics(null);
          setEarnings(null);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const monthlyEarnings =
    earnings?.totalEarnings ?? analytics?.currentMonthEarnings ?? 0;
  const availableBalance = earnings?.availableBalance ?? 0;
  const formatNumber = (value: number) =>
    new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US").format(value);
  const currency = earnings?.currency || "IRR";
  const upcomingClasses = classes
    .filter((item) => item.status === "scheduled" || item.status === "ongoing")
    .map((item) => {
      const parsedDate = new Date(item.scheduledDate);
      if (
        item.scheduledDate &&
        !Number.isNaN(parsedDate.getTime()) &&
        item.startTime &&
        /^\d{1,2}:\d{2}/.test(item.startTime)
      ) {
        const [hours, minutes] = item.startTime.split(":").map(Number);
        parsedDate.setHours(hours, minutes, 0, 0);
      }
      return { item, startsAt: parsedDate };
    })
    .filter(
      ({ startsAt }) =>
        !Number.isNaN(startsAt.getTime()) &&
        startsAt.getTime() > Date.now() - 60 * 60 * 1000,
    )
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
    .slice(0, 3);

  const submitWithdrawal = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(withdrawalAmount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > availableBalance) {
      setWithdrawalState("error");
      setWithdrawalError(d.earnings.invalidAmount);
      return;
    }

    setWithdrawalState("submitting");
    setWithdrawalError("");
    try {
      await requestTeacherWithdrawal(amount, iban.trim());
      setWithdrawalState("success");
      setWithdrawalAmount("");
      getTeacherDashboardOverview()
        .then((overview) => {
          setEarnings(overview.earnings);
          setAnalytics(overview.analytics);
        })
        .catch(() => {
          // Keep the accepted request state if the balance refresh fails.
        });
    } catch (error) {
      setWithdrawalState("error");
      setWithdrawalError(
        error instanceof Error ? error.message : d.earnings.requestFailed,
      );
    }
  };

  const stats = [
    {
      label: d.stats.students,
      value: analytics?.totalStudents ?? "—",
      icon: Users,
      bg: "bg-[#E4ECFF]",
      text: "text-blue",
    },
    {
      label: d.stats.classesToday,
      value: analytics?.upcomingClasses ?? "—",
      icon: CalendarDays,
      bg: "bg-sage",
      text: "text-sageDeep",
    },
    {
      label: d.stats.hoursWeek,
      value: analytics?.totalHoursTaught ?? "—",
      icon: Clock,
      bg: "bg-goldSoft",
      text: "text-goldDeep",
    },
    {
      label: d.stats.rating,
      value: analytics?.averageRating ?? "—",
      icon: Star,
      bg: "bg-peach",
      text: "text-peachDeep",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-[24px] sm:text-[27px] font-semibold mb-1">
          {d.welcome}, {name} 👋
        </h2>
        <p className="text-muted text-[14px] m-0">{d.sub}</p>
      </div>

      <AnnouncementsFeed lang={lang} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
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

      <TeacherGrowthTrack analytics={analytics} />

      <section className="grid lg:grid-cols-[0.85fr_1.15fr] gap-4 mb-8">
        <div className="rounded-xl bg-ink text-white p-5 sm:p-6 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[13px] text-white/70 m-0">
                {d.earnings.monthlyTitle}
              </p>
              <h3 className="font-serif text-2xl sm:text-[30px] font-semibold mt-2 mb-1">
                {formatNumber(monthlyEarnings)}{" "}
                <span className="font-sans text-sm font-medium text-white/70">
                  {currency}
                </span>
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#E7C98A]">
              <WalletCards size={23} />
            </div>
          </div>
          <div className="flex gap-6 mt-6 pt-4 border-t border-white/15">
            <div>
              <div className="font-semibold">
                {formatNumber(earnings?.totalHours ?? 0)}
              </div>
              <div className="text-[11px] text-white/65 mt-1">
                {d.earnings.hoursThisMonth}
              </div>
            </div>
            <div>
              <div className="font-semibold">
                {formatNumber(earnings?.completedClasses ?? 0)}
              </div>
              <div className="text-[11px] text-white/65 mt-1">
                {d.earnings.classesThisMonth}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-line rounded-xl p-5 sm:p-6 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-[11px] bg-sage flex items-center justify-center text-sageDeep">
              <ArrowDownToLine size={19} />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold m-0">
                {d.earnings.withdrawTitle}
              </h3>
              <p className="text-[12px] text-muted m-0 mt-1">
                {d.earnings.available}: {formatNumber(availableBalance)}{" "}
                {currency}
              </p>
            </div>
          </div>
          <form
            onSubmit={submitWithdrawal}
            className="grid sm:grid-cols-2 gap-3"
          >
            <label className="text-[12px] font-medium text-ink70">
              {d.earnings.amount}
              <input
                type="number"
                min="1"
                max={availableBalance}
                step="1"
                required
                value={withdrawalAmount}
                onChange={(event) => {
                  setWithdrawalAmount(event.target.value);
                  setWithdrawalState("idle");
                }}
                placeholder={d.earnings.amountPlaceholder}
                className="mt-1.5 w-full rounded-lg border border-line px-3 py-2.5 text-[13px] text-ink outline-none focus:border-blue"
              />
            </label>
            <label className="text-[12px] font-medium text-ink70">
              {d.earnings.iban}
              <input
                type="text"
                required
                value={iban}
                onChange={(event) => {
                  setIban(event.target.value);
                  setWithdrawalState("idle");
                }}
                placeholder={d.earnings.ibanPlaceholder}
                dir="ltr"
                className="mt-1.5 w-full rounded-lg border border-line px-3 py-2.5 text-[13px] text-ink outline-none focus:border-blue"
              />
            </label>
            <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={
                  withdrawalState === "submitting" || availableBalance <= 0
                }
                className="rounded-lg bg-blue px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {withdrawalState === "submitting"
                  ? d.earnings.sending
                  : d.earnings.requestButton}
              </button>
              {availableBalance <= 0 && withdrawalState !== "submitting" && (
                <p className="text-[12px] text-muted m-0">
                  {d.earnings.noAvailableBalance}
                </p>
              )}
              {withdrawalState === "success" && (
                <p role="status" className="text-[12px] text-sageDeep m-0">
                  {d.earnings.requestSuccess}
                </p>
              )}
              {withdrawalState === "error" && (
                <p role="alert" className="text-[12px] text-danger m-0">
                  {withdrawalError}
                </p>
              )}
            </div>
          </form>
        </div>
      </section>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[18px] font-semibold m-0">
          {lang === "fa" ? "کلاس‌های پیش رو" : "Upcoming classes"}
        </h3>
        <Link
          href={href("/teacher/schedule")}
          className="text-[13px] font-semibold text-blue flex items-center gap-1"
        >
          {d.seeSchedule} <ArrowRight size={13} className="rtl:rotate-180" />
        </Link>
      </div>

      <div className="bg-white border border-line rounded-lg shadow-card divide-y divide-line">
        {upcomingClasses.map(({ item: c, startsAt }) => (
          <div key={c.id} className="flex flex-wrap items-center gap-4 p-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#CFE7E4] to-[#9FCFC9] flex items-center justify-center shrink-0 text-white">
              <CalendarDays size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold truncate">
                {c.courseTitle}
              </div>
              <div className="text-[12px] text-muted">
                {c.subject} · {c.studentName}
              </div>
            </div>
            <div className="text-end shrink-0">
              <div className="text-[13px] font-bold">{c.startTime}</div>
              <div className="text-[11px] text-muted">
                {c.scheduledDate
                  ? startsAt.toLocaleDateString(
                      lang === "fa" ? "fa-IR" : "en-US",
                    )
                  : ""}
              </div>
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              {c.meetingUrl && /^https:\/\//i.test(c.meetingUrl) ? (
                <a
                  href={c.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue px-3 py-2 text-[11px] font-semibold text-white hover:bg-blueDeep sm:flex-none"
                >
                  <Video size={14} />
                  {lang === "fa" ? "ورود به کلاس" : "Join class"}
                </a>
              ) : null}
              <Link
                href={href("/teacher/messages")}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line px-3 py-2 text-[11px] font-semibold text-ink70 hover:bg-cream sm:flex-none"
              >
                <MessageSquare size={14} />
                {lang === "fa" ? "پیام‌ها" : "Messages"}
              </Link>
            </div>
          </div>
        ))}
        {upcomingClasses.length === 0 && (
          <div className="p-6 text-center">
            <CalendarDays size={22} className="mx-auto mb-2 text-muted" />
            <p className="m-0 text-[12px] font-semibold">
              {lang === "fa"
                ? "کلاس برنامه‌ریزی‌شده‌ای نداری."
                : "No upcoming classes yet."}
            </p>
            <p className="mb-3 mt-1 text-[11px] text-muted">
              {lang === "fa"
                ? "زمان‌بندی‌ات را تنظیم کن تا زبان‌آموزها بتوانند کلاس رزرو کنند."
                : "Set your availability so students can book a class."}
            </p>
            <Link
              href={href("/teacher/availability")}
              className="inline-flex items-center rounded-lg bg-blue px-3 py-2 text-[11px] font-semibold text-white"
            >
              {lang === "fa" ? "تنظیم زمان‌های آزاد" : "Set availability"}
            </Link>
          </div>
        )}
      </div>

      <div className="mt-6">
        <LiveDashboardCalendar audience="teacher" />
      </div>
    </div>
  );
}
