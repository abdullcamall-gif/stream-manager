import crypto from "node:crypto";

export const CSRF_COOKIE_NAME = "admin_csrf_token";

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function readCookie(request: Request, name: string): string | null {
  const cookie = request.headers.get("cookie");
  if (!cookie) return null;
  const parts = cookie.split(";").map((part) => part.trim());
  for (const part of parts) {
    if (part.startsWith(`${name}=`)) {
      return decodeURIComponent(part.slice(name.length + 1));
    }
  }
  return null;
}

export function verifyCsrf(request: Request): boolean {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return true;

  const cookieToken = readCookie(request, CSRF_COOKIE_NAME);
  const headerToken = request.headers.get("x-csrf-token");
  if (!cookieToken || !headerToken) return false;
  return cookieToken === headerToken;
}
