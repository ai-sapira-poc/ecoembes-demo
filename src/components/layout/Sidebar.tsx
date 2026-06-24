"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileSearch, GitCompare, UserCheck } from "lucide-react";
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
    <aside className="flex flex-col w-56 min-h-screen bg-brand-dark text-white shrink-0">
      {/* Logo area */}
      <div className="flex items-center justify-center px-4 py-6">
        <div className="bg-white rounded-xl p-2">
          <Logo variant="mark" className="h-10 w-auto" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3 flex-1">
        {navItems.map(({ label, href, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              {/* Left accent bar for active item */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-brand" />
              )}
              <Icon size={18} className="shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/10">
        <p className="text-[10px] text-white/40 text-center tracking-widest uppercase">
          Powered by Sapira
        </p>
      </div>
    </aside>
  );
}
