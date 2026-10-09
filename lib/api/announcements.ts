import { apiFetch } from "./client";

export type AnnouncementAudience = "students" | "teachers" | "all";
export type AnnouncementKind = "info" | "success" | "warning" | "urgent";
export type AnnouncementStatus = "draft" | "scheduled" | "published";

export type Announcement = {
  id: string;
  title: string;
  message: string;
  audience: AnnouncementAudience;
  kind: AnnouncementKind;
  status: AnnouncementStatus;
  actionUrl?: string;
  actionLabel?: string;
  publishAt?: string;
  expiresAt?: string;
  createdAt: string;
  isRead?: boolean;
  isDismissed?: boolean;
};

export type AnnouncementInput = Pick<
  Announcement,
  "title" | "message" | "audience" | "kind" | "status"
> &
  Partial<
    Pick<Announcement, "actionUrl" | "actionLabel" | "publishAt" | "expiresAt">
  >;

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

function normalizeAnnouncement(
  raw: unknown,
  index: number,
): Announcement | null {
  const record = (raw ?? {}) as ApiRecord;
  const title = text(record, "title", "Title");
  if (!title) return null;
  const audienceRaw = text(record, "audience", "Audience").toLowerCase();
  const kindRaw = text(record, "kind", "Kind", "type", "Type").toLowerCase();
  const statusRaw = text(record, "status", "Status").toLowerCase();

  return {
    id:
      text(record, "id", "Id", "announcementId", "AnnouncementId") ||
      `announcement-${index}`,
    title,
    message: text(record, "message", "Message", "body", "Body"),
    audience:
      audienceRaw === "teachers" || audienceRaw === "all"
        ? audienceRaw
        : "students",
    kind:
      kindRaw === "success" || kindRaw === "warning" || kindRaw === "urgent"
        ? kindRaw
        : "info",
    status:
      statusRaw === "published" || statusRaw === "scheduled"
        ? statusRaw
        : "draft",
    actionUrl: text(record, "actionUrl", "ActionUrl") || undefined,
    actionLabel: text(record, "actionLabel", "ActionLabel") || undefined,
    publishAt: text(record, "publishAt", "PublishAt") || undefined,
    expiresAt: text(record, "expiresAt", "ExpiresAt") || undefined,
    createdAt: text(record, "createdAt", "CreatedAt"),
    isRead: Boolean(value(record, "isRead", "IsRead")),
    isDismissed: Boolean(value(record, "isDismissed", "IsDismissed")),
  };
}

function unwrapList(response: unknown): Announcement[] {
  const record = (response ?? {}) as ApiRecord;
  const list = Array.isArray(response)
    ? response
    : value(
        record,
        "items",
        "Items",
        "data",
        "Data",
        "announcements",
        "Announcements",
      );
  return Array.isArray(list)
    ? list
        .map(normalizeAnnouncement)
        .filter((item): item is Announcement => item !== null)
    : [];
}

/** GET /api/admin/announcements — admin-only list, optionally filtered by status. */
export async function listAdminAnnouncements(
  status?: AnnouncementStatus | "all",
) {
  const query =
    status && status !== "all" ? `?status=${encodeURIComponent(status)}` : "";
  return unwrapList(
    await apiFetch<unknown>(`/api/admin/announcements${query}`),
  );
}

/** POST /api/admin/announcements — create an announcement. */
export async function createAdminAnnouncement(input: AnnouncementInput) {
  return normalizeAnnouncement(
    await apiFetch<unknown>("/api/admin/announcements", {
      method: "POST",
      body: input,
    }),
    0,
  )!;
}

/** PATCH /api/admin/announcements/{id} — edit or change publication status. */
export async function updateAdminAnnouncement(
  id: string,
  input: Partial<AnnouncementInput>,
) {
  return normalizeAnnouncement(
    await apiFetch<unknown>(
      `/api/admin/announcements/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: input,
      },
    ),
    0,
  )!;
}

/** DELETE /api/admin/announcements/{id} — remove an announcement. */
export async function deleteAdminAnnouncement(id: string): Promise<void> {
  await apiFetch(`/api/admin/announcements/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

/** GET /api/announcements — backend derives the current role and filters audience. */
export async function getDashboardAnnouncements(limit = 5) {
  return unwrapList(
    await apiFetch<unknown>(`/api/announcements?limit=${limit}`),
  );
}

/** POST /api/announcements/{id}/read — persist read state for this user. */
export async function markAnnouncementRead(id: string): Promise<void> {
  await apiFetch(`/api/announcements/${encodeURIComponent(id)}/read`, {
    method: "POST",
  });
}

/** POST /api/announcements/{id}/dismiss — hide this announcement for this user. */
export async function dismissAnnouncement(id: string): Promise<void> {
  await apiFetch(`/api/announcements/${encodeURIComponent(id)}/dismiss`, {
    method: "POST",
  });
}
