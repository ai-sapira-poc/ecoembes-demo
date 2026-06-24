# Platform Shell — "Make it feel like a real app" (Phase 1)

> Spec for the first phase of the Platform uplift. Goal: make the always-on app
> shell read as a real, daily-use product rather than a demo. Driven scripted by
> a rep on a happy path, so off-path controls must **look alive and never break**,
> not be deeply functional.

## Context

The `/plataforma/*` routes already have strong visual design, real filtering
logic, and brand-consistent components. What still reads as "demo" is the shell:
the TopBar bell, "Centro de ayuda", and the account → Configuración item are
no-ops, there is no breadcrumb trail, and there is no global search. This phase
makes the shell alive. Module depth, data framing, and demo-tell cleanup are
later phases (see "Out of scope / later phases").

## Constraints (inherited from CLAUDE.md)

- No `localStorage`/`sessionStorage`, no `/app/api/` routes, no runtime fetches.
- No placeholder text ("Lorem ipsum", "Empresa A", `TODO`).
- es-ES locale, `formatEUR`/`formatNum`/`formatPct` for all numbers.
- Footer must read "POWERED BY SAPIRA".
- The exact BPO figures (437, €2.338.519, etc.) are never changed.
- Brand tokens from `globals.css`; `cn()` for class merging.

## Deliverables

### 1. Breadcrumbs in the TopBar

Replace the single static section title in `TopBar.tsx` with a derived
breadcrumb trail.

- Derived from `usePathname()`. Segment → label map reuses the existing
  `titleMap` logic, extended so the last crumb is the page.
- For `/plataforma/auditoria/[id]`, the final crumb is the **empresa name**,
  resolved via `getDeclaracion(id)` (data is a static import, so this works
  client-side). If the id is unknown, fall back to the raw id.
- Crumbs before the last are `Link`s; the last is plain text (`aria-current`).
- Root crumb is always `Dashboard` → `/plataforma`.
- Example: `Dashboard / Auditoría / Capsa Food`.

New component: `src/components/layout/Breadcrumbs.tsx` (client). TopBar renders it
on the left in place of the current `<h2>`.

### 2. Notifications bell → real dropdown panel

The existing bell has a hardcoded "3" badge and no panel. Make it open a real
panel whose contents are **derived from the mock data**, not a static list.

- New helper in the data layer (`src/data/index.ts` or a small
  `src/data/notifications.ts`): `getNotifications()` returns a typed
  `Notificacion[]` derived from existing data:
  - declarations with `estadoAgente === "respuesta_recibida"` →
    "{empresa} respondió a una consulta" (links to its ficha).
  - BPO discrepancies (`bpoMes.records` where `estado !== "ok"`, top by delta) →
    "Discrepancia detectada en Control BPO — {formatEUR(delta)}" (links to
    `/plataforma/control`).
  - revisión queue count → "{n} casos esperan revisión" (links to
    `/plataforma/revision`).
- Badge count = `getNotifications().length` (replaces the hardcoded 3).
- Panel: framer-motion dropdown matching the existing account-dropdown style
  (fixed positioning to escape overflow, backdrop to close). Each row is a
  `Link` with icon + title + relative-ish timestamp label (static strings, es-ES,
  e.g. "hace 2 h"). Footer link: "Ver todo" → no-op-safe (scrolls/closes).
- Each `Notificacion`: `{ id, tipo, titulo, href, cuando, icon }`.

### 3. Global search — `⌘K` command palette

New component `src/components/layout/CommandPalette.tsx` (client).

- A visible search affordance in the TopBar (button styled as an input with a
  `⌘K` hint chip) opens it; `⌘K` / `Ctrl+K` also opens it via a global
  `keydown` listener; `Esc` closes.
- Modal overlay (framer-motion fade + scale), centered, with a text input.
- Results, filtered live against real data:
  - **Declaraciones**: match `empresa` or `cif` (reuse the list page's filter
    logic) → navigate to `/plataforma/auditoria/{id}`, showing estado + importe.
  - **Navegación**: static commands (Dashboard, Auditoría, Control BPO, Revisión,
    Configuración) that match by label.
- Keyboard: ↑/↓ to move highlight, Enter to navigate, Esc to close. Click also
  navigates. Uses `useRouter().push`.
- Empty query shows the nav commands + a few recent/priority declaraciones.
- No-results state: "Sin resultados para «{q}»".

