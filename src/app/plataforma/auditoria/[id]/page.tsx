import { notFound } from "next/navigation";
import { getDeclaracion } from "@/data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SigLinesTable } from "@/components/auditoria/SigLinesTable";
import { FindingsPanel } from "@/components/auditoria/FindingsPanel";
import { DictamenCard } from "@/components/auditoria/DictamenCard";
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
} from "lucide-react";
import type { EstadoAuditoria } from "@/data/types";

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

const AGENT_STEPS = [
  { icon: FileSearch2, label: "Extracción de líneas SIG", detail: "Estructura de materiales verificada" },
  { icon: GitCompare, label: "Cruce con ventas", detail: "Volumen declarado comparado con sistema de ventas" },
  { icon: Brain, label: "Validación de tarifas", detail: "Tarifas €/kg comprobadas contra tabla vigente" },
  { icon: CheckCircle2, label: "Análisis interanual", detail: "Comparativa con ejercicio 2024" },
  { icon: FileCheck2, label: "Dictamen emitido", detail: "Resultado consolidado y confianza calculada" },
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
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-2xl font-bold text-ink">{declaracion.empresa}</h1>
          <Badge color={ESTADO_COLORS[declaracion.estado]}>
            {ESTADO_LABELS[declaracion.estado]}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5" />
            {declaracion.cif}
          </span>
          <span className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            {declaracion.sector}
          </span>
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Ejercicio {declaracion.ejercicio}
          </span>
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
      </div>

      {/* Agent processing strip */}
      <Card className="mb-6">
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
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand text-white font-bold text-[10px] flex-shrink-0">
                    {i + 1}
                  </span>
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

      {/* SIG Lines */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Líneas SIG declaradas</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <SigLinesTable lines={declaracion.sigLines} flaggedLineIds={flaggedLineIds} />
        </CardContent>
      </Card>

      {/* Findings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            Hallazgos{" "}
            {declaracion.hallazgos.length > 0 && (
              <span className="ml-1 text-xs font-normal text-muted">
                ({declaracion.hallazgos.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FindingsPanel hallazgos={declaracion.hallazgos} />
        </CardContent>
      </Card>

      {/* Dictamen */}
      <DictamenCard declaracion={declaracion} />
    </div>
  );
}
