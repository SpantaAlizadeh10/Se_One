"use client";

import { useSearchParams } from "next/navigation";
import VideoCallRoom from "@/components/shared/VideoCallRoom";

export default function TeacherCallPage({ params }: { params: { roomId: string } }) {
  const searchParams = useSearchParams();
  const studentName = searchParams.get("with") || "your student";

  return (
    <VideoCallRoom
      roomId={params.roomId}
      otherPersonName={studentName}
      backHref="/teacher/availability"
      backLabelKey="videoCallPage.backToAvailability"
    />
  );
}
