import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let realtimeClient: SupabaseClient | null = null;
let activeAccessToken = "";

export function isSupabaseRealtimeConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function getSupabaseRealtimeClient(accessToken: string): SupabaseClient {
  if (typeof window === "undefined") {
    throw new Error("Realtime calling is only available in the browser.");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Supabase Realtime is not configured.");
  }

  activeAccessToken = accessToken;
  if (!realtimeClient) {
    realtimeClient = createClient(url, anonKey, {
      // Apply the ASP.NET-issued Supabase JWT to both PostgREST and Realtime.
      accessToken: async () => activeAccessToken,
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      realtime: { params: { eventsPerSecond: 20 } },
    });
  }

  // Supabase-compatible JWT issued by the authenticated ASP.NET API.
  realtimeClient.realtime.setAuth(accessToken);
  return realtimeClient;
}
