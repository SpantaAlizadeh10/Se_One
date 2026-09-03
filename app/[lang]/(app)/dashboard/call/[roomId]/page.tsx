"use client";

import { useSearchParams } from "next/navigation";
import VideoCallRoom from "@/components/shared/VideoCallRoom";

export default function StudentCallPage({ params }: { params: { roomId: string } }) {
  const searchParams = useSearchParams();
  const teacherName = searchParams.get("with") || "your teacher";

  return (
    <VideoCallRoom
      roomId={params.roomId}
      otherPersonName={teacherName}
      backHref="/dashboard/teachers"
      backLabelKey="videoCallPage.backToBookings"
    />
  );
}
