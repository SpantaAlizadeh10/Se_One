"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Youtube } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type ChannelVideo = {
  videoId: string;
  title: string;
  publishedAt: string;
};

export default function YouTubeVideos() {
  const { t } = useLanguage();
  const section = t("home.youtube");
  const [videos, setVideos] = useState<ChannelVideo[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/youtube-videos", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Video feed unavailable");
        return response.json();
      })
      .then((data: { videos?: ChannelVideo[] }) => {
        setVideos(data.videos ?? []);
        setLoaded(true);
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoaded(true);
      });

    return () => controller.abort();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-danger">
            <Youtube size={15} /> {section.eyebrow}
          </div>
          <h2 className="font-serif text-[26px] font-semibold sm:text-[32px]">
            {section.heading}
          </h2>
          <p className="mt-2 max-w-[480px] text-[13px] text-ink70 sm:text-[14px]">
            {section.sub}
          </p>
        </div>
        <a
          href="https://www.youtube.com/@Se1_Academy"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-[12px] font-semibold text-ink transition-colors hover:border-danger hover:text-danger"
        >
          {section.viewChannel}
          <ArrowRight size={14} className="rtl:rotate-180" />
        </a>
      </div>

      {!loaded ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="aspect-video animate-pulse rounded-2xl bg-[#EDEAE0]"
            />
          ))}
        </div>
      ) : videos.length > 0 ? (
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 thin-scroll lg:grid lg:grid-cols-3 lg:overflow-visible">
          {videos.map((video) => (
            <article
              key={video.videoId}
              className="w-[86%] min-w-[270px] shrink-0 snap-start overflow-hidden rounded-2xl border border-line bg-white shadow-card sm:w-[360px] lg:w-auto lg:min-w-0"
            >
              <div className="aspect-video bg-[#101010]">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${video.videoId}`}
                  title={video.title}
                  loading="lazy"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <h3 className="line-clamp-2 min-h-12 px-4 py-3 text-[13px] font-semibold leading-relaxed text-ink sm:text-[14px]">
                {video.title}
              </h3>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-[#FAFAF8] px-5 py-8 text-center text-[13px] text-ink70">
          {section.unavailable}
        </p>
      )}
    </section>
  );
}
