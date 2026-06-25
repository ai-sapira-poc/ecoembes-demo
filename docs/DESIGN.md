# Ecoembes Demo — Design System

The quality bar is the Radisson Sapira demo: **restrained, editorial, cinematic**. Chrome is
near-achromatic; the Ecoembes green is reserved for CTAs, active states, the coverage hero and
status. Motion is part of the build, never decoration. If a screen could be mistaken for a generic
AI-generated dashboard, it has failed.

**Brand source of truth:** `assets/ecoembes-brand-manual.pdf` (Manual de Marca, Sep 2024).
Official logo downloads live in `assets/` and are copied to `demo/public/brand/` for the app.

---

## Brand & color

### Official palette (manual §2.15)

| Token | Hex | Use |
|-------|-----|-----|
| `brand` | `#00A13A` | Primary Ecoembes green (PANTONE 347C) |
| `brand-dark` | `#008532` | Sidebar, hover states, darker surfaces |
| `brand-darker` | `#006428` | Deep overlays, pressed states |
| `brand-soft` | `#E6F7EC` | Soft fills, selected rows |
| `brand-tint` | `#F0FAF3` | Page canvas tint |
| `surface` | `#FFFFFF` | Cards, topbar — functional brand white |
| `accent` | `#1F7A8C` | Data-viz contrast only (not in the manual) |

Neutrals carry a faint green tint: `ink` `#14201A`, `ink-soft` `#3B4742`, `muted` `#5D6B64`,
`canvas` `#F5F8F5`, `line` `#E6ECE8`.

Semantic (+ `-soft` tints): `danger` `#D6453D`, `warning` `#E08A1E`, `ok` `#1F9D52`, `info` `#2F6F99`.

### Usage rules

- **Reserve the brand.** Sidebars/topbars/tables/cards are white/neutral. Green appears on the
  active nav item, primary buttons, the coverage meter, links, and `ok` status — so it pops.
- Status pills use the `bg-{semantic}-soft text-{semantic-dark}` pattern, never raw saturated fills.
- Body text must hit ≥4.5:1. Don't use `muted` for long body copy on tinted backgrounds — use `ink-soft`.
- Prefer `var(--color-brand)` in charts and CSS; hard-code `#00A13A` only where a library requires a literal hex.

---

## Logo (manual §2.2–2.14)

Use `@/components/layout/Logo` — never inline `<img>` or CSS-recolored assets.

### Variants

| Prop | Asset | When |
|------|-------|------|
| `horizontal-claim` + `color` | `ecoembes-logo-color.png` | **Primary lockup** — login, light hero surfaces |
| `horizontal-claim` + `white` | `ecoembes-logo-white.png` | Dark or brand-color backgrounds (landing) |
| `horizontal` + `color` | `ecoembes-logo-header.png` | Compact nav — sidebar white chip, tight headers |
| `mark` | `ecoembes-symbol.png` | Favicon, icon-only contexts |

Legacy alias: `variant="full"` → `horizontal-claim`.

### Do

- Use the **official negative PNG** on dark/color backgrounds (`tone="white"`).
- Use the **color positive PNG** on white/light surfaces (`tone="color"`).
- Give the logo **clear space** before adjacent type or UI (manual §2.11).
- Respect **minimum digital width**: 128px for `horizontal-claim`, 92px for `horizontal`.

### Don't (manual §2.13 — refuse and rewrite)

- CSS filters to fake white/color (`brightness`, `invert`, etc.).
- Drop shadows, glows, or any effect on the logo.
- Stretch or crop — always scale proportionally (`h-* w-auto`).
- Color logo on complex dark photos; white logo on complex light photos.
- Substitute unofficial JPGs, vertical lockups, or hand-drawn marks.

### Surface map

```
Landing (dark photo)     → horizontal-claim, tone="white"
Login (white card)       → horizontal-claim, tone="color"
Sidebar (white chip)     → horizontal, tone="color"
App icon / favicon       → mark (src/app/icon.png)
```

---

## Typography (manual §2.16–2.17)

