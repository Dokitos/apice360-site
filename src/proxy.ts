import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Next.js 16 renamed `middleware.ts`/`middleware` to `proxy.ts`/`proxy`.
export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoginRoute = pathname === "/admin/login";

  if (!req.auth && !isLoginRoute) {
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin));
  }

  if (req.auth && isLoginRoute) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  }

  if (pathname.startsWith("/admin/users") && req.auth?.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
