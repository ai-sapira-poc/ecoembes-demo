import Link from "next/link";
import { ArrowRight, ShieldCheck, GitCompareArrows } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { DemoFooter } from "@/components/layout/Footer";
import { MeshBackground } from "@/components/layout/MeshBackground";
import { Reveal, RevealItem } from "@/components/motion/Reveal";

const actos = [
  {
    href: "/demos/auditoria",
    label: "Acto 1",
    icon: ShieldCheck,
    title: "Auditoría de Declaraciones",
    desc: "Un agente que analiza cada declaración, dialoga con el cliente y emite veredicto.",
  },
  {
    href: "/demos/control",
    label: "Acto 2",
    icon: GitCompareArrows,
    title: "Control de Integridad — Cuentas a Cobrar",
    desc: "Conciliación del 100% de las declaraciones frente al muestreo manual del 1,6%.",
  },
];

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      <MeshBackground />

      <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-14">
      <Reveal className="flex w-full max-w-3xl flex-col items-center gap-9 text-center">
        {/* Logo */}
        <RevealItem>
          <div className="rounded-2xl bg-white/70 px-7 py-5 shadow-[0_2px_20px_-6px_rgba(20,32,26,0.18)] ring-1 ring-white/60 backdrop-blur-sm">
            <Logo variant="full" />
          </div>
        </RevealItem>

        {/* Kicker */}
        <RevealItem>
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-brand-dark">
            Plataforma de auditoría inteligente
          </p>
        </RevealItem>

        {/* Headline */}
        <RevealItem className="-mt-4 flex flex-col items-center gap-4">
          <h1 className="text-balance text-5xl font-medium leading-[1.05] tracking-tight text-ink md:text-6xl">
            Cada declaración,{" "}
            <span className="text-brand">verificada</span>.
          </h1>
          <p className="max-w-xl text-pretty text-lg leading-relaxed text-ink-soft">
            Ecoembes mueve millones en cuotas sobre declaraciones responsables. Hoy se
            revisa una muestra. Sapira verifica el 100%, deja evidencia y solo escala lo
            que un humano debe decidir.
          </p>
        </RevealItem>

        {/* Primary CTA */}
        <RevealItem className="w-full max-w-md">
          <Link
            href="/login"
            className="group flex items-center justify-between gap-4 rounded-2xl bg-brand px-7 py-5 text-left shadow-[0_12px_30px_-10px_rgba(26,168,75,0.55)] transition-colors hover:bg-brand-dark"
          >
            <span className="flex flex-col">
              <span className="text-lg font-semibold text-white">Entrar a la plataforma</span>
              <span className="text-sm text-white/75">Experiencia integrada completa</span>
            </span>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white/15 transition-transform group-hover:translate-x-1">
              <ArrowRight className="h-5 w-5 text-white" />
            </span>
          </Link>
        </RevealItem>

        {/* Actos */}
        <RevealItem className="w-full">
          <div className="mb-3 flex items-center gap-3 px-1">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Demos guiados paso a paso
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {actos.map(({ href, label, icon: Icon, title, desc }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col gap-3 rounded-2xl bg-white/70 p-5 text-left ring-1 ring-line backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white hover:ring-brand/30 hover:shadow-[0_14px_34px_-16px_rgba(20,32,26,0.3)]"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand-dark">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-muted">
                    {label}
                  </span>
                </div>
                <span className="font-semibold leading-snug text-ink group-hover:text-brand-dark">
                  {title}
                </span>
                <span className="text-sm leading-relaxed text-muted">{desc}</span>
                <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100">
                  Ver demo <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </RevealItem>
      </Reveal>
      </div>

      <DemoFooter fixed={false} />
    </main>
  );
}
