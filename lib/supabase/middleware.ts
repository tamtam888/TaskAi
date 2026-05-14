import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  try {
    // Create the response BEFORE wiring up the Supabase client so that setAll
    // can write refreshed session cookies onto this exact object.  Creating a
    // new NextResponse inside setAll (the old pattern) risks the reassigned
    // reference diverging from whatever response branch is ultimately returned.
    const supabaseResponse = NextResponse.next({
      request,
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(
            cookiesToSet: { name: string; value: string; options: CookieOptions }[]
          ) {
            // Mirror onto request.cookies so any subsequent getAll() call in
            // this same middleware run sees the refreshed values.
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            // Write onto the pre-created response so the browser receives the
            // updated Set-Cookie headers.
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // getUser() re-validates the JWT with Supabase Auth on every request and
    // refreshes the session if the access token is expired (updating cookies via setAll).
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser();

    if (getUserError) {
      console.error(
        "[Middleware] getUser error:",
        getUserError.message,
        "| path:",
        request.nextUrl.pathname
      );
    }

    const pathname = request.nextUrl.pathname;
    const isAuthPage = pathname === "/login" || pathname === "/signup";
    const isProtectedPage =
      pathname.startsWith("/tasks") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/projects");

    if (!user && isProtectedPage) {
      console.error(
        "[Middleware] Unauthenticated request to protected route:",
        pathname,
        "| cookies present:",
        request.cookies.getAll().map((c) => c.name).join(", ") || "none"
      );
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (user && isAuthPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/tasks";
      return NextResponse.redirect(url);
    }

    if (user && pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/tasks";
      return NextResponse.redirect(url);
    }

    if (!user && pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch (err) {
    console.error("[Middleware] Unexpected error:", err);
    return NextResponse.next({ request });
  }
}
