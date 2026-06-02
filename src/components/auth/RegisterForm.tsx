"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface RegisterFormProps {
  locale: string;
  onSuccess: () => void;
}

export default function RegisterForm({ locale, onSuccess }: RegisterFormProps) {
  const [form, setForm] = useState({ email: "", password: "", confirm: "", username: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Les mots de passe ne correspondent pas"); return; }
    if (form.password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères"); return; }
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { username: form.username } },
    });
    if (err) {
      setError(err.message.includes("already") ? "Cet email est déjà utilisé" : err.message);
    } else {
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Pseudo" value={form.username} onChange={set("username")} required />
      <Input label="Email" type="email" value={form.email} onChange={set("email")} required autoComplete="email" />
      <Input label="Mot de passe" type="password" value={form.password} onChange={set("password")} required autoComplete="new-password" />
      <Input label="Confirmer le mot de passe" type="password" value={form.confirm} onChange={set("confirm")} required autoComplete="new-password" />
      {error && <p className="text-sm text-brand-red">{error}</p>}
      <Button type="submit" loading={loading} className="w-full">
        Créer mon compte
      </Button>
      <p className="text-center text-sm text-gray-500">
        Déjà un compte ?{" "}
        <Link href={`/${locale}/auth/login`} className="text-brand-navy font-medium hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
