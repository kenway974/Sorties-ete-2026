import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

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

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

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
