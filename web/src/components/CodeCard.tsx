import { Check, Copy } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import type { AskResponse } from '../api';
import { CodeBlock } from './CodeBlock';

function TypecheckStatus({ typecheck }: { typecheck: AskResponse['typecheck'] }) {
  const [dot, label, color] =
    typecheck === null
      ? ['bg-ink-faint', 'not checked', 'text-ink-faint']
      : typecheck.ok
        ? ['bg-olive', 'type-check passed', 'text-olive']
        : ['bg-sanguine', `${typecheck.errors.length} type error${typecheck.errors.length === 1 ? '' : 's'}`, 'text-sanguine'];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${color}`}>
      <span className={`size-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }
  return (
    <button
      type="button"
      onClick={() => void copy()}
      aria-label="Copy code"
      className="inline-flex items-center gap-1.5 text-xs text-ink-soft transition-colors hover:text-ink"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={copied ? 'done' : 'copy'}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.15 }}
          className="inline-flex items-center gap-1.5"
        >
          {copied ? <Check className="size-3.5 text-olive" /> : <Copy className="size-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export function CodeCard({ answer, typecheck }: Pick<AskResponse, 'answer' | 'typecheck'>) {
  return (
    <section className="sheet p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-baseline gap-3">
          <h2 className="font-serif text-lg font-medium">The code</h2>
          <TypecheckStatus typecheck={typecheck} />
        </div>
        {answer.code && <CopyButton text={answer.code} />}
      </div>

      {answer.code ? (
        <CodeBlock code={answer.code} />
      ) : (
        <p className="border-l-2 border-ochre py-1 pl-4 font-serif text-[17px] italic leading-relaxed text-ink-soft">
          The retrieved SDK context was not enough to answer safely, so no code was written and no API was guessed.
        </p>
      )}

      {typecheck && !typecheck.ok && (
        <ul className="mt-3 space-y-1 border-l-2 border-sanguine pl-4 font-mono text-xs text-ink-soft">
          {typecheck.errors.map((error, i) => (
            <li key={i}>
              <span className="text-sanguine">line {error.line}</span> {error.message}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
