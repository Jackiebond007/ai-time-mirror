import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { GalleryPage } from "@/app/gallery/gallery-page";

export default async function Gallery() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = await supabase
    .from("data")
    .select("*")
    .order("created_at", { ascending: false })
    .match({ user_id: user?.id || "", failed: false });
  return <GalleryPage data={data} />;
}
