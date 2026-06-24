"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { navItems, isNavActive } from "@/components/layout/nav-items";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="relative z-10 hidden md:flex h-full w-16 flex-shrink-0 flex-col items-center border-r border-line bg-white py-4 shadow-[2px_0_8px_-2px_rgba(0,0,0,0.1)]">
        <div className="mb-8 rounded-xl bg-brand-soft px-2 py-2">
          <Logo variant="mark" className="h-8 w-auto" />
        </div>

        <nav className="flex flex-1 flex-col items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(pathname, item);

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors",
                      active
                        ? "bg-brand text-white"
                        : "text-muted hover:bg-brand-soft hover:text-brand-dark"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </aside>
    </TooltipProvider>
  );
}
