import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  if (!code || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.redirect(`${origin}/admin/login?error=missing-code`);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    return NextResponse.redirect(
      `${origin}/admin/login?error=${encodeURIComponent(error?.message ?? "auth-failed")}`
    );
  }

  if (!isAdminEmail(data.user.email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/admin/login?error=not-authorized`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
