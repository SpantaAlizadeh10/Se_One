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
  const germanLinks: string[] = t("footer.germanLinks");
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
    href("/blog"),
    null,
    `${href("/contact")}#faq`,
    href("/privacy-policy"),
  ]; // "Blog" is first, "FAQ" is third, "Privacy Policy" is last
  const mobileNavItems = [
    { label: t("nav.home"), href: href("/"), icon: Home },
    { label: t("nav.courses"), href: href("/courses"), icon: BookOpen },
    { label: t("nav.blog"), href: href("/blog"), icon: BookOpen },
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
      hrefs: [
        href("/courses/ielts"),
        null,
        href("/courses/beginners"),
      ],
    },
    {
      heading: t("footer.germanCourses"),
      links: germanLinks,
      hrefs: [
        href("/courses/german-a1"),
        href("/courses/german-a2"),
        href("/courses/german-b1"),
        href("/courses/free-discussion"),
      ],
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
        <div className="mx-auto max-w-md rounded-[24px] border border-white/20 bg-[#182163]/95 p-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="grid grid-cols-5 gap-1">
            {mobileNavItems.map(({ label, href: itemHref, icon: Icon }) => {
              const isActive = pathname === itemHref;
              return (
                <Link
                  key={label}
                  href={itemHref}
                  className={`group flex flex-col items-center justify-center gap-1 rounded-[18px] px-1.5 py-2.5 text-[9px] font-semibold transition-all duration-200 ${isActive
                    ? "bg-white text-[#182163] shadow-sm"
                    : "text-white hover:bg-white/20"
                    }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full ${isActive ? "bg-[#182163] text-white" : "bg-white/20 text-white group-hover:bg-white/30"}`}
                  >
                    <Icon size={14} />
                  </span>
                  <span className="leading-none">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <footer className="border-t border-line mt-6 pb-[84px] lg:pb-0 bg-gradient-to-br from-[#182163] via-[#1a2e5a] to-[#182163]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-14">
          {/* mobile / tablet: brand full-width, then Courses/About/Resources stay side-by-side */}
          <div className="lg:hidden">
            <div>
              <Link
                href={href("/")}
                className="font-serif font-bold text-[19px] tracking-wide text-white underline underline-offset-4"
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
              <p className="text-[13px] text-white/80 leading-relaxed mt-4 max-w-[320px]">
                {t("footer.desc")}
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mt-8">
              {columns.map((col) => (
                <div key={col.heading} className="min-w-0">
                  <h4 className="font-serif text-[13.5px] sm:text-[15px] font-semibold mb-4 text-white relative inline-block">
                    {col.heading}
                    <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-gold rounded-full"></span>
                  </h4>
                  <ul className="flex flex-col gap-2.5">
                    {col.links.map((link, i) => (
                      <li key={link}>
                        <a
                          href={col.hrefs[i] ?? "#"}
                          className="text-[11.5px] sm:text-[13px] text-white/70 hover:text-gold hover:translate-x-1 transition-all duration-300 leading-snug"
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
          <div className="hidden lg:grid lg:grid-cols-5 gap-10">
            <div>
              <Link
                href={href("/")}
                className="font-serif font-bold text-[19px] tracking-wide text-white underline underline-offset-4"
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
              <p className="text-[13px] text-white/80 leading-relaxed mt-4 max-w-[260px]">
                {t("footer.desc")}
              </p>
            </div>

            {columns.map((col) => (
              <div key={col.heading}>
                <h4 className="font-serif text-[15.5px] font-semibold mb-4 text-white relative inline-block">
                  {col.heading}
                  <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-gold rounded-full"></span>
                </h4>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map((link, i) => (
                    <li key={link}>
                      <a
                        href={col.hrefs[i] ?? "#"}
                        className="text-[13px] text-white/70 hover:text-gold hover:translate-x-1 transition-all duration-300"
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

        <div className="border-t border-white/10 bg-[#121c42]">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-gold hover:text-white transition-all duration-300 transform hover:scale-110"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
            <p className="text-[12.5px] text-white/60">{t("footer.credit")}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
