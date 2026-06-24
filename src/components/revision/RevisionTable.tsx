"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Filter, Inbox, TimerReset } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { InlineFilter } from "@/components/ui/InlineFilter";
import { ToolbarSearchField } from "@/components/ui/ToolbarSearchField";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { cn, formatEUR } from "@/lib/utils";
import type { RevisionItem } from "@/data/types";

interface RevisionTableProps {
  items: RevisionItem[];
}

type Vista = "abiertos" | "resueltos";
type BadgeColor = "ok" | "warning" | "danger" | "muted";

const ORIGEN_OPTIONS = [
  { value: "auditoria", label: "Auditoría" },
  { value: "control", label: "Control BPO" },
] as const;

function origenLabel(origen: RevisionItem["origen"]) {
  return origen === "auditoria" ? "Auditoría" : "Control BPO";
}

function resolucionBadgeProps(resolucion: RevisionItem["resolucion"]): {
  color: BadgeColor;
  label: string;
} {
  if (resolucion === "aprobado") return { color: "ok", label: "Aprobado" };
  if (resolucion === "rechazado") return { color: "danger", label: "Rechazado" };
  if (resolucion === "solicitar_datos") return { color: "muted", label: "Datos" };
  return { color: "warning", label: "Pendiente" };
}

export function RevisionTable({ items }: RevisionTableProps) {
  const router = useRouter();
  const [vista, setVista] = useState<Vista>("abiertos");
  const [origenFilter, setOrigenFilter] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const isResolved = item.resolucion != null;
      if (vista === "abiertos" && isResolved) return false;
      if (vista === "resueltos" && !isResolved) return false;
      if (origenFilter && item.origen !== origenFilter) return false;
      if (
        q &&
        !item.titulo.toLowerCase().includes(q) &&
        !item.id.toLowerCase().includes(q) &&
        !item.resumen.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [items, origenFilter, search, vista]);

  const openCount = items.filter((item) => !item.resolucion).length;
  const resolvedCount = items.length - openCount;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => setVista("abiertos")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-brand/25",
            vista === "abiertos"
              ? "bg-surface text-ink ring-1 ring-line"
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
          onClick={() => setVista("resueltos")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-brand/25",
            vista === "resueltos"
              ? "bg-surface text-ink ring-1 ring-line"
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
        <span className="hidden border-l border-line px-5 py-3.5 text-[11px] text-muted tabular-nums sm:block">
          {filtered.length} de {vista === "abiertos" ? openCount : resolvedCount}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-sm text-muted">
            <Inbox className="h-6 w-6 opacity-40" aria-hidden />
            <p>No se encontraron tickets.</p>
          </div>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH className="w-28 pl-6">ID</TH>
                <TH className="w-32">Origen</TH>
                <TH className="w-24">Prioridad</TH>
                <TH>Título</TH>
                <TH className="w-32 text-right">Impacto</TH>
                <TH className="w-28 text-center">Confianza</TH>
                <TH className="w-28 text-center">Estado</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map((item) => {
                const { color, label } = resolucionBadgeProps(item.resolucion);
                return (
                  <TR
                    key={item.id}
                    onClick={() => router.push(`/plataforma/revision/${item.id}`)}
                    className="cursor-pointer transition-colors hover:bg-canvas/50"
                  >
                    <TD className="pl-6 font-mono text-xs text-muted" translate="no">
                      {item.id}
                    </TD>
                    <TD className="text-sm text-ink-soft">{origenLabel(item.origen)}</TD>
                    <TD>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          item.prioridad === "alta" ? "text-danger" : "text-ink-soft"
                        )}
                      >
                        {item.prioridad === "alta" ? "Alta" : "Media"}
                      </span>
                    </TD>
                    <TD className="max-w-none text-sm font-medium text-ink">{item.titulo}</TD>
                    <TD className="text-right text-sm font-medium tabular-nums text-ink">
                      {formatEUR(item.impactoEur)}
                    </TD>
                    <TD className="text-center">
                      <ConfidenceBadge value={item.confianza} />
                    </TD>
                    <TD className="text-center">
                      <Badge color={color}>{label}</Badge>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </div>
    </div>
  );
}
