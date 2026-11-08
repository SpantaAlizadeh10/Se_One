import { apiFetch } from "./client";

export type TeacherGroupMessage = {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "teacher" | "admin";
  content: string;
  createdAt: string;
  isAnnouncement: boolean;
};

type ApiRecord = Record<string, unknown>;

function value(record: ApiRecord, ...keys: string[]) {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key];
  }
  return undefined;
}

function text(record: ApiRecord, ...keys: string[]): string {
  const item = value(record, ...keys);
  return item == null ? "" : String(item);
}

function normalizeMessage(raw: unknown, index: number): TeacherGroupMessage | null {
  const record = (raw ?? {}) as ApiRecord;
  const id = text(record, "id", "Id");
  if (!id) return null;
  const role = text(record, "senderRole", "SenderRole").toLowerCase();
  return {
    id: id || `teacher-group-message-${index}`,
    senderId: text(record, "senderId", "SenderId"),
    senderName: text(record, "senderName", "SenderName"),
    senderRole: role === "admin" ? "admin" : "teacher",
    content: text(record, "content", "Content"),
    createdAt: text(record, "createdAt", "CreatedAt"),
    isAnnouncement: Boolean(
      value(record, "isAnnouncement", "IsAnnouncement"),
    ),
  };
}

export async function getTeacherGroupMessages(): Promise<TeacherGroupMessage[]> {
  const response = await apiFetch<unknown>(
    "/api/teacher-group-chat/messages?limit=200",
    { cache: "no-store" },
  );
  const record = (response ?? {}) as ApiRecord;
  const items = Array.isArray(response)
    ? response
    : value(record, "items", "Items", "data", "Data");
  if (!Array.isArray(items)) return [];
  return items
    .map(normalizeMessage)
    .filter((message): message is TeacherGroupMessage => message !== null)
    .sort((left, right) => {
      const leftTime = Date.parse(left.createdAt);
      const rightTime = Date.parse(right.createdAt);
      return Number.isNaN(leftTime) || Number.isNaN(rightTime)
        ? 0
        : leftTime - rightTime;
    });
}

export async function sendTeacherGroupMessage(
  content: string,
  isAnnouncement = false,
): Promise<TeacherGroupMessage> {
  const response = await apiFetch<unknown>("/api/teacher-group-chat/messages", {
    method: "POST",
    body: { content, isAnnouncement },
  });
  const message = normalizeMessage(response, 0);
  if (!message) {
    throw new Error("The server returned an invalid group chat message.");
  }
  return message;
}
