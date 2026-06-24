"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { declaraciones } from "@/data";
import type { EstadoAuditoria, Severidad } from "@/data/types";
import { Badge } from "@/components/ui/Badge";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import {
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from "@/components/ui/Table";
import { formatEUR } from "@/lib/utils";
import { Search, FileSearch } from "lucide-react";

const ESTADO_LABELS: Record<EstadoAuditoria, string> = {
  verificada: "Verificada",
  con_hallazgos: "Con hallazgos",
  en_revision: "En revisión",
};

const ESTADO_COLORS: Record<EstadoAuditoria, "ok" | "warning" | "danger"> = {
  verificada: "ok",
  con_hallazgos: "warning",
  en_revision: "danger",
};

const SEVERIDAD_LABELS: Record<Severidad | "todas", string> = {
  todas: "Todas las severidades",
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

export default function AuditoriaListPage() {
  const [estadoFilter, setEstadoFilter] = useState<EstadoAuditoria | "todos">("todos");
  const [severidadFilter, setSeveridadFilter] = useState<Severidad | "todas">("todas");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return declaraciones.filter((d) => {
      if (estadoFilter !== "todos" && d.estado !== estadoFilter) return false;
      if (severidadFilter !== "todas") {
        const hasSeveridad = d.hallazgos.some((h) => h.severidad === severidadFilter);
        if (!hasSeveridad) return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (
          !d.empresa.toLowerCase().includes(q) &&
          !d.cif.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [estadoFilter, severidadFilter, search]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Auditoría de Declaraciones</h1>
        <p className="mt-1 text-sm text-muted">
          Ejercicio 2025 · {declaraciones.length} declaraciones procesadas por el agente
        </p>
      </div>

      {/* Filter controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-surface rounded-xl border border-black/5 shadow-sm">
        {/* Text search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Buscar por empresa o CIF…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-black/10 rounded-lg bg-canvas text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
        </div>

        {/* Estado filter */}
        <select
          value={estadoFilter}
          onChange={(e) => setEstadoFilter(e.target.value as EstadoAuditoria | "todos")}
          className="px-3 py-2 text-sm border border-black/10 rounded-lg bg-canvas text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
        >
          <option value="todos">Todos los estados</option>
          <option value="verificada">Verificada</option>
          <option value="con_hallazgos">Con hallazgos</option>
          <option value="en_revision">En revisión</option>
        </select>

        {/* Severidad filter */}
        <select
          value={severidadFilter}
          onChange={(e) => setSeveridadFilter(e.target.value as Severidad | "todas")}
          className="px-3 py-2 text-sm border border-black/10 rounded-lg bg-canvas text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
        >
          {(Object.keys(SEVERIDAD_LABELS) as (Severidad | "todas")[]).map((k) => (
            <option key={k} value={k}>
              {SEVERIDAD_LABELS[k]}
            </option>
          ))}
        </select>

        <span className="text-xs text-muted ml-auto">
          {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-black/5 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted">
            <FileSearch className="w-10 h-10 opacity-40" />
            <p className="text-sm">No se encontraron declaraciones con los filtros aplicados.</p>
          </div>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Empresa</TH>
                <TH>CIF</TH>
                <TH>Sector</TH>
                <TH className="text-right">Ejercicio</TH>
                <TH className="text-right">Cuota declarada</TH>
                <TH>Estado</TH>
                <TH className="text-right">Hallazgos</TH>
                <TH className="text-right">Confianza</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map((d) => (
                <TR key={d.id}>
                  <TD>
                    <Link
                      href={`/plataforma/auditoria/${d.id}`}
                      className="font-medium text-brand hover:text-brand-dark hover:underline"
                    >
                      {d.empresa}
                    </Link>
                  </TD>
                  <TD>
                    <span className="font-mono text-xs text-muted">{d.cif}</span>
                  </TD>
                  <TD>{d.sector}</TD>
                  <TD className="text-right tabular-nums">{d.ejercicio}</TD>
                  <TD className="text-right tabular-nums font-medium">
                    {formatEUR(d.cuotaDeclaradaEur)}
                  </TD>
                  <TD>
                    <Badge color={ESTADO_COLORS[d.estado]}>
                      {ESTADO_LABELS[d.estado]}
                    </Badge>
                  </TD>
                  <TD className="text-right">
                    {d.hallazgos.length > 0 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-warning/10 text-warning text-xs font-semibold">
                        {d.hallazgos.length}
                      </span>
                    ) : (
                      <span className="text-muted text-xs">—</span>
                    )}
                  </TD>
                  <TD className="text-right">
                    <ConfidenceBadge value={d.confianza} />
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </div>
    </div>
  );
}
