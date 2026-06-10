"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Plus, X, ChevronLeft, ChevronRight, Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StoryUser {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

interface Story {
  id: string;
  activity_id: string;
  user_id: string;
  media_url: string;
  media_type: "photo" | "video";
  caption: string | null;
  created_at: string;
  expires_at: string;
  user: StoryUser;
}

interface ActivityStoriesProps {
  activityId: string;
  userId: string | null;
}

// ---------------------------------------------------------------------------
// Simple time-ago helper (avoids date-fns dependency)
// ---------------------------------------------------------------------------

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "à l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

// ---------------------------------------------------------------------------
// Story Viewer Modal
// ---------------------------------------------------------------------------

interface ViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
}

function StoryViewer({ stories, initialIndex, onClose }: ViewerProps) {
  const [current, setCurrent] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const story = stories[current];

  const clearTimer = useCallback(() => {
    if (progressRef.current !== null) {
      clearInterval(progressRef.current);
      progressRef.current = null;
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

  // Auto-advance for photos (5 s)
  useEffect(() => {
    clearTimer();
    if (story.media_type === "photo") {
      setProgress(0);
      const step = 100 / 50; // 50 ticks = 5 s
      progressRef.current = setInterval(() => {
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
      // For videos, fill progress when video ends
      setProgress(0);
    }
    return () => clearTimer();
  }, [current, story.media_type, clearTimer, goNext]);

  // Handle keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, goNext, goPrev]);

  const handleVideoEnded = () => {
    setProgress(100);
    goNext();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      role="dialog"
      aria-modal="true"
    >
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
        {stories.map((s, i) => (
          <div
            key={s.id}
            className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-white transition-none"
              style={{
                width:
                  i < current
                    ? "100%"
                    : i === current
                    ? `${progress}%`
                    : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Header: avatar + name + time */}
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
            <p className="text-white/60 text-xs">{timeAgo(story.created_at)}</p>
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
            onEnded={handleVideoEnded}
            onLoadedMetadata={(e) => {
              // Drive progress by video currentTime
              const vid = e.currentTarget;
              const duration = vid.duration;
              const tick = setInterval(() => {
                if (vid.paused || vid.ended) {
                  clearInterval(tick);
                  return;
                }
                setProgress((vid.currentTime / duration) * 100);
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

      {/* Left/Right tap areas */}
      <button
        onClick={goPrev}
        disabled={current === 0}
        className="absolute left-0 top-0 bottom-0 w-1/3 z-10 flex items-center justify-start pl-2 opacity-0 hover:opacity-100 transition-opacity disabled:pointer-events-none"
        aria-label="Story précédente"
      >
        <ChevronLeft className="w-8 h-8 text-white drop-shadow-lg" />
      </button>
      <button
        onClick={goNext}
        className="absolute right-0 top-0 bottom-0 w-1/3 z-10 flex items-center justify-end pr-2 opacity-0 hover:opacity-100 transition-opacity"
        aria-label="Story suivante"
      >
        <ChevronRight className="w-8 h-8 text-white drop-shadow-lg" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Upload Sheet
// ---------------------------------------------------------------------------

interface UploadSheetProps {
  activityId: string;
  userId: string;
  onClose: () => void;
  onUploaded: () => void;
}

function UploadSheet({ activityId, userId, onClose, onUploaded }: UploadSheetProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<{ url: string; type: "photo" | "video" } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const mediaType: "photo" | "video" = f.type.startsWith("video/") ? "video" : "photo";
    setPreview({ url: URL.createObjectURL(f), type: mediaType });
  };

  const handleUpload = async () => {
    if (!file || !preview) return;
    setUploading(true);
    setError(null);
    setUploadProgress(10);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? (preview.type === "video" ? "mp4" : "jpg");
      const path = `${userId}/${Date.now()}.${ext}`;

      setUploadProgress(30);

      const { error: storageError } = await supabase.storage
        .from("stories")
        .upload(path, file, { upsert: false });

      if (storageError) throw new Error(storageError.message);

      setUploadProgress(70);

      const { data: urlData } = supabase.storage.from("stories").getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      // expires in 24 h
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const { error: insertError } = await supabase.from("activity_stories").insert({
        activity_id: activityId,
        user_id: userId,
        media_url: publicUrl,
        media_type: preview.type,
        caption: caption.trim() || null,
        expires_at: expiresAt,
      });

      if (insertError) throw new Error(insertError.message);

      setUploadProgress(100);
      onUploaded();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Ajouter une story
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!preview ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-40 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-brand-navy dark:hover:border-brand-gold hover:text-brand-navy dark:hover:text-brand-gold transition-colors"
          >
            <Camera className="w-8 h-8" />
            <span className="text-sm font-medium">Choisir une photo ou vidéo</span>
          </button>
        ) : (
          <div className="relative rounded-xl overflow-hidden bg-black h-48 flex items-center justify-center">
            {preview.type === "photo" ? (
              <Image
                src={preview.url}
                alt="Aperçu"
                fill
                className="object-contain"
              />
            ) : (
              <video
                src={preview.url}
                className="w-full h-full object-contain"
                controls
                playsInline
              />
            )}
            <button
              onClick={() => {
                setPreview(null);
                setFile(null);
              }}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
              aria-label="Retirer le média"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/mp4,video/quicktime"
          className="hidden"
          onChange={handleFileChange}
        />

        {preview && (
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Ajouter une légende…"
            maxLength={200}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-navy dark:focus:ring-brand-gold"
          />
        )}

        {uploading && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Upload en cours…</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
        )}

        {preview && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white font-semibold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {uploading ? "Publication…" : "Publier la story"}
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ActivityStories({ activityId, userId }: ActivityStoriesProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const fetchStories = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("activity_stories")
      .select("*, user:profiles(id, username, avatar_url)")
      .eq("activity_id", activityId)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: true });

    if (!error && data) {
      setStories(data as Story[]);
    }
    setLoading(false);
  }, [activityId]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // Render nothing while loading, or if no stories and no user
  if (loading) return null;
  if (stories.length === 0 && !userId) return null;

  return (
    <>
      {/* Story rings row */}
      <div className="flex items-start gap-3 overflow-x-auto scrollbar-hide pb-1">
        {/* Add story ring */}
        {userId && (
          <button
            onClick={() => setShowUpload(true)}
            className="flex flex-col items-center gap-1.5 shrink-0"
            aria-label="Ajouter une story"
          >
            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-brand-navy dark:hover:border-brand-gold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Plus className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 max-w-[3.5rem] truncate text-center">
              Ajouter
            </span>
          </button>
        )}

        {/* Existing stories */}
        {stories.map((story, index) => (
          <button
            key={story.id}
            onClick={() => setViewerIndex(index)}
            className="flex flex-col items-center gap-1.5 shrink-0"
            aria-label={`Story de ${story.user.username ?? "Anonyme"}`}
          >
            {/* Gradient border wrapper */}
            <div className="p-0.5 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400">
              <div className="p-0.5 rounded-full bg-white dark:bg-gray-900">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {story.user.avatar_url ? (
                    <Image
                      src={story.user.avatar_url}
                      alt={story.user.username ?? ""}
                      width={56}
                      height={56}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-300 text-lg font-bold">
                      {(story.user.username ?? "?")[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-700 dark:text-gray-300 max-w-[3.5rem] truncate text-center">
              {story.user.username ?? "Anonyme"}
            </span>
          </button>
        ))}
      </div>

      {/* Viewer */}
      {viewerIndex !== null && stories.length > 0 && (
        <StoryViewer
          stories={stories}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}

      {/* Upload sheet */}
      {showUpload && userId && (
        <UploadSheet
          activityId={activityId}
          userId={userId}
          onClose={() => setShowUpload(false)}
          onUploaded={fetchStories}
        />
      )}
    </>
  );
}
