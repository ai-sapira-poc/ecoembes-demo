# Platform Shell (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the always-on `/plataforma` app shell read as a real product — breadcrumbs, a live notifications panel, a `⌘K` command palette, a help popover, a real Settings page, and a shared toast.

**Architecture:** Build four self-contained client components (Breadcrumbs, NotificationsPanel, HelpPopover, CommandPalette) plus a Toast provider and a Settings page. Each panel owns its own open/close state and reads real mock data, so they compose trivially. `TopBar.tsx` is rewritten **once at the end** to assemble them — no task touches TopBar twice, and nothing forward-references an unbuilt component.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript (strict), Tailwind CSS 4, Framer Motion, Lucide React.

## Global Constraints

- No `localStorage`/`sessionStorage`; no `/app/api/`; no runtime fetches. Settings state is in-memory (`useState`), resets on reload.
- No placeholder text ("Lorem ipsum", "Empresa A", `TODO`, `FIXME`). No `console.log` in committed code.
- es-ES locale. Format numbers/currency with `formatEUR`/`formatNum`/`formatPct` from `@/lib/utils`.
- Brand tokens from `globals.css` (`brand`, `brand-dark`, `brand-soft`, `ink`, `ink-soft`, `muted`, `line`, `surface`, `canvas`, `danger`, `danger-soft`, `ok-soft`, `info-soft`, `warning-soft`). Merge classes with `cn()`.
- `"use client"` only where interactivity is needed.
- No new npm dependencies — reuse Framer Motion + Lucide.
- **No test runner exists.** Each task's verification cycle is: `npm run build` (TS strict gate, must pass) → visual check via `npm run dev` → commit. There are no unit tests to write.

---

### Task 1: Toast primitive + provider

**Files:**
- Create: `src/components/ui/Toast.tsx`
- Modify: `src/app/plataforma/layout.tsx`

**Interfaces:**
- Produces: `ToastProvider` (component), `useToast(): { show: (message: string) => void }`.

- [ ] **Step 1: Create the toast component + provider**

`src/components/ui/Toast.tsx`:

```tsx
"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

type ToastItem = { id: number; message: string };
type ToastCtx = { show: (message: string) => void };

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const show = useCallback((message: string) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2500);
  }, []);

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[2000] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-2.5 rounded-xl bg-ink text-white px-4 py-3 shadow-[0_8px_30px_-8px_rgba(20,32,26,0.45)] pointer-events-auto"
            >
              <CheckCircle size={16} className="text-brand shrink-0" />
              <span className="text-sm font-medium">{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
```

- [ ] **Step 2: Mount the provider in the platform layout**

Modify `src/app/plataforma/layout.tsx` — import the provider and wrap `{children}`:

```tsx
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { ToastProvider } from "@/components/ui/Toast";

export default function PlataformaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />
        <main className="p-8 overflow-auto bg-canvas min-h-screen flex-1">
          <ToastProvider>{children}</ToastProvider>
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run build`
Expected: build succeeds, no TS errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Toast.tsx src/app/plataforma/layout.tsx
git commit -m "feat(platform): add shared toast provider"
```

---

### Task 2: Notifications data helper

**Files:**
- Create: `src/data/notifications.ts`

**Interfaces:**
- Consumes: `declaraciones`, `bpoMes`, `revisionItems` from the data layer; `formatEUR`.
- Produces: `type Notificacion = { id: string; tipo: "consulta" | "discrepancia" | "revision"; titulo: string; href: string; cuando: string; icon: LucideIcon }` and `getNotifications(): Notificacion[]`.

- [ ] **Step 1: Create the helper**

`src/data/notifications.ts`:

```ts
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, MessageSquare, UserCheck } from "lucide-react";
import { declaraciones } from "@/data/mock/declaraciones";
import { bpoMes } from "@/data/mock/bpo";
import { revisionItems } from "@/data/mock/revision";
import { formatEUR } from "@/lib/utils";

export type Notificacion = {
  id: string;
  tipo: "consulta" | "discrepancia" | "revision";
  titulo: string;
  href: string;
  cuando: string;
  icon: LucideIcon;
};

