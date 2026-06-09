import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { rateLimit, getRateLimitKey } from "@/lib/utils/rateLimit";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CookieToSet = { name: string; value: string; options?: any };

const VALID_CONTENT_TYPES = ["activity", "review", "photo"] as const;
const VALID_REASONS = ["spam", "offensive", "wrong_info", "advertising"] as const;

export async function POST(request: NextRequest) {
  const limited = rateLimit(getRateLimitKey(request, "reports"), { limit: 5, windowSecs: 300 });
  if (limited) return limited;

  const body = await request.json();
  const { content_type, content_id, reason, description } = body;

  if (!VALID_CONTENT_TYPES.includes(content_type)) {
    return NextResponse.json({ error: "content_type invalide" }, { status: 400 });
  }
  if (!VALID_REASONS.includes(reason)) {
    return NextResponse.json({ error: "reason invalide" }, { status: 400 });
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(content_id ?? "")) {
    return NextResponse.json({ error: "content_id invalide" }, { status: 400 });
  }

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
