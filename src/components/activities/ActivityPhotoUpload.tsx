"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { Plus, X, Loader2, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Photo {
  id: string;
  url: string;
}

interface Props {
  activityId: string;
  userId: string;
  initialPhotos: Photo[];
}

export default function ActivityPhotoUpload({ activityId, userId, initialPhotos }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (photos.length + files.length > 8) {
      setError("Maximum 8 photos par activité.");
      return;
    }
    setError("");
    setUploading(true);

    const supabase = createClient();
    const uploaded: Photo[] = [];

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) { setError(`${file.name} dépasse 10 Mo.`); continue; }
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${activityId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("activity-photos")
        .upload(path, file, { contentType: file.type });

      if (upErr) { setError("Échec d'un upload. Réessayez."); continue; }

      const { data: { publicUrl } } = supabase.storage.from("activity-photos").getPublicUrl(path);

      const { data: row } = await supabase
        .from("activity_photos")
        .insert({ activity_id: activityId, url: publicUrl, uploaded_by: userId })
        .select("id, url")
        .single();

      if (row) uploaded.push(row);
    }

    setPhotos((p) => [...p, ...uploaded]);
    setUploading(false);
    // Reset input so the same file can be re-selected after deletion
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDelete = async (photo: Photo) => {
    const supabase = createClient();
    // Extract path from URL
    try {
      const url = new URL(photo.url);
      const marker = "/object/public/activity-photos/";
      const idx = url.pathname.indexOf(marker);
      if (idx !== -1) {
        const storagePath = url.pathname.slice(idx + marker.length);
        await supabase.storage.from("activity-photos").remove([storagePath]);
      }
    } catch {}
    await supabase.from("activity_photos").delete().eq("id", photo.id);
    setPhotos((p) => p.filter((ph) => ph.id !== photo.id));
  };

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
        Photos de l&apos;activité <span className="text-gray-400 font-normal">({photos.length}/8)</span>
      </label>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {photos.map((photo) => (
          <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden group">
            <Image src={photo.url} alt="" fill className="object-cover" />
            <button
              type="button"
              onClick={() => handleDelete(photo)}
              className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Supprimer cette photo"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        ))}

        {photos.length < 8 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-brand-navy hover:text-brand-navy dark:hover:border-brand-gold dark:hover:text-brand-gold transition-colors disabled:opacity-50"
          >
            {uploading
              ? <Loader2 className="w-5 h-5 animate-spin" />
              : <>
                  <Plus className="w-5 h-5" />
                  <span className="text-xs">Photo</span>
                </>
            }
          </button>
        )}

        {photos.length === 0 && !uploading && (
          <div className="col-span-2 flex items-center gap-2 text-xs text-gray-400 py-2">
            <ImageIcon className="w-4 h-4 shrink-0" />
            Ajoutez des photos pour attirer plus de participants
          </div>
        )}
      </div>

      {error && <p className="text-xs text-brand-red mt-1">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        onChange={handleFile}
      />
    </div>
  );
}
