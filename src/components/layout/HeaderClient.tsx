"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Header from "./Header";
import type { Profile } from "@/types";

interface HeaderClientProps {
  locale: string;
  profile: Profile | null;
}

export default function HeaderClient({ locale, profile }: HeaderClientProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}`);
    router.refresh();
  };

  return <Header locale={locale} user={profile} onLogout={handleLogout} />;
}
