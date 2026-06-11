"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Scan", icon: "📷" },
  { href: "/collection", label: "Collection", icon: "🖼️" },
  { href: "/profile", label: "Profile", icon: "⭐" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-museo-dark/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-lg items-center justify-around px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-2 transition-all ${
                active
                  ? "text-museo-gold"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
              {active && (
                <span className="h-0.5 w-6 rounded-full bg-museo-gold" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
