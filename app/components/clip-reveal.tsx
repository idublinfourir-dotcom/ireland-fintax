"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Reveals a contained background image once, on scroll into view, with a
 * top-down clip-path wipe and a slight settle from scale(1.05).
 * Reduced-motion → image shown immediately, no movement.
 */
export function ClipReveal({
  url,
  className = "",
}: {
  url: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      aria-hidden="true"
      style={{ backgroundImage: `url(${url})` }}
      className={`bg-cover bg-center ${className}`}
      initial={reduce ? false : { clipPath: "inset(0 0 100% 0)", scale: 1.05 }}
      whileInView={reduce ? undefined : { clipPath: "inset(0 0 0 0)", scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
    />
  );
}
