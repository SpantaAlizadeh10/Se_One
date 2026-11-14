"use client";

import { useEffect, useRef } from "react";

export default function ScrollReveal({
  children,
}: {
  children: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (
      !root ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    const observeSections = () => {
      const sections = root.querySelectorAll<HTMLElement>(
        "main > section, main > div > section",
      );

      sections.forEach((section, index) => {
        section.classList.add("scroll-reveal");
        section.style.setProperty(
          "--scroll-reveal-delay",
          `${Math.min(index * 70, 210)}ms`,
        );

        if (index === 0) {
          section.classList.add("is-visible");
          return;
        }

        if (!section.classList.contains("is-visible")) {
          observer.observe(section);
        }
      });

      root.classList.add("scroll-reveal-enabled");
    };

    observeSections();
    const mutations = new MutationObserver(observeSections);
    mutations.observe(root, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer.disconnect();
      root.classList.remove("scroll-reveal-enabled");
    };
  }, []);

  return <div ref={rootRef}>{children}</div>;
}
