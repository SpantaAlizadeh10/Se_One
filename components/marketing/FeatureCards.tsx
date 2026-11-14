"use client";

import { useEffect, useRef, useState } from "react";
import { Lightbulb, Search, ClipboardCheck, Leaf } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const icons = [Lightbulb, Search, ClipboardCheck, Leaf];
const iconStyles = [
  "bg-[#E8ECF8] text-blue",
  "bg-[#F7EEDB] text-[#85652B]",
  "bg-[#E6F0EB] text-[#376B52]",
  "bg-[#EEEAF4] text-[#66527F]",
];

export default function FeatureCards() {
  const { t, dir } = useLanguage();
  const features: { title: string; desc: string }[] = t("home.features");
  const railRef = useRef<HTMLDivElement>(null);
  const [scrollIndicator, setScrollIndicator] = useState({
    visible: false,
    width: 0,
    offset: 0,
  });

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const updateScrollIndicator = () => {
      const maxScroll = rail.scrollWidth - rail.clientWidth;
      if (maxScroll <= 0) {
        setScrollIndicator({ visible: false, width: 0, offset: 0 });
        return;
      }

      const width = Math.min(1, rail.clientWidth / rail.scrollWidth);
      const rawPosition =
        dir === "rtl" ? Math.abs(rail.scrollLeft) : rail.scrollLeft;
      const progress = Math.min(1, Math.max(0, rawPosition / maxScroll));
      setScrollIndicator({
        visible: true,
        width,
        offset: progress * (1 - width),
      });
    };

    updateScrollIndicator();
    rail.addEventListener("scroll", updateScrollIndicator, { passive: true });
    window.addEventListener("resize", updateScrollIndicator);
    return () => {
      rail.removeEventListener("scroll", updateScrollIndicator);
      window.removeEventListener("resize", updateScrollIndicator);
    };
  }, [dir, features.length]);

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
      <div
        ref={railRef}
        dir={dir}
        role="region"
        aria-label={dir === "rtl" ? "ویژگی‌های دوره‌های آموزشی" : "Learning features"}
        tabIndex={0}
        className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 -mx-5 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-4"
      >
        {features.map((card, i) => {
          const Icon = icons[i];
          return (
            <div
              key={card.title}
              className="relative min-h-[218px] w-[84%] shrink-0 snap-start overflow-hidden rounded-[24px] border border-line/80 bg-gradient-to-br from-[#FCFBF8] to-[#F3F1EA] p-6 text-center shadow-[0_8px_24px_rgba(28,43,68,0.06)] transition-transform duration-300 hover:-translate-y-1 sm:w-auto sm:rounded-2xl sm:p-6"
            >
              <div className={`mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${iconStyles[i % iconStyles.length]}`}>
                <Icon size={20} />
              </div>
              <h3 className="mb-2.5 font-serif text-[16.5px] font-semibold text-ink">{card.title}</h3>
              <p className="text-[13px] leading-relaxed text-ink70">{card.desc}</p>
            </div>
          );
        })}
      </div>
      {scrollIndicator.visible && (
        <div
          aria-hidden="true"
          className="relative mx-auto mt-1 h-1 w-16 overflow-hidden rounded-full bg-line sm:hidden"
        >
          <div
            className="absolute inset-y-0 rounded-full bg-blue/45 transition-[inset-inline-start,width] duration-150"
            style={{
              width: `${scrollIndicator.width * 100}%`,
              insetInlineStart: `${scrollIndicator.offset * 100}%`,
            }}
          />
        </div>
      )}
    </section>
  );
}
