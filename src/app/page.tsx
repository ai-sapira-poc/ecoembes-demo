import Link from "next/link";
import Image from "next/image";
import { ArrowRight, LayoutDashboard, ShieldCheck, GitCompareArrows } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Reveal, RevealItem } from "@/components/motion/Reveal";

const actos = [
  {
    href: "/demos/auditoria",
    label: "Acto 1",
    icon: ShieldCheck,
    title: "Auditoría de Declaraciones",
    desc: "Un agente analiza cada declaración, dialoga con el cliente y emite veredicto.",
  },
  {
    href: "/demos/control",
    label: "Acto 2",
    icon: GitCompareArrows,
    title: "Control de Integridad",
    desc: "Conciliación automática del 100% de las declaraciones recibidas.",
  },
];

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Cinematic photographic background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/brand/landing-bg.avif"
          alt=""
          fill
          priority
          sizes="100vw"
          className="animate-ken-burns object-cover [filter:saturate(0.55)_brightness(1.06)]"
        />
        {/* Frosted veil — keeps the photo subtle, content on near-white */}
        <div className="absolute inset-0 bg-canvas/82" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-16">
        <Reveal className="flex w-full max-w-2xl flex-col items-center gap-10 text-center">
          <RevealItem>
            <Logo variant="full" className="opacity-95" />
          </RevealItem>

          <RevealItem>
            <h1 className="text-balance text-5xl font-medium leading-[1.05] tracking-tight text-ink md:text-6xl">
              Cada declaración, <span className="text-brand">verificada</span>.
            </h1>
          </RevealItem>

          {/* Demo completa */}
          <RevealItem className="w-full">
            <SectionLabel>Demo completa</SectionLabel>
            <Link
              href="/login"
              className="group flex items-center gap-4 rounded-2xl bg-white/70 p-5 text-left ring-1 ring-white/60 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_18px_40px_-18px_rgba(20,32,26,0.35)]"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-dark">
                <LayoutDashboard className="h-5 w-5" />
              </span>
              <span className="flex flex-col">
                <span className="font-semibold text-ink">Plataforma integrada</span>
                <span className="text-sm text-muted">
                  Experiencia completa con navegación lateral.
                </span>
              </span>
              <ArrowRight className="ml-auto h-5 w-5 text-muted transition-all group-hover:translate-x-1 group-hover:text-brand" />
            </Link>
          </RevealItem>

          {/* Demos paso a paso */}
          <RevealItem className="w-full">
            <SectionLabel>Demos paso a paso</SectionLabel>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {actos.map(({ href, label, icon: Icon, title, desc }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex flex-col gap-3 rounded-2xl bg-white/70 p-5 text-left ring-1 ring-white/60 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_18px_40px_-18px_rgba(20,32,26,0.35)]"
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
                </Link>
              ))}
            </div>
          </RevealItem>
        </Reveal>
      </div>

      {/* Footer */}
      <footer className="relative z-10 flex items-center justify-center py-5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted/80">
          Powered by Sapira
        </span>
      </footer>
    </main>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
      {children}
    </p>
  );
}
