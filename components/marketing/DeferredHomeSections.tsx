"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const TeacherShowcase = dynamic(() => import("./TeacherShowcase"), {
  ssr: false,
});
const YouTubeVideos = dynamic(() => import("./YouTubeVideos"), {
  ssr: false,
});

function DeferredMount({
  children,
  minHeight,
}: {
  children: React.ReactNode;
  minHeight: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!("IntersectionObserver" in window)) {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldRender(true);
        observer.disconnect();
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ minHeight }}>
      {shouldRender ? (
        children
      ) : (
        <div
          aria-hidden="true"
          className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16"
        >
          <div className="h-5 w-48 animate-pulse rounded bg-line" />
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-2xl bg-line/70"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DeferredHomeSections() {
  return (
    <>
      <DeferredMount minHeight="460px">
        <TeacherShowcase />
      </DeferredMount>
      <DeferredMount minHeight="420px">
        <YouTubeVideos />
      </DeferredMount>
    </>
  );
}
