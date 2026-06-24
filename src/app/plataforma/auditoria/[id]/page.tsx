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
    <div className="max-w-5xl">
      {/* Header */}
      <section className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-1">
          <h1 className="text-2xl font-semibold text-ink text-balance">{declaracion.empresa}</h1>
          {declaracion.estadoAgente && (
            <EstadoBadge estado={declaracion.estadoAgente} className="flex-shrink-0 mt-0.5" />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted mt-1 mb-5">
          <span className="flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5" />
            <span className="font-mono text-xs">{declaracion.cif}</span>
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

        {/* Pipeline stepper */}
        {declaracion.estadoAgente && (
          <div className="bg-surface border border-line rounded-xl px-6 py-4">
            <EstadoPipeline estadoAgente={declaracion.estadoAgente} />
          </div>
        )}
      </section>

      {/* Procesado por el agente */}
      <section className="mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-brand" />
              <CardTitle>Procesado por el agente</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-wrap gap-2">
              {AGENT_STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <li
                    key={i}
                    className="flex items-center gap-2 rounded-lg bg-canvas px-3 py-2 text-xs"
                  >
                    <Icon className="w-3.5 h-3.5 text-brand flex-shrink-0" />
                    <span className="font-medium text-ink">{step.label}</span>
                    <span className="text-muted hidden lg:inline">·</span>
                    <span className="text-muted hidden lg:inline">{step.detail}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-ok flex-shrink-0" />
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      </section>

      {/* Formatos declarados */}
      {declaracion.formatos && declaracion.formatos.length > 0 && (
        <section className="mb-6">
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
        </section>
      )}

      {/* Hallazgos */}
      <section className="mb-6">
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
      </section>

      {/* Correspondencia */}
      <section className="mb-6">
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
      </section>

      {/* Veredicto */}
      <section className="mb-6">
        <VeredictoCard
          veredicto={declaracion.veredicto ?? null}
          estadoAgente={declaracion.estadoAgente ?? "recibida"}
          consultasAbiertas={declaracion.consultasAbiertas ?? 0}
          cuotaDeclaradaEur={declaracion.cuotaDeclaradaEur}
          cuotaCalculadaEur={declaracion.cuotaCalculadaEur}
          confianza={declaracion.confianza}
          razonamiento={declaracion.dictamen}
        />
      </section>
    </div>
  );
}
