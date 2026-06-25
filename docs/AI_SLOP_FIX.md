# Acto walkthroughs — de-slop brief (Propuesta A · Ledger)

Hand this to Claude Code. It applies to both guided Actos
(`src/app/demos/auditoria/page.tsx`, `src/app/demos/control/page.tsx`) and the
shared shell (`src/components/layout/StepLayout.tsx`, `StepBar.tsx`).

**Goal:** the right column of each step should read as *one product surface*, not a
stack of bordered cards that re-narrates itself and fakes loading. Stay strictly
inside the existing tokens in `src/app/globals.css` — no new colors, fonts, radii.

**Hard rule:** the data carries the screen, not the chrome. Reserve `brand` (green)
and `danger` (red) for one moment each. If a step could be mistaken for a generic
AI dashboard, it has failed.

---

## The six tells to remove

### 1 · Card pile-up → one surface per step
Today each step stacks 2–4 `<Card>`s (extracted table + `AnalisisChecks` card +
warning banner + queue + CTA). Replace the stack with **one `<Card>`** whose
internal sections are divided by `border-t border-line` hairlines and section
overlines, not by repeated card chrome.

- One outer `<Card className="overflow-hidden">` per step visual.
- Sections inside it = a header meta row, then `border-t border-line` blocks.
- Section labels: `text-[10px] font-semibold uppercase tracking-[0.14em] text-muted`
  (an overline), **not** a `CardTitle` + grey subtitle pair.
- Delete nested `<Card>`s inside a step. No card-in-card.

### 2 · Narration triplicated → say it once
The same fact appears in the left rail, the `CardTitle`, and a grey subtitle
(e.g. *"Cada validación con su evidencia, delta económico y confianza"*).

- Keep the explanation in the **left rail only**.
- Remove every descriptive grey subtitle under a `CardTitle` (the
  `<span className="block text-xs ... text-muted">…</span>` pattern). A section
  overline (point 1) replaces it.
- Left rail prose: **2 short paragraphs max**, ~70ch. Cut anything the visual
  already shows. (See the tightened copy in point 7.)

### 3 · Skeleton theater → one working beat per act
Drop the decorative skeletons: `PlatformFetchSkeleton`, `ConsultaEmailSkeleton`,
`ExtractionTableSkeleton`, the "Recuperando ficha…" / "Redactando…" / "Extrayendo
del adjunto…" loaders. Nothing is actually loading — they read as fake.

- Keep **exactly one** "the agent is working" beat per Acto: the
  `AnalisisChecks` resolving line-by-line (`resolvedCount` stepping up). That one
  is meaningful — it shows the audit happening.
- Everywhere else, render the resolved state directly with a single entrance
  fade (point 4). Tables, emails, fichas appear — they don't pretend to load.

### 4 · Compound transitions → one entrance, no height animation
The jank comes from layering motions: `StepLayout` slides the column in X while
that same column has `overflow-y-auto`, and inner cards animate their own
`height: 0 → auto` inside the scroll container.

- **Step entrance:** one fade only. In `StepLayout`, change the right column's
  `initial/animate` from `{ opacity, x }` to `{ opacity, y: 8 }` (or opacity-only).
  Never translate-X a scrolling column.
- **Never animate `height`/`auto` of anything inside an `overflow-y-auto`
  container.** Reveal child content with opacity (and a tiny `y`), not height.
  This removes the mid-animation reflow that jumps scroll position.
- One `<FadeUp>` per section, small stagger (`delay` 0 / 0.08 / 0.16). Don't nest
  `AnimatePresence` height collapses inside `FadeUp` inside the slide.
- Keep the `prefers-reduced-motion` path already in `globals.css`.

### 5 · Color confetti → reserve green and red
Status pills (`OK`/`Alerta`), `SeverityBadge`, the `Recomendada` brand pill,
filter chips and brand hovers all compete.

- Passing checks are **quiet**: a 7px `bg-ok` dot + label in `text-ink-soft` +
  `OK · 99%` in `text-muted`. No `bg-ok-soft` pill on every row.
