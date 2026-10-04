import { apiFetch } from "./client";

export type CallIceServer = {
  urls: string | string[];
  username?: string;
  credential?: string;
};

export type CallRealtimeCredentials = {
  accessToken: string;
  expiresAt?: string;
  iceServers?: CallIceServer[];
};

/**
 * The ASP.NET API verifies the current app session and issues a short-lived,
 * Supabase-compatible JWT scoped to this user's permitted call contacts.
 */
export async function getCallRealtimeCredentials(): Promise<CallRealtimeCredentials> {
  const data = await apiFetch<{
    accessToken?: string;
    token?: string;
    expiresAt?: string;
    iceServers?: CallIceServer[];
  }>("/api/calls/realtime-token", { method: "POST", body: {} });

  const accessToken = data.accessToken || data.token;
  if (!accessToken) {
    throw new Error("The call signaling token was not returned by the server.");
  }

  return {
    accessToken,
    expiresAt: data.expiresAt,
    iceServers: data.iceServers,
  };
}
