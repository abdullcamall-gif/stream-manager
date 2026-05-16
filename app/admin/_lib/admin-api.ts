const ADMIN_TOKEN_KEY = "admin_token";
const ADMIN_CSRF_KEY = "admin_csrf_token";
export type AdminClientRole = "ADMIN" | "SUPPORT";

type AdminTokenPayload = {
  sub?: string;
  email?: string;
  role?: AdminClientRole;
  exp?: number;
};

export function getAdminToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(ADMIN_TOKEN_KEY) ?? "";
}

export function setAdminToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function setAdminCsrfToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_CSRF_KEY, token);
}

export function getAdminCsrfToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(ADMIN_CSRF_KEY) ?? "";
}

export function clearAdminToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_CSRF_KEY);
}

function decodeTokenPayload(token: string): AdminTokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json) as AdminTokenPayload;
  } catch {
    return null;
  }
}

export function getAdminRoleFromToken(): AdminClientRole | null {
  const token = getAdminToken();
  if (!token) return null;
  const payload = decodeTokenPayload(token);
  if (!payload) return null;
  return payload.role === "ADMIN" || payload.role === "SUPPORT" ? payload.role : null;
}

type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

function readErrorMessage(payload: unknown): string {
  if (typeof payload === "object" && payload !== null && "error" in payload) {
    const error = (payload as { error?: unknown }).error;
    if (typeof error === "string") return error;
    if (typeof error === "object" && error !== null && "message" in error) {
      const message = (error as { message?: unknown }).message;
      if (typeof message === "string") return message;
    }
  }

  return "Request failed";
}

export async function adminFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  const token = getAdminToken();
  const csrfToken = getAdminCsrfToken();
  const method = (init?.method ?? "GET").toUpperCase();
  const shouldSendCsrf = method !== "GET" && method !== "HEAD" && method !== "OPTIONS";

  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(shouldSendCsrf && csrfToken ? { "x-csrf-token": csrfToken } : {}),
    },
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAdminToken();
    }

    return {
      ok: false,
      status: response.status,
      message: readErrorMessage(payload),
    };
  }

  return {
    ok: true,
    data: payload as T,
  };
}
