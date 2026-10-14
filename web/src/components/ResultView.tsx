import { motion } from 'motion/react';
import type { AskResponse } from '../api';
import { ChunkList } from './ChunkList';
import { CodeCard } from './CodeCard';

const rise = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } } as const;

export function ResultView({ result }: { result: AskResponse }) {
  const { answer, retrieval, typecheck, meta } = result;
  const totalMs = Object.values(meta.latencyMs).reduce((sum, ms) => sum + ms, 0);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      variants={{ show: { transition: { staggerChildren: 0.1 } } }}
      className="grid grid-cols-1 gap-6 lg:grid-cols-5"
    >
      <div className="min-w-0 space-y-5 lg:col-span-3">
        <motion.div variants={rise}>
          <CodeCard answer={answer} typecheck={typecheck} />
        </motion.div>

        <motion.section variants={rise} className="sheet p-4 sm:p-5">
          <h2 className="font-serif text-lg font-medium">Why</h2>
          <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{answer.explanation}</p>
          {answer.usedSymbols.length > 0 && (
            <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-ink-soft">
              {answer.usedSymbols.map((symbol) => (
                <span key={symbol} className="break-all">
                  {symbol}
                </span>
              ))}
            </p>
          )}
        </motion.section>

        <motion.p variants={rise} className="font-mono text-[11px] leading-relaxed text-ink-faint">
          {(totalMs / 1000).toFixed(1)}s ({Object.entries(meta.latencyMs).map(([stage, ms]) => `${stage} ${ms}ms`).join(', ')}) · {meta.model} ·{' '}
          {meta.embeddingModel} · studio-sdk {meta.sdkVersion} · {meta.tokens.input} in / {meta.tokens.output} out tokens
        </motion.p>
      </div>

      <motion.aside variants={rise} className="min-w-0 lg:col-span-2">
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h2 className="font-serif text-lg font-medium">Sources</h2>
          <span className="text-xs text-ink-faint">top {retrieval.topK} by cosine similarity</span>
        </div>
        <ChunkList chunks={retrieval.chunks} usedSymbols={answer.usedSymbols} />
      </motion.aside>
    </motion.div>
  );
}
