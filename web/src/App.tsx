import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { type AskResponse, askQuestion } from './api';
import { Composer, ExampleChips } from './components/Composer';
import { Header } from './components/Header';
import { Progress } from './components/Progress';
import { ResultView } from './components/ResultView';
import { Backdrop } from './components/Backdrop';
import { ErrorCard, HowItWorks } from './components/States';

export function App() {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<AskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const pending = useRef<AbortController | null>(null);

  async function ask(text: string) {
    if (!text.trim()) return;
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    setQuestion(text);
    window.history.replaceState(null, '', `?q=${encodeURIComponent(text)}`);
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await askQuestion(text, controller.signal));
    } catch (err) {
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : String(err));
    } finally {
      if (pending.current === controller) setLoading(false);
    }
  }

  // `?q=...` asks on load, so answers can be linked to (and screenshotted).
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get('q');
    if (initial) void ask(initial);
  }, []);

  return (
    <div className="relative min-h-dvh">
      <Backdrop />
      <div className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <Header />

        <div className="mx-auto max-w-2xl pt-12 sm:pt-20">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center font-serif text-4xl font-medium leading-[1.1] tracking-tight text-balance sm:text-6xl"
          >
            Studio SDK code, <em className="font-normal text-chili [text-shadow:0_0_32px_rgb(255_31_82/0.45)]">served hot from the source.</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mx-auto mt-5 max-w-lg text-center text-[15px] leading-relaxed text-pretty text-ink-soft sm:text-base"
          >
            Every answer is grounded in the real SDK source, type-checked against the published package, and shown with the sources it came from.
          </motion.p>

          <div className="mt-10 sm:mt-12">
            <Composer value={question} loading={loading} onChange={setQuestion} onAsk={(q) => void ask(q)} />
            <ExampleChips disabled={loading} onPick={(q) => void ask(q)} />
          </div>
        </div>

        <main className="mt-14 sm:mt-20">
          <AnimatePresence mode="wait">
            {loading ? (
              <Progress key="progress" />
            ) : error ? (
              <ErrorCard key="error" message={error} onRetry={() => void ask(question)} />
            ) : result ? (
              <ResultView key={`result-${result.question}`} result={result} />
            ) : (
              <HowItWorks key="empty" />
            )}
          </AnimatePresence>
        </main>

        <footer className="mt-20 border-t border-line pt-5 text-center font-serif text-sm italic text-ink-faint">
          Cooked from the @chili-publish/studio-sdk source; every source links to GitHub.
        </footer>
      </div>
    </div>
  );
}
