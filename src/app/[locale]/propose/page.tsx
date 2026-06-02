"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ProposeForm from "@/components/activities/ProposeForm";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function ProposePage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations("propose");
  const [userId, setUserId] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{t("title")}</h1>
      <p className="text-gray-500 mb-6">{t("subtitle")}</p>

      {done ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t("form.success")}</h2>
          <p className="text-gray-500 text-sm mb-6">⭐</p>
          <Link href={`/${locale}`}>
            <Button variant="outline">{"Retour à l'accueil"}</Button>
          </Link>
        </div>
      ) : !userId ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-500 mb-4">{t("login_required")}</p>
          <Link href={`/${locale}/auth/login`}>
            <Button>{"Se connecter"}</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <ProposeForm userId={userId} onSuccess={() => setDone(true)} />
        </div>
      )}
    </div>
  );
}