/** Derive notifications from real mock data — never a hardcoded list. */
export function getNotifications(): Notificacion[] {
  const notifs: Notificacion[] = [];

  // Declarations whose client just answered an agent query.
  declaraciones
    .filter((d) => d.estadoAgente === "respuesta_recibida")
    .slice(0, 2)
    .forEach((d, i) =>
      notifs.push({
        id: `consulta-${d.id}`,
        tipo: "consulta",
        titulo: `${d.empresa} respondió a una consulta`,
        href: `/plataforma/auditoria/${d.id}`,
        cuando: i === 0 ? "hace 2 h" : "hace 5 h",
        icon: MessageSquare,
      }),
    );

  // Largest BPO discrepancy by amount.
  const topDisc = bpoMes.records
    .filter((r) => r.estado !== "ok")
    .map((r) => ({ r, delta: Math.abs(r.importeOrigenEur - (r.importeSgaEur ?? 0)) }))
    .sort((a, b) => b.delta - a.delta)[0];
  if (topDisc) {
    notifs.push({
      id: `disc-${topDisc.r.id}`,
      tipo: "discrepancia",
      titulo: `Discrepancia en Control BPO — ${formatEUR(topDisc.delta)}`,
      href: "/plataforma/control",
      cuando: "hace 1 d",
      icon: AlertTriangle,
    });
  }

  // Human review queue.
  if (revisionItems.length > 0) {
    notifs.push({
      id: "revision-cola",
      tipo: "revision",
      titulo: `${revisionItems.length} casos esperan revisión`,
      href: "/plataforma/revision",
      cuando: "hace 3 h",
      icon: UserCheck,
    });
  }

  return notifs;
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: build succeeds. (Helper is not yet imported anywhere — it must still typecheck.)

- [ ] **Step 3: Commit**

```bash
git add src/data/notifications.ts
git commit -m "feat(platform): derive notifications from mock data"
```

---

### Task 3: Breadcrumbs component

**Files:**
- Create: `src/components/layout/Breadcrumbs.tsx`

**Interfaces:**
- Consumes: `getDeclaracion` from `@/data`.
- Produces: `Breadcrumbs` component (no props).

- [ ] **Step 1: Create the component**

`src/components/layout/Breadcrumbs.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getDeclaracion } from "@/data";

const SEGMENT_LABELS: Record<string, string> = {
  auditoria: "Auditoría",
  control: "Control BPO",
  revision: "Revisión",
  configuracion: "Configuración",
};

type Crumb = { label: string; href: string };

export function Breadcrumbs() {
  const pathname = usePathname();
  const crumbs: Crumb[] = [{ label: "Dashboard", href: "/plataforma" }];

  const segs = pathname.replace(/^\/plataforma\/?/, "").split("/").filter(Boolean);
  let href = "/plataforma";
  segs.forEach((seg, i) => {
    href += `/${seg}`;
    let label = SEGMENT_LABELS[seg] ?? seg;
    // A segment directly under /auditoria is a declaration id → show empresa name.
    if (i > 0 && segs[i - 1] === "auditoria") {
      label = getDeclaracion(seg)?.empresa ?? seg;
    }
    crumbs.push({ label, href });
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm min-w-0">
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        return (
          <span key={c.href} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && <ChevronRight size={13} className="text-muted/60 shrink-0" />}
            {last ? (
              <span aria-current="page" className="font-semibold text-ink truncate max-w-[220px]">
                {c.label}
              </span>
            ) : (
              <Link href={c.href} className="text-muted hover:text-ink transition-colors shrink-0">
                {c.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Breadcrumbs.tsx
git commit -m "feat(platform): add route-derived breadcrumbs"
```

---

### Task 4: NotificationsPanel component

**Files:**
- Create: `src/components/layout/NotificationsPanel.tsx`

**Interfaces:**
- Consumes: `getNotifications` from `@/data/notifications` (Task 2).
- Produces: `NotificationsPanel` component (no props) — self-contained bell button + badge + dropdown.

- [ ] **Step 1: Create the component**

`src/components/layout/NotificationsPanel.tsx`:

```tsx
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
```

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/NotificationsPanel.tsx
git commit -m "feat(platform): add notifications bell panel"
```

---

### Task 5: HelpPopover component

**Files:**
- Create: `src/components/layout/HelpPopover.tsx`

**Interfaces:**
- Produces: `HelpPopover` component (no props) — self-contained "Centro de ayuda" button + popover.

- [ ] **Step 1: Create the component**

`src/components/layout/HelpPopover.tsx`:

```tsx
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
```

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/HelpPopover.tsx
git commit -m "feat(platform): add help center popover"
```

---

### Task 6: CommandPalette component (`⌘K`)

**Files:**
- Create: `src/components/layout/CommandPalette.tsx`

**Interfaces:**
- Consumes: `declaraciones` from `@/data/mock/declaraciones`; `formatEUR`, `cn`.
- Produces: `CommandPalette` component (no props) — renders a TopBar search trigger AND the modal, owns its open state and the global `⌘K`/`Ctrl+K`/`Esc` listener.

- [ ] **Step 1: Create the component**

`src/components/layout/CommandPalette.tsx`:

```tsx
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
      setActive((a) => Math.min(a + 1, results.flat.length - 1));
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
                  className="flex-1 py-3.5 text-sm text-ink placeholder:text-muted bg-transparent focus:outline-none"
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
```

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/CommandPalette.tsx
git commit -m "feat(platform): add command palette (cmd-k search)"
```

---

### Task 7: Settings page

**Files:**
- Create: `src/app/plataforma/configuracion/page.tsx`

**Interfaces:**
- Consumes: `useToast` (Task 1); `Card`/`CardHeader`/`CardTitle`/`CardContent`, `Button`, `Reveal`/`RevealItem`.
- Produces: the `/plataforma/configuracion` route. Breadcrumb label is provided by Task 3's `SEGMENT_LABELS` once TopBar is assembled (Task 8).

- [ ] **Step 1: Create the page**

`src/app/plataforma/configuracion/page.tsx`:

```tsx
"use client";

import { useState, type ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Reveal, RevealItem } from "@/components/motion/Reveal";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-brand" : "bg-line"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`}
      />
    </button>
  );
}

