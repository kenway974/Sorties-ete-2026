import Link from "next/link";
import { MailCheck } from "lucide-react";

export default async function VerifyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
          <MailCheck className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Vérifiez votre email</h1>
        <p className="text-gray-500 mb-6">
          Nous vous avons envoyé un email de confirmation.
          Cliquez sur le lien pour activer votre compte.
        </p>
        <Link
          href={`/${locale}/auth/login`}
          className="text-brand-navy font-medium hover:underline"
        >
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
