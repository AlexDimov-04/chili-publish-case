import { ChevronDown, ExternalLink } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import clsx from 'clsx';
import type { RetrievedChunk } from '../api';
import { CodeBlock } from './CodeBlock';

function ChunkCard({ chunk, used, index }: { chunk: RetrievedChunk; used: boolean; index: number }) {
  const [open, setOpen] = useState(false);
  const source = `${chunk.file.replace('packages/sdk/src/', '')}:${chunk.lines[0]}–${chunk.lines[1]}`;

  return (
    <motion.li
      variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
      className={clsx('sheet overflow-hidden', used && 'border-l-2 border-l-sanguine')}
    >
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="w-full px-4 pt-3.5 pb-3 text-left">
        <div className="flex items-start gap-3">
          <span className="w-5 shrink-0 pt-px font-serif text-[17px] italic leading-5 text-ink-faint">{chunk.rank}</span>
          <div className="min-w-0 flex-1">
            <p className="break-all font-mono text-[13px] leading-5">{chunk.apiPath ?? chunk.symbol}</p>
            <p className="mt-1 text-[11px] text-ink-faint">
              <span className="small-caps">{chunk.kind}</span>
              {used && <span className="small-caps ml-2 text-sanguine">· used in the answer</span>}
            </p>
          </div>
          <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-ink-faint">
            <ChevronDown className="size-4" />
          </motion.span>
        </div>

        <div className="mt-3 flex items-center gap-3 pl-8">
          <div className="h-px flex-1 bg-line" title="Cosine similarity">
            <motion.div
              className={clsx('h-px origin-left', used ? 'bg-sanguine' : 'bg-ink-soft')}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: chunk.score }}
              transition={{ duration: 1, delay: 0.25 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <span className="font-mono text-xs tabular-nums text-ink-soft">{chunk.score.toFixed(2)}</span>
        </div>
      </button>

      <a
        href={chunk.url}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1.5 border-t border-line px-4 py-2 pl-12 text-xs text-ink-faint transition-colors hover:text-ink"
      >
        <ExternalLink className="size-3 shrink-0" />
        <span className="truncate">{source}</span>
      </a>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-line p-3">
              <CodeBlock code={chunk.text} lineNumbers={false} className="max-h-80 text-xs leading-5" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

export function ChunkList({ chunks, usedSymbols }: { chunks: RetrievedChunk[]; usedSymbols: string[] }) {
  return (
    <motion.ol initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } }} className="space-y-2">
      {chunks.map((chunk, i) => (
        <ChunkCard key={chunk.rank} chunk={chunk} index={i} used={usedSymbols.includes(chunk.symbol)} />
      ))}
    </motion.ol>
  );
}
