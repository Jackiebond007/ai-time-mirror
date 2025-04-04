import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { waitUntil } from "@vercel/functions";
import { dub } from "@/lib/dub";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/";

  console.log("code: ", code);
  console.log("origin1: ", origin);
  console.log("next: ", next);

  if (code) {
    console.log("origin2: ", origin);
    const supabase = createClient(cookies());
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { user } = data;
      const clickId =
        cookies().get("dub_id")?.value || cookies().get("dclid")?.value;
      const isNewUser =
        new Date(user.created_at) > new Date(Date.now() - 10 * 60 * 1000);
      // if the user is new and has a clickId cookie, track the lead
      if (clickId && isNewUser) {
        waitUntil(
          dub.track.lead({
            clickId,
            eventName: "Sign Up",
            customerId: user.id,
            customerName: user.user_metadata.name,
            customerEmail: user.email,
            customerAvatar: user.user_metadata.avatar_url,
          }),
        );
        // delete the clickId cookie
        cookies().delete("dub_id");
        cookies().delete("dclid");
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
