import type { EstadoAgente } from "@/data/types";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export interface EstadoBadgeProps {
  estado: EstadoAgente;
  className?: string;
}

type BadgeColor = "brand" | "ok" | "warning" | "danger" | "info" | "muted";

const ESTADO_CONFIG: Record<EstadoAgente, { label: string; color: BadgeColor; dotColor: string }> = {
  recibida:           { label: "Recibida",           color: "muted",   dotColor: "bg-muted" },
  en_analisis:        { label: "En análisis",         color: "info",    dotColor: "bg-info" },
  consulta_enviada:   { label: "Consulta enviada",    color: "warning", dotColor: "bg-warning" },
  respuesta_recibida: { label: "Respuesta recibida",  color: "brand",   dotColor: "bg-brand" },
  apto:               { label: "Apto",                color: "ok",      dotColor: "bg-ok" },
  no_apto:            { label: "No apto",             color: "danger",  dotColor: "bg-danger" },
  en_revision:        { label: "En revisión",         color: "warning", dotColor: "bg-warning" },
};

export function EstadoBadge({ estado, className }: EstadoBadgeProps) {
  const { label, color, dotColor } = ESTADO_CONFIG[estado];
  return (
    <Badge color={color} className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dotColor)} />
      {label}
    </Badge>
  );
}
