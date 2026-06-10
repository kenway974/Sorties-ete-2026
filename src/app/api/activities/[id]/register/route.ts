import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { rateLimit, getRateLimitKey } from "@/lib/utils/rateLimit";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CookieToSet = { name: string; value: string; options?: any };

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(getRateLimitKey(request, "register"), { limit: 10, windowSecs: 60 });
  if (limited) return limited;

  const { id } = await params;
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

  const { data: activity } = await supabase
    .from("activities")
    .select("max_participants, current_participants")
    .eq("id", id)
    .single();

  if (!activity) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (activity.max_participants !== null && activity.current_participants >= activity.max_participants) {
    return NextResponse.json({ error: "Activity is full" }, { status: 400 });
  }

  const { error } = await supabase
    .from("activity_registrations")
    .insert({ activity_id: id, user_id: user.id });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase
    .from("activities")
    .update({ current_participants: activity.current_participants + 1 })
    .eq("id", id);

  // Fire-and-forget confirmation email (graceful degradation if edge fn unavailable)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseUrl && anonKey) {
    fetch(`${supabaseUrl}/functions/v1/send-confirmation`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${anonKey}` },
      body: JSON.stringify({ userId: user.id, activityId: id }),
    }).catch(() => {});
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(getRateLimitKey(request, "register"), { limit: 10, windowSecs: 60 });
  if (limited) return limited;

  const { id } = await params;
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

  await supabase
    .from("activity_registrations")
    .delete()
    .match({ activity_id: id, user_id: user.id });

  const { data: activity } = await supabase
    .from("activities")
    .select("current_participants")
    .eq("id", id)
    .single();

  if (activity) {
    await supabase
      .from("activities")
      .update({ current_participants: Math.max(0, activity.current_participants - 1) })
      .eq("id", id);
  }

  return NextResponse.json({ success: true });
}
