import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const supabase = await createClient();
  let query = supabase
    .from("activities")
    .select("id")
    .eq("status", "approved")
    .gte("date", new Date().toISOString().split("T")[0]);

  if (category) query = query.eq("category", category);

  const { data } = await query;
  if (!data || data.length === 0) {
    return NextResponse.json({ id: null });
  }
  const random = data[Math.floor(Math.random() * data.length)];
  return NextResponse.json({ id: random.id });
}
