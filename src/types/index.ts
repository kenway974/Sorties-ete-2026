import type { CuriosityKey } from "@/lib/constants/curiosites";
export type { CuriosityKey } from "@/lib/constants/curiosites";


export type ActivityStatus = "pending" | "approved" | "rejected";
export type UserRole = "user" | "moderator" | "admin";
export type ReportReason = "spam" | "offensive" | "wrong_info" | "advertising";
export type ContentType = "activity" | "review" | "photo";

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  preferred_language: string;
  preferences: CuriosityKey[];
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  curiosity: CuriosityKey;
  tags: string[];
  address: string;
  lat: number;
  lng: number;
  date: string;
  time: string;
  max_participants: number | null;
  current_participants: number;
  price: number | null;
  external_url: string | null;
  status: ActivityStatus;
  moderation_note?: string | null;
  creator_id: string;
  creator?: Profile;
  photos?: ActivityPhoto[];
  avg_rating?: number;
  review_count?: number;
  is_favorite?: boolean;
  is_registered?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityPhoto {
  id: string;
  activity_id: string;
  url: string;
  uploaded_by: string;
  created_at: string;
}

export interface ActivityRegistration {
  id: string;
  activity_id: string;
  user_id: string;
  user?: Profile;
  created_at: string;
}

export interface Favorite {
  id: string;
  activity_id: string;
  user_id: string;
  created_at: string;
}

export interface Review {
  id: string;
  activity_id: string;
  user_id: string;
  user?: Profile;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  content_type: ContentType;
  content_id: string;
  reason: ReportReason;
  description: string | null;
  status: "pending" | "resolved" | "dismissed";
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

export interface ActivityFilters {
  curiosity?: CuriosityKey | null;
  dateFilter?: "today" | "tomorrow" | "this_week" | "this_weekend" | "this_month" | null;
  priceFilter?: "free" | "paid" | null;
  sortBy?: "distance" | "date" | "popularity" | "rating" | "price";
  search?: string;
  userLat?: number;
  userLng?: number;
  /** Custom date range (YYYY-MM-DD). */
  dateFrom?: string | null;
  dateTo?: string | null;
  /** Time-of-day range (HH:MM), applies across all matching dates. */
  timeFrom?: string | null;
  timeTo?: string | null;
  /** Vibe/ambiance tags to filter by (overlaps with activity tags). */
  tags?: string[] | null;
}
