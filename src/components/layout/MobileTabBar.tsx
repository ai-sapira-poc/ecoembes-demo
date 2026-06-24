"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { navItems, isNavActive } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

/**
 * Fixed bottom navigation for phones. Mirrors the desktop Sidebar's nav items
 * and active styling, but as thumb-reachable tabs. Hidden at `md` and up, where
 * the Sidebar takes over.
 */
export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[var(--z-sticky)] flex md:hidden border-t border-line bg-surface/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_12px_-4px_rgba(10,32,20,0.12)]"
      aria-label="Navegación principal"
    >
      {navItems.map((item) => {
        const { shortLabel, href, icon: Icon } = item;
        const active = isNavActive(pathname, item);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors duration-150",
              active ? "text-brand-dark" : "text-muted hover:text-ink"
            )}
          >
            {active && (
              <motion.span
                layoutId="mobile-tab-active-accent"
                className="absolute top-0 h-[3px] w-8 rounded-full bg-brand"
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            <Icon
              size={20}
              strokeWidth={active ? 2.2 : 1.8}
              className="shrink-0"
            />
            <span className={cn(active && "font-semibold")}>{shortLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
