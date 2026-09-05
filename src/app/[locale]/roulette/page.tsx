import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Roulette from "@/components/roulette/Roulette";

export const metadata: Metadata = {
  title: "La Roulette — une sortie insolite à la fois",
  description:
    "On ne te demande ni ton humeur ni avec qui tu sors : on montre. Une sortie insolite à Paris à la fois, et un seul bouton.",
  robots: { index: true, follow: true },
};

export default async function RoulettePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <Roulette locale={locale} userId={user?.id ?? null} />;
}
