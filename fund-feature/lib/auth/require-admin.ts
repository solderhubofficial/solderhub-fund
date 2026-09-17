import { NextRequest, NextResponse } from "next/server";

/**
 * PLACEHOLDER. Replace the body of this function with your project's real
 * session/role check (the same one your other admin write-routes use).
 * Returning `null` means "allowed to proceed"; returning a NextResponse
 * short-circuits the route with that response.
 */
export async function requireAdmin(_req: NextRequest): Promise<NextResponse | null> {
  // TODO: check the authenticated user's session/role here, e.g.:
  //   const session = await getSession(req);
  //   if (!session || !session.user.isAdmin) {
  //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  //   }
  //   return null;
  throw new Error(
    "requireAdmin() is a placeholder — wire this to your real auth before deploying.",
  );
}
