"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  userId: string;
  currentUrl: string | null;
  username: string;
  onUploaded: (url: string) => void;
}

export default function AvatarUpload({ userId, currentUrl, username, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  const initials = (username || "?")
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Image trop lourde (max 5 Mo)");
      return;
    }
    setError("");
    setUploading(true);
    setPreview(URL.createObjectURL(file));

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${userId}/avatar.${ext}`;

    const supabase = createClient();
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (upErr) {
      setError("Échec de l'upload. Réessayez.");
      setPreview(null);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    // Bust cache with timestamp
    const urlWithBust = `${publicUrl}?t=${Date.now()}`;

    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", userId);

    onUploaded(urlWithBust);
    setUploading(false);
  };

  const displayUrl = preview ?? currentUrl;

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="relative w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-offset-2 ring-brand-navy/20 hover:ring-brand-navy/50 transition-all group"
        aria-label="Changer la photo de profil"
      >
        {displayUrl ? (
          <Image src={displayUrl} alt={username} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-brand-navy flex items-center justify-center text-white text-xl font-bold">
            {initials}
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {uploading
            ? <Loader2 className="w-5 h-5 text-white animate-spin" />
            : <Camera className="w-5 h-5 text-white" />
          }
        </div>
      </button>
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Photo de profil</p>
        <p className="text-xs text-gray-400">JPG, PNG ou WebP · max 5 Mo</p>
        {error && <p className="text-xs text-brand-red mt-0.5">{error}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFile}
      />
    </div>
  );
}
