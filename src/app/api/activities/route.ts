import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { futureOrClause } from "@/lib/utils/parisTime";
import { rateLimit, getRateLimitKey } from "@/lib/utils/rateLimit";

const CATEGORIES = [
  "soirees", "concerts", "expositions", "restaurants", "bars",
  "sport", "culture", "famille", "etudiants", "networking", "loisirs",
] as const;

const querySchema = z.object({
  category: z.enum(CATEGORIES).optional(),
  search:   z.string().max(100).optional(),
  date:     z.enum(["today", "tomorrow", "week", "weekend"]).optional(),
  price:    z.enum(["free", "paid"]).optional(),
  limit:    z.coerce.number().int().min(1).max(100).default(30),
  offset:   z.coerce.number().int().min(0).default(0),
});

export async function GET(request: NextRequest) {
  const limited = rateLimit(getRateLimitKey(request, "activities"), { limit: 60, windowSecs: 60 });
  if (limited) return limited;

  const parsed = querySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams)
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Paramètres invalides", details: parsed.error.flatten() }, { status: 400 });
  }
  const { category, search, date, price, limit, offset } = parsed.data;

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
    .or(futureOrClause())
    .order("date", { ascending: true })
    .order("time", { ascending: true })
    .range(offset, offset + limit - 1);

  if (category) query = query.eq("category", category);
  if (search)   query = query.ilike("title", `%${search}%`);
  if (price === "free") query = query.or("price.eq.0,price.is.null");
  if (price === "paid") query = query.gt("price", 0);
  if (date === "today") {
    query = query.eq("date", new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Paris" }));
  }

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ activities: data, total: count });
}
