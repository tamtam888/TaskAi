import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/tasks";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? origin;

  if (!code) {
    console.error("[Auth Callback] No code param received — origin:", origin);
    return NextResponse.redirect(`${siteUrl}/login?error=auth`);
  }

  // Create the redirect response FIRST so we can set session cookies directly on it.
  // Using cookies() from next/headers does NOT reliably forward cookies to an explicitly
  // returned NextResponse.redirect() in Next.js 14 — the Set-Cookie headers are lost.
  const response = NextResponse.redirect(`${siteUrl}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Read existing cookies (including the PKCE code_verifier) from the request.
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Write onto both request (so subsequent getAll() calls see them) and
            // the response (so the browser receives the Set-Cookie headers).
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (!error) {
    return response;
  }

  console.error("[Auth Callback] exchangeCodeForSession failed:", error.message);
  return NextResponse.redirect(`${siteUrl}/login?error=auth`);
}
