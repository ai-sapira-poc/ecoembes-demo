"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/layout/Logo";
import { DemoFooter } from "@/components/layout/Footer";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-brand-soft via-white to-brand-soft">
      {/* Ken-Burns background layer */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-brand-soft/60 via-white to-brand-soft/80"
        animate={{
          scale: [1, 1.08, 1.04, 1],
          x: [0, 12, -8, 0],
          y: [0, -8, 10, 0],
        }}
        transition={{
          duration: 28,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop",
        }}
        style={{ transformOrigin: "center center" }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 pb-20 pt-8 max-w-3xl w-full text-center">
        {/* Logo */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <Logo variant="full" />
        </div>

        {/* Headline */}
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-5xl font-extrabold tracking-tight text-ink leading-tight">
            Cada declaración,{" "}
            <span className="text-brand-dark">verificada.</span>
          </h1>
          <p className="text-lg text-muted max-w-xl">
            Del muestreo manual al control del 100% — sin esfuerzo adicional.
          </p>
        </div>

        {/* Plataforma CTA */}
        <div className="w-full max-w-sm">
          <Link
            href="/login"
            className="group flex flex-col items-center gap-1 bg-brand hover:bg-brand-dark transition-colors rounded-xl px-8 py-5 shadow-lg shadow-brand/20"
          >
            <span className="text-white font-semibold text-lg">Plataforma</span>
            <span className="text-white/70 text-sm">Entrar a la plataforma →</span>
          </Link>
        </div>

        {/* Demos paso a paso */}
        <div className="w-full flex flex-col items-center gap-3">
          <p className="text-xs uppercase tracking-widest text-muted font-medium">
            Demos paso a paso
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
            <Link
              href="/demos/auditoria"
              className="group flex flex-col gap-2 bg-white hover:bg-brand-soft border border-black/8 hover:border-brand/30 transition-all rounded-xl px-6 py-5 shadow-sm text-left"
            >
              <span className="text-xs font-semibold text-brand uppercase tracking-wider">
                Acto 1
              </span>
              <span className="font-semibold text-ink group-hover:text-brand-dark transition-colors">
                Auditoría de Declaraciones
              </span>
              <span className="text-sm text-muted">
                Verificación automática de cuotas SIG, tarifas y coherencia documental.
              </span>
            </Link>

            <Link
              href="/demos/control"
              className="group flex flex-col gap-2 bg-white hover:bg-brand-soft border border-black/8 hover:border-brand/30 transition-all rounded-xl px-6 py-5 shadow-sm text-left"
            >
              <span className="text-xs font-semibold text-brand uppercase tracking-wider">
                Acto 2
              </span>
              <span className="font-semibold text-ink group-hover:text-brand-dark transition-colors">
                Control de Integridad — Cuentas a Cobrar
              </span>
              <span className="text-sm text-muted">
                Conciliación del 100% frente al muestreo manual del 1,6%.
              </span>
            </Link>
          </div>
        </div>
      </div>

      <DemoFooter />
    </main>
  );
}
