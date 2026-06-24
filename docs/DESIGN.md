# Ecoembes Demo — Design System

The quality bar is the Radisson Sapira demo: **restrained, editorial, cinematic**. Chrome is
near-achromatic; the Ecoembes green is reserved for CTAs, active states, the coverage hero and
status. Motion is part of the build, never decoration. If a screen could be mistaken for a generic
AI-generated dashboard, it has failed.

## Brand & color

- Official Ecoembes green: `brand` `#1AA84B`, `brand-dark` `#0F7C36`, `brand-darker` `#0A5827`,
  `brand-soft` `#E8F5EC`, `brand-tint` `#F3FAF5`. Accent (viz contrast) `accent` `#1F7A8C`.
- Neutrals carry a faint green tint: `ink` `#14201A`, `ink-soft` `#3B4742`, `muted` `#5D6B64`,
  `surface` `#FFFFFF`, `canvas` `#F5F8F5`, `line` `#E6ECE8`.
- Semantic (+`-soft` tints): `danger` `#D6453D`, `warning` `#E08A1E`, `ok` `#1F9D52`, `info` `#2F6F99`.
- **Reserve the brand.** Sidebars/topbars/tables/cards are white/neutral. Green appears on the
  active nav item, primary buttons, the coverage meter, links, and `ok` status — so it pops.
- Status pills use the `bg-{semantic}-soft text-{semantic-dark}` pattern, never raw saturated fills.
- Body text must hit ≥4.5:1. Don't use `muted` for long body copy on tinted backgrounds — use `ink-soft`.

## Typography

- One family: **Inter** (`--font-inter`), already loaded. Weight is the system, not family variety.
- Hero/display: `text-5xl md:text-6xl font-medium tracking-tight text-balance` — **medium, not bold**
  at the largest size (the key editorial tell). Emphasis via a single brand-colored word, never gradient text.
- Page title (inner): `text-2xl font-semibold text-ink`.
- Kicker/overline: `text-xs font-semibold uppercase tracking-[0.18em] text-muted` (or `text-brand-dark`).
  Use sparingly — one deliberate kicker per surface, NOT above every section.
- Body: `text-sm text-ink-soft leading-relaxed`; meta `text-xs text-muted`. Long prose `text-pretty`,
  headings `text-balance`. Cap line length ~70ch.
- Monospace for IDs/CIFs/codes: `font-mono text-xs text-muted`.

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

## Surfaces, spacing, shadow

- Content padding `p-8` (`px-12 py-6` for wide shells). Vary spacing for rhythm; don't uniformly pad.
- Radius: cards/panels `rounded-xl` (12px) up to `rounded-2xl` (16px) for hero cards; pills `rounded-full`;
  inputs/buttons `rounded-lg`/`rounded-xl`. **Never** `rounded-[24px]+` on cards.
- Borders: `border border-line` (single, light). No colored side-stripe borders (banned).
- Shadows: directional and soft, e.g. `shadow-[0_2px_20px_-6px_rgba(20,32,26,0.18)]`. **Never** pair a
  1px border with a wide soft glow as decoration; pick one. No omnidirectional/colored glow.
- Glass (sparingly, for elevated cards over the mesh): `bg-white/70 backdrop-blur-sm ring-1 ring-line`.
- Background: `MeshBackground` (drifting green blobs) on landing/login/Acto canvases; plain `bg-canvas`
  in the platform shell content area.

## Component conventions

- One component per file, PascalCase, grouped by feature. `"use client"` only when needed
  (hooks, framer-motion, recharts, onClick).
- Reuse `@/components/ui/*` primitives (Button, Card, Badge, SeverityBadge, ConfidenceBadge, StatCard,
  Skeleton, Table). Extend via `className` + `cn`, don't fork.
- Recharts: stroke/fill use the brand `#1AA84B` (or `var(--color-brand)`), not the old olive.

## Banned (AI-slop tells — refuse and rewrite)

- Gradient text; glassmorphism as default; colored side-stripe borders; identical icon+title+text card
  grids repeated endlessly; tiny uppercase eyebrow above *every* section; `01/02/03` numbered markers as
  scaffolding; over-rounded cards; 1px-border + wide-glow "ghost cards"; repeating-linear-gradient stripes;
  hand-drawn/sketchy SVGs. Text must never overflow its container at any breakpoint.

## The story must lead

This is a narrative, not a dashboard. Every screen reinforces one beat: **"hoy se revisa una muestra →
con Sapira, el 100% verificado, con evidencia, y el humano solo decide lo dudoso."** Navigation should
feel like turning pages. The Auditoría agent behaves like a real auditor (analiza → consulta al cliente
por email → veredicto APTO/NO APTO). The Control coverage meter (1,6% → 100%) is the single most
important visual.
