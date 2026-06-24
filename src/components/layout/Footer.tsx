/*
  Demo chrome. Defaults to fixed (used over the step-by-step canvases); pass
  fixed={false} to render it in normal document flow (e.g. the landing, where a
  fixed bar would cut across scrolling content).
*/
export function DemoFooter({ fixed = true }: { fixed?: boolean }) {
  return (
    <footer
      className={`${
        fixed ? "fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-line" : "w-full"
      } z-[var(--z-sticky)] flex items-center justify-between px-8 py-3 text-xs text-muted`}
    >
      <span>demo v1.0</span>
      <span className="uppercase tracking-widest font-medium text-muted/70">
        Powered by Sapira
      </span>
    </footer>
  );
}
