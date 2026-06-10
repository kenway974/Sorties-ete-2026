export interface BadgeStats {
  activitiesRegistered: number;
  activitiesCreated: number;
  reviewsWritten: number;
  profileComplete: boolean;
}

interface BadgeDef {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  earned: (s: BadgeStats) => boolean;
  earnedClass: string;
}

const BADGES: BadgeDef[] = [
  {
    id: "first_step",
    label: "Premier pas",
    emoji: "👣",
    desc: "Inscrit à ta première activité",
    earned: (s) => s.activitiesRegistered >= 1,
    earnedClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
  },
  {
    id: "explorer",
    label: "Explorateur",
    emoji: "🗺️",
    desc: "Inscrit à 3 activités ou plus",
    earned: (s) => s.activitiesRegistered >= 3,
    earnedClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  },
  {
    id: "regular",
    label: "Habitué",
    emoji: "⭐",
    desc: "Inscrit à 10 activités ou plus",
    earned: (s) => s.activitiesRegistered >= 10,
    earnedClass: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
  },
  {
    id: "critic",
    label: "Critique",
    emoji: "✍️",
    desc: "A rédigé au moins un avis",
    earned: (s) => s.reviewsWritten >= 1,
    earnedClass: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
  },
  {
    id: "organizer",
    label: "Organisateur",
    emoji: "🎪",
    desc: "A proposé sa première activité",
    earned: (s) => s.activitiesCreated >= 1,
    earnedClass: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
  },
  {
    id: "complete",
    label: "Profil complet",
    emoji: "🏆",
    desc: "Pseudo, bio et préférences renseignés",
    earned: (s) => s.profileComplete,
    earnedClass: "bg-brand-navy/8 text-brand-navy border-brand-navy/20 dark:bg-brand-gold/10 dark:text-brand-gold dark:border-brand-gold/30",
  },
];

interface UserBadgesProps {
  stats: BadgeStats;
}

export default function UserBadges({ stats }: UserBadgesProps) {
  const lockedClass =
    "bg-gray-50 text-gray-300 border-gray-100 dark:bg-gray-800/50 dark:text-gray-600 dark:border-gray-700";

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Badges</h2>
      <div className="flex flex-wrap gap-2">
        {BADGES.map((badge) => {
          const isEarned = badge.earned(stats);
          return (
            <div
              key={badge.id}
              title={badge.desc}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                isEarned ? badge.earnedClass : lockedClass
              }`}
            >
              <span className={isEarned ? "" : "grayscale opacity-40"}>{badge.emoji}</span>
              {badge.label}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-2">
        {BADGES.filter((b) => b.earned(stats)).length}/{BADGES.length} badges débloqués
      </p>
    </div>
  );
}
