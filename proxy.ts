import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  const isProtected =
    pathname.startsWith("/admin") || pathname.startsWith("/compte");
  const isLogin =
    pathname === "/admin/login" || pathname === "/compte/login" ||
    pathname.startsWith("/admin/auth") || pathname.startsWith("/compte/auth");

  if (!isProtected || isLogin) return NextResponse.next();

  // No Supabase env — let the page handle it (it'll redirect to /login).
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
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
    url.pathname = pathname.startsWith("/admin")
      ? "/admin/login"
      : "/compte/login";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin")) {
    const allow = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (!allow.includes((user.email ?? "").toLowerCase())) {
      url.pathname = "/compte";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/compte/:path*"],
};
