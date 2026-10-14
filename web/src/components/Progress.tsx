import { Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

// Typical stage durations measured on the real pipeline; the API does not stream, so progress is an estimate.
const STAGES = [
  { label: 'Embedding the question', ms: 400 },
  { label: 'Searching the SDK index for the five closest chunks', ms: 300 },
  { label: 'Writing TypeScript from the retrieved context', ms: 6000 },
  { label: 'Type-checking against @chili-publish/studio-sdk', ms: 250 },
];
const TOTAL = STAGES.reduce((sum, s) => sum + s.ms, 0);
const NUMERALS = ['i', 'ii', 'iii', 'iv'];

export function Progress() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const started = performance.now();
    const timer = setInterval(() => setElapsed(performance.now() - started), 100);
    return () => clearInterval(timer);
  }, []);

  // Approaches but never reaches the end until the answer arrives.
  const fraction = 0.96 * (1 - Math.exp((-2.2 * elapsed) / TOTAL));
  let boundary = 0;
  const active = STAGES.findIndex((stage) => (boundary += stage.ms) > elapsed);
  const current = active === -1 ? STAGES.length - 1 : active;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="sheet mx-auto max-w-xl p-6"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-baseline justify-between">
        <p className="font-serif text-lg italic">Working on it…</p>
        <p className="font-mono text-xs tabular-nums text-ink-faint">{(elapsed / 1000).toFixed(1)}s</p>
      </div>

      <div className="mt-4 h-px bg-line">
        <motion.div className="h-px origin-left bg-ink" animate={{ scaleX: fraction }} transition={{ ease: 'linear', duration: 0.1 }} />
      </div>

      <ol className="mt-5 space-y-2.5">
        {STAGES.map((stage, i) => {
          const done = i < current;
          const running = i === current;
          return (
            <li key={stage.label} className={clsx('flex items-center gap-3 text-sm transition-colors duration-500', done || running ? 'text-ink' : 'text-ink-faint')}>
              <span className="w-6 font-serif italic text-ink-faint">{NUMERALS[i]}.</span>
              <span className="flex-1">{stage.label}</span>
              {done && <Check className="size-3.5 text-olive" strokeWidth={2.5} />}
              {running && (
                <motion.span
                  className="size-1.5 rounded-full bg-sanguine"
                  animate={{ opacity: [1, 0.25, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                />
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-5 text-xs text-ink-faint">Progress is estimated; the real timings are shown with the answer.</p>
    </motion.div>
  );
}
