import { apiFetch } from "./client";

/**
 * Messaging API client
 * Handle conversations and messages between students, teachers, and support
 */

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderRole: "student" | "teacher" | "admin" | "support";
  content: string;
  attachments?: string[];
  createdAt: string;
  isRead: boolean;
  readAt?: string;
};

export type Conversation = {
  id: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
    role: "student" | "teacher" | "admin" | "support";
  }[];
  lastMessage?: {
    content: string;
    createdAt: string;
    senderName: string;
  };
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  subject?: string;
  type: "student_teacher" | "student_support" | "teacher_support" | "admin";
  relatedCourseId?: string;
  relatedAssignmentId?: string;
};

export type CreateConversationInput = {
  participantId: string;
  subject?: string;
  type: "student_teacher" | "student_support" | "teacher_support";
  relatedCourseId?: string;
  relatedAssignmentId?: string;
  initialMessage?: string;
};

export type SendMessageInput = {
  content: string;
  attachments?: string[];
};

export type MessagingContact = {
  id: string;
  name: string;
  avatar?: string;
  role: "student" | "teacher" | "admin" | "support";
  courseId?: string;
  courseTitle?: string;
};

type ApiRecord = Record<string, unknown>;

function value(record: ApiRecord, ...keys: string[]) {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key];
  }
  return undefined;
}

function text(record: ApiRecord, ...keys: string[]): string {
  const result = value(record, ...keys);
  return typeof result === "string"
    ? result
    : result == null
      ? ""
      : String(result);
}

