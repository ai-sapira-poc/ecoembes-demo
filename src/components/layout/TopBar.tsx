"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { NotificationsPanel } from "@/components/layout/NotificationsPanel";
import { HelpPopover } from "@/components/layout/HelpPopover";

export function TopBar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center justify-between h-14 px-6 bg-surface border-b border-line shrink-0 gap-4"
    >
      <Breadcrumbs />

      <div className="flex items-center gap-1.5">
        <CommandPalette />
        <HelpPopover />
        <NotificationsPanel />

        <div className="w-px h-5 bg-line mx-1" />

        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-lg px-1.5 py-1 hover:bg-canvas transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            aria-label="Menú de usuario"
            aria-expanded={dropdownOpen}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-dark text-white text-[10px] font-semibold select-none">
              AE
            </span>
            <ChevronDown
              size={12}
              strokeWidth={2}
              className={cn("text-muted transition-transform duration-150", dropdownOpen && "rotate-180")}
            />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-[1000]" onClick={() => setDropdownOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute right-0 top-full mt-1.5 z-[1001] w-44 rounded-xl border border-line bg-surface shadow-[0_4px_24px_-6px_rgba(20,32,26,0.18)] py-1 overflow-hidden"
                >
                  <div className="px-4 py-2 border-b border-line">
                    <p className="text-xs font-semibold text-ink truncate">Auditor Ecoembes</p>
                    <p className="text-[10px] text-muted truncate mt-0.5">auditor@ecoembes.es</p>
                  </div>
                  <Link
                    href="/plataforma/configuracion"
                    onClick={() => setDropdownOpen(false)}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-ink-soft hover:bg-canvas transition-colors duration-100 mt-0.5"
                  >
                    <Settings size={13} strokeWidth={1.8} className="text-muted" />
                    Configuración
                  </Link>
                  <div className="my-0.5 border-t border-line" />
                  <Link
                    href="/"
                    onClick={() => setDropdownOpen(false)}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-danger hover:bg-danger-soft transition-colors duration-100"
                  >
                    <LogOut size={13} strokeWidth={1.8} />
                    Cerrar sesión
                  </Link>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}
