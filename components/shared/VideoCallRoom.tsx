"use client";

import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { getJitsiUrl } from "@/lib/video-call";

export default function VideoCallRoom({
  roomId,
  otherPersonName,
  backHref,
  backLabelKey
}: {
  roomId: string;
  otherPersonName: string;
  backHref: string;
  backLabelKey: string;
}) {
  const { t, href } = useLanguage();
  const c = t("videoCallPage");

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] lg:h-[calc(100vh-110px)]">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h2 className="text-[18px] sm:text-[20px] font-semibold m-0">
            {c.classWith} {otherPersonName}
          </h2>
          <p className="text-[12px] text-muted flex items-center gap-1.5 mt-1">
            <Info size={13} className="shrink-0" />
            {c.note}
          </p>
        </div>
        <Link
          href={href(backHref)}
          className="inline-flex items-center gap-2 bg-white border border-line text-ink70 px-4 py-2.5 rounded-full text-[12.5px] font-semibold hover:border-ink transition-colors shrink-0"
        >
          <ArrowLeft size={14} className="rtl:rotate-180" />
          {t(backLabelKey)}
        </Link>
      </div>

      <div className="flex-1 rounded-lg overflow-hidden border border-line shadow-card bg-ink min-h-[360px]">
        <iframe
          src={getJitsiUrl(roomId)}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          className="w-full h-full border-0"
          title="Video call"
        />
      </div>
    </div>
  );
}
