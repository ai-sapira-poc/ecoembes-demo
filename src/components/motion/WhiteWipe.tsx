"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Brief full-canvas white overlay that auto-dismisses.
 * Opacity 0→1→0 over ~1.5s. Non-interactive.
 * Reduced-motion: skipped entirely (globals.css already zeroes durations,
 * but we also bail early so there's no flash for users who need it).
 */
export interface WhiteWipeProps {
  /** Label shown while the wipe is visible */
  label?: string;
  /** Total duration in ms (default 1500) */
  duration?: number;
}

export function WhiteWipe({ label = "Redactando consulta…", duration = 1500 }: WhiteWipeProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(t);
  }, [duration]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: duration / 1000, times: [0, 0.2, 0.7, 1], ease: "easeInOut" }}
          exit={{ opacity: 0 }}
        >
          {label && (
            <p className="text-sm font-medium text-muted tracking-wide">{label}</p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
