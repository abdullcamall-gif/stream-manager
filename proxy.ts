import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "stream-saas-ultra-secure-key-2024";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes, excluding login
  // We allow /admin/login to be accessible
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(ADMIN_JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      
      const role = payload.role as string;
      const isAdminOnlyRoute = pathname === "/admin/users" || pathname === "/admin/settings";

      if (role === "SUPPORT" && isAdminOnlyRoute) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      
      return NextResponse.next();
    } catch (error) {
      console.error('Proxy auth error:', error);
      // If token is invalid, clear it and redirect to login
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('admin_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
