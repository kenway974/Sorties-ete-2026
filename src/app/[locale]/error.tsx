"use client";
import { useEffect } from "react";
import Button from "@/components/ui/Button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-6xl mb-4">😥</p>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Une erreur est survenue</h2>
      <p className="text-gray-500 text-sm mb-6">{error.message}</p>
      <Button onClick={reset}>Réessayer</Button>
    </div>
  );
}
