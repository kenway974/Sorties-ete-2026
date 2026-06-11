import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { rateLimit, getRateLimitKey } from "@/lib/utils/rateLimit";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CookieToSet = { name: string; value: string; options?: any };

const bodySchema = z.object({
  content_type: z.enum(["activity", "review", "photo"]),
  content_id:   z.string().uuid(),
  reason:       z.enum(["spam", "offensive", "wrong_info", "advertising"]),
  description:  z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  const limited = rateLimit(getRateLimitKey(request, "reports"), { limit: 5, windowSecs: 300 });
  if (limited) return limited;

  let raw: unknown;
  try { raw = await request.json(); }
  catch { return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 }); }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 });
  }
  const { content_type, content_id, reason, description } = parsed.data;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet: CookieToSet[]) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    content_type,
    content_id,
    reason,
    description: description || null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
