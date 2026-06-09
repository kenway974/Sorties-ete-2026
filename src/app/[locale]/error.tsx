"use client";
import { useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[PageError]", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-6xl mb-4" aria-hidden="true">😥</p>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Une erreur est survenue</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
        Quelque chose s&apos;est mal passé de notre côté.
      </p>
      {error.digest && (
        <p className="text-gray-400 text-xs mb-6 font-mono">Réf : {error.digest}</p>
      )}
      {!error.digest && <div className="mb-6" />}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={reset}>Réessayer</Button>
        <Link
          href="/fr"
          className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
