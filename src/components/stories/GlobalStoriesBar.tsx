"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Plus, X, ChevronLeft, ChevronRight, Camera, MapPin, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StoryUser {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

interface GlobalStory {
  id: string;
  user_id: string;
  media_url: string;
  media_type: "photo" | "video";
  caption: string | null;
  location_text: string | null;
  moderation_status: "pending" | "approved" | "rejected";
  created_at: string;
  expires_at: string;
  user: StoryUser;
}

interface Props {
  userId: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(dateStr: string): string {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60) return "à l'instant";
  const m = Math.floor(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  return `il y a ${Math.floor(h / 24)} j`;
}

function AvatarRing({
  story,
  own,
  onClick,
}: {
  story: GlobalStory;
  own: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 shrink-0 group"
      aria-label={`Story de ${story.user.username ?? "Anonyme"}`}
    >
      <div
        className={`p-0.5 rounded-full ${
          own
            ? "bg-gradient-to-tr from-blue-500 via-brand-navy to-indigo-600"
            : "bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400"
        }`}
      >
        <div className="p-0.5 rounded-full bg-[#0a0e16]">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-700 relative">
            {story.user.avatar_url ? (
              <Image
                src={story.user.avatar_url}
                alt={story.user.username ?? ""}
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                {(story.user.username ?? "?")[0].toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>
      <span className="text-xs text-gray-300 max-w-[3.5rem] truncate text-center leading-tight">
        {story.user.username ?? "Anonyme"}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// StoryViewer
// ---------------------------------------------------------------------------

function StoryViewer({
  stories,
  initialIndex,
  onClose,
}: {
  stories: GlobalStory[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const story = stories[current];

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const goNext = useCallback(() => {
    if (current < stories.length - 1) {
      setCurrent((c) => c + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [current, stories.length, onClose]);

  const goPrev = useCallback(() => {
    if (current > 0) {
      setCurrent((c) => c - 1);
      setProgress(0);
    }
  }, [current]);

  useEffect(() => {
    clearTimer();
    if (story.media_type === "photo") {
      setProgress(0);
      const step = 100 / 50;
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p + step >= 100) {
            clearTimer();
            goNext();
            return 100;
          }
          return p + step;
        });
      }, 100);
    } else {
      setProgress(0);
    }
    return clearTimer;
  }, [current, story.media_type, clearTimer, goNext]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, goNext, goPrev]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
        {stories.map((s, i) => (
          <div key={s.id} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white"
              style={{
                width: i < current ? "100%" : i === current ? `${progress}%` : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-6 left-0 right-0 flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-700 shrink-0">
            {story.user.avatar_url ? (
              <Image
                src={story.user.avatar_url}
                alt={story.user.username ?? ""}
                width={36}
                height={36}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                {(story.user.username ?? "?")[0].toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-tight">
              {story.user.username ?? "Anonyme"}
            </p>
            <p className="text-white/50 text-xs flex items-center gap-1">
              {story.location_text && (
                <>
                  <MapPin className="w-3 h-3" />
                  {story.location_text} ·{" "}
                </>
              )}
              {timeAgo(story.created_at)}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Media */}
      <div className="relative w-full h-full max-w-sm mx-auto">
        {story.media_type === "photo" ? (
          <Image
            src={story.media_url}
            alt={story.caption ?? "Story"}
            fill
            className="object-contain"
            priority
          />
        ) : (
          <video
            ref={videoRef}
            src={story.media_url}
            className="absolute inset-0 w-full h-full object-contain"
            autoPlay
            playsInline
            onEnded={goNext}
            onLoadedMetadata={(e) => {
              const vid = e.currentTarget;
              const tick = setInterval(() => {
                if (vid.paused || vid.ended) { clearInterval(tick); return; }
                setProgress((vid.currentTime / vid.duration) * 100);
              }, 200);
            }}
          />
        )}
      </div>

      {/* Caption */}
      {story.caption && (
        <div className="absolute bottom-12 left-0 right-0 px-4 z-10">
          <p className="text-white text-sm text-center drop-shadow-md bg-black/30 rounded-lg px-3 py-2 backdrop-blur-sm">
            {story.caption}
          </p>
        </div>
      )}

      {/* Tap areas */}
      <button
        onClick={goPrev}
        disabled={current === 0}
        className="absolute left-0 top-0 bottom-0 w-1/3 z-10 flex items-center pl-2 opacity-0 hover:opacity-100 transition-opacity disabled:pointer-events-none"
        aria-label="Précédent"
      >
        <ChevronLeft className="w-8 h-8 text-white drop-shadow-lg" />
      </button>
      <button
        onClick={goNext}
        className="absolute right-0 top-0 bottom-0 w-1/3 z-10 flex items-center justify-end pr-2 opacity-0 hover:opacity-100 transition-opacity"
        aria-label="Suivant"
      >
        <ChevronRight className="w-8 h-8 text-white drop-shadow-lg" />
      </button>
    </div>,
    document.body
  );
}

// ---------------------------------------------------------------------------
// UploadSheet
// ---------------------------------------------------------------------------

type UploadState =
  | "idle"
  | "preview"
  | "uploading"
  | "moderating"
  | "rejected"
  | "done";

function UploadSheet({
  userId,
  onClose,
  onPublished,
}: {
  userId: string;
  onClose: () => void;
  onPublished: (story: GlobalStory) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ url: string; type: "photo" | "video" } | null>(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [state, setState] = useState<UploadState>("idle");
  const [uploadPct, setUploadPct] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview({ url: URL.createObjectURL(f), type: f.type.startsWith("video/") ? "video" : "photo" });
    setState("preview");
  };

  const handlePublish = async () => {
    if (!file || !preview) return;
    setState("uploading");
    setError(null);
    setUploadPct(10);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? (preview.type === "video" ? "mp4" : "jpg");
      const path = `${userId}/${Date.now()}.${ext}`;

      setUploadPct(30);
      const { error: storageErr } = await supabase.storage
        .from("global-stories")
        .upload(path, file, { upsert: false });
      if (storageErr) throw new Error(storageErr.message);

      setUploadPct(60);
      const { data: urlData } = supabase.storage.from("global-stories").getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      setState("moderating");
      setUploadPct(80);

      const res = await fetch("/api/stories/global", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          media_url: publicUrl,
          media_type: preview.type,
          caption: caption.trim() || null,
          location_text: location.trim() || null,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? "Erreur serveur");
      }

      setUploadPct(100);

      if (json.status === "rejected") {
        setState("rejected");
        setRejectReason(json.reason ?? "Contenu non conforme à nos règles.");
        return;
      }

      // Fetch the published story to optimistically add it
      const { data: newStory } = await supabase
        .from("global_stories")
        .select("*, user:profiles(id, username, avatar_url)")
        .eq("id", json.id)
        .single();

      setState("done");
      if (newStory) onPublished(newStory as GlobalStory);
      setTimeout(onClose, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
      setState("preview");
    }
  };

  const isLoading = state === "uploading" || state === "moderating";

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span className="text-xl">🗼</span>
            Partage ton instant parisien
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File picker */}
        {!preview && (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full h-44 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-pink-400 hover:text-pink-400 dark:hover:border-pink-500 dark:hover:text-pink-400 transition-colors"
          >
            <Camera className="w-10 h-10" />
            <span className="text-sm font-medium">Photo ou vidéo</span>
            <span className="text-xs text-gray-300">Max 50 Mo</span>
          </button>
        )}

        {/* Preview */}
        {preview && (
          <div className="relative rounded-2xl overflow-hidden bg-black h-52">
            {preview.type === "photo" ? (
              <Image src={preview.url} alt="Aperçu" fill className="object-contain" />
            ) : (
              <video src={preview.url} className="w-full h-full object-contain" controls playsInline />
            )}
            {!isLoading && state !== "done" && state !== "rejected" && (
              <button
                onClick={() => { setFile(null); setPreview(null); setState("idle"); }}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors"
                aria-label="Supprimer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Caption + location */}
        {preview && !isLoading && state !== "done" && state !== "rejected" && (
          <div className="space-y-2">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Raconte ton moment… (optionnel)"
              maxLength={200}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Lieu (ex: Marais, Tour Eiffel…)"
                maxLength={60}
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>
        )}

        {/* Progress */}
        {isLoading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {state === "moderating" ? "Vérification du contenu…" : "Upload en cours…"}
              </span>
              <span>{uploadPct}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 transition-all duration-500"
                style={{ width: `${uploadPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Done */}
        {state === "done" && (
          <p className="text-center text-sm text-green-600 dark:text-green-400 font-medium py-2">
            ✓ Story publiée !
          </p>
        )}

        {/* Rejected */}
        {state === "rejected" && (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 space-y-2">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">Contenu refusé</p>
            <p className="text-xs text-red-600 dark:text-red-300">{rejectReason}</p>
            <button
              onClick={() => { setFile(null); setPreview(null); setState("idle"); setRejectReason(null); }}
              className="text-xs font-medium text-red-700 dark:text-red-400 underline"
            >
              Choisir une autre image
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/mp4,video/quicktime"
          className="hidden"
          onChange={handleFile}
        />

        {/* Publish button */}
        {preview && !isLoading && state !== "done" && state !== "rejected" && (
          <button
            onClick={handlePublish}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all"
          >
            Publier la story
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function GlobalStoriesBar({ userId }: Props) {
  const [stories, setStories] = useState<GlobalStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerIdx, setViewerIdx] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const fetchStories = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("global_stories")
      .select("*, user:profiles(id, username, avatar_url)")
      .eq("moderation_status", "approved")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(30);
    setStories((data as GlobalStory[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchStories(); }, [fetchStories]);

  const handlePublished = useCallback((story: GlobalStory) => {
    setStories((prev) => [story, ...prev]);
  }, []);

  // Render nothing while loading; hide entire section if no content and no user
  if (loading) return null;
  if (stories.length === 0 && !userId) return null;

  return (
    <>
      <section className="bg-[#0a0e16] py-5 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4">
          {/* Section header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500" />
                </span>
                Paris en ce moment
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Stories qui disparaissent en 24h</p>
            </div>
            {stories.length > 0 && (
              <span className="text-xs text-gray-600">{stories.length} story{stories.length > 1 ? "s" : ""}</span>
            )}
          </div>

          {/* Rings strip */}
          <div className="flex items-start gap-4 overflow-x-auto scrollbar-hide pb-1">
            {/* Add button */}
            {userId && (
              <button
                onClick={() => setShowUpload(true)}
                className="flex flex-col items-center gap-1.5 shrink-0 group"
                aria-label="Ajouter une story"
              >
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-600 group-hover:border-pink-500 flex items-center justify-center bg-white/5 group-hover:bg-pink-500/10 transition-all">
                  <Plus className="w-6 h-6 text-gray-500 group-hover:text-pink-400 transition-colors" />
                </div>
                <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
                  Ajouter
                </span>
              </button>
            )}

            {/* Story rings */}
            {stories.map((story, i) => (
              <AvatarRing
                key={story.id}
                story={story}
                own={story.user_id === userId}
                onClick={() => setViewerIdx(i)}
              />
            ))}

            {/* Empty state for logged-in users with no stories yet */}
            {stories.length === 0 && userId && (
              <p className="text-xs text-gray-600 self-center pl-2">
                Sois le premier à partager ton plan parisien du moment !
              </p>
            )}
          </div>
        </div>
      </section>

      {viewerIdx !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={viewerIdx}
          onClose={() => setViewerIdx(null)}
        />
      )}

      {showUpload && userId && (
        <UploadSheet
          userId={userId}
          onClose={() => setShowUpload(false)}
          onPublished={handlePublished}
        />
      )}
    </>
  );
}
