"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { declaraciones } from "@/data";
import type { EstadoAgente } from "@/data/types";
import { EstadoBadge } from "@/components/auditoria/EstadoBadge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
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
  const router = useRouter();
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted mb-1">
            Módulo Auditoría
          </p>
          <h1 className="text-xl font-bold text-ink">Carga de trabajo del agente</h1>
          <p className="mt-0.5 text-xs text-muted">
            {declaraciones.length} declaraciones · Período 56 · Ejercicio 2025
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Buscar por empresa o CIF…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-line rounded-lg bg-surface text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {ESTADO_CHIPS.map(({ estado, label }) => {
          const count = counts[estado] ?? 0;
          const isActive = estadoFilter === estado;
          return (
            <button
              key={estado}
              onClick={() => setEstadoFilter(estado)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0",
                isActive
                  ? "bg-ink text-white"
                  : "bg-surface text-ink-soft border border-line hover:border-brand/40 hover:text-ink"
              )}
            >
              {label}
              {count > 0 && (
                <span
                  className={cn(
                    "tabular-nums text-[10px] font-semibold",
                    isActive ? "text-white/70" : "text-muted"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-line bg-surface overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted">
            <Search className="w-7 h-7 opacity-30" />
            <p className="text-sm">No se encontraron declaraciones con los filtros aplicados.</p>
          </div>
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>Empresa</TH>
                <TH>Sector</TH>
                <TH className="text-center">Período</TH>
                <TH>Canal</TH>
                <TH className="text-right">Importe DAE</TH>
                <TH>Estado</TH>
                <TH className="w-8" aria-label="Abrir" />
              </tr>
            </THead>
            <TBody>
              {filtered.map((d) => (
                <TR
                  key={d.id}
                  onClick={() => router.push(`/plataforma/auditoria/${d.id}`)}
                  className="group cursor-pointer"
                >
                  <TD className="py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-ink group-hover:text-brand transition-colors">
                        {d.empresa}
                      </span>
                      {d.consultasAbiertas != null && d.consultasAbiertas > 0 && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-warning-soft text-warning text-[10px] font-semibold px-1.5 py-0.5">
                          <MessageSquare className="w-2.5 h-2.5" />
                          {d.consultasAbiertas}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-muted">{d.cif}</span>
                  </TD>
                  <TD className="text-muted">{d.sector}</TD>
                  <TD className="text-center text-muted tabular-nums">{d.periodo ?? "—"}</TD>
                  <TD className="text-muted">{d.canal ?? "—"}</TD>
                  <TD className="text-right font-semibold text-ink tabular-nums">
                    {d.importeDaeEur != null ? formatEUR(d.importeDaeEur) : "—"}
                  </TD>
                  <TD>{d.estadoAgente && <EstadoBadge estado={d.estadoAgente} />}</TD>
                  <TD className="text-right pr-3.5">
                    <ChevronRight className="w-4 h-4 text-muted/50 group-hover:text-brand group-hover:translate-x-0.5 transition-all inline-block" />
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </div>
      {filtered.length !== declaraciones.length && (
        <p className="text-xs text-muted">
          {filtered.length} de {declaraciones.length} declaraciones
        </p>
      )}
    </div>
  );
}
