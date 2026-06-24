/*
  Bespoke animated background: slow-drifting, heavily-blurred green blobs over a
  near-white canvas. No stock photo (CSP-safe), on-brand, and subliminal rather
  than busy — the demo equivalent of the Radisson Ken Burns. Pure CSS animation,
  so it runs without JS and respects prefers-reduced-motion via globals.css.
*/
export function MeshBackground({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* Blobs */}
      <div
        className="absolute -left-[10%] -top-[15%] h-[55vw] w-[55vw] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(0,161,58,0.28), rgba(0,161,58,0) 70%)",
          animation: "drift-a 24s ease-in-out infinite",
        }}
      />
      <div
        className="absolute right-[-12%] top-[8%] h-[48vw] w-[48vw] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(31,122,140,0.22), rgba(31,122,140,0) 70%)",
          animation: "drift-b 30s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-[-18%] left-[25%] h-[50vw] w-[50vw] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(0,133,50,0.18), rgba(0,133,50,0) 70%)",
          animation: "drift-c 27s ease-in-out infinite",
        }}
      />
      {/* Fine grid texture for depth */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(20,32,26,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(20,32,26,0.035) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at 50% 40%, black 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 40%, black 30%, transparent 80%)",
        }}
      />
      {/* Legibility veil — keeps content on near-white, like Radisson's 75% overlay */}
      <div className="absolute inset-0 bg-canvas/55" />
    </div>
  );
}
