"use client";

import { useRouter } from "next/navigation";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { EstadoBadge } from "@/components/auditoria/EstadoBadge";
import { formatEUR } from "@/lib/utils";
import type { Declaracion } from "@/data/types";

export function RecentDeclaracionesTable({ rows }: { rows: Declaracion[] }) {
  const router = useRouter();
  return (
    <Table>
      <THead>
        <tr>
          <TH>Empresa</TH>
          <TH className="hidden xl:table-cell">Sector</TH>
          <TH className="text-right">Importe DAE</TH>
          <TH>Estado</TH>
        </tr>
      </THead>
      <TBody>
        {rows.map((d) => (
          <TR
            key={d.id}
            onClick={() => router.push(`/plataforma/auditoria/${d.id}`)}
            className="group cursor-pointer"
          >
            <TD className="py-2">
              <span className="block font-medium text-ink group-hover:text-brand transition-colors leading-tight">
                {d.empresa}
              </span>
              <span className="font-mono text-[11px] text-muted">{d.cif}</span>
            </TD>
            <TD className="hidden xl:table-cell text-muted">{d.sector}</TD>
            <TD className="text-right font-semibold text-ink tabular-nums">
              {d.importeDaeEur != null ? formatEUR(d.importeDaeEur) : "—"}
            </TD>
            <TD>{d.estadoAgente && <EstadoBadge estado={d.estadoAgente} />}</TD>
          </TR>
        ))}
      </TBody>
    </Table>
  );
}
