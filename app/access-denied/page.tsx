import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";

export default async function AccessDeniedPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F6FA] px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-7 text-center shadow-sm">
        <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#FBEFE6] text-lg">
          🔒
        </span>
        <p className="font-['Fraunces',serif] text-lg text-[#101828]">No fund access yet</p>
        <p className="mt-2 text-sm text-[#101828]/60">
          {user?.email ? <>Signed in as {user.email}, but this </> : <>This </>}
          Solderhub account isn&rsquo;t set up as a Fund Member or Fund Manager. Ask a fund
          manager to grant your account access.
        </p>
        {user && (
          <div className="mt-5">
            <SignOutButton />
          </div>
        )}
      </div>
    </div>
  );
}