- Use `danger`/`warning` **once** — on the finding that carries money.
- Drop the `Recomendada` green pill and decorative chip rows. Green stays for the
  active nav/step, the progress bar, and the single primary CTA.

### 6 · Flat hierarchy → the finding is the hero
Every row is `text-sm font-semibold`, so the 8.568 € finding reads the same as
"Integridad del envase · OK".

- The flagged check becomes a pulled-out block: `bg-danger-soft rounded-lg`,
  the € impact in **`text-3xl font-extrabold tabular-nums text-danger`** on the
  right, the tariff math (`0,049 €/kg (Madera) · 0,389 €/kg (PEAD) · 0,340 × 25.200 kg`)
  on the left.
- Passing checks are one quiet line each (point 5). Don't expand evidence +
  confianza + Δ on rows where Δ is `—`; show that meta only on the alerta row.

### 7 · Left-rail copy — tighten
Replace the 2 long paragraphs per step with 2 short ones. Example for Acto 1 / Paso 2:

> El agente extrae el SIG, normaliza cada material contra el catálogo 2025 y corre
> las cinco comprobaciones del monográfico.
>
> Una falla: la línea de gel ducha se tarifó como **Madera**, no como **PEAD**.

Drop the `Interactúa` box except on steps with a genuine interaction (the
HITL approve/reject, the portal hand-off). One per act, max.

---

## Target structure for a step visual (Ledger)

One `<Card>`, sectioned by hairlines:

```
<Card overflow-hidden>
  ── meta row ──────────────────────────────────────────────
     Empresa (text-base font-bold)        EstadoBadge (one pill)
     CIF · sector · período (text-xs muted)   Confianza NN%
  ── border-t · DECLARACIÓN · N líneas ─────────────────────
     slim table; only the flagged line tinted (bg-warning-soft)
  ── border-t · COMPROBACIONES · 5 ─────────────────────────
     quiet OK rows (dot · label · "OK · 99%")           ← muted
     quiet alerta row (dot · label · "Alerta · 92%")
     ┌ HERO block (bg-danger-soft) ───────────────────┐
     │ Cruce de tarifas       tariff math    8.568 €   │ ← text-3xl danger
     └─────────────────────────────────────────────────┘
  ── border-t · next ───────────────────────────────────────
     "Pasa a consulta con el cliente"        Abrir consulta →
</Card>
```

It must **fit the viewport without scrolling** on a 1440×900 screen. If it
doesn't, cut content — don't add a scroll.

## Reuse, don't fork
- Keep `Card / CardHeader / CardContent`, `Table`, `StatCard`, `EstadoBadge`,
  `SeverityBadge`, `ConfidenceBadge`, `FadeUp`. Refactor how they're *composed*,
  not the primitives.
- `AnalisisChecks`: keep the resolve-by-line behavior; restyle rows to the quiet/
  hero split above (quiet OK rows, one pulled-out alerta with the € hero).
- `FindingsPanel`: fine as-is for the HITL verdict step; just don't also repeat the
  same findings in a sibling card on the same step.

## Tokens (don't invent)
`brand #00A13A` · `brand-soft #E6F7EC` · `ink #14201A` · `ink-soft #3B4742` ·
`muted #5D6B64` · `surface #fff` · `canvas #F5F8F5` · `line #E6ECE8` ·
`danger #D6453D` / `-soft #FBEAE9` · `warning #E08A1E` / `-soft #FCF2E2` ·
`ok #1F9D52` / `-soft #E6F5EC`. Font: Nunito. Cards `rounded-xl`, pills `rounded-full`.

## Done when
- Each step = one card, no card-in-card, no grey restating subtitles.
- Only the `AnalisisChecks` resolve animates; no other skeletons.
- Step entrance is a single fade; no height animation inside a scroll container;
  scroll position never jumps on step change.
- One red and at most one green moment per step; passing checks are quiet.
- The € finding is visibly the largest thing in the analysis step.
- Left rail is ≤ 2 short paragraphs; `Interactúa` box only where it's interactive.
- Step visual fits 1440×900 without internal scroll.
