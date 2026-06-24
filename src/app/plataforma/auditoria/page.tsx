"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { declaraciones } from "@/data";
import type { EstadoAgente } from "@/data/types";
import { EstadoBadge, ESTADO_FILTER_OPTIONS } from "@/components/auditoria/EstadoBadge";
import { InlineFilter } from "@/components/ui/InlineFilter";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { formatEUR } from "@/lib/utils";
import { Search, ChevronRight, MessageSquare, Filter } from "lucide-react";

const SECTORS = [...new Set(declaraciones.map((d) => d.sector))].sort();

export default function AuditoriaListPage() {
  const router = useRouter();
  const [estadoFilter, setEstadoFilter] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [search, setSearch] = useState("");

  const hasFilters =
    estadoFilter !== "" || sectorFilter !== "" || search.trim() !== "";

  const filtered = useMemo(() => {
    return declaraciones.filter((d) => {
      if (estadoFilter && d.estadoAgente !== estadoFilter) return false;
      if (sectorFilter && d.sector !== sectorFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!d.empresa.toLowerCase().includes(q) && !d.cif.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [estadoFilter, sectorFilter, search]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-ink">Auditoría</h1>
        <p className="mt-0.5 text-sm text-muted">
          {hasFilters
            ? `${filtered.length} de ${declaraciones.length} declaraciones`
            : `${declaraciones.length} declaraciones`}
        </p>
      </div>

      <div className="flex items-center rounded-xl border border-line bg-surface">
        <div className="flex flex-1 items-center px-4 min-w-0">
          <Search className="h-4 w-4 shrink-0 text-muted" />
          <input
            type="text"
            placeholder="Buscar por empresa o CIF…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border-0 bg-transparent px-3 py-3.5 text-sm text-ink outline-none placeholder:text-muted"
          />
        </div>
        <div className="hidden sm:block h-7 w-px bg-line shrink-0" />
        <div className="flex items-center gap-1 px-2 sm:px-4 sm:pr-6 shrink-0">
          <Filter className="hidden sm:block h-4 w-4 shrink-0 text-muted" />
          <InlineFilter
            label="Estado"
            value={estadoFilter}
            options={ESTADO_FILTER_OPTIONS}
            onChange={setEstadoFilter}
          />
          <InlineFilter
            label="Sector"
            value={sectorFilter}
            options={SECTORS}
            onChange={setSectorFilter}
          />
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted">
            <Search className="w-7 h-7 opacity-30" />
            <p className="text-sm">No hay declaraciones con estos filtros.</p>
          </div>
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>Empresa</TH>
                <TH className="hidden lg:table-cell">Sector</TH>
                <TH className="text-center hidden md:table-cell">Período</TH>
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
                  <TD className="hidden lg:table-cell text-muted">{d.sector}</TD>
                  <TD className="hidden md:table-cell text-center text-muted tabular-nums">
                    {d.periodo ?? "—"}
                  </TD>
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
    </div>
  );
}
