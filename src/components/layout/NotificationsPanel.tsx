"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { getNotifications } from "@/data/notifications";

const NOTIFS = getNotifications();

export function NotificationsPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="relative flex items-center justify-center h-8 w-8 rounded-lg text-muted hover:text-ink hover:bg-canvas transition-colors duration-150"
        aria-label="Notificaciones"
        aria-expanded={open}
      >
        <Bell size={16} strokeWidth={1.8} />
        {NOTIFS.length > 0 && (
          <span className="absolute top-1 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-danger text-[8px] font-bold text-white leading-none pointer-events-none">
            {NOTIFS.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-[1000]" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 top-full mt-1.5 z-[1001] w-80 rounded-xl border border-line bg-surface shadow-[0_4px_24px_-6px_rgba(20,32,26,0.18)] py-1 overflow-hidden"
            >
              <div className="px-4 py-2.5 border-b border-line flex items-center justify-between">
                <p className="text-xs font-semibold text-ink">Notificaciones</p>
                <span className="text-[10px] text-muted">{NOTIFS.length} nuevas</span>
              </div>
              <div className="max-h-80 overflow-auto">
                {NOTIFS.map((n) => {
                  const Icon = n.icon;
                  return (
                    <Link
                      key={n.id}
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-canvas transition-colors border-b border-line last:border-0"
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-soft">
                        <Icon size={14} className="text-brand-dark" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs text-ink leading-snug">{n.titulo}</p>
                        <p className="text-[10px] text-muted mt-0.5">{n.cuando}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <Link
                href="/plataforma/revision"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-center text-xs font-medium text-brand hover:bg-canvas transition-colors border-t border-line"
              >
                Ver todo
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
