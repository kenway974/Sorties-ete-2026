import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import EditActivityForm from "./EditActivityForm";
import type { Activity } from "@/types";

export const metadata: Metadata = {
  title: "Modifier l'activité | ParisSorties",
  robots: { index: false, follow: false },
};

export default async function EditActivityPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const { data: activity } = await supabase
    .from("activities")
    .select("*")
    .eq("id", id)
    .eq("creator_id", user.id)
    .single();

  if (!activity) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Modifier l&apos;activité</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Les modifications seront soumises à validation.</p>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <EditActivityForm activity={activity as Activity} locale={locale} />
      </div>
    </div>
  );
}
