import { type FormEvent, useEffect, useRef, useState } from 'react';
import { type AskResponse, askQuestion } from './api';
import { ChunkList } from './ChunkList';

const EXAMPLES = [
  'I want to create a list variable with 4 items: Banana, Apple, Strawberry and Tomato',
  'I want to create a snapshot of the currently active page',
  'How can I make sure that my end-user can change the position of a frame?',
];

export function App() {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<AskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const pending = useRef<AbortController | null>(null);

  // `?q=...` asks on load, so answers can be linked to (and screenshotted).
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get('q');
    if (initial) void ask(initial);
  }, []);

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

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void ask(question);
  }

  return (
    <main>
      <h1>Studio SDK Code Assistant</h1>
      <p className="muted">Ask how to do something with the CHILI GraFx Studio SDK; get TypeScript plus the source it was based on.</p>

      <form onSubmit={onSubmit}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onSubmit(e);
          }}
          rows={3}
          maxLength={1000}
          placeholder="e.g. How do I change the text of a frame?"
        />
        <div className="actions">
          <button type="submit" disabled={loading || !question.trim()}>
            {loading ? 'Thinking…' : 'Ask'}
          </button>
          <span className="muted">or try:</span>
          {EXAMPLES.map((example) => (
            <button key={example} type="button" className="example" disabled={loading} onClick={() => void ask(example)}>
              {example}
            </button>
          ))}
        </div>
      </form>

      {loading && <p className="muted">Retrieving context and generating code…</p>}
      {error && <p className="error">Error: {error}</p>}
      {result && <Result result={result} />}
    </main>
  );
}

function Result({ result }: { result: AskResponse }) {
  const { answer, retrieval, typecheck, meta } = result;
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(answer.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <section>
      <h2>
        Code
        {typecheck && (
          <span className={typecheck.ok ? 'badge pass' : 'badge fail'}>
            {typecheck.ok ? 'type-check passed' : `type-check failed (${typecheck.errors.length})`}
          </span>
        )}
      </h2>
      {answer.code ? (
        <div className="code">
          <button type="button" className="copy" onClick={() => void copy()}>
            {copied ? 'Copied' : 'Copy'}
          </button>
          <pre>{answer.code}</pre>
        </div>
      ) : (
        <p className="muted">No code: the retrieved context was not sufficient (see explanation).</p>
      )}
      {typecheck && !typecheck.ok && (
        <ul className="error">
          {typecheck.errors.map((e, i) => (
            <li key={i}>
              line {e.line}: {e.message}
            </li>
          ))}
        </ul>
      )}

      <h2>Explanation</h2>
      <p>{answer.explanation}</p>

      <h2>Retrieved context (top {retrieval.topK})</h2>
      <ChunkList chunks={retrieval.chunks} usedSymbols={answer.usedSymbols} />

      <p className="muted meta">
        {meta.model} · {meta.embeddingModel} · studio-sdk {meta.sdkVersion} ·{' '}
        {Object.entries(meta.latencyMs)
          .map(([stage, ms]) => `${stage} ${ms} ms`)
          .join(', ')}{' '}
        · {meta.tokens.input} in / {meta.tokens.output} out tokens
      </p>
    </section>
  );
}
