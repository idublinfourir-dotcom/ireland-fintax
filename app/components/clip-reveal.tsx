"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Reveals a contained background image once, on scroll into view, with a
 * top-down clip-path wipe and a slight settle from scale(1.05).
 * Reduced-motion → the same reveal, instant, no movement.
 *
 * whileInView sits on the unclipped wrapper, not on the image. Chrome's
 * IntersectionObserver counts the target's own clip-path, so a fully clipped
 * element measured 0% visible, never reached the threshold, and the wipe never
 * ran: every ClipReveal stayed a blank box. The wrapper also carries the
 * caller's sizing, and the variant label flows down to the image.
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
      className={`overflow-hidden ${className}`}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.div
        style={{ backgroundImage: `url(${url})` }}
        className="h-full w-full bg-cover bg-center"
        variants={{
          hidden: { clipPath: "inset(0 0 100% 0)", scale: 1.05 },
          shown: { clipPath: "inset(0 0 0% 0)", scale: 1 },
        }}
        // Same tree on server and client either way (no hydration mismatch);
        // reduced motion only drops the duration.
        transition={reduce ? { duration: 0 } : { duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
      />
    </motion.div>
  );
}
