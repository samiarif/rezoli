import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // Expose the pathname so server layouts can branch on the current route
  // (the admin layout renders /admin/login without the protected shell).
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  const forward = () =>
    NextResponse.next({ request: { headers: requestHeaders } });

  // Admin auth is a signed cookie verified in-app (Node runtime). The edge
  // runtime can't verify it here (no node:crypto), so forward and let the
  // admin layout + requireAdmin() do the gating.
  if (pathname.startsWith("/admin")) {
    return forward();
  }

  // Customer area (/compte) — still backed by Supabase magic-link.
  const isLogin =
    pathname === "/compte/login" || pathname.startsWith("/compte/auth");
  if (isLogin) return forward();

  // No Supabase env — let the page handle it (it'll redirect to /login).
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return forward();
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(values) {
          values.forEach(({ name, value }) => request.cookies.set(name, value));
          values.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    url.pathname = "/compte/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/compte/:path*"],
};
