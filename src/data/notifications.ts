import type { LucideIcon } from "lucide-react";
import { AlertTriangle, MessageSquare, UserCheck } from "lucide-react";
import { declaraciones } from "@/data/mock/declaraciones";
import { bpoMes } from "@/data/mock/bpo";
import { revisionItems } from "@/data/mock/revision";
import { formatEUR } from "@/lib/utils";

export type Notificacion = {
  id: string;
  tipo: "consulta" | "discrepancia" | "revision";
  titulo: string;
  href: string;
  cuando: string;
  icon: LucideIcon;
};

/** Derive notifications from real mock data — never a hardcoded list. */
export function getNotifications(): Notificacion[] {
  const notifs: Notificacion[] = [];

  // Declarations whose client just answered an agent query.
  declaraciones
    .filter((d) => d.estadoAgente === "respuesta_recibida")
    .slice(0, 2)
    .forEach((d, i) =>
      notifs.push({
        id: `consulta-${d.id}`,
        tipo: "consulta",
        titulo: `${d.empresa} respondió a una consulta`,
        href: `/plataforma/auditoria/${d.id}`,
        cuando: i === 0 ? "hace 2 h" : "hace 5 h",
        icon: MessageSquare,
      }),
    );

  // Largest BPO discrepancy by amount.
  const topDisc = bpoMes.records
    .filter((r) => r.estado !== "ok")
    .map((r) => ({ r, delta: Math.abs(r.importeOrigenEur - (r.importeSgaEur ?? 0)) }))
    .sort((a, b) => b.delta - a.delta)[0];
  if (topDisc) {
    notifs.push({
      id: `disc-${topDisc.r.id}`,
      tipo: "discrepancia",
      titulo: `Discrepancia en Control BPO — ${formatEUR(topDisc.delta)}`,
      href: "/plataforma/control",
      cuando: "hace 1 d",
      icon: AlertTriangle,
    });
  }

  // Human review queue.
  if (revisionItems.length > 0) {
    notifs.push({
      id: "revision-cola",
      tipo: "revision",
      titulo: `${revisionItems.length} casos esperan revisión`,
      href: "/plataforma/revision",
      cuando: "hace 3 h",
      icon: UserCheck,
    });
  }

  return notifs;
}
