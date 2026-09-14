"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { stripLocale } from "@/lib/i18n/paths";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";

export default function Navbar() {
  const { t, href } = useLanguage();
  const pathname = usePathname();
  const currentPath = stripLocale(pathname || "/");

  const navLinks = [
    { label: t("nav.home"), path: "/" },
    { label: t("nav.courses"), path: "/courses", hasChevron: true },
    { label: t("nav.teacher"), path: "/become-teacher" },
    { label: t("nav.blog"), path: "/blog" },
    { label: t("nav.contact"), path: "/contact" },
    { label: t("nav.about"), path: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur border-b border-line">
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 h-[76px] flex items-center justify-between">
        <Link href={href("/")} className="hidden lg:block">
          <Image
            src="/images/logo.png"
            alt="SE ONE"
            width={260}
            height={66}
            className="h-12 md:h-14 w-auto"
            sizes="(max-width: 1024px) 180px, 260px"
          />
        </Link>
        <Link
          href={href("/")}
          className="lg:hidden absolute start-1/2 -translate-x-1/2 rtl:translate-x-1/2"
        >
          <Image
            src="/images/logo.png"
            alt="SE ONE"
            width={180}
            height={48}
            className="h-10 w-auto"
            sizes="(max-width: 640px) 140px, 180px"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-9 text-[14.5px] font-medium">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.path ? href(item.path) : "#"}
              className={`flex items-center gap-1 transition-colors ${item.path && currentPath === item.path
                ? "text-gold font-semibold"
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
          <Link
            href={href("/login")}
            className="inline-flex items-center gap-2 bg-blue text-white px-5 py-2.5 rounded-full text-[13.5px] font-semibold hover:bg-blueDeep transition-colors"
          >
            {t("nav.logIn")} <ArrowRight size={14} className="rtl:rotate-180" />
          </Link>
        </div>

      </div>

    </header>
  );
}
