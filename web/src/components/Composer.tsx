import { ArrowUp, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { FormEvent } from 'react';

export const EXAMPLES = [
  { label: 'A list variable with four items', question: 'I want to create a list variable with 4 items: Banana, Apple, Strawberry and Tomato' },
  { label: 'A snapshot of the active page', question: 'I want to create a snapshot of the currently active page' },
  { label: 'A frame the end-user can move', question: 'How can I make sure that my end-user can change the position of a frame?' },
];

const MAX_LENGTH = 1000;
const ease = [0.22, 1, 0.36, 1] as const;

interface Props {
  value: string;
  loading: boolean;
  onChange: (value: string) => void;
  onAsk: (question: string) => void;
}

export function Composer({ value, loading, onChange, onAsk }: Props) {
  function submit(event: FormEvent) {
    event.preventDefault();
    onAsk(value);
  }

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.25, ease }}
      className="sheet p-1.5 transition-[border-color,box-shadow] duration-300 focus-within:border-chili/50 focus-within:shadow-[0_0_0_1px_rgb(255_31_82/0.25),0_0_40px_-8px_rgb(255_60_20/0.45)]"
    >
      <label htmlFor="question" className="sr-only">
        Your question about the Studio SDK
      </label>
      <textarea
        id="question"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(e);
        }}
        rows={3}
        maxLength={MAX_LENGTH}
        placeholder="Ask how to do something with the Studio SDK…"
        className="block w-full resize-none bg-transparent px-3.5 pt-3 text-base leading-relaxed outline-none placeholder:text-ink-faint sm:text-[15px]"
      />
      <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-2">
        <span className="font-mono text-[11px] tabular-nums text-ink-faint">
          {value.length}/{MAX_LENGTH}
          <span className="ml-3 hidden sm:inline">⌘↵ to ask</span>
        </span>
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="inline-flex items-center gap-2 rounded-md bg-chili px-4 py-2 text-sm font-medium text-white shadow-[0_0_24px_-6px_rgb(255_31_82/0.9)] transition-[background-color,box-shadow] hover:bg-ember hover:shadow-[0_0_28px_-4px_rgb(255_122_26/0.9)] disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none disabled:hover:bg-chili"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
          {loading ? 'Working' : 'Ask'}
        </button>
      </div>
    </motion.form>
  );
}

export function ExampleChips({ disabled, onPick }: { disabled: boolean; onPick: (question: string) => void }) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.5 } } }}
      className="mt-4 flex flex-wrap items-center gap-x-1 gap-y-2"
    >
      <span className="small-caps mr-2 text-xs text-ink-faint">for example</span>
      {EXAMPLES.map(({ label, question }) => (
        <motion.button
          key={label}
          type="button"
          title={question}
          disabled={disabled}
          onClick={() => onPick(question)}
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.6 } } }}
          className="rounded-full border border-line bg-sheet px-3 py-1 font-serif text-[15px] italic text-ink-soft backdrop-blur-md transition-colors hover:border-chili/60 hover:text-ink disabled:opacity-40"
        >
          {label}
        </motion.button>
      ))}
    </motion.div>
  );
}