- **Primary:** Nunito (`--font-nunito`) — Light 300, Regular 400, Bold 600/700.
- **Complementary (sparingly):** Nunito Sans (`--font-nunito-sans`) for dense UI or tables if needed.
- Default body: `font-[var(--font-nunito)]`.

### Scale

- Hero/display: `text-5xl md:text-6xl font-medium tracking-tight text-balance` — **medium, not bold**
  at the largest size (the key editorial tell). Emphasis via a single brand-colored word, never gradient text.
- Page title (inner): `text-2xl font-semibold text-ink`.
- Kicker/overline: `text-xs font-semibold uppercase tracking-[0.18em] text-muted` (or `text-brand-dark`).
  Use sparingly — one deliberate kicker per surface, NOT above every section.
- Body: `text-sm text-ink-soft leading-relaxed`; meta `text-xs text-muted`. Long prose `text-pretty`,
  headings `text-balance`. Cap line length ~70ch.
- Monospace for IDs/CIFs/codes: `font-mono text-xs text-muted`.

### Voice (manual §1.4)

Ecoembes tone is **integrador, abierto, entusiasta, empático, moderno**. Copy should feel warm and
purpose-led — not cold SaaS jargon. Prefer lines like *"Cada declaración, verificada."* over generic
"automation platform" language.

---

## Motion (use the shared primitives in `@/components/motion/Reveal`)

- Reveal language: fade + 20px rise, `0.5s`, ease `[0.22,1,0.36,1]` (easeOut quint), `0.1s` stagger.
  Use `<Reveal>`/`<RevealItem>` for groups, `<FadeUp delay>` standalone.
- Step transitions (Actos): right column slides `x:20→0 / exit x:-20`, `0.25s`; left fades.
- Coverage meter / progress bars: animate width, `0.4–1.2s` easeOut. Numbers may count up.
- Narrative beats (agent sending an email, pipeline hand-off): a brief white-wipe overlay is on-brand
  (borrowed from Radisson) — `opacity 0→1→0`, auto-dismiss ~1.5–2.4s, never interactive.
- Skeleton→content reveals (1–2s) for "the agent is working" moments.
- Never spring/bounce/elastic for UI. Always provide a reduced-motion path (globals.css already
  zeroes durations under `prefers-reduced-motion`).

---

## Surfaces, spacing, shadow

- Content padding `p-8` (`px-12 py-6` for wide shells). Vary spacing for rhythm; don't uniformly pad.
- Radius: cards/panels `rounded-xl` (12px) up to `rounded-2xl` (16px) for hero cards; pills `rounded-full`;
  inputs/buttons `rounded-lg`/`rounded-xl`. **Never** `rounded-[24px]+` on cards.
- Borders: `border border-line` (single, light). No colored side-stripe borders (banned).
- Shadows: directional and soft, e.g. `shadow-[0_2px_20px_-6px_rgba(20,32,26,0.18)]`. **Never** pair a
  1px border with a wide soft glow as decoration; pick one. No omnidirectional/colored glow.
- Glass (sparingly, for elevated cards over the mesh): `bg-white/70 backdrop-blur-sm ring-1 ring-line`.
- Background: `MeshBackground` (drifting green blobs) on landing/login/Acto canvases; cinematic photo +
  brand-green wash on the landing hero; plain `bg-canvas` in the platform shell content area.

### Acto sidebar copy (left rail)

Use `StepAsideSection`, `StepAsideList`, and `StepAsideMeta` from `@/components/layout/StepLayout`
for all Acto step explainers — not long prose paragraphs.

- **Section title:** `text-[11px] uppercase tracking-[0.14em] text-muted` — one kicker per beat
  (e.g. "Qué hace el agente", "Validaciones del monográfico", "Hallazgo en este caso").
- **Body:** `text-sm text-ink-soft`; use `<StepAsideList>` for enumerations — neutral `bg-muted` bullets,
  no brand green in the left rail (green stays on the visual / active states).
- **Meta footnote:** `<StepAsideMeta>` for figures (importe declarado, confianza) — separated by `border-t`.
- Stack sections with `space-y-4` in the left column; 2–4 sections per step is the target density.

