import { RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

const STEPS = [
  { numeral: 'I', title: 'Retrieve', text: 'The question is matched against every public method and type in the Studio SDK source; the five closest are kept.' },
  { numeral: 'II', title: 'Write', text: 'The model writes TypeScript using only those APIs, and says so plainly when they are not enough.' },
  { numeral: 'III', title: 'Verify', text: 'The code is type-checked against the same @chili-publish/studio-sdk version that was indexed.' },
];

export function HowItWorks() {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      variants={{ show: { transition: { staggerChildren: 0.15, delayChildren: 0.7 } } }}
      className="grid gap-8 border-t border-line pt-8 sm:grid-cols-3 sm:gap-6"
    >
      {STEPS.map(({ numeral, title, text }) => (
        <motion.div key={title} variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}>
          <p className="font-serif text-2xl italic text-chili">{numeral}.</p>
          <h3 className="mt-1 font-serif text-xl font-medium">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{text}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

export function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      role="alert"
      className="sheet mx-auto flex max-w-xl items-start gap-4 border-l-2 border-l-chili p-5"
    >
      <div className="flex-1">
        <p className="font-serif text-lg italic">Something went wrong.</p>
        <p className="mt-1 text-sm text-ink-soft">{message}</p>
      </div>
      <button type="button" onClick={onRetry} className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-chili">
        <RotateCcw className="size-3.5" /> Retry
      </button>
    </motion.div>
  );
}
