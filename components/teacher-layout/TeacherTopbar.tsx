"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell, LayoutGrid, ChevronDown, Menu } from "lucide-react";
import { teacherNavItems } from "@/lib/teacher-nav";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { stripLocale } from "@/lib/i18n/paths";
import { getName } from "@/lib/auth-client";
import { useEffect, useState } from "react";

export default function TeacherTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const current = teacherNavItems.find((i) => i.href === stripLocale(pathname || "/"));
  const [name, setName] = useState("Teacher");

  useEffect(() => {
    const n = getName();
    if (n) setName(n);
  }, []);

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
        <button className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-line flex items-center justify-center text-ink70">
          <Bell size={17} />
          <span className="absolute top-[8px] end-[8px] sm:top-[9px] sm:end-[9px] w-[7px] h-[7px] rounded-full bg-danger border-[1.5px] border-white" />
        </button>
        <button className="hidden sm:flex w-10 h-10 rounded-full bg-white border border-line items-center justify-center text-ink70">
          <LayoutGrid size={17} />
        </button>
        <div className="flex items-center gap-2 sm:gap-2.5 bg-white border border-line rounded-full ps-1 pe-2 sm:pe-3 py-1">
          <Image src="https://i.pravatar.cc/64?img=32" alt={name} width={32} height={32} className="rounded-full object-cover" />
          <div className="hidden sm:block">
            <div className="text-[13.5px] font-semibold leading-tight">{name}</div>
            <div className="text-[11px] text-muted leading-tight">{t("auth.signup.teacher")}</div>
          </div>
          <ChevronDown size={14} className="hidden sm:block" />
        </div>
      </div>
    </div>
  );
}
