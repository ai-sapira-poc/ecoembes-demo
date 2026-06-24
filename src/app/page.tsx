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
      {/* Cinematic photographic background — deep green */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/brand/landing-bg.avif"
          alt=""
          fill
          priority
          sizes="100vw"
          className="animate-ken-burns object-cover [filter:brightness(0.72)_saturate(1.1)]"
        />
        {/* Green wash — keeps the foliage visible, darkens for legible light text */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a3a1f]/80 via-[#0a3a1f]/55 to-[#04160c]/88" />
        <div className="absolute inset-0 [background:radial-gradient(ellipse_at_50%_38%,transparent_42%,rgba(4,18,10,0.55)_100%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-16">
        <Reveal className="flex w-full max-w-2xl flex-col items-center gap-10 text-center">
          <RevealItem>
            <div className="rounded-2xl bg-white px-7 py-5 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.5)]">
              <Logo variant="full" />
            </div>
          </RevealItem>

          <RevealItem>
            <h1 className="text-balance text-5xl font-medium leading-[1.05] tracking-tight text-white md:text-6xl">
              Auditorías <span className="text-brand-soft">automatizadas</span>.
            </h1>
          </RevealItem>

          {/* Demo completa */}
          <RevealItem className="w-full">
            <SectionLabel>Demo completa</SectionLabel>
            <Link
              href="/login"
              className="group flex items-center gap-4 rounded-2xl bg-white/[0.08] p-5 text-left ring-1 ring-white/15 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/[0.14] hover:ring-white/25"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/15 text-white">
                <LayoutDashboard className="h-5 w-5" />
              </span>
              <span className="flex flex-col">
                <span className="font-semibold text-white">Plataforma integrada</span>
                <span className="text-sm text-white/65">
                  Experiencia completa con navegación lateral.
                </span>
              </span>
              <ArrowRight className="ml-auto h-5 w-5 text-white/60 transition-all group-hover:translate-x-1 group-hover:text-white" />
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
                  className="group flex flex-col gap-3 rounded-2xl bg-white/[0.08] p-5 text-left ring-1 ring-white/15 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/[0.14] hover:ring-white/25"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-white/55">
                      {label}
                    </span>
                  </div>
                  <span className="font-semibold leading-snug text-white">{title}</span>
                  <span className="text-sm leading-relaxed text-white/65">{desc}</span>
                </Link>
              ))}
            </div>
          </RevealItem>
        </Reveal>
      </div>

      {/* Footer */}
      <footer className="relative z-10 flex items-center justify-center py-5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
          Powered by Sapira
        </span>
      </footer>
    </main>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
      {children}
    </p>
  );
}
