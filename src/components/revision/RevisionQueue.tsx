"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Filter, Inbox, TimerReset } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { revisionItems } from "@/data/index";
import { RevisionTicketDetail } from "@/components/revision/RevisionTicketDetail";
import { InlineFilter } from "@/components/ui/InlineFilter";
import { ToolbarSearchField } from "@/components/ui/ToolbarSearchField";
import { cn, formatEUR, formatPct } from "@/lib/utils";
import type { RevisionItem } from "@/data/types";

type Resolucion = "aprobado" | "rechazado" | "solicitar_datos" | null;
type Vista = "abiertos" | "resueltos";

const ORIGEN_OPTIONS = [
  { value: "auditoria", label: "Auditoría" },
  { value: "control", label: "Control BPO" },
] as const;

function origenLabel(origen: RevisionItem["origen"]) {
  return origen === "auditoria" ? "Auditoría" : "Control BPO";
}

export function RevisionQueue() {
  const [vista, setVista] = useState<Vista>("abiertos");
  const [origenFilter, setOrigenFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(revisionItems[0]?.id ?? null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [resoluciones, setResoluciones] = useState<Record<string, Resolucion>>({});

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return revisionItems.filter((item) => {
      const resolved = resoluciones[item.id] !== undefined && resoluciones[item.id] !== null;
      if (vista === "abiertos" && resolved) return false;
      if (vista === "resueltos" && !resolved) return false;
      if (origenFilter && item.origen !== origenFilter) return false;
      if (
        q &&
        !item.titulo.toLowerCase().includes(q) &&
        !item.id.toLowerCase().includes(q) &&
        !item.resumen.toLowerCase().includes(q) &&
        !item.decisionRequerida.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [origenFilter, resoluciones, search, vista]);

  const hasFilters = origenFilter !== "" || search.trim() !== "";
  const openCount = revisionItems.filter((item) => !resoluciones[item.id]).length;
  const resolvedCount = revisionItems.length - openCount;
  const selectedItem =
    selectedId && filtered.some((item) => item.id === selectedId)
      ? filtered.find((item) => item.id === selectedId) ?? null
      : filtered[0] ?? null;

  const setResolucion = (id: string, value: Resolucion) => {
    setResoluciones((prev) => {
      if (value === null) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: value };
    });
    if (value !== null && vista === "abiertos") {
      const currentIndex = filtered.findIndex((item) => item.id === id);
      const nextItem = filtered[currentIndex + 1] ?? filtered[currentIndex - 1] ?? null;
      setSelectedId(nextItem?.id ?? null);
      setMobileDetailOpen(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col md:h-[calc(100vh-8rem)]">
      <div className="shrink-0 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-ink">Revisión</h1>
          <p className="mt-0.5 text-sm text-muted">
            {hasFilters
              ? `${filtered.length} de ${vista === "abiertos" ? openCount : resolvedCount} tickets`
              : vista === "abiertos"
                ? `${openCount} tickets abiertos`
                : `${resolvedCount} tickets resueltos`}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setVista("abiertos");
              setMobileDetailOpen(false);
            }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-brand/25",
              vista === "abiertos"
                ? "bg-surface text-ink shadow-sm ring-1 ring-brand/20"
                : "text-muted hover:bg-surface/70 hover:text-ink-soft"
            )}
          >
            <TimerReset className={cn("h-3.5 w-3.5", vista === "abiertos" && "text-brand")} aria-hidden />
            Abiertos
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                vista === "abiertos" ? "bg-brand-soft text-brand-dark" : "bg-line text-muted"
              )}
            >
              {openCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setVista("resueltos");
              setMobileDetailOpen(false);
            }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-brand/25",
              vista === "resueltos"
                ? "bg-surface text-ink shadow-sm ring-1 ring-brand/20"
                : "text-muted hover:bg-surface/70 hover:text-ink-soft"
            )}
          >
            <CheckCircle2 className={cn("h-3.5 w-3.5", vista === "resueltos" && "text-brand")} aria-hidden />
            Resueltos
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                vista === "resueltos" ? "bg-brand-soft text-brand-dark" : "bg-line text-muted"
              )}
            >
              {resolvedCount}
            </span>
          </button>
        </div>

        <div className="flex items-center rounded-xl border border-line bg-surface">
          <ToolbarSearchField
            value={search}
            onChange={setSearch}
            placeholder="Buscar por ID, título o contexto…"
          />
          <div className="hidden h-7 w-px shrink-0 bg-line sm:block" />
          <div className="flex shrink-0 items-center gap-1 px-2 sm:px-4 sm:pr-6">
            <Filter className="hidden h-4 w-4 shrink-0 text-muted sm:block" />
            <InlineFilter
              label="Origen"
              value={origenFilter}
              options={ORIGEN_OPTIONS}
              onChange={setOrigenFilter}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 flex min-h-0 flex-1 overflow-hidden rounded-xl border border-line bg-surface">
        <div
          className={cn(
            "flex w-full shrink-0 flex-col border-line lg:w-[360px] lg:border-r",
            mobileDetailOpen ? "hidden lg:flex" : "flex"
          )}
        >
          <div className="shrink-0 border-b border-line bg-canvas/70 px-4 py-2.5">
            <span className="text-xs font-medium text-muted">
              {filtered.length} {filtered.length === 1 ? "ticket" : "tickets"}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center gap-2 px-4 text-center text-sm text-muted">
                <Inbox className="h-6 w-6 opacity-40" aria-hidden />
                No hay tickets con estos filtros.
              </div>
            ) : (
              filtered.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                const resolucion = resoluciones[item.id] ?? null;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(item.id);
                      setMobileDetailOpen(true);
                    }}
                    className={cn(
                      "flex w-full cursor-pointer items-start gap-3 border-b border-l-2 border-line px-4 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink/20",
                      isSelected
                        ? "border-l-brand bg-brand-tint/45"
                        : "border-l-transparent hover:bg-canvas/40"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted">
                        <span className="font-mono" translate="no">{item.id}</span>
                        <span aria-hidden>·</span>
                        <span>{origenLabel(item.origen)}</span>
                        <span aria-hidden>·</span>
                        <span>{item.prioridad === "alta" ? "Alta" : "Media"}</span>
                        <span aria-hidden>·</span>
                        <span>{item.creadoHace}</span>
                      </p>
                      <p
                        className={cn(
                          "line-clamp-2 text-xs leading-snug text-ink",
                          isSelected ? "font-semibold" : "font-medium"
                        )}
                      >
                        {item.titulo}
                      </p>
                      <p className="mt-1 text-[10px] font-medium text-ink-soft tabular-nums">
                        {formatEUR(item.impactoEur)}
                      </p>
                    </div>
                    <div className="mt-0.5 shrink-0 text-right">
                      {resolucion === "aprobado" ? (
                        <span className="text-[10px] font-semibold text-ok">Aprobado</span>
                      ) : resolucion === "rechazado" ? (
                        <span className="text-[10px] font-semibold text-danger">Rechazado</span>
                      ) : resolucion === "solicitar_datos" ? (
                        <span className="text-[10px] font-semibold text-ink-soft">Datos</span>
                      ) : (
                        <>
                          <span className="block text-[10px] font-semibold text-ink-soft tabular-nums">
                            {formatPct(item.confianza * 100, 0)}
                          </span>
                          <span className="mt-0.5 block text-[9px] uppercase tracking-wide text-muted">
                            confianza
                          </span>
                        </>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div
          className={cn(
            "min-w-0 flex-1 overflow-hidden",
            !selectedItem || !mobileDetailOpen ? "hidden lg:flex lg:items-stretch" : "flex"
          )}
        >
          <AnimatePresence mode="wait">
            {selectedItem ? (
              <motion.div
                key={selectedItem.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-full w-full"
              >
                <RevisionTicketDetail
                  item={selectedItem}
                  resolucion={resoluciones[selectedItem.id] ?? null}
                  onResolucion={(value) => setResolucion(selectedItem.id, value)}
                  onBack={() => setMobileDetailOpen(false)}
                />
              </motion.div>
            ) : (
              <div className="hidden flex-col items-center justify-center gap-2 px-6 text-center text-sm text-muted lg:flex">
                <Inbox className="h-7 w-7 opacity-30" aria-hidden />
                Selecciona un ticket para revisar el razonamiento del agente.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