Reference: Acto 1 steps in `src/app/demos/auditoria/page.tsx`.

### Acto cards — follow the Radisson approach (deep-dive through the real product)

Reference: Acto 1 (`src/app/demos/auditoria/page.tsx`) and the platform ficha it mirrors
(`src/app/plataforma/auditoria/[id]/page.tsx`).

An Acto is a **narrated deep-dive through the real product UI** — not a set of bespoke "narrative
tiles". Each step visual is built from the SAME platform primitives the `/plataforma` screens use, so
the guided walkthrough and the live product look identical. The narration lives in the left rail; the
right column shows the actual platform surface.

**Build from the platform primitives, don't reinvent chrome:**

- Use `Card` / `CardHeader` / `CardTitle` / `CardContent` from `@/components/ui/Card` for every panel —
  never hand-roll `rounded-xl border border-line bg-surface` card markup in a step visual.
  `CardHeader` = `px-6 pt-5 pb-3`, `CardTitle` = `text-base font-semibold text-ink`, with a muted count
  or sub-label inline (e.g. `Declaración extraída · Hoja SIG`).
- Tables use `Table` / `THead` / `TBody` / `TR` / `TH` / `TD`; row hover `hover:bg-brand-tint/60`.
- Stats use `StatCard`; status uses `EstadoBadge` / `SeverityBadge` / `ConfidenceBadge`; the metadata
  header is the ficha's icon flex-row (Hash / Building2 / Layers / Calendar).
- Reuse the shared feature components (`FormatosBreakdown`, `FindingsPanel`, `CorrespondenciaThread`,
  `AnalisisChecks`, …) rather than rebuilding their content inline.
- Borders are always `border-line` — no `border-brand/25`, `border-warning/25` accents on chrome.
  Brand green stays reserved for CTAs, active and `ok` states.

**Layout & scroll — full platform style is fine:**

- A step visual **may be full platform-style and scroll inside the right column** — the `StepLayout`
  sticky fix pins the left rail while the right column scrolls. Do not chase "fit-in-viewport" or make
  cards hug content to avoid scroll.
- Step visual root: `flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto` (match the platform's
  `space-y-5` rhythm between stacked cards).

**Keep the staged "agent working" beats:**

- Retain the skeleton → reveal sequences (extraction, redacting → sent, fetching ficha) and the
  white-wipe hand-offs — these are good narrative and on-brand (borrowed from Radisson).
- Stagger stacked cards with `<FadeUp delay>` / `<AnimatePresence>`; resolve validation rows
  progressively. The beats now play out inside real platform Cards, not bespoke panels.

---

## Component conventions

- One component per file, PascalCase, grouped by feature. `"use client"` only when needed
  (hooks, framer-motion, recharts, onClick).
- Reuse `@/components/ui/*` primitives (Button, Card, Badge, SeverityBadge, ConfidenceBadge, StatCard,
  Skeleton, Table). Extend via `className` + `cn`, don't fork.
- Recharts: stroke/fill use `#00A13A` (or `var(--color-brand)`), not legacy approximations.

---

## Banned (AI-slop tells — refuse and rewrite)

- Gradient text; glassmorphism as default; colored side-stripe borders; identical icon+title+text card
  grids repeated endlessly; tiny uppercase eyebrow above *every* section; `01/02/03` numbered markers as
  scaffolding; over-rounded cards; 1px-border + wide-glow "ghost cards"; repeating-linear-gradient stripes;
  hand-drawn/sketchy SVGs; CSS-filtered or unofficial logos. Text must never overflow its container at
  any breakpoint.

---

## The story must lead

This is a narrative, not a dashboard. Every screen reinforces one beat: **"hoy se revisa una muestra →
con Sapira, el 100% verificado, con evidencia, y el humano solo decide lo dudoso."** Navigation should
feel like turning pages. The Auditoría agent behaves like a real auditor (analiza → consulta al cliente
por email → veredicto APTO/NO APTO). The Control coverage meter (1,6% → 100%) is the single most
important visual.
