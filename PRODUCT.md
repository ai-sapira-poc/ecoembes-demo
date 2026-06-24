# Ecoembes Demo — PRODUCT.md

**register:** product (app UI — dashboard/tool; design serves the product)

## What this is
A **frontend-only sales demo** for Ecoembes (via AW, reselling Sapira). It must feel like a
real, shippable SaaS product — polished enough to put in front of a client, not a prototype.
"If a screen could be mistaken for a generic AI-generated dashboard, it has failed."

## Quality bar
Reference: the Radisson Sapira demo — **restrained, editorial, cinematic**. Chrome is
near-achromatic; the Ecoembes green (`#00A13A`) is reserved for CTAs, active states, the
coverage hero, links, and `ok` status, so the brand pops instead of competing. Motion is part
of the build, never decoration. Full design system in `docs/DESIGN.md`; tokens in
`src/app/globals.css`.

## Surfaces (the three "demos")
- **Platform** (`/plataforma/*`) — the always-on product UI: dashboard, Auditoría list + ficha,
  Control BPO, Revisión, Configuración.
- **Acto 1** (`/demos/auditoria`) — guided step-by-step auditoría walkthrough.
- **Acto 2** (`/demos/control`) — guided step-by-step Control BPO walkthrough.
Plus the landing (`/`) and login (`/login`).

## Non-negotiables
- No visual bugs. Fix on sight — never ship a layout defect (e.g. controls that jump position
  between states, content overflow, broken scroll containers).
- Only the main content area scrolls; sidebar + topbar are pinned (desktop). Mobile uses the tab bar.
- es-ES copy, official logo component, brand tokens only. No AI-slop tells (see docs/DESIGN.md "Banned").
- The story leads: every screen reinforces "hoy se revisa una muestra → con Sapira, 100% verificado".
