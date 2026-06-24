"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const titleMap: Record<string, string> = {
  "/plataforma": "Dashboard",
  "/plataforma/auditoria": "Auditoría de Declaraciones",
  "/plataforma/control": "Control de Integridad",
  "/plataforma/revision": "Revisión Humana",
};

function getSectionTitle(pathname: string): string {
  // Exact match first
  if (titleMap[pathname]) return titleMap[pathname];
  // Prefix match for nested routes
  for (const key of Object.keys(titleMap)) {
    if (key !== "/plataforma" && pathname.startsWith(key + "/")) {
      return titleMap[key];
    }
  }
  return "Plataforma";
}

export function TopBar() {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const title = getSectionTitle(pathname);

  return (
    <header className="flex items-center justify-between h-14 px-6 bg-surface border-b border-black/5 shrink-0">
      {/* Left: section title */}
      <h2 className="text-sm font-semibold text-ink">{title}</h2>

      {/* Right: actions */}
      <div className="flex items-center gap-4">
        {/* Centro de ayuda */}
        <button
          type="button"
          className="text-sm text-muted hover:text-ink transition-colors"
          onClick={() => {/* no-op */}}
        >
          Centro de ayuda
        </button>

        {/* Bell with badge */}
        <button
          type="button"
          className="relative text-muted hover:text-ink transition-colors"
          aria-label="Notificaciones"
        >
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white leading-none">
            3
          </span>
        </button>

        {/* Avatar dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            aria-label="Menú de usuario"
            aria-expanded={dropdownOpen}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white text-xs font-semibold select-none">
              AE
            </span>
            <ChevronDown
              size={14}
              className={cn(
                "text-muted transition-transform",
                dropdownOpen && "rotate-180"
              )}
            />
          </button>

          {dropdownOpen && (
            <>
              {/* Overlay to close on outside click */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 z-20 w-44 rounded-xl border border-black/5 bg-white shadow-lg py-1">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(false)}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-ink hover:bg-canvas transition-colors"
                >
                  <Settings size={14} className="text-muted" />
                  Configuración
                </button>
                <div className="my-1 border-t border-black/5" />
                <Link
                  href="/"
                  onClick={() => setDropdownOpen(false)}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-canvas transition-colors"
                >
                  <LogOut size={14} />
                  Cerrar sesión
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