### 4. "Centro de ayuda" → popover

The existing help button becomes a small framer-motion popover (same visual
language as the dropdowns) with plausible, non-dead links:

- "Guía de la plataforma", "Ver Acto 1 — Auditoría" (`/demos/auditoria`),
  "Ver Acto 2 — Control BPO" (`/demos/control`), "Contactar con Sapira".
- Internal links navigate; external/contact links are inert but styled normally
  (no broken click). Closes on outside click.

### 5. Settings page at `/plataforma/configuracion`

New route `src/app/plataforma/configuracion/page.tsx`. The account dropdown's
existing "Configuración" button becomes a `Link` to it.

- Reachable, real-looking, **visual-only** (state via `useState`, resets on
  reload — no storage). Sections:
  - **Agente** — "Umbral de confianza para dictamen autónomo" (slider/stepper,
    default 0.80), "Auto-dictamen de declaraciones aptas" (toggle, on).
  - **Notificaciones** — toggles for consultas respondidas, discrepancias BPO,
    cola de revisión.
  - **Exportación** — formato de informe select (PDF / XLSX / CSV).
  - **Cuenta** — read-only: "Auditor Ecoembes", "auditor@ecoembes.es", org.
- Uses existing `Card`/`Button`/`Badge` primitives + breadcrumb "Dashboard /
  Configuración". A "Guardar cambios" button fires a toast (see below) — no
  persistence.
- Add to the Sidebar? No — keep the four primary nav items; Configuración is
  reached from the account menu (matches real apps).

### 6. Toast primitive (shared)

A lightweight toast is needed by Settings now and Revisión later.

- New `src/components/ui/Toast.tsx` + a minimal context/provider mounted in
  `plataforma/layout.tsx` (client boundary). `useToast().show("Cambios guardados")`.
- framer-motion enter/exit, bottom-right, auto-dismiss ~2.5s, brand-styled.
- No external lib(no `sonner` etc.) — keep the dependency surface as-is.

## Architecture / where things live

```
src/
  app/plataforma/
    layout.tsx              # mount ToastProvider (client wrapper) around children
    configuracion/page.tsx  # NEW settings page
  components/
    layout/
      TopBar.tsx            # breadcrumbs + search trigger + wired bell/help/account
      Breadcrumbs.tsx       # NEW
      CommandPalette.tsx    # NEW (⌘K)
      NotificationsPanel.tsx# NEW (or inline in TopBar)
      HelpPopover.tsx       # NEW (or inline in TopBar)
    ui/
      Toast.tsx             # NEW toast + provider/hook
  data/
    notifications.ts        # NEW getNotifications() + Notificacion type (or in index.ts)
```

Each new component has one purpose and a small surface. TopBar becomes an
orchestrator that composes Breadcrumbs + CommandPalette trigger + the three
panels; the panels own their own open/close state.

## Interfaces

```ts
// data/notifications.ts
type Notificacion = {
  id: string;
  tipo: "consulta" | "discrepancia" | "revision";
  titulo: string;
  href: string;
  cuando: string;     // es-ES relative label, static
  icon: LucideIcon;
};
function getNotifications(): Notificacion[];

// ui/Toast.tsx
function useToast(): { show: (msg: string) => void };
```

## Error / edge handling

- Breadcrumb on unknown declaration id → show the id, never crash.
- Command palette with empty data match → no-results state.
- All panels close on outside click / Esc; only one open at a time is nice-to-have,
  not required.
- Keyboard listeners are cleaned up on unmount.

## Testing / verification

No test runner in this project. Verification is visual via `npm run dev`:
- Breadcrumbs correct on each route incl. a ficha (shows empresa name).
- `⌘K` opens palette; typing "Capsa" navigates to that ficha; nav commands work.
- Bell badge = derived count; panel items link correctly.
- Help popover opens, links navigate, no dead clicks.
- Settings page reachable from account menu; toggles move; "Guardar" toasts.
- `npm run build` passes (TS strict) — the correctness gate.

## Out of scope / later phases

- **Phase 2 — module depth:** Auditoría list sort control + "N de 437" priority
  framing; Revisión Aprobar/Rechazar animates out + decrements + toasts.
- **Phase 3 — demo-tell cleanup + states:** remove "demo v1.0 / acciones visuales"
  disclaimers; per-module `loading.tsx` skeletons; empty/error state pass.
- Real auth, persistence, backend, true pagination over invented data — never.
```