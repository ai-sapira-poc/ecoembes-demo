"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getDeclaracion } from "@/data";

const SEGMENT_LABELS: Record<string, string> = {
  auditoria: "Auditoría",
  control: "Control BPO",
  revision: "Revisión",
  configuracion: "Configuración",
};

type Crumb = { label: string; href: string };

export function Breadcrumbs() {
  const pathname = usePathname();
  const crumbs: Crumb[] = [{ label: "Dashboard", href: "/plataforma" }];

  const segs = pathname.replace(/^\/plataforma\/?/, "").split("/").filter(Boolean);
  let href = "/plataforma";
  segs.forEach((seg, i) => {
    href += `/${seg}`;
    let label = SEGMENT_LABELS[seg] ?? seg;
    // A segment directly under /auditoria is a declaration id → show empresa name.
    if (i > 0 && segs[i - 1] === "auditoria") {
      label = getDeclaracion(seg)?.empresa ?? seg;
    }
    crumbs.push({ label, href });
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm min-w-0">
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        return (
          <span key={c.href} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && <ChevronRight size={13} className="text-muted/60 shrink-0" />}
            {last ? (
              <span aria-current="page" className="font-semibold text-ink truncate max-w-[220px]">
                {c.label}
              </span>
            ) : (
              <Link href={c.href} className="text-muted hover:text-ink transition-colors shrink-0">
                {c.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
