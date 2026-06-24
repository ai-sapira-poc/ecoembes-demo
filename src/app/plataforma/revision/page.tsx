"use client";

import { RevisionTable } from "@/components/revision/RevisionTable";
import { revisionItems } from "@/data/index";

export default function RevisionPage() {
  const openCount = revisionItems.filter((item) => !item.resolucion).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Revisión</h1>
        <p className="mt-0.5 text-sm text-muted">
          {openCount} tickets abiertos · criterio humano requerido
        </p>
      </div>

      <RevisionTable items={revisionItems} />
    </div>
  );
}
