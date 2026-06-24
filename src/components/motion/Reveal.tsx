"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

/*
  Shared reveal primitives. Timing matches the demo's motion language:
  fade + 20px rise, 0.5s, easeOut, 0.1s stagger between siblings.
  framer-motion honours prefers-reduced-motion when the user has it set.
*/

const easeOut = [0.22, 1, 0.36, 1] as const;

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
};

/**
 * Wraps a group; children using <RevealItem> animate in sequence.
 *
 * Animates on mount (not on scroll). A scroll-triggered `whileInView` reveal is
 * fragile here: the scroll container is <main>, not the window, and a page taller
 * than ~5× the viewport can never reach the in-view threshold — so it would ship
 * blank. Mount-triggered reveal always fires regardless of page length.
 */
export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  /** Deprecated/no-op — kept for call-site compatibility. */
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

/** A single staggered child. Use inside <Reveal>. */
export function RevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

/** Standalone reveal-on-mount (no parent container needed). */
export function FadeUp({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOut, delay }}
    >
      {children}
    </motion.div>
  );
}