function numberValue(record: ApiRecord, ...keys: string[]): number {
  const n = Number(value(record, ...keys) ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function normalizeRole(
  raw: unknown,
): "student" | "teacher" | "admin" | "support" {
  const value = String(raw).toLowerCase();
  if (value === "teacher") return "teacher";
  if (value === "admin") return "admin";
  if (value === "support") return "support";
  return "student";
}

function normalizeMessage(raw: unknown, index: number): Message | null {
  const record = (raw ?? {}) as ApiRecord;
  const id = text(record, "id", "Id", "messageId", "MessageId");
  const conversationId = text(record, "conversationId", "ConversationId");
  if (!conversationId) return null;

  return {
    id: id || `message-${index}`,
    conversationId,
    senderId: text(record, "senderId", "SenderId"),
    senderName: text(record, "senderName", "SenderName"),
    senderAvatar: text(record, "senderAvatar", "SenderAvatar") || undefined,
    senderRole: normalizeRole(value(record, "senderRole", "SenderRole")),
    content: text(record, "content", "Content", "text", "Text"),
    attachments:
      (value(record, "attachments", "Attachments") as string[]) || undefined,
    createdAt: text(record, "createdAt", "CreatedAt", "sentAt", "SentAt"),
    isRead: Boolean(value(record, "isRead", "IsRead")),
    readAt: text(record, "readAt", "ReadAt") || undefined,
  };
}

function normalizeConversation(
  raw: unknown,
  index: number,
): Conversation | null {
  const record = (raw ?? {}) as ApiRecord;
  const id = text(record, "id", "Id", "conversationId", "ConversationId");
  if (!id) return null;

  const participants =
    (value(record, "participants", "Participants") as unknown[]) || [];
  const normalizedParticipants = participants.map((p: unknown) => {
    const participant = (p ?? {}) as ApiRecord;
    return {
      id: text(participant, "id", "Id", "userId", "UserId"),
      name: text(participant, "name", "Name", "fullName", "FullName"),
      avatar: text(participant, "avatar", "Avatar") || undefined,
      role: normalizeRole(value(participant, "role", "Role")),
    };
  });

  const lastMessage = value(record, "lastMessage", "LastMessage") as
    | ApiRecord
    | undefined;

  return {
    id,
    participants: normalizedParticipants,
    lastMessage: lastMessage
      ? {
          content: text(lastMessage, "content", "Content", "text", "Text"),
          createdAt: text(lastMessage, "createdAt", "CreatedAt"),
          senderName: text(lastMessage, "senderName", "SenderName"),
        }
      : undefined,
    unreadCount: numberValue(record, "unreadCount", "UnreadCount"),
    createdAt: text(record, "createdAt", "CreatedAt"),
    updatedAt: text(record, "updatedAt", "UpdatedAt"),
    subject: text(record, "subject", "Subject") || undefined,
    type:
      (value(record, "type", "Type") as Conversation["type"]) ||
      "student_teacher",
    relatedCourseId:
      text(record, "relatedCourseId", "RelatedCourseId") || undefined,
    relatedAssignmentId:
      text(record, "relatedAssignmentId", "RelatedAssignmentId") || undefined,
  };
}

function unwrapList<T>(
  response: unknown,
  normalize: (raw: unknown, index: number) => T | null,
): T[] {
  if (Array.isArray(response)) {
    return response.map(normalize).filter((x): x is T => x != null);
  }
  const record = (response ?? {}) as ApiRecord;
  const nested = value(record, "items", "Items", "data", "Data");
  if (Array.isArray(nested)) {
    return nested.map(normalize).filter((x): x is T => x != null);
  }
  return [];
}

/**
 * GET /api/conversations
 * Get user's conversations
 */
export async function getConversations(): Promise<Conversation[]> {
  const data = await apiFetch<unknown>("/api/conversations");
  return unwrapList(data, normalizeConversation);
}

/** GET /api/conversations/contacts — only contacts this user is allowed to message. */
export async function getMessagingContacts(): Promise<MessagingContact[]> {
  const data = await apiFetch<unknown>("/api/conversations/contacts");
  return unwrapList(data, (raw) => {
    const record = (raw ?? {}) as ApiRecord;
    const id = text(record, "id", "Id", "userId", "UserId");
    const name = text(record, "name", "Name", "fullName", "FullName");
    if (!id || !name) return null;
    return {
      id,
      name,
      avatar:
        text(record, "avatar", "Avatar", "avatarUrl", "AvatarUrl") || undefined,
      role: normalizeRole(value(record, "role", "Role")),
      courseId: text(record, "courseId", "CourseId") || undefined,
      courseTitle: text(record, "courseTitle", "CourseTitle") || undefined,
    };
  });
}

/**
 * GET /api/conversations/search?query={query}
 * Search conversations
 */
export async function searchConversations(
  query: string,
): Promise<Conversation[]> {
  const data = await apiFetch<unknown>(
    `/api/conversations/search?query=${encodeURIComponent(query)}`,
  );
  return unwrapList(data, normalizeConversation);
}

/**
 * POST /api/conversations
 * Create a new conversation
 */
export async function createConversation(
  input: CreateConversationInput,
): Promise<Conversation> {
  const data = await apiFetch<unknown>("/api/conversations", {
    method: "POST",
    body: input,
  });
  return normalizeConversation(data, 0)!;
}

/**
 * GET /api/conversations/{conversationId}
 * Get a specific conversation
 */
export async function getConversation(
  conversationId: string,
): Promise<Conversation> {
  const data = await apiFetch<unknown>(`/api/conversations/${conversationId}`);
  return normalizeConversation(data, 0)!;
}

/**
 * GET /api/conversations/{conversationId}/messages
 * Get messages in a conversation
 */
export async function getMessages(conversationId: string): Promise<Message[]> {
  const data = await apiFetch<unknown>(
    `/api/conversations/${conversationId}/messages`,
  );
  return unwrapList(data, normalizeMessage);
}

/**
 * POST /api/conversations/{conversationId}/messages
 * Send a message
 */
export async function sendMessage(
  conversationId: string,
  input: SendMessageInput,
): Promise<Message> {
  const data = await apiFetch<unknown>(
    `/api/conversations/${conversationId}/messages`,
    {
      method: "POST",
      body: input,
    },
  );
  return normalizeMessage(data, 0)!;
}

/** POST /api/conversations/{id}/messages/{messageId}/upload — attach one file to a sent message. */
export async function uploadMessageAttachment(
  conversationId: string,
  messageId: string,
  file: File,
): Promise<{ fileUrl: string }> {
  const formData = new FormData();
  formData.append("attachment", file);
  return apiFetch<{ fileUrl: string }>(
    `/api/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}/upload`,
    { method: "POST", body: formData as any, headers: undefined },
  );
}

/**
 * PATCH /api/conversations/{conversationId}/read
 * Mark conversation as read
 */
export async function markConversationAsRead(
  conversationId: string,
): Promise<void> {
  await apiFetch(`/api/conversations/${conversationId}/read`, {
    method: "PATCH",
  });
}

/**
 * PATCH /api/messages/{messageId}/read
 * Mark specific message as read
 */
export async function markMessageAsRead(messageId: string): Promise<void> {
  await apiFetch(`/api/messages/${messageId}/read`, { method: "PATCH" });
}

/**
 * GET /api/conversations/{conversationId}/typing
 * Get typing status (for real-time indicators)
 */
export async function getTypingStatus(conversationId: string): Promise<
  {
    userId: string;
    isTyping: boolean;
  }[]
> {
  const data = await apiFetch<unknown>(
    `/api/conversations/${conversationId}/typing`,
  );
  if (Array.isArray(data)) {
    return data.map((item: unknown) => {
      const record = (item ?? {}) as ApiRecord;
      return {
        userId: text(record, "userId", "UserId"),
        isTyping: Boolean(value(record, "isTyping", "IsTyping")),
      };
    });
  }
  return [];
}

/**
 * POST /api/conversations/{conversationId}/typing
 * Set typing status
 */
export async function setTypingStatus(
  conversationId: string,
  isTyping: boolean,
): Promise<void> {
  await apiFetch(`/api/conversations/${conversationId}/typing`, {
    method: "POST",
    body: { isTyping },
  });
}
