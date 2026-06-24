"use client";

import { useState, type ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Reveal, RevealItem } from "@/components/motion/Reveal";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-brand" : "bg-line"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`}
      />
    </button>
  );
}

function Row({ label, desc, children }: { label: string; desc?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{label}</p>
        {desc && <p className="text-xs text-muted mt-0.5">{desc}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function ConfiguracionPage() {
  const { show } = useToast();
  const [umbral, setUmbral] = useState(0.8);
  const [autoDictamen, setAutoDictamen] = useState(true);
  const [notifConsultas, setNotifConsultas] = useState(true);
  const [notifDiscrepancias, setNotifDiscrepancias] = useState(true);
  const [notifRevision, setNotifRevision] = useState(false);
  const [formato, setFormato] = useState("PDF");

  return (
    <Reveal className="max-w-5xl space-y-5">
      <RevealItem>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted mb-1">
            Configuración
          </p>
          <h1 className="text-xl font-bold text-ink">Ajustes de la plataforma</h1>
        </div>
      </RevealItem>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
      <RevealItem>
        <Card>
          <CardHeader>
            <CardTitle>Agente auditor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="umbral-confianza" className="text-sm font-medium text-ink">
                  Umbral de confianza para dictamen autónomo
                </label>
                <span className="text-sm font-semibold text-brand tabular-nums">
                  {Math.round(umbral * 100)} %
                </span>
              </div>
              <input
                id="umbral-confianza"
                type="range"
                min={0.5}
                max={0.95}
                step={0.05}
                value={umbral}
                onChange={(e) => setUmbral(parseFloat(e.target.value))}
                className="w-full accent-brand"
              />
              <p className="text-xs text-muted mt-1">
                Por debajo de este umbral, el caso se escala a revisión humana.
              </p>
            </div>
            <Row
              label="Auto-dictamen de declaraciones aptas"
              desc="El agente cierra automáticamente las declaraciones sin hallazgos."
            >
              <Toggle checked={autoDictamen} onChange={setAutoDictamen} />
            </Row>
          </CardContent>
        </Card>
      </RevealItem>

      <RevealItem>
        <Card>
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Row label="Consultas respondidas">
              <Toggle checked={notifConsultas} onChange={setNotifConsultas} />
            </Row>
            <Row label="Discrepancias en Control BPO">
              <Toggle checked={notifDiscrepancias} onChange={setNotifDiscrepancias} />
            </Row>
            <Row label="Nuevos casos en cola de revisión">
              <Toggle checked={notifRevision} onChange={setNotifRevision} />
            </Row>
          </CardContent>
        </Card>
      </RevealItem>

      <RevealItem>
        <Card>
          <CardHeader>
            <CardTitle>Exportación</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Formato de informe">
              <select
                value={formato}
                onChange={(e) => setFormato(e.target.value)}
                className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                <option>PDF</option>
                <option>XLSX</option>
                <option>CSV</option>
              </select>
            </Row>
          </CardContent>
        </Card>
      </RevealItem>

      <RevealItem>
        <Card>
          <CardHeader>
            <CardTitle>Cuenta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="text-ink">
              <span className="text-muted">Usuario:</span> Auditor Ecoembes
            </p>
            <p className="text-ink">
              <span className="text-muted">Email:</span> auditor@ecoembes.es
            </p>
            <p className="text-ink">
              <span className="text-muted">Organización:</span> Ecoembes · AW Auditores
            </p>
          </CardContent>
        </Card>
      </RevealItem>
      </div>

      <RevealItem>
        <div className="flex justify-end">
          <Button onClick={() => show("Cambios guardados")}>Guardar cambios</Button>
        </div>
      </RevealItem>
    </Reveal>
  );
}
