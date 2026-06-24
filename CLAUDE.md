# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

# Ecoembes Demo — "Cada declaración, verificada"

## What Is This

A **frontend-only** sales demo built for Ecoembes (via AW, the auditing partner reselling Sapira).
The demo shows how Sapira's AI platform turns two manual, sample-based verification processes into
automated 100%-coverage processes with a full audit trail.

**Narrative in one sentence:** Ecoembes moves millions in packaging fees on self-declarations, and
today verifies only a sample — Sapira takes that to 100%.

**The BPO punchline:** Today the BPO checks 5 of 437 cases (€37.367 of €2.338.519 — 1,6% by amount).
All seeded discrepancies are outside those 5 cases. That is the story.

> This is a demo, not a product. It must feel real enough to sell — not real enough to ship.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router) — see `@AGENTS.md` for breaking-change warnings
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 4 — brand tokens live in `src/app/globals.css` `@theme` block
- **Charts:** Recharts
- **Animations:** Framer Motion (coverage meter, skeleton→content reveals, step transitions)
- **Icons:** Lucide React
- **Utils:** clsx + tailwind-merge (`cn` from `@/lib/utils`)
- **Import alias:** `@/*` → `./src/*`
- **Language/locale:** es-ES everywhere — numbers as `2.338.519`, currency as `€2.338.519`

---

## Commands

```bash
npm run dev      # Next.js dev server at http://localhost:3000
npm run build    # Production build (also the type-check gate — tsc runs as part of build)
npm run start    # Serve the production build
npm run lint     # ESLint (flat config: next/core-web-vitals + next/typescript)
```

No test runner is configured — there are no unit/e2e tests. Verification is visual: run `npm run dev`
and check the screen against the narrative. `npm run build` is the only correctness gate (TS strict).

---

## Brand Palette

| Token          | Hex       | Usage                                    |
|----------------|-----------|------------------------------------------|
| `brand`        | `#1AA84B` | Primary green (official Ecoembes) — buttons, active states |
| `brand-dark`   | `#0F7C36` | Sidebar bg, section headers              |
| `brand-darker` | `#0A5827` | Deep accent                              |
| `brand-soft`   | `#E8F5EC` | Light tinted backgrounds, icon circles   |
| `accent`       | `#1F7A8C` | Teal-blue for chart contrast             |
| `ink`          | `#1A2520` | Body text                                |
| `muted`        | `#6B7770` | Secondary / placeholder text             |
| `canvas`       | `#F6F8F4` | Page background                          |
| `danger`       | `#D6453D` | Error, alta severidad                    |
| `warning`      | `#E08A1E` | Media severidad                          |
| `ok`           | `#2F9E44` | Verified / ok states                     |

Footer must always read **"POWERED BY SAPIRA"** (bottom-right).

---

## Route Architecture

The App Router tree under `src/app/` splits into **two parallel experiences** — this is the single
most important structural fact:

- **`/plataforma/*`** — the always-on product UI (own `layout.tsx` with Sidebar/TopBar). This is
  "the platform" a user explores freely.
- **`/demos/*`** — scripted **Acto** walkthroughs (own `layout.tsx` with StepLayout/StepBar). These
  are paced, step-by-step versions of the same modules for live presentations.

| Route                          | Screen                          |
|--------------------------------|---------------------------------|
| `/`                            | Landing                         |
| `/login`                       | Simulated login → `/plataforma` |
| `/plataforma`                  | Dashboard (unified KPIs)        |
| `/plataforma/auditoria`        | Auditoría — declaration listing |
| `/plataforma/auditoria/[id]`   | Auditoría — full declaration ficha |
| `/plataforma/control`          | Control BPO — coverage hero + reconciliation |
| `/plataforma/revision`         | Revisión Humana (HITL queue)    |
| `/demos/auditoria`             | Acto 1 — guided 5-step Auditoría |
| `/demos/control`               | Acto 2 — guided 5-step Control BPO |

