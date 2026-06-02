"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { MapPin, CheckCircle } from "lucide-react";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations("auth.register");
  const [done, setDone] = useState(false);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-navy rounded-2xl mb-4">
            <MapPin className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ParisSorties</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {done ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="font-semibold text-gray-900 mb-2">{t("title")}</p>
              <p className="text-sm text-gray-500">{t("verify_email")}</p>
            </div>
          ) : (
            <RegisterForm locale={locale} onSuccess={() => setDone(true)} />
          )}
        </div>
      </div>
    </div>
  );
}
