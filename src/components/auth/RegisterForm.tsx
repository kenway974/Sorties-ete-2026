"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface RegisterFormProps {
  locale: string;
  onSuccess: () => void;
}

export default function RegisterForm({ locale, onSuccess }: RegisterFormProps) {
  const t = useTranslations("auth");
  const [form, setForm] = useState({ email: "", password: "", confirm: "", username: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError(t("errors.passwords_dont_match")); return; }
    if (form.password.length < 8) { setError(t("errors.weak_password")); return; }
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { username: form.username } },
    });
    if (err) {
      setError(err.message.includes("already") ? t("errors.email_taken") : err.message);
    } else {
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label={t("register.username")} value={form.username} onChange={set("username")} required />
      <Input label={t("register.email")} type="email" value={form.email} onChange={set("email")} required autoComplete="email" />
      <Input label={t("register.password")} type="password" value={form.password} onChange={set("password")} required autoComplete="new-password" />
      <Input label={t("register.confirm_password")} type="password" value={form.confirm} onChange={set("confirm")} required autoComplete="new-password" />
      {error && <p className="text-sm text-brand-red">{error}</p>}
      <Button type="submit" loading={loading} className="w-full">
        {t("register.submit")}
      </Button>
      <p className="text-center text-sm text-gray-500">
        {t("register.already_account")}{" "}
        <Link href={`/${locale}/auth/login`} className="text-brand-navy font-medium hover:underline">
          {t("register.login_link")}
        </Link>
      </p>
    </form>
  );
}
