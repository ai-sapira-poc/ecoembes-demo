"use client";

import { useState, useMemo } from "react";
import { UserCheck, Filter } from "lucide-react";
import { revisionItems } from "@/data/index";
import { ReviewItemCard } from "@/components/revision/ReviewItemCard";
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
      <div className="flex items-start gap-3 mb-2">
        <div className="rounded-lg bg-brand-soft p-2 shrink-0 mt-0.5">
          <UserCheck size={20} className="text-brand" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink">Cola de Revisión Humana</h1>
          <p className="text-sm text-muted mt-0.5">
            El agente procesa el 100 % de las declaraciones; el humano revisa solo lo dudoso.
          </p>
        </div>
      </div>

      {/* Explanatory callout */}
      <div className="mt-5 mb-6 rounded-xl bg-brand-soft border border-brand/20 px-5 py-4">
        <p className="text-sm text-brand-dark leading-relaxed">
          Estos{" "}
          <strong>{nTotal} casos</strong> han sido escalados automáticamente porque la
          confianza del agente no alcanza el umbral de dictamen autónomo. Proceden de
          los módulos de{" "}
          <strong>Auditoría de Declaraciones</strong> ({nAuditoria}) y{" "}
          <strong>Control de Integridad BPO</strong> ({nControl}). El resto de
          declaraciones — el 100 % del volumen — ya han sido resueltas sin
          intervención humana.
        </p>
      </div>

      {/* Count + filter bar */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <p className="text-sm font-medium text-ink">
          {filtroOrigen === "todos"
            ? `${nTotal} casos en revisión`
            : filtroOrigen === "auditoria"
            ? `${nAuditoria} casos de Auditoría`
            : `${nControl} casos de Control BPO`}
        </p>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted" />
          <span className="text-xs text-muted mr-1">Origen:</span>
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
                  : "bg-black/5 text-muted hover:bg-black/10 hover:text-ink",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Review item cards */}
      <div className="flex flex-col gap-4">
        {itemsFiltrados.length === 0 ? (
          <div className="text-center py-16 text-muted text-sm">
            No hay casos que coincidan con el filtro seleccionado.
          </div>
        ) : (
          itemsFiltrados.map((item) => (
            <ReviewItemCard key={item.id} item={item} />
          ))
        )}
      </div>

      {/* Footer note */}
      <p className="mt-8 text-center text-xs text-muted">
        Las acciones de esta pantalla son visuales y no persisten entre sesiones — demo v1.0.
      </p>
    </div>
  );
}
