"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MapPin, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { getSiteUrl } from "@/lib/utils/siteUrl";

export default function ForgotPasswordPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getSiteUrl()}/auth/callback?next=/auth/reset-password`,
    });
    setLoading(false);
    if (err) {
      setError("Une erreur est survenue. Vérifiez votre adresse email.");
      return;
    }
    setDone(true);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-navy rounded-2xl mb-4">
            <MapPin className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ParisSorties</h1>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          {done ? (
            <div className="text-center py-4">
              <MailCheck className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="font-semibold text-gray-900 mb-2">Email envoyé !</p>
              <p className="text-sm text-gray-500">
                Consultez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Mot de passe oublié ?</h2>
              <p className="text-sm text-gray-500 mb-5">
                Saisissez votre email et nous vous enverrons un lien de réinitialisation.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
                {error && <p className="text-sm text-brand-red">{error}</p>}
                <Button type="submit" loading={loading} className="w-full">
                  Envoyer le lien
                </Button>
              </form>
            </>
          )}
          <p className="text-center text-sm text-gray-500 mt-4">
            <Link href={`/${locale}/auth/login`} className="text-brand-navy font-medium hover:underline">
              Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
