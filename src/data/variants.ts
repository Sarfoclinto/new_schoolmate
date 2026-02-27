import type { Variants } from "motion/react";

export const cardVariants = (i: number): Variants => ({
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut", delay: i * 0.07 },
  },
  hover: {
    y: -3,
    boxShadow: "0 16px 32px rgba(13,27,46,0.12)",
    transition: { duration: 0.2 },
  },
});

