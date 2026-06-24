"use client";

import { useRouter } from "next/navigation";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { formatEUR } from "@/lib/utils";
import type { RevisionItem } from "@/data/types";

export function PendingRevisionTable({ rows }: { rows: RevisionItem[] }) {
  const router = useRouter();

  return (
    <Table>
      <THead>
        <tr>
          <TH>Caso</TH>
          <TH>Origen</TH>
          <TH className="text-right">Impacto</TH>
          <TH className="text-right">Confianza</TH>
        </tr>
      </THead>
      <TBody>
        {rows.map((item) => (
          <TR
            key={item.id}
            onClick={() => router.push("/plataforma/revision")}
            className="group cursor-pointer"
          >
            <TD className="py-2">
              <span className="block font-medium text-ink group-hover:text-brand transition-colors leading-tight line-clamp-1">
                {item.titulo}
              </span>
              <span className="font-mono text-[11px] text-muted">{item.id}</span>
            </TD>
            <TD>
              <Badge color={item.origen === "auditoria" ? "brand" : "ok"}>
                {item.origen === "auditoria" ? "Auditoría" : "Control"}
              </Badge>
            </TD>
            <TD className="text-right font-semibold text-ink tabular-nums">
              {formatEUR(item.impactoEur)}
            </TD>
            <TD className="text-right">
              <ConfidenceBadge value={item.confianza} />
            </TD>
          </TR>
        ))}
      </TBody>
    </Table>
  );
}
