import { apiFetch } from "./client";

/**
 * Newsletter API client
 * Handle newsletter subscriptions, unsubscriptions, and subscriber management
 */

export type NewsletterSubscriber = {
  id: string;
  email: string;
  name?: string;
  status: "active" | "unsubscribed" | "bounced" | "pending";
  subscribedAt: string;
  unsubscribedAt?: string;
  preferences: {
    blog: boolean;
    courses: boolean;
    promotions: boolean;
    tips: boolean;
  };
  source: "website" | "blog" | "admin" | "import";
};

export type NewsletterCampaign = {
  id: string;
  subject: string;
  content: string;
  category: "blog" | "courses" | "promotions" | "tips";
  status: "draft" | "scheduled" | "sent";
  scheduledAt?: string;
  sentAt?: string;
  recipientCount: number;
  openCount: number;
  clickCount: number;
  createdAt: string;
  createdBy: string;
};

export type SubscribeInput = {
  email: string;
  name?: string;
  preferences?: Partial<NewsletterSubscriber["preferences"]>;
  source?: "website" | "blog";
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

function normalizeSubscriber(raw: unknown, index: number): NewsletterSubscriber | null {
  const record = (raw ?? {}) as ApiRecord;
  const id = text(record, "id", "Id", "subscriberId", "SubscriberId");
  const email = text(record, "email", "Email");
  if (!email) return null;

  const statusRaw = text(record, "status", "Status").toLowerCase();
  const status: NewsletterSubscriber["status"] = 
    statusRaw === "active" || statusRaw === "unsubscribed" || statusRaw === "bounced" || statusRaw === "pending"
      ? statusRaw
      : "pending";

  const sourceRaw = text(record, "source", "Source").toLowerCase();
  const source: NewsletterSubscriber["source"] = 
    sourceRaw === "website" || sourceRaw === "blog" || sourceRaw === "admin" || sourceRaw === "import"
      ? sourceRaw
      : "website";

  const preferences = (value(record, "preferences", "Preferences") as ApiRecord) || {};

  return {
    id: id || `subscriber-${index}`,
    email,
    name: text(record, "name", "Name") || undefined,
    status,
    subscribedAt: text(record, "subscribedAt", "SubscribedAt"),
    unsubscribedAt: text(record, "unsubscribedAt", "UnsubscribedAt") || undefined,
    preferences: {
      blog: Boolean(value(preferences, "blog", "Blog")),
      courses: Boolean(value(preferences, "courses", "Courses")),
      promotions: Boolean(value(preferences, "promotions", "Promotions")),
      tips: Boolean(value(preferences, "tips", "Tips")),
    },
    source,
  };
}

function normalizeCampaign(raw: unknown, index: number): NewsletterCampaign | null {
  const record = (raw ?? {}) as ApiRecord;
  const id = text(record, "id", "Id", "campaignId", "CampaignId");
  const subject = text(record, "subject", "Subject");
  if (!subject) return null;

  const categoryRaw = text(record, "category", "Category").toLowerCase();
  const category: NewsletterCampaign["category"] = 
    categoryRaw === "blog" || categoryRaw === "courses" || categoryRaw === "promotions" || categoryRaw === "tips"
      ? categoryRaw
      : "tips";

  const statusRaw = text(record, "status", "Status").toLowerCase();
  const status: NewsletterCampaign["status"] = 
    statusRaw === "draft" || statusRaw === "scheduled" || statusRaw === "sent"
      ? statusRaw
      : "draft";

  return {
    id: id || `campaign-${index}`,
    subject,
    content: text(record, "content", "Content"),
    category,
    status,
    scheduledAt: text(record, "scheduledAt", "ScheduledAt") || undefined,
    sentAt: text(record, "sentAt", "SentAt") || undefined,
    recipientCount: Number(value(record, "recipientCount", "RecipientCount") ?? 0),
    openCount: Number(value(record, "openCount", "OpenCount") ?? 0),
    clickCount: Number(value(record, "clickCount", "ClickCount") ?? 0),
    createdAt: text(record, "createdAt", "CreatedAt"),
    createdBy: text(record, "createdBy", "CreatedBy"),
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

// --- Public Subscription ---

/**
 * POST /api/newsletter/subscribe
 * Subscribe to newsletter (public, no auth required)
 */
export async function subscribeToNewsletter(input: SubscribeInput): Promise<NewsletterSubscriber> {
  const data = await apiFetch<unknown>("/api/newsletter/subscribe", {
    method: "POST",
    body: input,
  });
  return normalizeSubscriber(data, 0)!;
}

/**
 * POST /api/newsletter/unsubscribe
 * Unsubscribe from newsletter (public, with token)
 */
export async function unsubscribeFromNewsletter(token: string): Promise<void> {
  await apiFetch("/api/newsletter/unsubscribe", {
    method: "POST",
    body: { token },
  });
}

/**
 * GET /api/newsletter/preferences/{token}
 * Get newsletter preferences (public, with token)
 */
export async function getNewsletterPreferences(token: string): Promise<NewsletterSubscriber> {
  const data = await apiFetch<unknown>(`/api/newsletter/preferences/${token}`);
  return normalizeSubscriber(data, 0)!;
}

/**
 * PATCH /api/newsletter/preferences/{token}
 * Update newsletter preferences (public, with token)
 */
export async function updateNewsletterPreferences(
  token: string,
  preferences: Partial<NewsletterSubscriber["preferences"]>,
): Promise<NewsletterSubscriber> {
  const data = await apiFetch<unknown>(`/api/newsletter/preferences/${token}`, {
    method: "PATCH",
    body: { preferences },
  });
  return normalizeSubscriber(data, 0)!;
}

// --- Blog Page Newsletter ---

/**
 * POST /api/blog/newsletter/subscribe
 * Subscribe specifically from blog page
 */
export async function subscribeFromBlog(input: SubscribeInput): Promise<NewsletterSubscriber> {
  const data = await apiFetch<unknown>("/api/blog/newsletter/subscribe", {
    method: "POST",
    body: { ...input, source: "blog" as const },
  });
  return normalizeSubscriber(data, 0)!;
}

// --- Admin/Authenticated Operations ---

/**
 * GET /api/newsletter/subscribers
 * Get all subscribers (admin)
 */
export async function getSubscribers(filters?: {
  status?: NewsletterSubscriber["status"];
  source?: NewsletterSubscriber["source"];
}): Promise<NewsletterSubscriber[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.source) params.set("source", filters.source);
  
  const query = params.toString();
  const data = await apiFetch<unknown>(`/api/newsletter/subscribers${query ? `?${query}` : ""}`);
  return unwrapList(data, normalizeSubscriber);
}

/**
 * GET /api/newsletter/subscribers/{subscriberId}
 * Get specific subscriber (admin)
 */
export async function getSubscriber(subscriberId: string): Promise<NewsletterSubscriber> {
  const data = await apiFetch<unknown>(`/api/newsletter/subscribers/${subscriberId}`);
  return normalizeSubscriber(data, 0)!;
}

/**
 * PATCH /api/newsletter/subscribers/{subscriberId}
 * Update subscriber (admin)
 */
export async function updateSubscriber(
  subscriberId: string,
  input: Partial<Pick<NewsletterSubscriber, "name" | "status" | "preferences">>,
): Promise<NewsletterSubscriber> {
  const data = await apiFetch<unknown>(`/api/newsletter/subscribers/${subscriberId}`, {
    method: "PATCH",
    body: input,
  });
  return normalizeSubscriber(data, 0)!;
}

/**
 * DELETE /api/newsletter/subscribers/{subscriberId}
 * Delete subscriber (admin)
 */
export async function deleteSubscriber(subscriberId: string): Promise<void> {
  await apiFetch(`/api/newsletter/subscribers/${subscriberId}`, { method: "DELETE" });
}

/**
 * POST /api/newsletter/subscribers/import
 * Import subscribers from CSV (admin)
 */
export async function importSubscribers(file: File): Promise<{
  imported: number;
  failed: number;
  errors: string[];
}> {
  const formData = new FormData();
  formData.append("file", file);
  
  const data = await apiFetch<{
    imported: number;
    failed: number;
    errors: string[];
  }>("/api/newsletter/subscribers/import", {
    method: "POST",
    body: formData as any,
    headers: undefined,
  });
  return data;
}

// --- Campaigns (Admin) ---

/**
 * GET /api/newsletter/campaigns
 * Get all campaigns (admin)
 */
export async function getCampaigns(filters?: {
  status?: NewsletterCampaign["status"];
  category?: NewsletterCampaign["category"];
}): Promise<NewsletterCampaign[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.category) params.set("category", filters.category);
  
  const query = params.toString();
  const data = await apiFetch<unknown>(`/api/newsletter/campaigns${query ? `?${query}` : ""}`);
  return unwrapList(data, normalizeCampaign);
}

/**
 * POST /api/newsletter/campaigns
 * Create a new campaign (admin)
 */
export async function createCampaign(input: {
  subject: string;
  content: string;
  category: NewsletterCampaign["category"];
  scheduledAt?: string;
}): Promise<NewsletterCampaign> {
  const data = await apiFetch<unknown>("/api/newsletter/campaigns", {
    method: "POST",
    body: input,
  });
  return normalizeCampaign(data, 0)!;
}

/**
 * GET /api/newsletter/campaigns/{campaignId}
 * Get specific campaign (admin)
 */
export async function getCampaign(campaignId: string): Promise<NewsletterCampaign> {
  const data = await apiFetch<unknown>(`/api/newsletter/campaigns/${campaignId}`);
  return normalizeCampaign(data, 0)!;
}

/**
 * PATCH /api/newsletter/campaigns/{campaignId}
 * Update campaign (admin)
 */
export async function updateCampaign(
  campaignId: string,
  input: Partial<Pick<NewsletterCampaign, "subject" | "content" | "category" | "scheduledAt">>,
): Promise<NewsletterCampaign> {
  const data = await apiFetch<unknown>(`/api/newsletter/campaigns/${campaignId}`, {
    method: "PATCH",
    body: input,
  });
  return normalizeCampaign(data, 0)!;
}

/**
 * POST /api/newsletter/campaigns/{campaignId}/send
 * Send campaign immediately (admin)
 */
export async function sendCampaign(campaignId: string): Promise<NewsletterCampaign> {
  const data = await apiFetch<unknown>(`/api/newsletter/campaigns/${campaignId}/send`, {
    method: "POST",
  });
  return normalizeCampaign(data, 0)!;
}

/**
 * DELETE /api/newsletter/campaigns/{campaignId}
 * Delete campaign (admin)
 */
export async function deleteCampaign(campaignId: string): Promise<void> {
  await apiFetch(`/api/newsletter/campaigns/${campaignId}`, { method: "DELETE" });
}

/**
 * GET /api/newsletter/stats
 * Get newsletter statistics (admin)
 */
export async function getNewsletterStats(): Promise<{
  totalSubscribers: number;
  activeSubscribers: number;
  unsubscribedCount: number;
  totalCampaigns: number;
  sentCampaigns: number;
  scheduledCampaigns: number;
  averageOpenRate: number;
  averageClickRate: number;
}> {
  const data = await apiFetch<unknown>("/api/newsletter/stats");
  const record = (data ?? {}) as ApiRecord;
  return {
    totalSubscribers: Number(value(record, "totalSubscribers", "TotalSubscribers") ?? 0),
    activeSubscribers: Number(value(record, "activeSubscribers", "ActiveSubscribers") ?? 0),
    unsubscribedCount: Number(value(record, "unsubscribedCount", "UnsubscribedCount") ?? 0),
    totalCampaigns: Number(value(record, "totalCampaigns", "TotalCampaigns") ?? 0),
    sentCampaigns: Number(value(record, "sentCampaigns", "SentCampaigns") ?? 0),
    scheduledCampaigns: Number(value(record, "scheduledCampaigns", "ScheduledCampaigns") ?? 0),
    averageOpenRate: Number(value(record, "averageOpenRate", "AverageOpenRate") ?? 0),
    averageClickRate: Number(value(record, "averageClickRate", "AverageClickRate") ?? 0),
  };
}
