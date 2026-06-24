import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded bg-line/60",
        className
      )}
      {...props}
    >
      {/* Moving shimmer highlight */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -translate-x-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)",
          animation: "shimmer 1.6s ease-in-out infinite",
        }}
      />
    </div>
  );
}
