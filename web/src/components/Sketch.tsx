import { motion } from 'motion/react';

// A Vitruvian-style construction drawing that sketches itself in, then rests; only the outer ring keeps turning.
const CENTER = { x: 500, y: 540 };
const PHI = (1 + Math.sqrt(5)) / 2;

/** Golden (logarithmic) spiral r = a·e^(bθ), with b chosen so the radius grows by φ every quarter turn. */
function goldenSpiral(): string {
  const b = Math.log(PHI) / (Math.PI / 2);
  const points: string[] = [];
  for (let theta = 0; theta <= 4.25 * Math.PI; theta += 0.05) {
    const r = 5 * Math.exp(b * theta);
    points.push(`${(CENTER.x + r * Math.cos(theta)).toFixed(1)},${(CENTER.y - r * Math.sin(theta)).toFixed(1)}`);
  }
  return `M${points.join(' L')}`;
}

const TICKS = Array.from({ length: 72 }, (_, i) => {
  const angle = (i * 5 * Math.PI) / 180;
  const long = i % 6 === 0;
  const [r1, r2] = [404, long ? 422 : 413];
  return `M${CENTER.x + r1 * Math.cos(angle)},${CENTER.y + r1 * Math.sin(angle)} L${CENTER.x + r2 * Math.cos(angle)},${CENTER.y + r2 * Math.sin(angle)}`;
});

const draw = (delay: number, duration = 2.4) => ({
  initial: { pathLength: 0, opacity: 0 },
  animate: { pathLength: 1, opacity: 1 },
  transition: { pathLength: { delay, duration, ease: [0.65, 0, 0.35, 1] as const }, opacity: { delay, duration: 0.3 } },
});

export function Sketch() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <svg
        viewBox="0 0 1000 1000"
        className="absolute left-1/2 top-[-6vmin] w-[max(120vmin,720px)] max-w-[1200px] -translate-x-1/2 text-ink opacity-[0.13] dark:opacity-[0.16]"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
      >
        {/* square and circle of the Vitruvian proportions */}
        <motion.rect x="190" y="230" width="620" height="620" strokeWidth="1.1" {...draw(0.2)} />
        <motion.circle cx={CENTER.x} cy={CENTER.y} r="380" strokeWidth="1.1" {...draw(0.6, 2.8)} />
        {/* construction lines */}
        <motion.path d="M190 230 L810 850 M810 230 L190 850" strokeWidth="0.6" strokeDasharray="2 7" {...draw(1.4, 2)} />
        <motion.path d="M500 120 L500 960 M80 540 L920 540" strokeWidth="0.6" strokeDasharray="2 7" {...draw(1.6, 2)} />
        <motion.circle cx={CENTER.x} cy={CENTER.y} r="235" strokeWidth="0.6" {...draw(2, 2.2)} />
        {/* golden spiral, the one stroke in red chalk */}
        <motion.path d={goldenSpiral()} className="text-sanguine" stroke="currentColor" strokeWidth="2" {...draw(2.4, 3.6)} />
        {/* compass ticks and a slowly turning outer ring */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.2, duration: 1.5 }} strokeWidth="0.8">
          {TICKS.map((d) => (
            <path key={d} d={d} />
          ))}
        </motion.g>
        <motion.circle
          cx={CENTER.x}
          cy={CENTER.y}
          r="452"
          strokeWidth="0.6"
          strokeDasharray="1 11"
          style={{ originX: '50%', originY: '54%' }}
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: 1, rotate: 360 }}
          transition={{ opacity: { delay: 3.4, duration: 1.5 }, rotate: { duration: 240, repeat: Infinity, ease: 'linear' } }}
        />
        {/* mirror-written note, as in Leonardo's notebooks */}
        <motion.text
          x="-470"
          y="905"
          transform="scale(-1 1)"
          stroke="none"
          fill="currentColor"
          className="font-serif italic"
          fontSize="18"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4, duration: 2 }}
        >
          de divina proportione · studio sdk
        </motion.text>
      </svg>

      {/* paper grain */}
      <svg className="absolute inset-0 size-full opacity-[0.07] mix-blend-multiply dark:opacity-[0.05] dark:mix-blend-screen">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>
  );
}
