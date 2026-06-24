"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileSearch, GitCompare, UserCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/plataforma",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Auditoría",
    href: "/plataforma/auditoria",
    icon: FileSearch,
    exact: false,
  },
  {
    label: "Control BPO",
    href: "/plataforma/control",
    icon: GitCompare,
    exact: false,
  },
  {
    label: "Revisión",
    href: "/plataforma/revision",
    icon: UserCheck,
    exact: false,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean): boolean {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="flex flex-col w-56 min-h-screen bg-brand-dark text-white shrink-0 shadow-[2px_0_12px_-4px_rgba(10,32,20,0.22)]">
      {/* Logo chip */}
      <div className="flex items-center justify-center px-5 pt-7 pb-6">
        <div className="bg-white rounded-xl px-3 py-2.5 shadow-[0_2px_8px_-2px_rgba(10,32,20,0.20)]">
          <Logo variant="mark" className="h-9 w-auto" />
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/10 mb-2" />

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-3 flex-1 py-2">
        {navItems.map(({ label, href, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-white/12 text-white"
                  : "text-white/65 hover:bg-white/8 hover:text-white/90"
              )}
            >
              {/* Active accent — left pill */}
              {active && (
                <motion.span
                  layoutId="sidebar-active-accent"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-brand"
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                />
              )}

              {/* Icon */}
              <Icon
                size={17}
                strokeWidth={active ? 2.2 : 1.8}
                className={cn(
                  "shrink-0 transition-colors duration-150",
                  active ? "text-white" : "text-white/55 group-hover:text-white/80"
                )}
              />

              {/* Label */}
              <span
                className={cn(
                  "transition-colors duration-150",
                  active ? "font-semibold" : "font-medium"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-5 border-t border-white/10">
        <p className="text-[9px] text-white/35 text-center tracking-[0.18em] uppercase font-medium">
          Powered by Sapira
        </p>
      </div>
    </aside>
  );
}
