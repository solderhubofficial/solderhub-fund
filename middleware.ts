import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getUnifiedRole, hasFundAccess } from "@/lib/auth/roles";

const cookieDomain = process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN;

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: cookieDomain ? { domain: cookieDomain } : undefined,
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as CookieOptions)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  // Routes reachable without a fund role: the (unified) login form, the
  // magic-link callback, and the page that explains why access was denied.
  const isPublicRoute =
    path.startsWith("/login") || path.startsWith("/auth") || path.startsWith("/access-denied");

  if (!user) {
    if (isPublicRoute) return response;
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", path);
    return NextResponse.redirect(redirectUrl);
  }

  if (isPublicRoute) return response;

  // Signed in via the unified Solderhub account — now check they're
  // actually provisioned for the fund (role = fund_user or fund_manager).
  const role = await getUnifiedRole(supabase, user.id);
  if (!hasFundAccess(role)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/access-denied";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
