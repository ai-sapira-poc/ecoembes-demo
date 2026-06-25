"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { MeshBackground } from "@/components/layout/MeshBackground";
import { Button } from "@/components/ui/Button";

const easeOut = [0.22, 1, 0.36, 1] as const;

/** Staged entrance: each element fades + rises 20px at a staggered delay. */
function stage(delay: number) {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: easeOut, delay },
  };
}

export default function LoginPage() {
  const router = useRouter();

  function handleEntrar() {
    router.push("/plataforma");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-canvas">
      <MeshBackground />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-10 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-2xl ring-1 ring-line shadow-[0_8px_50px_-16px_rgba(20,32,26,0.28)] lg:grid-cols-[1.05fr_1fr]">
          {/* Brand / context panel — cinematic green wash, white logo */}
          <motion.aside
            {...stage(0.05)}
            className="relative hidden flex-col justify-between overflow-hidden bg-brand-darker px-9 py-10 lg:flex"
          >
            {/* Subtle on-brand depth: drifting darker wash + fine grid */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(120% 90% at 15% 0%, rgba(0,161,58,0.55), rgba(0,100,40,0) 60%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)",
                backgroundSize: "44px 44px",
                maskImage:
                  "radial-gradient(ellipse at 30% 20%, black 25%, transparent 75%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse at 30% 20%, black 25%, transparent 75%)",
              }}
            />

            <motion.div {...stage(0.15)} className="relative">
              <Logo variant="horizontal-claim" tone="white" className="h-11 w-auto" />
            </motion.div>

            <div className="relative">
              <motion.h2
                {...stage(0.28)}
                className="max-w-sm text-balance text-4xl font-medium leading-[1.1] tracking-tight text-white"
              >
                Cada declaración,{" "}
                <span className="text-white/70">verificada.</span>
              </motion.h2>
              <motion.p
                {...stage(0.4)}
                className="mt-4 max-w-xs text-pretty text-sm leading-relaxed text-white/75"
              >
                Del muestreo al 100 % verificado, con evidencia y trazabilidad
                completa en cada expediente.
              </motion.p>

              <motion.div
                {...stage(0.52)}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/85 ring-1 ring-white/15"
              >
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                Plataforma de verificación · Ecoembes
              </motion.div>
            </div>
          </motion.aside>

          {/* Login card */}
          <motion.div
            {...stage(0.12)}
            className="flex flex-col justify-center bg-surface px-8 py-10 sm:px-10"
          >
            {/* Logo (mobile only — the brand panel carries it on desktop) */}
            <motion.div {...stage(0.22)} className="mb-7 lg:hidden">
              <Logo variant="horizontal-claim" className="h-11 w-auto" />
            </motion.div>

            <motion.div {...stage(0.24)}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-dark">
                Acceso seguro
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-[-0.01em] text-ink">
                Entra en la plataforma
              </h1>
              <p className="mt-1.5 text-sm text-ink-soft">
                Continúa con tus credenciales de auditor.
              </p>
            </motion.div>

            <form
              className="mt-7 flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleEntrar();
              }}
            >
              <motion.div {...stage(0.32)} className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft"
                >
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  defaultValue="auditor@ecoembes.es"
                  readOnly
                  className="w-full cursor-default rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
                />
              </motion.div>

              <motion.div {...stage(0.4)} className="flex flex-col gap-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft"
                >
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  defaultValue="demo1234"
                  readOnly
                  className="w-full cursor-default rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
                />
              </motion.div>

              <motion.div {...stage(0.48)}>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="group mt-1 w-full font-semibold"
                >
                  Entrar
                  <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                </Button>
              </motion.div>
            </form>

            <motion.p
              {...stage(0.56)}
              className="mt-5 text-center text-xs text-muted"
            >
              Credenciales de demostración precargadas.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
