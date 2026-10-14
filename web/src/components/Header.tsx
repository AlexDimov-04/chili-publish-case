import clsx from 'clsx';
import { useHealth } from '../hooks/useHealth';
import { ChiliMark } from './ChiliMark';


export function Header() {
  const health = useHealth();
  const online = health?.status === 'ok';

  return (
    <header className="flex items-center justify-between gap-4 border-b border-line py-4">
      <div className="flex items-center gap-3">
        <ChiliMark className="h-8 w-8 drop-shadow-[0_0_12px_rgb(255_0_72/0.5)]" />
        <div className="leading-none">
          <p className="font-serif text-lg font-medium tracking-tight">Studio SDK Assistant</p>
          <p className="small-caps mt-1 text-[11px] text-ink-faint">for chili publish</p>
        </div>
      </div>

      <div
        className="flex shrink-0 items-center gap-2 whitespace-nowrap text-xs text-ink-soft"
        title={online ? `Model ${health?.model}` : 'Start the API with `npm run dev`; build the index with `npm run ingest`'}
      >
        <span className={clsx('size-1.5 rounded-full', online ? 'bg-pass' : health ? 'bg-chili' : 'bg-ink-faint')} />
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
