import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// Same shared-domain cookie as lib/supabase/client.ts — see the comment
// there. Both must match or the session won't be visible on both sides.
const cookieDomain = process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN;

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: cookieDomain ? { domain: cookieDomain } : undefined,
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as CookieOptions)
            );
          } catch {
            // Called from a Server Component during render — safe to ignore
            // since middleware.ts refreshes the session on every request.
          }
        },
      },
    }
  );
}
