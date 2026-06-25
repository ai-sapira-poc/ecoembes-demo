"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { MeshBackground } from "@/components/layout/MeshBackground";

const EMAIL = "auditor@ecoembes.es";
const PASSWORD = "••••••••";
const TYPE_SPEED = 40;
const easeOut = [0.22, 1, 0.36, 1] as const;

type Phase = "idle" | "typing-email" | "typing-password" | "clicking" | "done";

export default function LoginPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [emailText, setEmailText] = useState("");
  const [passwordText, setPasswordText] = useState("");

  const typeText = useCallback(
    (text: string, setter: (v: string) => void): Promise<void> =>
      new Promise((resolve) => {
        let i = 0;
        const interval = setInterval(() => {
          i++;
          setter(text.slice(0, i));
          if (i >= text.length) {
            clearInterval(interval);
            resolve();
          }
        }, TYPE_SPEED);
      }),
    []
  );

  useEffect(() => {
    let cancelled = false;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const run = async () => {
      // Reduced motion: skip the typing, show fields pre-filled, navigate after a short beat.
      if (reduceMotion) {
        setEmailText(EMAIL);
        setPasswordText(PASSWORD);
        setPhase("clicking");
        await wait(700);
        if (!cancelled) router.push("/plataforma");
        return;
      }

      await wait(600);
      if (cancelled) return;
      setPhase("typing-email");
      await typeText(EMAIL, setEmailText);
      if (cancelled) return;
      await wait(300);
      setPhase("typing-password");
      await typeText(PASSWORD, setPasswordText);
      if (cancelled) return;
      await wait(400);
      setPhase("clicking");
      await wait(600);
      if (cancelled) return;
      setPhase("done");
      router.push("/plataforma");
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [reduceMotion, router, typeText]);

  const clicking = phase === "clicking";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas px-4 py-10">
      <MeshBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: easeOut }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="flex flex-col items-center gap-7">
          <Logo variant="horizontal-claim" tone="color" className="h-12 w-auto" />

          <div className="w-full rounded-xl border border-line bg-surface p-8 shadow-[0_8px_40px_-12px_rgba(20,32,26,0.22)]">
            <h1 className="text-lg font-semibold tracking-[-0.01em] text-ink">
              Iniciar sesión
            </h1>
            <p className="mt-1 text-sm text-muted">
              Accede a la plataforma de verificación.
            </p>

            <div className="mt-6 space-y-4">
              {/* Email field — fills via the typing animation */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">
                  Correo electrónico
                </label>
                <div className="flex h-11 items-center gap-2.5 rounded-lg border border-line bg-canvas px-3">
                  <Mail className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                  <span className="text-sm text-ink">{emailText}</span>
                  {phase === "typing-email" && (
                    <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-ink" aria-hidden />
                  )}
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">
                  Contraseña
                </label>
                <div className="flex h-11 items-center gap-2.5 rounded-lg border border-line bg-canvas px-3">
                  <Lock className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                  <span className="flex-1 text-sm tracking-[0.18em] text-ink">
                    {passwordText}
                    {phase === "typing-password" && (
                      <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-[2px] animate-pulse bg-ink" aria-hidden />
                    )}
                  </span>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2">
                <div className="flex h-4.5 w-4.5 items-center justify-center rounded bg-brand">
                  <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path
                      d="M2.5 6L5 8.5L9.5 3.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-sm text-ink-soft">Recordarme</span>
              </div>

              {/* Entrar — the auto-played CTA (brief press beat, no spring) */}
              <motion.div
                className={`flex h-11 cursor-default items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white transition-colors ${
                  clicking ? "bg-brand-dark" : "bg-brand"
                }`}
                animate={clicking ? { scale: [1, 0.97, 1] } : {}}
                transition={{ duration: 0.2, ease: easeOut }}
              >
                Entrar
                <ArrowRight className="h-4 w-4" aria-hidden />
              </motion.div>
            </div>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-line" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted">
                O continúa con
              </span>
              <div className="h-px flex-1 bg-line" />
            </div>

            {/* SSO buttons — visual only, official multi-color marks */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-surface text-sm font-medium text-ink-soft">
                <svg className="h-4 w-4" viewBox="0 0 23 23" fill="none" aria-hidden>
                  <path d="M11 0H0v11h11V0z" fill="#F25022" />
                  <path d="M23 0H12v11h11V0z" fill="#7FBA00" />
                  <path d="M11 12H0v11h11V12z" fill="#00A4EF" />
                  <path d="M23 12H12v11h11V12z" fill="#FFB900" />
                </svg>
                Microsoft
              </div>
              <div className="flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-surface text-sm font-medium text-ink-soft">
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
