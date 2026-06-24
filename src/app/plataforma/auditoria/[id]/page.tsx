import { notFound } from "next/navigation";
import { getDeclaracion } from "@/data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { EstadoBadge } from "@/components/auditoria/EstadoBadge";
import { EstadoPipeline } from "@/components/auditoria/EstadoPipeline";
import { FormatosBreakdown } from "@/components/auditoria/FormatosBreakdown";
import { FindingsPanel } from "@/components/auditoria/FindingsPanel";
import { CorrespondenciaThread } from "@/components/auditoria/CorrespondenciaThread";
import { VeredictoCard } from "@/components/auditoria/VeredictoCard";
import {
  Building2,
  Hash,
  Layers,
  Calendar,
  CheckCircle2,
  FileSearch2,
  Brain,
  GitCompare,
  FileCheck2,
  Radio,
} from "lucide-react";

const AGENT_STEPS = [
  { icon: FileSearch2, label: "Extracción de líneas SIG",    detail: "Estructura de materiales verificada" },
  { icon: GitCompare,  label: "Cruce con ventas",            detail: "Volumen declarado comparado con sistema de ventas" },
  { icon: Brain,       label: "Validación de tarifas",       detail: "Tarifas €/kg comprobadas contra tabla vigente" },
  { icon: CheckCircle2,label: "Análisis interanual",         detail: "Comparativa con ejercicio anterior" },
  { icon: FileCheck2,  label: "Dictamen emitido",            detail: "Resultado consolidado y confianza calculada" },
];

interface DeclaracionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DeclaracionDetailPage({ params }: DeclaracionDetailPageProps) {
  const { id } = await params;
  const declaracion = getDeclaracion(id);

  if (!declaracion) {
    notFound();
  }

  const flaggedLineIds = declaracion.hallazgos
    .filter((h) => h.lineaId != null)
    .map((h) => h.lineaId as string);

  return (
    <div className="space-y-5">
      {/* Header */}
      <section>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-bold text-ink text-balance">{declaracion.empresa}</h1>
          {declaracion.estadoAgente && (
            <EstadoBadge estado={declaracion.estadoAgente} className="flex-shrink-0 mt-0.5" />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted mt-1.5">
          <span className="flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5" />
            <span className="font-mono">{declaracion.cif}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            {declaracion.sector}
          </span>
          {declaracion.periodo && (
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Período {declaracion.periodo}
            </span>
          )}
          {declaracion.canal && (
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" />
              {declaracion.canal}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Recibida el{" "}
            {new Date(declaracion.fechaRecepcion).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </section>

      {/* Pipeline stepper — compact status banner */}
      {declaracion.estadoAgente && (
        <div className="bg-surface border border-line rounded-xl px-5 py-3">
          <EstadoPipeline estadoAgente={declaracion.estadoAgente} compact />
        </div>
      )}

      {/* Two-column record layout: evidence left, verdict + process rail right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
        {/* ── Main column: the evidence ── */}
        <div className="lg:col-span-3 space-y-5">
          {declaracion.formatos && declaracion.formatos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Formatos declarados
                  <span className="ml-1.5 text-xs font-normal text-muted">
                    ({declaracion.formatos.length} formato{declaracion.formatos.length !== 1 ? "s" : ""})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormatosBreakdown
                  formatos={declaracion.formatos}
                  flaggedComponenteIds={flaggedLineIds}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>
                Hallazgos
                {declaracion.hallazgos.length > 0 && (
                  <span className="ml-1.5 text-xs font-normal text-muted">
                    ({declaracion.hallazgos.length})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FindingsPanel hallazgos={declaracion.hallazgos} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Correspondencia
                {declaracion.correspondencia && declaracion.correspondencia.length > 0 && (
                  <span className="ml-1.5 text-xs font-normal text-muted">
                    ({declaracion.correspondencia.length} mensaje{declaracion.correspondencia.length !== 1 ? "s" : ""})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CorrespondenciaThread
                mensajes={declaracion.correspondencia ?? []}
                empresaNombre={declaracion.empresa}
              />
            </CardContent>
          </Card>
        </div>

        {/* ── Right rail: verdict + agent process (sticky) ── */}
        <aside className="lg:col-span-1 space-y-5 lg:sticky lg:top-0 self-start">
          <VeredictoCard
            veredicto={declaracion.veredicto ?? null}
            estadoAgente={declaracion.estadoAgente ?? "recibida"}
            consultasAbiertas={declaracion.consultasAbiertas ?? 0}
            cuotaDeclaradaEur={declaracion.cuotaDeclaradaEur}
            cuotaCalculadaEur={declaracion.cuotaCalculadaEur}
            confianza={declaracion.confianza}
            razonamiento={declaracion.dictamen}
          />

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-brand" />
                <CardTitle>Procesado por el agente</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-1">
              <ol className="divide-y divide-line">
                {AGENT_STEPS.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <li key={i} className="flex items-start gap-2.5 py-2.5 first:pt-0">
                      <Icon className="w-3.5 h-3.5 text-brand flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-ink leading-snug">{step.label}</p>
                        <p className="text-[11px] text-muted leading-snug mt-0.5">{step.detail}</p>
                      </div>
                      <CheckCircle2 className="w-3.5 h-3.5 text-ok flex-shrink-0 mt-0.5" />
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
