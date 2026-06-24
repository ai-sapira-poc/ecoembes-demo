"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/layout/Logo";
import { navItems, isNavActive } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-full bg-brand-dark text-white shrink-0 shadow-[2px_0_12px_-4px_rgba(10,32,20,0.22)] transition-[width] duration-200",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo chip */}
      <div
        className={cn(
          "flex items-center pt-7 pb-6",
          collapsed ? "justify-center px-2" : "justify-between px-5"
        )}
      >
        <div
          className={cn(
            "bg-white rounded-xl shadow-[0_2px_8px_-2px_rgba(10,32,20,0.20)]",
            collapsed ? "px-1.5 py-1.5" : "px-3 py-2.5"
          )}
        >
          {collapsed ? (
            <Logo variant="mark" className="h-7 w-auto" />
          ) : (
            <Logo variant="horizontal" className="h-8 w-auto" />
          )}
        </div>

        {/* Toggle button — visible in expanded state, placed inline */}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            aria-label="Contraer menú"
            aria-expanded={true}
            className="text-white/50 hover:text-white/90 transition-colors duration-150 p-1 rounded-md hover:bg-white/8"
          >
            <PanelLeftClose size={16} strokeWidth={1.8} />
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/10 mb-2" />

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-3 flex-1 overflow-y-auto py-2">
        {navItems.map((item) => {
          const { label, href, icon: Icon } = item;
          const active = isNavActive(pathname, item);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                collapsed ? "justify-center gap-0" : "gap-3",
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

              {/* Label — hidden when collapsed */}
              {!collapsed && (
                <span
                  className={cn(
                    "transition-colors duration-150",
                    active ? "font-semibold" : "font-medium"
                  )}
                >
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className={cn(
          "py-5 border-t border-white/10",
          collapsed ? "px-2 flex items-center justify-center" : "px-5"
        )}
      >
        {collapsed ? (
          /* Toggle button in footer when collapsed */
          <button
            onClick={() => setCollapsed(false)}
            aria-label="Expandir menú"
            aria-expanded={false}
            className="text-white/50 hover:text-white/90 transition-colors duration-150 p-1 rounded-md hover:bg-white/8"
          >
            <PanelLeftOpen size={16} strokeWidth={1.8} />
          </button>
        ) : (
          <p className="text-[9px] text-white/35 text-center tracking-[0.18em] uppercase font-medium">
            Powered by Sapira
          </p>
        )}
      </div>
    </aside>
  );
}
