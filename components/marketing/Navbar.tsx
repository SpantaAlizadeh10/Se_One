"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  ArrowRight,
  User,
  LogOut,
  Menu,
  X,
  Home,
  GraduationCap,
  Briefcase,
  Newspaper,
  Headphones,
  Info,
  ChevronLeft,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { stripLocale } from "@/lib/i18n/paths";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import {
  getRole,
  getName,
  getEmail,
  clearSession,
  dashboardPathFor,
} from "@/lib/auth-client";
import { logoutApi } from "@/lib/api/auth";

export default function Navbar() {
  const { t, href, lang } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const currentPath = stripLocale(pathname || "/");
  const [menuOpen, setMenuOpen] = useState(false);

  const role = getRole();
  const userName = getName();
  const userEmail = getEmail();
  const isLoggedIn = role !== null;

  const navLinks = [
    { label: t("nav.home"), path: "/", icon: Home },
    {
      label: t("nav.courses"),
      path: "/courses",
      hasChevron: true,
      icon: GraduationCap,
    },
    { label: t("nav.teacher"), path: "/become-teacher", icon: Briefcase },
    { label: t("nav.blog"), path: "/blog", icon: Newspaper },
    { label: t("nav.contact"), path: "/contact", icon: Headphones },
    { label: t("nav.about"), path: "/about", icon: Info },
  ];

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    await logoutApi();
    clearSession();
    router.push(href("/login"));
  };

  const handleDashboard = () => {
    if (role) {
      router.push(href(dashboardPathFor(role)));
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-cream shadow-[0_4px_16px_rgba(28,43,68,0.06)]">
      <div className="relative mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:h-[76px] sm:px-8">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={
            lang === "fa"
              ? menuOpen
                ? "بستن منو"
                : "بازکردن منو"
              : menuOpen
                ? "Close menu"
                : "Open menu"
          }
          aria-controls="marketing-navigation"
          aria-expanded={menuOpen}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink70 lg:hidden"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Link href={href("/")} className="hidden lg:block">
          <Image
            src="/images/logo.png"
            alt="SE ONE"
            width={260}
            height={66}
            className="h-12 w-12 rounded-full bg-white object-contain p-1.5 shadow-sm md:h-14 md:w-14"
            sizes="(max-width: 1024px) 180px, 260px"
          />
        </Link>
        <Link
          href={href("/")}
          className="absolute start-1/2 -translate-x-1/2 rtl:translate-x-1/2 lg:hidden"
        >
          <Image
            src="/images/logo.png"
            alt="SE ONE"
            width={180}
            height={48}
            className="h-10 w-10 rounded-full bg-white object-contain p-1.5 shadow-sm"
            sizes="(max-width: 640px) 140px, 180px"
          />
        </Link>

        <nav className="hidden items-center gap-5 text-[13px] font-semibold 2xl:gap-9 2xl:text-[14.5px] lg:flex">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.path ? href(item.path) : "#"}
              className={`flex items-center gap-1 transition-colors ${item.path && currentPath === item.path
                ? "text-goldDeep font-semibold"
                : "text-ink70 hover:text-ink"
                }`}
            >
              {item.label}
              {item.hasChevron && <ChevronDown size={14} />}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher compact />
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <button
                onClick={handleDashboard}
                className="flex min-h-11 items-center gap-2 rounded-full border border-line bg-cream px-3 sm:px-4 text-[13.5px] font-semibold hover:border-ink transition-colors"
              >
                <User size={14} />
                <span className="hidden sm:inline">{userName || "Dashboard"}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-ink70 hover:text-ink text-[13.5px] font-medium transition-colors"
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <Link
              href={href("/login")}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-blue px-3 sm:px-5 text-[13.5px] font-semibold text-white hover:bg-blueDeep transition-colors"
            >
              {t("nav.logIn")} <ArrowRight size={14} className="rtl:rotate-180" />
            </Link>
          )}
        </div>
      </div>
      </header>
      {menuOpen && (
        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          aria-label={lang === "fa" ? "بستن منو" : "Close menu"}
          style={{
            bottom: 0,
          }}
          className="fixed inset-x-0 top-0 z-[60] bg-ink/35 backdrop-blur-sm lg:hidden"
        />
      )}
      <aside
        id="marketing-navigation"
        aria-hidden={!menuOpen}
        style={{
          top: 0,
          bottom: 0,
        }}
        className={`fixed ${
          lang === "fa"
            ? "right-0 rounded-l-[30px]"
            : "left-0 rounded-r-[30px]"
        } z-[70] flex w-[min(56vw,190px)] flex-col overflow-y-auto overscroll-contain border border-line/80 bg-[#F8F7F2] px-3 pt-[max(1rem,env(safe-area-inset-top))] pb-5 shadow-[0_24px_70px_rgba(16,28,54,0.22)] transition-[transform,visibility] duration-300 ease-out lg:hidden ${
          menuOpen
            ? "visible translate-x-0"
            : lang === "fa"
              ? "invisible pointer-events-none translate-x-full"
              : "invisible pointer-events-none -translate-x-full"
        }`}
      >
            <div className="flex min-h-[58px] items-center justify-between border-b border-line/80 pb-3">
              <Link
                href={href("/")}
                onClick={() => setMenuOpen(false)}
                aria-label="SE ONE"
                className="inline-flex items-center gap-2 rounded-full border border-line/80 bg-white py-1 pe-3 ps-1 shadow-sm"
              >
                <Image
                  src="/images/logo.png"
                  alt="SE ONE"
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-contain"
                  priority
                />
                <span className="text-[12px] font-bold tracking-wide text-ink">
                  SE ONE
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label={lang === "fa" ? "بستن منو" : "Close menu"}
                className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-ink70 shadow-sm transition-colors hover:border-blue/30 hover:text-blue"
              >
                <X size={18} />
              </button>
            </div>
            <nav
              aria-label={lang === "fa" ? "منوی اصلی سایت" : "Main navigation"}
              className="mt-5 flex flex-col gap-1.5"
            >
              <p className="mb-1.5 px-2 text-[10px] font-bold tracking-[0.14em] text-muted">
                {lang === "fa" ? "بخش‌های سایت" : "EXPLORE"}
              </p>
              {navLinks.map((item) => {
                const active = item.path === currentPath;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={href(item.path)}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                    className={`group relative flex min-h-[50px] items-center gap-3 rounded-2xl px-2.5 py-2 text-[13px] font-semibold transition-all duration-200 ${
                      active
                        ? "bg-white text-ink shadow-[0_5px_16px_rgba(28,43,68,0.08)] ring-1 ring-blue/10"
                        : "text-ink70 hover:bg-white/80 hover:text-ink"
                    }`}
                  >
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors ${
                        active
                          ? "bg-blue text-white shadow-sm"
                          : "bg-[#EAE8E0] text-blue group-hover:bg-blue/10"
                      }`}
                    >
                      <Icon size={18} strokeWidth={1.9} />
                    </span>
                    <span className="min-w-0 flex-1 truncate leading-snug">
                      {item.label}
                    </span>
                    <ChevronLeft
                      size={15}
                      className={`shrink-0 transition-transform ${
                        active
                          ? "text-blue"
                          : "text-muted/55 group-hover:text-blue"
                      } ${lang === "en" ? "rotate-180" : ""}`}
                    />
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto pt-4">
              {isLoggedIn ? (
                <div className="rounded-[22px] border border-line/80 bg-white p-3 shadow-[0_8px_24px_rgba(28,43,68,0.06)]">
                  <button
                    type="button"
                    onClick={handleDashboard}
                    className="flex w-full min-w-0 items-center gap-2.5 rounded-xl text-start"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#E9EDF8] text-blue">
                      <User size={18} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-bold text-ink">
                        {userName || (lang === "fa" ? "حساب کاربری" : "My account")}
                      </span>
                      {userEmail && (
                        <span
                          className="mt-0.5 block truncate text-[10px] text-muted"
                          dir="ltr"
                        >
                          {userEmail}
                        </span>
                      )}
                    </span>
                  </button>
                  <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line/80 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        handleDashboard();
                        setMenuOpen(false);
                      }}
                      className="flex min-h-10 items-center justify-center gap-1.5 rounded-full bg-cream px-2 text-[11px] font-semibold text-ink70 transition-colors hover:bg-[#ECE9E0]"
                    >
                      <User size={14} aria-hidden="true" />
                      {t("nav.dashboard")}
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex min-h-10 items-center justify-center gap-1.5 rounded-full bg-danger/5 px-2 text-[11px] font-semibold text-danger transition-colors hover:bg-danger/10"
                    >
                      <LogOut size={14} aria-hidden="true" />
                      {t("nav.logout")}
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href={href("/signup")}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-blue px-4 text-[13px] font-bold text-white shadow-[0_8px_18px_rgba(48,77,182,0.18)] transition-colors hover:bg-blueDeep"
                >
                  <GraduationCap size={18} />
                  {t("common.startLearning")}
                  <ArrowRight
                    size={16}
                    className={`ms-auto ${lang === "fa" ? "rotate-180" : ""}`}
                  />
                </Link>
              )}
              <p className="mt-3 text-center text-[10px] font-medium text-muted/80">
                SE ONE
              </p>
            </div>
      </aside>
    </>
  );
}
