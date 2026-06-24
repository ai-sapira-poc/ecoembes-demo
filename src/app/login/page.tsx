"use client";

import { useRouter } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { MeshBackground } from "@/components/layout/MeshBackground";
import { FadeUp } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();

  function handleEntrar() {
    router.push("/plataforma");
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 bg-canvas overflow-hidden">
      {/* Animated mesh background */}
      <MeshBackground />

      {/* Glass card */}
      <FadeUp className="relative z-10 w-full max-w-sm">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl ring-1 ring-line shadow-[0_8px_40px_-12px_rgba(20,32,26,0.22)] px-8 py-9 flex flex-col items-center gap-6">

          {/* Logo */}
          <div className="flex items-center justify-center">
            <Logo variant="horizontal-claim" className="h-12 w-auto" />
          </div>

          {/* Heading */}
          <div className="text-center -mt-1">
            <h1 className="text-xl font-semibold text-ink tracking-[-0.01em]">
              Acceso a la plataforma
            </h1>
            <p className="text-sm text-muted mt-1">Cada declaración, verificada.</p>
          </div>

          {/* Form */}
          <div className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-ink-soft uppercase tracking-[0.08em]">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                defaultValue="auditor@ecoembes.es"
                readOnly
                className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand cursor-default"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-ink-soft uppercase tracking-[0.08em]">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                defaultValue="demo1234"
                readOnly
                className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand cursor-default"
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full mt-1 font-semibold"
              onClick={handleEntrar}
            >
              Entrar
            </Button>
          </div>
        </div>
      </FadeUp>
    </main>
  );
}
