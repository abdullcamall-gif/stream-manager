import { SYSTEM_CONTRACT_PATH } from "@/lib/contract";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { type AdminRole } from "@prisma/client";

const JWT_EXPIRATION = "8h";

type AuthErrorCode = "INVALID_INPUT" | "UNAUTHORIZED" | "FORBIDDEN";

type AdminJwtPayload = {
  sub: string;
  email: string;
  role: AdminRole;
};

export type AdminAuthResult =
  | { ok: true; data: { token: string } }
  | { ok: false; statusCode: number; error: { code: AuthErrorCode; message: string } };

export type AdminSessionResult =
  | { ok: true; data: AdminJwtPayload }
  | { ok: false; statusCode: number; error: { code: AuthErrorCode; message: string } };

function getJwtSecret(): string | null {
  return process.env.ADMIN_JWT_SECRET?.trim() || null;
}

export async function loginAdmin(emailInput: string, passwordInput: string): Promise<AdminAuthResult> {
  void SYSTEM_CONTRACT_PATH;

  try {
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput;
    if (!email || !password) {
      return {
        ok: false,
        statusCode: 400,
        error: { code: "INVALID_INPUT", message: "email and password are required" },
      };
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email },
      select: { id: true, email: true, role: true, passwordHash: true },
    });

    if (!admin) {
      return {
        ok: false,
        statusCode: 401,
        error: { code: "UNAUTHORIZED", message: "invalid credentials" },
      };
    }

    const passwordMatches = await bcrypt.compare(password, admin.passwordHash);
    if (!passwordMatches) {
      return {
        ok: false,
        statusCode: 401,
        error: { code: "UNAUTHORIZED", message: "invalid credentials" },
      };
    }

    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      return {
        ok: false,
        statusCode: 500,
        error: { code: "UNAUTHORIZED", message: "missing ADMIN_JWT_SECRET" },
      };
    }

    const token = jwt.sign(
      {
        sub: admin.id,
        email: admin.email,
        role: admin.role,
      } satisfies AdminJwtPayload,
      jwtSecret,
      { expiresIn: JWT_EXPIRATION },
    );

    return { ok: true, data: { token } };
  } catch (error) {
    console.error("loginAdmin prisma error:", error);
    const message =
      process.env.NODE_ENV === "development"
        ? error instanceof Error
          ? error.message
          : String(error)
        : "admin auth internal error";

    return {
      ok: false,
      statusCode: 500,
      error: { code: "INVALID_INPUT", message },
    };
  }
}

export async function authorizeAdmin(
  authorizationHeader: string | null,
  allowedRoles: AdminRole[] = ["SUPPORT", "ADMIN"],
): Promise<AdminSessionResult> {
  void SYSTEM_CONTRACT_PATH;

  if (!authorizationHeader?.startsWith("Bearer ")) {
    return {
      ok: false,
      statusCode: 401,
      error: { code: "UNAUTHORIZED", message: "missing bearer token" },
    };
  }

  const jwtSecret = getJwtSecret();
  if (!jwtSecret) {
    return {
      ok: false,
      statusCode: 500,
      error: { code: "UNAUTHORIZED", message: "missing ADMIN_JWT_SECRET" },
    };
  }

  const token = authorizationHeader.slice("Bearer ".length).trim();
  try {
    const decoded = jwt.verify(token, jwtSecret) as Partial<AdminJwtPayload>;
    const subject = typeof decoded.sub === "string" ? decoded.sub : "";
    const role = decoded.role === "ADMIN" || decoded.role === "SUPPORT" ? decoded.role : null;

    if (!subject) {
      return {
        ok: false as const,
        statusCode: 401,
        error: { code: "UNAUTHORIZED" as const, message: "invalid token" },
      };
    }

    if (role && allowedRoles.includes(role)) {
      return {
        ok: true as const,
        data: {
          sub: subject,
          email: typeof decoded.email === "string" ? decoded.email : "",
          role,
        },
      };
    }

    // Backward-compatible fallback for tokens that may not carry role.
    const admin = await prisma.adminUser.findUnique({
      where: { id: subject },
      select: { email: true, role: true },
    });

    if (!admin || !allowedRoles.includes(admin.role)) {
      return {
        ok: false as const,
        statusCode: 403,
        error: { code: "FORBIDDEN" as const, message: "insufficient role" },
      };
    }

    return {
      ok: true as const,
      data: {
        sub: subject,
        email: admin.email,
        role: admin.role,
      },
    };
  } catch {
    return {
      ok: false,
      statusCode: 401,
      error: { code: "UNAUTHORIZED", message: "invalid token" },
    };
  }
}

