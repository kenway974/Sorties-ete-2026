"use client";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import type { ContentType, ReportReason } from "@/types";

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  contentType: ContentType;
  contentId: string;
}

const REASONS: ReportReason[] = ["spam", "offensive", "wrong_info", "advertising"];

const REASON_LABELS: Record<ReportReason, string> = {
  spam: "Spam",
  offensive: "Contenu offensant",
  wrong_info: "Informations incorrectes",
  advertising: "Publicité non sollicitée",
};

export default function ReportModal({ open, onClose, contentType, contentId }: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason | "">("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!reason) return;
    setLoading(true);
    await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content_type: contentType, content_id: contentId, reason, description }),
    });
    setLoading(false);
    setDone(true);
    setTimeout(() => { onClose(); setDone(false); setReason(""); setDescription(""); }, 1500);
  };

  return (
    <Modal open={open} onClose={onClose} title="Signaler un contenu" size="sm">
      {done ? (
        <div className="text-center py-4">
          <p className="text-2xl mb-2">✅</p>
          <p className="text-sm text-gray-600">Signalement envoyé. Merci !</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Raison</label>
            <div className="space-y-2">
              {REASONS.map((r) => (
                <label key={r} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="text-brand-navy"
                  />
                  <span className="text-sm">{REASON_LABELS[r]}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Description (optionnelle)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
            <Button onClick={submit} loading={loading} disabled={!reason} className="flex-1">Signaler</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
