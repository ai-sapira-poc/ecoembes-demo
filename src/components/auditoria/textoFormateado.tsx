import type { ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Light text formatting (no markdown lib): **bold** inline + "• "/"- " bullets.
// Shared by the client portal chat and the expediente conversation log.
// ─────────────────────────────────────────────────────────────────────────────
export function renderInline(text: string, keyPrefix: string) {
  // Split on **bold** spans; odd indices are the emphasized parts.
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={`${keyPrefix}-b${i}`} className="font-bold text-ink">
        {part}
      </strong>
    ) : (
      <span key={`${keyPrefix}-t${i}`}>{part}</span>
    )
  );
}

export function TextoFormateado({ texto }: { texto: string }) {
  const lines = texto.split("\n");
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];
  let key = 0;

  const flushBullets = () => {
    if (bullets.length === 0) return;
    const items = bullets;
    bullets = [];
    blocks.push(
      <ul key={`ul-${key++}`} className="my-1 space-y-0.5">
        {items.map((b, i) => (
          <li key={i} className="flex gap-1.5">
            <span aria-hidden className="select-none">
              •
            </span>
            <span className="min-w-0">{renderInline(b, `li-${i}`)}</span>
          </li>
        ))}
      </ul>
    );
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const m = /^\s*[•-]\s+(.*)$/.exec(line);
    if (m) {
      bullets.push(m[1]);
    } else {
      flushBullets();
      if (line.trim() !== "") {
        blocks.push(<p key={`p-${key++}`}>{renderInline(line, `p-${key}`)}</p>);
      }
    }
  }
  flushBullets();

  return <div className="space-y-1.5">{blocks}</div>;
}
