import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const date = searchParams.get("date");
  const price = searchParams.get("price");
  const limit = parseInt(searchParams.get("limit") || "30");
  const offset = parseInt(searchParams.get("offset") || "0");

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  let query = supabase
    .from("activities")
    .select(`
      *,
      creator:profiles!activities_creator_id_fkey(id, username, avatar_url),
      photos:activity_photos(id, url)
    `, { count: "exact" })
    .eq("status", "approved")
    .gte("date", new Date().toISOString().split("T")[0])
    .order("date", { ascending: true })
    .range(offset, offset + limit - 1);

  if (category) query = query.eq("category", category);
  if (search) query = query.ilike("title", `%${search}%`);
  if (price === "free") query = query.is("price", null);
  if (price === "paid") query = query.not("price", "is", null);
  if (date === "today") query = query.eq("date", new Date().toISOString().split("T")[0]);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ activities: data, total: count });
}
