"use client";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Badge from "@/components/ui/Badge";
import type { Report } from "@/types";

interface Props { reports: Report[]; }

export default function ModerationClient({ reports: initial }: Props) {
  const [reports, setReports] = useState(initial);
  const [processing, setProcessing] = useState<string | null>(null);

  const handle = async (id: string, status: "resolved" | "dismissed") => {
    setProcessing(id);
    const supabase = createClient();
    await supabase.from("reports").update({ status }).eq("id", id);
    setReports((r) => r.filter((rep) => rep.id !== id));
    setProcessing(null);
  };

  const reasonColors: Record<string, "red" | "gold" | "navy" | "gray"> = {
    spam: "gray",
    offensive: "red",
    wrong_info: "gold",
    advertising: "navy",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Signalements</h1>
      {reports.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
          <Check className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-gray-500">Aucun contenu en attente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={reasonColors[report.reason] || "gray"}>
                      {report.reason}
                    </Badge>
                    <span className="text-xs text-gray-400">{report.content_type}</span>
                  </div>
                  {report.description && (
                    <p className="text-sm text-gray-700">{report.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Content ID: {report.content_id}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handle(report.id, "resolved")}
                    disabled={processing === report.id}
                    className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
                    title="Résoudre"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handle(report.id, "dismissed")}
                    disabled={processing === report.id}
                    className="p-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    title="Ignorer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
