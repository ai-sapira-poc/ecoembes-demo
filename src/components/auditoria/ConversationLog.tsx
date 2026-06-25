import type { ChatMensaje } from "@/data/types";
import { cn } from "@/lib/utils";
import { TextoFormateado } from "@/components/auditoria/textoFormateado";

export interface ConversationLogProps {
  mensajes: ChatMensaje[];
}

function speaker(autor: string): { nombre: string; org?: string } {
  const [nombre, org] = autor.split("·").map((s) => s.trim());
  return { nombre, org: org || undefined };
}

/**
 * Reviewable transcript of the portal exchange — built for a human auditor to
 * scan who said what, not a live chat. Each turn is a hairline-separated row:
 * speaker + role + time on top, the formatted message below.
 */
export function ConversationLog({ mensajes }: ConversationLogProps) {
  return (
    <ol className="divide-y divide-line">
      {mensajes.map((m) => {
        const isAgente = m.de === "agente";
        const { nombre, org } = speaker(m.autor);
        return (
          <li key={m.id} className="px-6 py-3.5">
            <div className="flex items-baseline justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={cn(
                    "h-[7px] w-[7px] shrink-0 rounded-full",
                    isAgente ? "bg-brand" : "bg-ink-soft"
                  )}
                  aria-hidden
                />
                <span className="truncate text-sm font-semibold text-ink">{nombre}</span>
                <span
                  className={cn(
                    "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    isAgente ? "bg-brand-soft text-brand-dark" : "bg-canvas text-muted"
                  )}
                >
                  {isAgente ? "Agente" : "Cliente"}
                </span>
                {org && <span className="hidden truncate text-xs text-muted sm:inline">{org}</span>}
              </div>
              <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted">{m.hora}</span>
            </div>
            <div className="mt-1.5 pl-[15px] text-[13.5px] leading-snug text-ink-soft">
              <TextoFormateado texto={m.texto} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
