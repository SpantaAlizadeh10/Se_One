import { apiFetch } from "./client";

/**
 * Contact / Support API client
 * Handle contact form submissions and support tickets
 */

export type SupportTicket = {
  id: string;
  userId?: string;
  userName?: string;
  userEmail: string;
  subject: string;
  category: "technical" | "billing" | "academic" | "account" | "general";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  description: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  assignedTo?: string;
  assignedToName?: string;
  messages: SupportMessage[];
};

export type SupportMessage = {
  id: string;
  ticketId: string;
  userId?: string;
  userName?: string;
  isFromSupport: boolean;
  content: string;
  attachments?: string[];
  createdAt: string;
  isInternal?: boolean; // Only visible to support team
};

export type ContactFormSubmission = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

export type CreateTicketInput = {
  subject: string;
  category: "technical" | "billing" | "academic" | "account" | "general";
  priority?: "low" | "medium" | "high" | "urgent";
  description: string;
  attachments?: string[];
};

export type CreateMessageInput = {
  content: string;
  attachments?: string[];
  isInternal?: boolean;
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

function normalizeSupportMessage(
  raw: unknown,
  index: number,
): SupportMessage | null {
  const record = (raw ?? {}) as ApiRecord;
  const id = text(record, "id", "Id", "messageId", "MessageId");
  const ticketId = text(record, "ticketId", "TicketId");
  if (!ticketId) return null;

  return {
    id: id || `message-${index}`,
    ticketId,
    userId: text(record, "userId", "UserId") || undefined,
    userName: text(record, "userName", "UserName") || undefined,
    isFromSupport: Boolean(
      value(
        record,
        "isFromSupport",
        "IsFromSupport",
        "fromSupport",
        "FromSupport",
      ),
    ),
    content: text(record, "content", "Content", "message", "Message"),
    attachments:
      (value(record, "attachments", "Attachments") as string[]) || undefined,
    createdAt: text(record, "createdAt", "CreatedAt"),
    isInternal: Boolean(value(record, "isInternal", "IsInternal")),
  };
}

function normalizeTicket(raw: unknown, index: number): SupportTicket | null {
  const record = (raw ?? {}) as ApiRecord;
  const id = text(record, "id", "Id", "ticketId", "TicketId");
  const userEmail = text(record, "userEmail", "UserEmail", "email", "Email");
  if (!userEmail) return null;

  const categoryRaw = text(record, "category", "Category").toLowerCase();
  const category: SupportTicket["category"] =
    categoryRaw === "technical" ||
    categoryRaw === "billing" ||
    categoryRaw === "academic" ||
    categoryRaw === "account" ||
    categoryRaw === "general"
      ? categoryRaw
      : "general";

  const priorityRaw = text(record, "priority", "Priority").toLowerCase();
  const priority: SupportTicket["priority"] =
    priorityRaw === "low" ||
    priorityRaw === "medium" ||
    priorityRaw === "high" ||
    priorityRaw === "urgent"
      ? priorityRaw
      : "medium";

  const statusRaw = text(record, "status", "Status").toLowerCase();
  const status: SupportTicket["status"] =
    statusRaw === "open" ||
    statusRaw === "in_progress" ||
    statusRaw === "resolved" ||
    statusRaw === "closed"
      ? statusRaw
      : "open";

  const messages = (value(record, "messages", "Messages") as unknown[]) || [];

  return {
    id: id || `ticket-${index}`,
    userId: text(record, "userId", "UserId") || undefined,
    userName: text(record, "userName", "UserName") || undefined,
    userEmail,
    subject: text(record, "subject", "Subject"),
    category,
    priority,
    status,
    description: text(record, "description", "Description"),
    attachments:
      (value(record, "attachments", "Attachments") as string[]) || undefined,
    createdAt: text(record, "createdAt", "CreatedAt"),
    updatedAt: text(record, "updatedAt", "UpdatedAt"),
    resolvedAt: text(record, "resolvedAt", "ResolvedAt") || undefined,
    assignedTo: text(record, "assignedTo", "AssignedTo") || undefined,
    assignedToName:
      text(record, "assignedToName", "AssignedToName") || undefined,
    messages: messages
      .map((m, i) => normalizeSupportMessage(m, i))
      .filter((m): m is SupportMessage => m !== null),
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
  const nested = value(
    record,
    "items",
    "Items",
    "data",
    "Data",
    "tickets",
    "Tickets",
  );
  if (Array.isArray(nested)) {
    return nested.map(normalize).filter((x): x is T => x != null);
  }
  return [];
}

// --- Contact Form ---

/**
 * POST /api/contact
 * Submit contact form (public, no auth required)
 */
export async function submitContactForm(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<ContactFormSubmission> {
  const data = await apiFetch<unknown>("/api/contact", {
    method: "POST",
    body: input,
  });
  const record = (data ?? {}) as ApiRecord;
  return {
    id: text(record, "id", "Id"),
    name: text(record, "name", "Name"),
    email: text(record, "email", "Email"),
    subject: text(record, "subject", "Subject"),
    message: text(record, "message", "Message"),
    createdAt: text(record, "createdAt", "CreatedAt"),
  };
}

// --- Support Tickets ---

/**
 * GET /api/support/tickets
 * Get user's support tickets
 */
export async function getSupportTickets(filters?: {
  status?: SupportTicket["status"];
  category?: SupportTicket["category"];
}): Promise<SupportTicket[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.category) params.set("category", filters.category);

  const query = params.toString();
  const data = await apiFetch<unknown>(
    `/api/support/tickets${query ? `?${query}` : ""}`,
  );
  return unwrapList(data, normalizeTicket);
}

/**
 * POST /api/support/tickets
 * Create a new support ticket
 */
export async function createSupportTicket(
  input: CreateTicketInput,
): Promise<SupportTicket> {
  const data = await apiFetch<unknown>("/api/support/tickets", {
    method: "POST",
    body: input,
  });
  return normalizeTicket(data, 0)!;
}

/**
 * GET /api/support/tickets/{ticketId}
 * Get a specific support ticket
 */
export async function getSupportTicket(
  ticketId: string,
): Promise<SupportTicket> {
  const data = await apiFetch<unknown>(`/api/support/tickets/${ticketId}`);
  return normalizeTicket(data, 0)!;
}

/**
 * PATCH /api/support/tickets/{ticketId}
 * Update support ticket (e.g., change priority)
 */
export async function updateSupportTicket(
  ticketId: string,
  input: Partial<
    Pick<SupportTicket, "subject" | "priority" | "category" | "status">
  >,
): Promise<SupportTicket> {
  const data = await apiFetch<unknown>(`/api/support/tickets/${ticketId}`, {
    method: "PATCH",
    body: input,
  });
  return normalizeTicket(data, 0)!;
}

/**
 * POST /api/support/tickets/{ticketId}/close
 * Close a support ticket
 */
export async function closeSupportTicket(
  ticketId: string,
): Promise<SupportTicket> {
  const data = await apiFetch<unknown>(
    `/api/support/tickets/${ticketId}/close`,
    {
      method: "POST",
    },
  );
  return normalizeTicket(data, 0)!;
}

/**
 * POST /api/support/tickets/{ticketId}/reopen
 * Reopen a closed support ticket
 */
export async function reopenSupportTicket(
  ticketId: string,
): Promise<SupportTicket> {
  const data = await apiFetch<unknown>(
    `/api/support/tickets/${ticketId}/reopen`,
    {
      method: "POST",
    },
  );
  return normalizeTicket(data, 0)!;
}

// --- Support Messages ---

/**
 * POST /api/support/tickets/{ticketId}/messages
 * Add a message to a support ticket
 */
export async function addSupportMessage(
  ticketId: string,
  input: CreateMessageInput,
): Promise<SupportMessage> {
  const data = await apiFetch<unknown>(
    `/api/support/tickets/${ticketId}/messages`,
    {
      method: "POST",
      body: input,
    },
  );
  return normalizeSupportMessage(data, 0)!;
}

/**
 * GET /api/support/tickets/{ticketId}/messages
 * Get all messages for a support ticket
 */
export async function getSupportMessages(
  ticketId: string,
): Promise<SupportMessage[]> {
  const data = await apiFetch<unknown>(
    `/api/support/tickets/${ticketId}/messages`,
  );
  if (Array.isArray(data)) {
    return data
      .map((m, i) => normalizeSupportMessage(m, i))
      .filter((m): m is SupportMessage => m !== null);
  }
  return [];
}

/**
 * POST /api/support/tickets/{ticketId}/messages/{messageId}/upload
 * Upload attachment for a support message
 */
export async function uploadSupportAttachment(
  ticketId: string,
  messageId: string,
  file: File,
): Promise<{ fileUrl: string }> {
  const formData = new FormData();
  formData.append("attachment", file);

  const data = await apiFetch<{ fileUrl: string }>(
    `/api/support/tickets/${ticketId}/messages/${messageId}/upload`,
    {
      method: "POST",
      body: formData as any,
      headers: undefined,
    },
  );
  return data;
}

// --- FAQ ---

/**
 * GET /api/support/faq
 * Get FAQ articles
 */
export async function getFAQ(category?: string): Promise<
  {
    id: string;
    category: string;
    question: string;
    answer: string;
    order: number;
  }[]
> {
  const query = category ? `?category=${category}` : "";
  const data = await apiFetch<unknown>(`/api/support/faq${query}`);
  if (Array.isArray(data)) {
    return data.map((item: unknown) => {
      const record = (item ?? {}) as ApiRecord;
      return {
        id: text(record, "id", "Id"),
        category: text(record, "category", "Category"),
        question: text(record, "question", "Question"),
        answer: text(record, "answer", "Answer"),
        order: Number(value(record, "order", "Order") ?? 0),
      };
    });
  }
  return [];
}
