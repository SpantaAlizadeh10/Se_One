/**
 * Thin fetch wrapper around your .NET Web API.
 *
 * Configure the base URL via NEXT_PUBLIC_API_BASE_URL (see .env.local.example).
 * `credentials: "include"` is on by default so this works whether your API
 * uses ASP.NET Identity cookie auth, JWT bearer auth, or both — if you're
 * cookie-only, you can ignore the token helpers below entirely.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const TOKEN_KEY = "se-one-token";
const API_REQUEST_TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

type ApiFetchOptions = Omit<RequestInit, "body"> & { body?: unknown };

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  if (!BASE_URL) {
    throw new ApiError(
      "Backend API URL is not configured. Set NEXT_PUBLIC_API_BASE_URL in .env.local.",
      0,
    );
  }

  const { body, headers, signal, ...rest } = options;
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  const token = getToken();
  const controller = new AbortController();
  const forwardAbort = () => controller.abort(signal?.reason);

  if (signal?.aborted) {
    forwardAbort();
  } else {
    signal?.addEventListener("abort", forwardAbort, { once: true });
  }

  const timeoutId = setTimeout(
    () => controller.abort(),
    API_REQUEST_TIMEOUT_MS,
  );

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...rest,
      signal: controller.signal,
      credentials: "include",
      headers: {
        ...(!isFormData ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body:
        body === undefined
          ? undefined
          : isFormData
            ? body
            : JSON.stringify(body),
    });

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const responseBody = isJson ? res.json() : res.text();
    const data = await responseBody.catch((error) => {
      if (controller.signal.aborted) throw error;
      return null;
    });

    if (!res.ok) {
      // ASP.NET's default ProblemDetails error shape uses "title"/"detail";
      // adjust this line if your API returns errors differently.
      const message =
        (isJson &&
          data &&
          ((data as any).message ||
            (data as any).title ||
            (data as any).detail)) ||
        res.statusText ||
        "Request failed";
      throw new ApiError(message, res.status, data);
    }

    return data as T;
  } catch (error) {
    if (controller.signal.aborted && !signal?.aborted) {
      throw new ApiError("The API request timed out. Please try again.", 408);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener("abort", forwardAbort);
  }
}