function Row({ label, desc, children }: { label: string; desc?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{label}</p>
        {desc && <p className="text-xs text-muted mt-0.5">{desc}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function ConfiguracionPage() {
  const { show } = useToast();
  const [umbral, setUmbral] = useState(0.8);
  const [autoDictamen, setAutoDictamen] = useState(true);
  const [notifConsultas, setNotifConsultas] = useState(true);
  const [notifDiscrepancias, setNotifDiscrepancias] = useState(true);
  const [notifRevision, setNotifRevision] = useState(false);
  const [formato, setFormato] = useState("PDF");

  return (
    <Reveal className="max-w-2xl space-y-6">
      <RevealItem>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted mb-1">
            Configuración
          </p>
          <h1 className="text-2xl font-semibold text-ink">Ajustes de la plataforma</h1>
        </div>
      </RevealItem>

      <RevealItem>
        <Card>
          <CardHeader>
            <CardTitle>Agente auditor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-ink">
                  Umbral de confianza para dictamen autónomo
                </label>
                <span className="text-sm font-semibold text-brand tabular-nums">
                  {Math.round(umbral * 100)} %
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={0.95}
                step={0.05}
                value={umbral}
                onChange={(e) => setUmbral(parseFloat(e.target.value))}
                className="w-full accent-brand"
              />
              <p className="text-xs text-muted mt-1">
                Por debajo de este umbral, el caso se escala a revisión humana.
              </p>
            </div>
            <Row
              label="Auto-dictamen de declaraciones aptas"
              desc="El agente cierra automáticamente las declaraciones sin hallazgos."
            >
              <Toggle checked={autoDictamen} onChange={setAutoDictamen} />
            </Row>
          </CardContent>
        </Card>
      </RevealItem>

      <RevealItem>
        <Card>
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Row label="Consultas respondidas">
              <Toggle checked={notifConsultas} onChange={setNotifConsultas} />
            </Row>
            <Row label="Discrepancias en Control BPO">
              <Toggle checked={notifDiscrepancias} onChange={setNotifDiscrepancias} />
            </Row>
            <Row label="Nuevos casos en cola de revisión">
              <Toggle checked={notifRevision} onChange={setNotifRevision} />
            </Row>
          </CardContent>
        </Card>
      </RevealItem>

      <RevealItem>
        <Card>
          <CardHeader>
            <CardTitle>Exportación</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Formato de informe">
              <select
                value={formato}
                onChange={(e) => setFormato(e.target.value)}
                className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                <option>PDF</option>
                <option>XLSX</option>
                <option>CSV</option>
              </select>
            </Row>
          </CardContent>
        </Card>
      </RevealItem>

      <RevealItem>
        <Card>
          <CardHeader>
            <CardTitle>Cuenta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="text-ink">
              <span className="text-muted">Usuario:</span> Auditor Ecoembes
            </p>
            <p className="text-ink">
              <span className="text-muted">Email:</span> auditor@ecoembes.es
            </p>
            <p className="text-ink">
              <span className="text-muted">Organización:</span> Ecoembes · AW Auditores
            </p>
          </CardContent>
        </Card>
      </RevealItem>

      <RevealItem>
        <div className="flex justify-end">
          <Button onClick={() => show("Cambios guardados")}>Guardar cambios</Button>
        </div>
      </RevealItem>
    </Reveal>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/plataforma/configuracion/page.tsx
git commit -m "feat(platform): add settings page"
```

---

### Task 8: Assemble the TopBar

**Files:**
- Modify: `src/components/layout/TopBar.tsx` (full rewrite)

**Interfaces:**
- Consumes: `Breadcrumbs` (Task 3), `CommandPalette` (Task 6), `NotificationsPanel` (Task 4), `HelpPopover` (Task 5). Account dropdown's "Configuración" links to `/plataforma/configuracion` (Task 7).
- Produces: the assembled `TopBar`. Removes the old `titleMap`/`getSectionTitle` logic (now handled by Breadcrumbs) and the inline bell/help buttons.

- [ ] **Step 1: Rewrite TopBar to compose the pieces**

Replace the entire contents of `src/components/layout/TopBar.tsx`:

```tsx
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
```

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: build succeeds with no unused-import or type errors.

- [ ] **Step 3: Full visual verification**

Run: `npm run dev`, then check at `http://localhost:3000/plataforma`:
- Breadcrumbs: `Dashboard` on the dashboard; `Dashboard / Auditoría` on the list; `Dashboard / Auditoría / {empresa}` on a ficha (open any declaration); `Dashboard / Configuración` on settings.
- `⌘K` (and `Ctrl+K`) opens the palette; typing an empresa name (e.g. the first company in the list) shows it and Enter navigates to its ficha; arrow keys move the highlight; Esc closes.
- Bell shows a numeric badge equal to the derived notification count; clicking opens the panel; each row navigates; "Ver todo" works.
- "Centro de ayuda" opens the popover; the Acto links navigate to `/demos/...`; inert links don't break.
- Account menu → "Configuración" opens the settings page; toggles/slider/select respond; "Guardar cambios" shows a toast bottom-right that auto-dismisses.
- Click outside each panel closes it; no console errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/TopBar.tsx
git commit -m "feat(platform): assemble live topbar shell"
```

---

## Self-Review

**Spec coverage:**
- Breadcrumbs → Task 3 + assembled in Task 8. ✓
- Notifications panel (derived, badge = count) → Task 2 (data) + Task 4 (UI). ✓
- `⌘K` command palette → Task 6. ✓
- Help popover → Task 5. ✓
- Settings page + account link → Task 7 + Task 8. ✓
- Toast → Task 1 (used by Task 7). ✓

**Type consistency:** `getNotifications`/`Notificacion` (Task 2) consumed verbatim in Task 4. `useToast().show` (Task 1) consumed in Task 7. `Breadcrumbs`/`CommandPalette`/`NotificationsPanel`/`HelpPopover` (Tasks 3–6) consumed in Task 8. `SEGMENT_LABELS` includes `configuracion` so Task 7's route gets a proper breadcrumb.

**Constraints:** No storage, no API routes, no new deps, es-ES copy, brand tokens, `formatEUR`. Settings state is in-memory only.
```