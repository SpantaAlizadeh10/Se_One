"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Home,
  BookOpen,
  Users,
  MessageSquareText,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function Footer() {
  const { t, href } = useLanguage();
  const courseLinks: string[] = t("footer.courseLinks");
  const aboutLinks: string[] = t("footer.aboutLinks");
  const resourceLinks: string[] = t("footer.resourceLinks");

  // Most footer categories don't have real pages yet (IELTS Prep, Blog, etc.)
  // — these two are wired to pages that do exist. Matched by array index
  // since the dictionary stores plain translated strings, not paths.
  const aboutHrefs = [
    href("/about"),
    href("/our-instructors"),
    null,
    href("/contact"),
  ]; // "Our Story", "Instructors", "Careers" (no page yet), "Contact"
  const resourceHrefs = [
    null,
    null,
    `${href("/contact")}#faq`,
    href("/privacy-policy"),
  ]; // "FAQ" is third, "Privacy Policy" is last
  const mobileNavItems = [
    { label: t("nav.home"), href: href("/"), icon: Home },
    { label: t("nav.courses"), href: href("/courses"), icon: BookOpen },
    { label: t("nav.teacher"), href: href("/become-teacher"), icon: Users },
    {
      label: t("nav.contact"),
      href: href("/contact"),
      icon: MessageSquareText,
    },
  ];

  const pathname = usePathname();

  const columns = [
    {
      heading: t("footer.courses"),
      links: courseLinks,
      hrefs: [null, null, null, null],
    },
    { heading: t("footer.about"), links: aboutLinks, hrefs: aboutHrefs },
    {
      heading: t("footer.resources"),
      links: resourceLinks,
      hrefs: resourceHrefs,
    },
  ];

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 lg:hidden">
        <div className="mx-auto max-w-md rounded-[24px] border border-line/80 bg-white/90 p-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="grid grid-cols-4 gap-1.5">
            {mobileNavItems.map(({ label, href: itemHref, icon: Icon }) => {
              const isActive = pathname === itemHref;
              return (
                <Link
                  key={label}
                  href={itemHref}
                  className={`group flex flex-col items-center justify-center gap-1 rounded-[18px] px-2 py-2.5 text-[10px] font-semibold transition-all duration-200 ${isActive
                    ? "bg-goldSoft text-goldDeep shadow-sm"
                    : "text-ink70 hover:bg-cream hover:text-ink"
                    }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${isActive ? "bg-white text-goldDeep" : "bg-cream text-ink70 group-hover:text-ink"}`}
                  >
                    <Icon size={16} />
                  </span>
                  <span className="leading-none">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <footer className="border-t border-line mt-6 pb-[84px] lg:pb-0">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-14">
          {/* mobile / tablet: brand full-width, then Courses/About/Resources stay side-by-side */}
          <div className="lg:hidden">
            <div>
              <Link
                href={href("/")}
                className="font-serif font-bold text-[19px] tracking-wide text-goldDeep underline underline-offset-4"
              >
                <Image
                  src="/images/logo.png"
                  alt="SE ONE"
                  width={280}
                  height={100}
                  className="h-12 sm:h-14 w-auto rounded-full object-contain"
                  sizes="(max-width: 640px) 160px, 240px"
                />
              </Link>
              <p className="text-[13px] text-ink70 leading-relaxed mt-4 max-w-[320px]">
                {t("footer.desc")}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-8">
              {columns.map((col) => (
                <div key={col.heading} className="min-w-0">
                  <h4 className="font-serif text-[13.5px] sm:text-[15px] font-semibold mb-3">
                    {col.heading}
                  </h4>
                  <ul className="flex flex-col gap-2">
                    {col.links.map((link, i) => (
                      <li key={link}>
                        <a
                          href={col.hrefs[i] ?? "#"}
                          className="text-[11.5px] sm:text-[13px] text-ink70 hover:text-ink transition-colors leading-snug"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* desktop: original 4-column row */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-10">
            <div>
              <Link
                href={href("/")}
                className="font-serif font-bold text-[19px] tracking-wide text-goldDeep underline underline-offset-4"
              >
                <Image
                  src="/images/logo.png"
                  alt="SE ONE"
                  width={320}
                  height={96}
                  className="h-16 sm:h-18 md:h-20 w-auto rounded-full object-contain"
                  sizes="(max-width: 640px) 180px, (max-width: 1024px) 260px, 320px"
                />
              </Link>
              <p className="text-[13px] text-ink70 leading-relaxed mt-4 max-w-[260px]">
                {t("footer.desc")}
              </p>
            </div>

            {columns.map((col) => (
              <div key={col.heading}>
                <h4 className="font-serif text-[15.5px] font-semibold mb-4">
                  {col.heading}
                </h4>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map((link, i) => (
                    <li key={link}>
                      <a
                        href={col.hrefs[i] ?? "#"}
                        className="text-[13px] text-ink70 hover:text-ink transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-line">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-ink text-white flex items-center justify-center hover:bg-blueDeep transition-colors"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
            <p className="text-[12.5px] text-muted">{t("footer.credit")}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
