"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Shuffle } from "lucide-react";

export default function DiscoverButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "fr";

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/activities/random");
      const { id } = await res.json();
      if (id) router.push(`/${locale}/activities/${id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white font-medium transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:scale-100 backdrop-blur-sm"
    >
      <Shuffle className={`w-4 h-4 text-brand-gold ${loading ? "animate-spin" : ""}`} />
      {loading ? "Recherche..." : "Surprends-moi"}
    </button>
  );
}
