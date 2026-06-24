"use client";

import { useState, useMemo } from "react";
import { UserCheck, Filter } from "lucide-react";
import { revisionItems } from "@/data/index";
import { ReviewItemCard } from "@/components/revision/ReviewItemCard";
import { Reveal, RevealItem, FadeUp } from "@/components/motion/Reveal";
import type { RevisionItem } from "@/data/types";

type OrigenFiltro = "todos" | "auditoria" | "control";

export default function RevisionPage() {
  const [filtroOrigen, setFiltroOrigen] = useState<OrigenFiltro>("todos");

  const itemsFiltrados = useMemo<RevisionItem[]>(() => {
    if (filtroOrigen === "todos") return revisionItems;
    return revisionItems.filter((item) => item.origen === filtroOrigen);
  }, [filtroOrigen]);

  const nTotal = revisionItems.length;
  const nAuditoria = revisionItems.filter((i) => i.origen === "auditoria").length;
  const nControl = revisionItems.filter((i) => i.origen === "control").length;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page header */}
      <FadeUp delay={0}>
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted mb-2">
            Revisión humana
          </p>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-brand-soft p-2 shrink-0 mt-0.5">
              <UserCheck size={18} className="text-brand" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-ink">Cola de revisión</h1>
              <p className="text-sm text-muted mt-0.5 leading-relaxed">
                El agente procesa el 100 % de las declaraciones; el humano revisa solo lo dudoso.
              </p>
            </div>
          </div>
        </div>
      </FadeUp>

      {/* Explanatory callout */}
      <FadeUp delay={0.08}>
        <div className="mb-6 rounded-xl bg-brand-soft border border-brand/15 px-5 py-4">
          <p className="text-sm text-ink-soft leading-relaxed">
            Estos{" "}
            <strong className="text-ink">{nTotal} casos</strong> han sido escalados porque la
            confianza del agente no alcanza el umbral de dictamen autónomo. Proceden de los módulos de{" "}
            <strong className="text-ink">Auditoría de Declaraciones</strong> ({nAuditoria}) y{" "}
            <strong className="text-ink">Control de Integridad BPO</strong> ({nControl}). El resto
            de declaraciones — el 100 % del volumen — se ha resuelto sin intervención humana.
          </p>
        </div>
      </FadeUp>

      {/* Count + filter bar */}
      <FadeUp delay={0.14}>
        <div className="flex items-center justify-between gap-3 mb-6">
          <p className="text-sm font-medium text-ink">
            {filtroOrigen === "todos"
              ? `${nTotal} casos en revisión`
              : filtroOrigen === "auditoria"
              ? `${nAuditoria} casos de Auditoría`
              : `${nControl} casos de Control BPO`}
          </p>

          <div className="flex items-center gap-2">
            <Filter size={13} className="text-muted" />
            {(
              [
                { value: "todos", label: "Todos" },
                { value: "auditoria", label: "Auditoría" },
                { value: "control", label: "Control BPO" },
              ] as { value: OrigenFiltro; label: string }[]
            ).map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFiltroOrigen(value)}
                className={[
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  filtroOrigen === value
                    ? "bg-brand text-white"
                    : "bg-line text-muted hover:bg-line/70 hover:text-ink-soft",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </FadeUp>

      {/* Review item cards — staggered */}
      {itemsFiltrados.length === 0 ? (
        <div className="text-center py-16 text-muted text-sm">
          No hay casos que coincidan con el filtro seleccionado.
        </div>
      ) : (
        <Reveal className="flex flex-col gap-4">
          {itemsFiltrados.map((item) => (
            <RevealItem key={item.id}>
              <ReviewItemCard item={item} />
            </RevealItem>
          ))}
        </Reveal>
      )}

      {/* Footer note */}
      <p className="mt-10 text-center text-xs text-muted">
        Las acciones de esta pantalla son visuales y no persisten entre sesiones — demo v1.0.
      </p>
    </div>
  );
}
