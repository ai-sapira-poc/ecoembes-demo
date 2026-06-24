"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, HelpCircle, Mail, PlayCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const LINKS: { label: string; icon: typeof HelpCircle; href: string | null }[] = [
  { label: "Guía de la plataforma", icon: BookOpen, href: null },
  { label: "Acto 1 — Auditoría paso a paso", icon: PlayCircle, href: "/demos/auditoria" },
  { label: "Acto 2 — Control BPO paso a paso", icon: PlayCircle, href: "/demos/control" },
  { label: "Contactar con Sapira", icon: Mail, href: null },
];

export function HelpPopover() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted hover:text-ink hover:bg-canvas transition-colors duration-150"
        aria-expanded={open}
      >
        <HelpCircle size={14} strokeWidth={1.8} />
        Centro de ayuda
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
              className="absolute right-0 top-full mt-1.5 z-[1001] w-64 rounded-xl border border-line bg-surface shadow-[0_4px_24px_-6px_rgba(20,32,26,0.18)] py-1.5 overflow-hidden"
            >
              {LINKS.map((l) => {
                const Icon = l.icon;
                const inner = (
                  <span className="flex items-center gap-2.5 px-4 py-2 text-xs text-ink-soft hover:bg-canvas transition-colors">
                    <Icon size={13} className="text-muted shrink-0" />
                    {l.label}
                  </span>
                );
                return l.href ? (
                  <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className="block">
                    {inner}
                  </Link>
                ) : (
                  <button
                    key={l.label}
                    type="button"
                    onClick={() => setOpen(false)}
                    className="block w-full text-left"
                  >
                    {inner}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
