import { lazy, Suspense } from 'react';
import { motion } from 'motion/react';
import { Embers } from './Embers';

// three.js is large; load the 3D logo after the page itself is up.
const ChiliLogo3D = lazy(() => import('./ChiliLogo3D'));

/** Background layers: heat glow, the slowly turning 3D CHILI mark, embers and sparks, and a little smoke grain. */
export function Backdrop() {
  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-20 bg-paper">
        <div className="absolute inset-x-0 bottom-0 h-[55vh] bg-[radial-gradient(ellipse_at_50%_100%,rgb(255_60_20/0.22),transparent_65%)]" />
        <div className="absolute inset-x-0 top-0 h-[40vh] bg-[radial-gradient(ellipse_at_50%_0%,rgb(255_0_72/0.10),transparent_70%)]" />
      </div>

      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[100svh] opacity-40"
      >
        <Suspense fallback={null}>
          <ChiliLogo3D />
        </Suspense>
      </motion.div>

      <Embers />

      <svg aria-hidden className="pointer-events-none fixed inset-0 -z-10 size-full opacity-[0.05] mix-blend-screen">
        <filter id="smoke">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#smoke)" />
      </svg>
    </>
  );
}