Both the platform module and its matching Acto render the **same data** (`src/data/mock/*`) — the
Acto just gates it behind steps. Keep them consistent.

## Component & Data Layout

```
src/
  components/
    ui/          # Primitives: Button, Card, Badge, StatCard, Table, Skeleton, Severity/ConfidenceBadge
    layout/      # Shell: Sidebar, TopBar, Logo, Footer, StepLayout, StepBar, MeshBackground
    motion/      # Reveal, WhiteWipe — shared Framer Motion transition wrappers
    auditoria/   # SIG lines, findings, dictamen, expediente, pipeline, correspondencia
    control/     # CoverageMeter (the hero visual), ReconciliationTable, EvidenceCard
    revision/    # ReviewItemCard
    dashboard/   # CoverageDonut, TrendChart
  data/
    types.ts     # All TypeScript interfaces
    mock/        # empresas.ts, declaraciones.ts, bpo.ts, dashboard.ts, revision.ts
    index.ts     # Re-exports + derived helpers (getDeclaracion, auditoriaResumen, auditoriaPipeline)
  lib/utils.ts   # cn(), formatEUR(), formatNum(), formatPct()
```

---

## Data Rules

All data lives in `src/data/mock/*.ts`. **No data is fetched at runtime.**

**Exact BPO figures — never change these:**
- `437` declaraciones totales
- `€2.338.519` importe total
- `5` muestreadas manualmente
- `€37.367` importe muestreado (1,6% cobertura)
- `€26.900` importe en riesgo (suma de deltas de discrepancias)
- `6` discrepancias, todas con `muestreada: false` — this is the narrative punchline

**Auditoría declarations:** 8–10 entries for ejercicio 2025. Realistic Spanish FMCG company names,
plausible tariffs (€/kg per material), real packaging materials (PET, PEAD, PVC, Film plástico,
Papel/Cartón, Vidrio, Acero, Aluminio, Madera, Brik).

**HITL queue:** 4–6 items mixing both module origins, confidence 0.55–0.78.

---

## Coding Conventions

- One component per file, PascalCase filename.
- `"use client"` only where interactivity is actually needed.
- Group components by feature: `/components/{feature}/ComponentName.tsx`.
- Format numbers with `formatEUR()`, `formatNum()`, `formatPct()` from `@/lib/utils`.
- Filters, search, and drill-downs must work with real logic against mock data — no faking.
- Use Framer Motion for reveals, transitions, and the coverage meter animation.
- Skeleton → content loading for "wow" moments (1–2s max delay).

---

## Absolute Don'ts

- ❌ No `localStorage`, `sessionStorage`, or any browser storage
- ❌ No `/app/api/` routes
- ❌ No runtime external API calls
- ❌ No real authentication
- ❌ No "Lorem ipsum", "Empresa A", "Product 1", or placeholder text
- ❌ No `console.log` in committed code
- ❌ No unbranded default theming
- ❌ No placeholder / `TODO` / `FIXME` in source

---

## The Demo Must Tell a Story

This is not a dashboard — it is a **narrative**. The arc is always:

> "Today: muestreo → only a sample is checked, money is at risk."
> "With Sapira: 100% of declarations verified, discrepancies surfaced, humans review only what matters."

Every screen should reinforce one of those two beats. Navigation between screens should feel like
turning pages, not switching tabs.

### Story landmarks

1. **Landing** → sets the theme, invites into the platform or a guided act.
2. **Dashboard** → proves the scope: all declarations, all amounts, all findings at a glance.
3. **Auditoría module** → shows the agent reading and judging individual self-declarations.
4. **Control BPO module** → the coverage meter (1,6% → 100%) is the single most important visual.
5. **Revisión HITL** → closes the loop: "the agent did 100%; the human reviews only what matters."
6. **Acto 1 & Acto 2** → guided walkthroughs for live demos where you want to control the pace.

---

## docs/

- `docs/DEMO_STRUCTURE.md` — condensed single source of truth: narrative, route map, module summaries, Actos.
- `docs/DESIGN.md` — visual/design direction for the demo.
