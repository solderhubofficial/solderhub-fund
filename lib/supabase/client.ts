import { createBrowserClient } from "@supabase/ssr";

// Cookie domain is shared across every solderhub.com subdomain so a session
// started on the main site (or simulator.solderhub.com) is already valid
// here — this is what makes the login "unified" instead of a separate
// account system. Leave NEXT_PUBLIC_AUTH_COOKIE_DOMAIN unset locally
// (localhost can't set a .solderhub.com cookie).
const cookieDomain = process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN;

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    cookieDomain ? { cookieOptions: { domain: cookieDomain } } : undefined
  );
}
