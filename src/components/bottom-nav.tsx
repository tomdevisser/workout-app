"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, History, House, Settings, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Vandaag", icon: House },
  { href: "/workout", label: "Workout", icon: Dumbbell },
  { href: "/history", label: "Historie", icon: History },
  { href: "/nutrition", label: "Voeding", icon: UtensilsCrossed },
  { href: "/settings", label: "Instellingen", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div
        className="mx-auto flex max-w-md items-stretch justify-between px-1"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {items.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors",
                active ? "text-orange-500" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
