/**
 * Video call rooms for booked sessions, using Jitsi Meet's free public
 * server (meet.jit.si) — no account, API key, or backend required, and
 * it actually works. The room name is deterministic from the teacher +
 * slot ids, so both sides land in the same room without any server-side
 * coordination.
 *
 * For production you'd likely want a self-hosted Jitsi instance or a
 * managed provider (Daily.co, Twilio Video, Zoom SDK, ...) instead of
 * the public server, mainly for reliability and moderation control —
 * but the public server is genuinely usable for testing this feature
 * end to end right now.
 */

export function getRoomId(teacherId: string, slotId: string): string {
  return `seone-${teacherId}-${slotId}`.replace(/[^a-zA-Z0-9-]/g, "");
}

export function getJitsiUrl(roomId: string): string {
  return `https://meet.jit.si/${roomId}`;
}
