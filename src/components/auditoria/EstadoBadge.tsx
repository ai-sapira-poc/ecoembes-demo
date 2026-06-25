import type { EstadoAgente } from "@/data/types";
import { StatusDot, type StatusColor } from "@/components/ui/StatusDot";

export interface EstadoBadgeProps {
  estado: EstadoAgente;
  className?: string;
}

const ESTADO_CONFIG: Record<EstadoAgente, { label: string; color: StatusColor }> = {
  recibida:           { label: "Recibida",            color: "muted"   },
  en_analisis:        { label: "En análisis",         color: "info"    },
  consulta_enviada:   { label: "Consulta enviada",    color: "warning" },
  respuesta_recibida: { label: "Respuesta recibida",  color: "brand"   },
  apto:               { label: "Apto",                color: "ok"      },
  no_apto:            { label: "No apto",             color: "danger"  },
  en_revision:        { label: "En revisión",         color: "warning" },
};

/** The only state that carries money gets the filled pill; the rest stay quiet. */
const LOUD: ReadonlySet<EstadoAgente> = new Set(["no_apto"]);

export const ESTADO_FILTER_OPTIONS = (
  Object.entries(ESTADO_CONFIG) as [EstadoAgente, (typeof ESTADO_CONFIG)[EstadoAgente]][]
).map(([value, { label }]) => ({ value, label }));

export function EstadoBadge({ estado, className }: EstadoBadgeProps) {
  const { label, color } = ESTADO_CONFIG[estado];
  return <StatusDot color={color} label={label} loud={LOUD.has(estado)} className={className} />;
}
