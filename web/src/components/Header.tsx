import clsx from 'clsx';
import { useHealth } from '../hooks/useHealth';

/** Circle-in-square mark, after the Vitruvian proportions in the background drawing. */
function Mark() {
  return (
    <svg viewBox="0 0 32 32" className="size-8 text-ink" fill="none" stroke="currentColor" strokeWidth="1.3">
      <rect x="5" y="5" width="22" height="22" />
      <circle cx="16" cy="17.2" r="12.4" />
      <circle cx="16" cy="17.2" r="1.6" className="fill-sanguine text-sanguine" />
    </svg>
  );
}

export function Header() {
  const health = useHealth();
  const online = health?.status === 'ok';

  return (
    <header className="flex items-center justify-between gap-4 border-b border-line py-4">
      <div className="flex items-center gap-3">
        <Mark />
        <div className="leading-none">
          <p className="font-serif text-lg font-medium tracking-tight">Studio SDK Assistant</p>
          <p className="small-caps mt-1 text-[11px] text-ink-faint">chili grafx</p>
        </div>
      </div>

      <div
        className="flex shrink-0 items-center gap-2 whitespace-nowrap text-xs text-ink-soft"
        title={online ? `Model ${health?.model}` : 'Start the API with `npm run dev`; build the index with `npm run ingest`'}
      >
        <span className={clsx('size-1.5 rounded-full', online ? 'bg-olive' : health ? 'bg-sanguine' : 'bg-ink-faint')} />
        {health === null ? (
          'connecting'
        ) : online ? (
          <span className="font-mono">
            <span className="hidden sm:inline">studio-sdk </span>
            {health.sdkVersion}
            <span className="hidden min-[400px]:inline"> · {health.chunks} chunks</span>
          </span>
        ) : (
          'API offline'
        )}
      </div>
    </header>
  );
}
