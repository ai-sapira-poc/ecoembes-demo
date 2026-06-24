"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { declaraciones } from "@/data";
import type { EstadoAgente } from "@/data/types";
import { EstadoBadge } from "@/components/auditoria/EstadoBadge";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { formatEUR } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Search, ChevronRight, MessageSquare } from "lucide-react";

const ESTADO_CHIPS: { estado: EstadoAgente | "todos"; label: string }[] = [
  { estado: "todos",               label: "Todas" },
  { estado: "recibida",            label: "Recibidas" },
  { estado: "en_analisis",         label: "En análisis" },
  { estado: "consulta_enviada",    label: "Consulta enviada" },
  { estado: "respuesta_recibida",  label: "Respuesta recibida" },
  { estado: "apto",                label: "Aptas" },
  { estado: "no_apto",             label: "No aptas" },
  { estado: "en_revision",         label: "En revisión" },
];

export default function AuditoriaListPage() {
  const [estadoFilter, setEstadoFilter] = useState<EstadoAgente | "todos">("todos");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    const c: Partial<Record<EstadoAgente | "todos", number>> = { todos: declaraciones.length };
    for (const d of declaraciones) {
      if (d.estadoAgente) c[d.estadoAgente] = (c[d.estadoAgente] ?? 0) + 1;
    }
    return c;
  }, []);

  const filtered = useMemo(() => {
    return declaraciones.filter((d) => {
      if (estadoFilter !== "todos" && d.estadoAgente !== estadoFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!d.empresa.toLowerCase().includes(q) && !d.cif.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [estadoFilter, search]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted mb-1">
          Módulo Auditoría
        </p>
        <h1 className="text-2xl font-semibold text-ink text-balance">
          Carga de trabajo del agente
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          {declaraciones.length} declaraciones · Período 56 · Ejercicio 2025
        </p>
      </div>

      {/* Summary chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {ESTADO_CHIPS.map(({ estado, label }) => {
          const count = counts[estado] ?? 0;
          const isActive = estadoFilter === estado;
          return (
            <button
              key={estado}
              onClick={() => setEstadoFilter(estado)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap border transition-colors flex-shrink-0",
                isActive
                  ? "bg-brand text-white border-brand"
                  : "bg-surface text-ink-soft border-line hover:border-brand/40 hover:text-ink"
              )}
            >
              {label}
              {count > 0 && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold",
                    isActive ? "bg-white/20 text-white" : "bg-canvas text-muted"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Buscar por empresa o CIF…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-line rounded-xl bg-surface text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
        />
        {filtered.length !== declaraciones.length && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted rounded-xl border border-line bg-surface">
          <Search className="w-8 h-8 opacity-30" />
          <p className="text-sm">No se encontraron declaraciones con los filtros aplicados.</p>
        </div>
      ) : (
        <Reveal className="flex flex-col gap-3">
          {filtered.map((d) => (
            <RevealItem key={d.id}>
              <Link
                href={`/plataforma/auditoria/${d.id}`}
                className="group block rounded-xl border border-line bg-surface hover:shadow-[0_2px_20px_-6px_rgba(20,32,26,0.12)] hover:border-brand/20 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4 p-5">
                  {/* Left: empresa info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2 mb-1">
                      <span className="text-base font-semibold text-ink group-hover:text-brand transition-colors truncate">
                        {d.empresa}
                      </span>
                      {d.consultasAbiertas != null && d.consultasAbiertas > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft text-warning text-[11px] font-semibold px-2 py-0.5 flex-shrink-0">
                          <MessageSquare className="w-3 h-3" />
                          {d.consultasAbiertas}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                      <span className="font-mono">{d.cif}</span>
                      <span>{d.sector}</span>
                      {d.periodo && <span>Período {d.periodo}</span>}
                      {d.canal && <span>{d.canal}</span>}
                    </div>
                  </div>

                  {/* Right: estado + importe */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {d.estadoAgente && <EstadoBadge estado={d.estadoAgente} />}
                    {d.importeDaeEur != null && (
                      <span className="text-sm font-semibold text-ink tabular-nums">
                        {formatEUR(d.importeDaeEur)}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </Link>
            </RevealItem>
          ))}
        </Reveal>
      )}
    </div>
  );
}
