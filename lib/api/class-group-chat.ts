import { apiFetch } from "./client";

export type ClassGroup = {
  id: string;
  title: string;
  teacherName: string;
  memberCount: number;
};

export type ClassGroupMessage = {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "student" | "teacher" | "admin";
  content: string;
  createdAt: string;
};

type ApiRecord = Record<string, unknown>;

function value(record: ApiRecord, ...keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key];
  }
  return undefined;
}

function text(record: ApiRecord, ...keys: string[]): string {
  const result = value(record, ...keys);
  return result == null ? "" : String(result);
}

function normalizeGroup(raw: unknown, fallbackId: string): ClassGroup {
  const record = (raw ?? {}) as ApiRecord;
  return {
    id: text(record, "id", "Id", "groupId", "GroupId") || fallbackId,
    title: text(record, "title", "Title", "classTitle", "ClassTitle"),
    teacherName: text(record, "teacherName", "TeacherName"),
    memberCount: Number(value(record, "memberCount", "MemberCount") ?? 0),
  };
}

function normalizeMessage(raw: unknown): ClassGroupMessage | null {
  const record = (raw ?? {}) as ApiRecord;
  const id = text(record, "id", "Id", "messageId", "MessageId");
  if (!id) return null;
  const role = text(record, "senderRole", "SenderRole").toLowerCase();
  return {
    id,
    senderId: text(record, "senderId", "SenderId"),
    senderName: text(record, "senderName", "SenderName"),
    senderRole:
      role === "teacher" || role === "admin" ? role : "student",
    content: text(record, "content", "Content"),
    createdAt: text(record, "createdAt", "CreatedAt"),
  };
}

function unwrapMessages(raw: unknown): ClassGroupMessage[] {
  const record = (raw ?? {}) as ApiRecord;
  const messages = Array.isArray(raw)
    ? raw
    : value(record, "items", "Items", "data", "Data", "messages", "Messages");
  if (!Array.isArray(messages)) return [];
  return messages
    .map(normalizeMessage)
    .filter((message): message is ClassGroupMessage => message !== null)
    .sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt));
}

export async function getClassGroup(groupId: string): Promise<ClassGroup> {
  const response = await apiFetch<unknown>(
    `/api/class-groups/${encodeURIComponent(groupId)}`,
    { cache: "no-store" },
  );
  return normalizeGroup(response, groupId);
}

export async function getClassGroupMessages(
  groupId: string,
): Promise<ClassGroupMessage[]> {
  const response = await apiFetch<unknown>(
    `/api/class-groups/${encodeURIComponent(groupId)}/messages?limit=200`,
    { cache: "no-store" },
  );
  return unwrapMessages(response);
}

export async function sendClassGroupMessage(
  groupId: string,
  content: string,
): Promise<ClassGroupMessage> {
  const response = await apiFetch<unknown>(
    `/api/class-groups/${encodeURIComponent(groupId)}/messages`,
    { method: "POST", body: { content } },
  );
  const message = normalizeMessage(response);
  if (!message) throw new Error("The server returned an invalid group message.");
  return message;
}
