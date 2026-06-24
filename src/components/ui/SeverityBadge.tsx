import { Badge } from "@/components/ui/Badge";

type Severidad = "alta" | "media" | "baja";

interface SeverityBadgeProps {
  severidad: Severidad;
  className?: string;
}

const labels: Record<Severidad, string> = {
  alta:  "Alta",
  media: "Media",
  baja:  "Baja",
};

const colors = {
  alta:  "danger",
  media: "warning",
  baja:  "muted",
} as const;

export function SeverityBadge({ severidad, className }: SeverityBadgeProps) {
  return (
    <Badge color={colors[severidad]} className={className}>
      {labels[severidad]}
    </Badge>
  );
}
