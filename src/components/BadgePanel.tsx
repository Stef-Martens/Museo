"use client";

import { ALL_BADGES } from "@/lib/gamification";
import type { Badge } from "@/types";

interface BadgePanelProps {
  earnedBadges: Badge[];
}

export default function BadgePanel({ earnedBadges }: BadgePanelProps) {
  const earnedIds = new Set(earnedBadges.map((b) => b.id));

  return (
    <div className="rounded-2xl bg-museo-card p-4 card-glow">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-white/50">
        Badges
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {ALL_BADGES.map((badge) => {
          const earned = earnedIds.has(badge.id);
          const earnedBadge = earnedBadges.find((b) => b.id === badge.id);
          return (
            <div
              key={badge.id}
              className={`rounded-xl p-3 text-center transition-all ${
                earned
                  ? "bg-museo-purple/20 ring-1 ring-museo-purple/40"
                  : "bg-white/5 opacity-40"
              }`}
            >
              <span className="text-2xl">{badge.icon}</span>
              <p className="mt-1 text-xs font-bold text-white">{badge.name}</p>
              <p className="text-xs text-white/40">{badge.description}</p>
              {earnedBadge?.earnedAt && (
                <p className="mt-1 text-xs text-museo-gold">
                  {new Date(earnedBadge.earnedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
