"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CornerDownLeft,
  FileSearch,
  GitCompare,
  LayoutDashboard,
  Search,
  Settings,
  UserCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { declaraciones } from "@/data/mock/declaraciones";
import { cn, formatEUR } from "@/lib/utils";
import { chromelessSearchInputClass } from "@/components/ui/ToolbarSearchField";

type Cmd = { id: string; label: string; sub?: string; href: string; icon: typeof Search };

const NAV: Cmd[] = [
  { id: "nav-dash", label: "Dashboard", href: "/plataforma", icon: LayoutDashboard },
  { id: "nav-aud", label: "Auditoría", href: "/plataforma/auditoria", icon: FileSearch },
  { id: "nav-ctrl", label: "Control BPO", href: "/plataforma/control", icon: GitCompare },
  { id: "nav-rev", label: "Revisión", href: "/plataforma/revision", icon: UserCheck },
  { id: "nav-cfg", label: "Configuración", href: "/plataforma/configuracion", icon: Settings },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((p) => !p);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQ("");
      setActive(0);
    }
  }, [open]);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    const navMatches = NAV.filter((c) => !query || c.label.toLowerCase().includes(query));
    const src = query
      ? declaraciones.filter(
          (d) => d.empresa.toLowerCase().includes(query) || d.cif.toLowerCase().includes(query),
        )
      : declaraciones.slice(0, 4);
    const decMatches: Cmd[] = src.map((d) => ({
      id: `dec-${d.id}`,
      label: d.empresa,
      sub: d.importeDaeEur != null ? formatEUR(d.importeDaeEur) : d.cif,
      href: `/plataforma/auditoria/${d.id}`,
      icon: FileSearch,
    }));
    return { navMatches, decMatches, flat: [...navMatches, ...decMatches] };
  }, [q]);

  useEffect(() => setActive(0), [q]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, Math.max(0, results.flat.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const sel = results.flat[active];
      if (sel) go(sel.href);
    }
  }

  const activeId = results.flat[active]?.id;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-1.5 text-xs text-muted hover:border-brand/40 hover:text-ink-soft transition-colors w-56"
      >
        <Search size={14} />
        <span className="flex-1 text-left">Buscar…</span>
        <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 text-[10px] font-medium text-muted">
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[1500] flex items-start justify-center pt-[12vh] px-4">
            <motion.div
              className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-lg rounded-2xl border border-line bg-surface shadow-[0_24px_60px_-12px_rgba(20,32,26,0.35)] overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 border-b border-line">
                <Search size={16} className="text-muted shrink-0" />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={onInputKey}
                  placeholder="Buscar empresas, módulos…"
                  className={cn("flex-1 py-3.5 text-sm text-ink placeholder:text-muted bg-transparent", chromelessSearchInputClass)}
                />
                <kbd className="rounded border border-line bg-canvas px-1.5 py-0.5 text-[10px] text-muted">
                  Esc
                </kbd>
              </div>
              <div className="max-h-80 overflow-auto py-2">
                {results.flat.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-muted">Sin resultados para «{q}»</p>
                ) : (
                  <>
                    {results.navMatches.length > 0 && <Section title="Navegación" />}
                    {results.navMatches.map((c) => (
                      <Row key={c.id} cmd={c} activeId={activeId} onPick={go} />
                    ))}
                    {results.decMatches.length > 0 && <Section title="Declaraciones" />}
                    {results.decMatches.map((c) => (
                      <Row key={c.id} cmd={c} activeId={activeId} onPick={go} />
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function Section({ title }: { title: string }) {
  return (
    <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
      {title}
    </p>
  );
}

function Row({
  cmd,
  activeId,
  onPick,
}: {
  cmd: Cmd;
  activeId?: string;
  onPick: (href: string) => void;
}) {
  const Icon = cmd.icon;
  const isActive = cmd.id === activeId;
  return (
    <button
      type="button"
      onClick={() => onPick(cmd.href)}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
        isActive ? "bg-brand-soft" : "hover:bg-canvas",
      )}
    >
      <Icon size={15} className="text-muted shrink-0" />
      <span className="flex-1 text-sm text-ink truncate">{cmd.label}</span>
      {cmd.sub && <span className="text-xs text-muted tabular-nums">{cmd.sub}</span>}
      {isActive && <CornerDownLeft size={13} className="text-brand shrink-0" />}
    </button>
  );
}
