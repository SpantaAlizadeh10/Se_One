import { apiFetch } from "./client";

/**
 * Notifications API client
 * Handle notification storage, listing, read status, and preferences
 */

export type Notification = {
  id: string;
  userId: string;
  type: "booking" | "payment" | "assignment" | "message" | "promotion" | "system";
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  expiresAt?: string;
  actionUrl?: string;
  actionLabel?: string;
};

export type NotificationStats = {
  total: number;
  unread: number;
  byType: {
    booking: number;
    payment: number;
    assignment: number;
    message: number;
    promotion: number;
    system: number;
  };
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

function normalizeNotification(raw: unknown, index: number): Notification | null {
  const record = (raw ?? {}) as ApiRecord;
  const id = text(record, "id", "Id", "notificationId", "NotificationId");
  const userId = text(record, "userId", "UserId");
  if (!userId) return null;

  const typeRaw = text(record, "type", "Type").toLowerCase();
  const type: Notification["type"] = 
    typeRaw === "booking" || typeRaw === "payment" || typeRaw === "assignment" ||
    typeRaw === "message" || typeRaw === "promotion" || typeRaw === "system"
      ? typeRaw
      : "system";

  return {
    id: id || `notification-${index}`,
    userId,
    type,
    title: text(record, "title", "Title"),
    message: text(record, "message", "Message", "body", "Body"),
    data: (value(record, "data", "Data") as Record<string, unknown>) || undefined,
    isRead: Boolean(value(record, "isRead", "IsRead")),
    readAt: text(record, "readAt", "ReadAt") || undefined,
    createdAt: text(record, "createdAt", "CreatedAt"),
    expiresAt: text(record, "expiresAt", "ExpiresAt") || undefined,
    actionUrl: text(record, "actionUrl", "ActionUrl") || undefined,
    actionLabel: text(record, "actionLabel", "ActionLabel") || undefined,
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
  const nested = value(record, "items", "Items", "data", "Data", "notifications", "Notifications");
  if (Array.isArray(nested)) {
    return nested.map(normalize).filter((x): x is T => x != null);
  }
  return [];
}

/**
 * GET /api/notifications
 * Get user's notifications
 */
export async function getNotifications(filters?: {
  type?: Notification["type"];
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}): Promise<Notification[]> {
  const params = new URLSearchParams();
  if (filters?.type) params.set("type", filters.type);
  if (filters?.unreadOnly) params.set("unreadOnly", "true");
  if (filters?.limit) params.set("limit", String(filters.limit));
  if (filters?.offset) params.set("offset", String(filters.offset));
  
  const query = params.toString();
  const data = await apiFetch<unknown>(`/api/notifications${query ? `?${query}` : ""}`);
  return unwrapList(data, normalizeNotification);
}

/**
 * GET /api/notifications/stats
 * Get notification statistics
 */
export async function getNotificationStats(): Promise<NotificationStats> {
  const data = await apiFetch<unknown>("/api/notifications/stats");
  const record = (data ?? {}) as ApiRecord;
  const byType = (value(record, "byType", "ByType") as ApiRecord) || {};
  
  return {
    total: numberValue(record, "total", "Total"),
    unread: numberValue(record, "unread", "Unread"),
    byType: {
      booking: numberValue(byType, "booking", "Booking"),
      payment: numberValue(byType, "payment", "Payment"),
      assignment: numberValue(byType, "assignment", "Assignment"),
      message: numberValue(byType, "message", "Message"),
      promotion: numberValue(byType, "promotion", "Promotion"),
      system: numberValue(byType, "system", "System"),
    },
  };
}

/**
 * GET /api/notifications/{notificationId}
 * Get a specific notification
 */
export async function getNotification(notificationId: string): Promise<Notification> {
  const data = await apiFetch<unknown>(`/api/notifications/${notificationId}`);
  return normalizeNotification(data, 0)!;
}

/**
 * PATCH /api/notifications/{notificationId}/read
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await apiFetch(`/api/notifications/${notificationId}/read`, { method: "PATCH" });
}

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  await apiFetch("/api/notifications/read-all", { method: "PATCH" });
}

/**
 * DELETE /api/notifications/{notificationId}
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  await apiFetch(`/api/notifications/${notificationId}`, { method: "DELETE" });
}

/**
 * DELETE /api/notifications/clear
 * Clear all notifications (or all read notifications)
 */
export async function clearNotifications(options?: {
  readOnly?: boolean;
  olderThan?: string; // ISO date
}): Promise<void> {
  const params = new URLSearchParams();
  if (options?.readOnly) params.set("readOnly", "true");
  if (options?.olderThan) params.set("olderThan", options.olderThan);
  
  const query = params.toString();
  await apiFetch(`/api/notifications/clear${query ? `?${query}` : ""}`, { method: "DELETE" });
}

/**
 * POST /api/notifications/{notificationId}/action
 * Execute notification action (if applicable)
 */
export async function executeNotificationAction(
  notificationId: string,
  actionData?: Record<string, unknown>,
): Promise<{ success: boolean; redirectUrl?: string }> {
  const data = await apiFetch<{ success: boolean; redirectUrl?: string }>(
    `/api/notifications/${notificationId}/action`,
    {
      method: "POST",
      body: actionData || {},
    },
  );
  return data;
}

/**
 * POST /api/notifications/test
 * Create a test notification (for development)
 */
export async function createTestNotification(type: Notification["type"]): Promise<Notification> {
  const data = await apiFetch<unknown>("/api/notifications/test", {
    method: "POST",
    body: { type },
  });
  return normalizeNotification(data, 0)!;
}
