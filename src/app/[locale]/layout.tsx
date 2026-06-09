import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HeaderClient from "@/components/layout/HeaderClient";
import Footer from "@/components/layout/Footer";
import CookieConsent from "@/components/layout/CookieConsent";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import SkipNav from "@/components/layout/SkipNav";

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
      <SkipNav />
      <HeaderClient locale={locale} profile={profile} />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer locale={locale} />
      <CookieConsent locale={locale} />
      <OnboardingWizard locale={locale} />
    </div>
  );
}
