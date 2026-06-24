"use client";

import { useRouter } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();

  function handleEntrar() {
    router.push("/plataforma");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-brand-soft px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="flex items-center justify-center">
          <Logo variant="full" className="h-16 w-auto" />
        </div>

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-xl font-semibold text-ink">Acceso a la plataforma</h1>
          <p className="text-sm text-muted mt-1">Cada declaración, verificada.</p>
        </div>

        {/* Form */}
        <div className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-ink">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              defaultValue="auditor@ecoembes.es"
              readOnly
              className="w-full rounded-lg border border-black/10 bg-canvas px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-ink">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              defaultValue="demo1234"
              readOnly
              className="w-full rounded-lg border border-black/10 bg-canvas px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full mt-2"
            onClick={handleEntrar}
          >
            Entrar
          </Button>
        </div>

        {/* Demo note */}
        <p className="text-xs text-muted text-center">
          Acceso de demostración — sin validación real de credenciales
        </p>
      </div>
    </main>
  );
}
