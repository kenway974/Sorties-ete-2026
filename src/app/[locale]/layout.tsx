import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HeaderClient from "@/components/layout/HeaderClient";
import Footer from "@/components/layout/Footer";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (locale !== "fr") notFound();

  let profile = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      profile = data;
    }
  } catch {}

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderClient locale={locale} profile={profile} />
      <main className="flex-1">{children}</main>
      <Footer />
      <OnboardingWizard locale={locale} />
    </div>
  );
}
