import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile || (profile.role !== "admin" && profile.role !== "moderator")) redirect(`/${locale}`);

  const { data: pendingActivities } = await supabase
    .from("activities")
    .select("*, creator:profiles!activities_creator_id_fkey(id, username)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
  const { count: activityCount } = await supabase.from("activities").select("*", { count: "exact", head: true }).eq("status", "approved");
  const { count: reportCount } = await supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending");

  return (
    <AdminClient
      pendingActivities={pendingActivities || []}
      stats={{
        users: userCount || 0,
        activities: activityCount || 0,
        pending: pendingActivities?.length || 0,
        reports: reportCount || 0,
      }}
    />
  );
}
