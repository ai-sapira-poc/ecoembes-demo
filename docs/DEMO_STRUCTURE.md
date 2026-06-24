# Demo Structure — Ecoembes · "Cada declaración, verificada"

> Single source of truth for the demo narrative, routes, and step-by-step acts.

---

## Narrative

Ecoembes collects annual fees from ~4.000 companies based on **self-declarations** of packaging
placed on the market. Today verification is **sampling-based**:

- **Auditoría:** auditors review a fraction of declarations each year.
- **BPO (Cuentas a Cobrar):** the BPO team manually checks 5 of 437 cases per month — €37.367
  of €2.338.519 in total (1,6% coverage by amount).

Sapira's AI platform moves both processes from **muestreo → 100% coverage**, leaving an audit
trail and escalating only genuinely uncertain cases to a human reviewer.

**Theme / headline:** "Cada declaración, verificada."

**The BPO punchline:** all seeded discrepancies fall outside the 5 sampled cases — money at risk
that today's process structurally cannot catch.

---

## Route Map

| Route                          | Screen                          | Purpose                                                        |
|--------------------------------|---------------------------------|----------------------------------------------------------------|
| `/`                            | Landing                         | Cinematic entry — brand, headline, two paths into the demo     |
| `/login`                       | Login simulado                  | Visual-only login, pre-filled, navigates to `/plataforma`      |
| `/plataforma`                  | Dashboard                       | Unified KPIs: coverage, € audited, findings, HITL queue        |
| `/plataforma/auditoria`        | Auditoría — listado             | Filtered table of all declarations + status + findings count   |
| `/plataforma/auditoria/[id]`   | Auditoría — ficha               | Full declaration: SIG lines, findings panel, agent dictamen    |
| `/plataforma/control`          | Control BPO                     | Coverage hero (1,6%→100%), reconciliation table 437/437        |
| `/plataforma/revision`         | Revisión Humana (HITL)          | Low-confidence items from both modules, Aprobar/Rechazar UI    |
| `/demos/auditoria`             | Acto 1 — Auditoría paso a paso  | Guided 5-step walkthrough of the declaration-audit process     |
| `/demos/control`               | Acto 2 — Control BPO paso a paso| Guided 5-step walkthrough of the BPO reconciliation process    |

---

## Module 1 — Auditoría de Declaraciones

**Purpose:** Show the agent reading a self-declaration, extracting SIG packaging lines,
running validations, and issuing an opinion — replacing manual auditor review.

**Platform views:**
- **Listado** (`/plataforma/auditoria`): filterable table (estado, severidad, empresa search).
  Columns: Empresa, CIF, Sector, Ejercicio, Cuota declarada, Estado, Nº hallazgos, Confianza.
- **Ficha** (`/plataforma/auditoria/[id]`): SIG lines table (materials, kg, tarifa, importe);
  findings panel (tipo, severidad, impacto €); agent dictamen + confidence; HITL routing CTA.

**Findings types seeded in mock data:**
1. Infra-declaración de material — declared kg well below sales-implied volume
2. Tarifa incorrecta aplicada — wrong €/kg used for a line
3. Envase no declarado — undeclared material found via cross-check
4. Incoherencia peso/unidades — kgTotales ≠ unidades × pesoUnitario / 1000
5. Salto interanual anómalo — units dropped 40% with no commercial justification

---

## Module 2 — Control de Integridad BPO (Cuentas a Cobrar)

**Purpose:** Show the agent reconciling every declaration in the origin system against SGA
(the management system) — replacing a manual sample of 5.

**Platform view** (`/plataforma/control`):
- **Coverage hero:** animated meter 1,6% → 100% with €37.367 (muestra) → €2.338.519 (total).
- **Reconciliation table:** 437 records, filterable by estado / tipo discrepancia / muestreada.
  Expandable rows show field-level detail.
- **Evidence card:** auto-generated control report + audit trail + "Descargar informe" (no-op).

**BPO dataset (exact figures — never change):**
- Total: 437 declaraciones · €2.338.519
- Muestreadas: 5 · €37.367 (1,6%)
- Discrepancias: 6 (todas con `muestreada: false`)
- Importe en riesgo: €26.900

**Discrepancy types seeded:**
- 2 × `no_cargada` — received in origin, missing from SGA
- 2 × `importe_distinto` — amount mismatch between origin and SGA
- 1 × `duplicada` — loaded twice in SGA (potential double charge)
- 1 × `campos_distintos` — CIF loaded with wrong check digit

---

## Cola de Revisión Humana (HITL)

**Route:** `/plataforma/revision`

**Purpose:** Aggregate low-confidence items from both modules into one human review queue.
Reinforces the message: "the agent processes 100%; the human reviews only what matters."

Each item shows: source module, summary, agent reasoning, confidence badge, suggested action,
€ impact. Buttons (Aprobar / Rechazar / Editar) toggle local visual state — no persistence.

Items in mock data: 4–6, mixing auditoria and control origins, confidence 0.55–0.78.

---

## Acto 1 — Auditoría de Declaraciones (`/demos/auditoria`)

5-step guided walkthrough. Uses `StepLayout` (narrow left explanation + wide right visual).

| Step | Nombre                  | Visual                                                                  |
|------|-------------------------|-------------------------------------------------------------------------|
| 1    | Declaración recibida    | Raw "Excel" SIG tab — messy, human-entered, realistic imperfections     |
| 2    | Extracción IA           | Skeleton → structured `SigLinesTable` reveal (1–2s Framer delay)        |
| 3    | Validaciones            | Checklist: coherencia, tarifa, cruce interanual, cruce ventas, benchmark|
| 4    | Hallazgos               | `FindingsPanel` for a seeded declaration with multiple findings         |
| 5    | Dictamen                | `DictamenCard` + "→ enviado a Revisión Humana" routing indicator        |

---

## Acto 2 — Control BPO (`/demos/control`)

5-step guided walkthrough. Same `StepLayout`.

| Step | Nombre                | Visual                                                                      |
|------|-----------------------|-----------------------------------------------------------------------------|
| 1    | Cierre mensual        | Big stat: 437 declaraciones recibidas · €2.338.519                          |
| 2    | El control de hoy     | 437-dot grid — 5 green (muestreadas), rest grey — 1,6% made visceral        |
| 3    | Conciliación agente   | `CoverageMeter` animating 1,6% → 100%, "cruzando origen ↔ SGA"             |
| 4    | Discrepancias         | `ReconciliationTable` filtered to 6 discrepancies + callout "ninguna en muestra" |
| 5    | Evidencia y traza     | `EvidenceCard` — auto-generated control report + audit trail                |

---

## Data Conventions

- All mock data in `src/data/mock/*.ts`. No runtime fetching.
- Types in `src/data/types.ts`. Helpers and re-exports in `src/data/index.ts`.
- Numbers formatted with `formatEUR()` / `formatNum()` / `formatPct()` from `@/lib/utils`.
- Locale: es-ES — thousands separator `.`, decimal separator `,`, currency symbol `€`.
