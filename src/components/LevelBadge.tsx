"use client";

import { getLevelTitle, xpProgressInLevel } from "@/lib/gamification";

interface LevelBadgeProps {
  level: number;
  xp: number;
}

export default function LevelBadge({ level, xp }: LevelBadgeProps) {
  const progress = xpProgressInLevel(xp);
  const title = getLevelTitle(level);

  return (
    <div className="rounded-2xl bg-museo-card p-4 card-glow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/50">
            Art Level
          </p>
          <p className="text-3xl font-black text-museo-gold">Lv. {level}</p>
          <p className="text-sm text-white/60">{title}</p>
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-full game-gradient text-2xl font-black text-white shadow-lg">
          {level}
        </div>
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-xs text-white/50">
          <span>{progress.current} XP</span>
          <span>{progress.needed} XP to next level</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full game-gradient transition-all duration-500"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <p className="mt-1 text-right text-xs text-white/40">
          Total: {xp} XP
        </p>
      </div>
    </div>
  );
}
