import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ModerationClient from "./ModerationClient";

export default async function ModerationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile || (profile.role !== "admin" && profile.role !== "moderator")) redirect(`/${locale}`);

  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return <ModerationClient reports={reports || []} />;
}
