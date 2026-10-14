import { Highlight, type PrismTheme } from 'prism-react-renderer';
import clsx from 'clsx';

// Built from the page's own palette (CSS variables), so code follows the light/dark theme.
const notebook: PrismTheme = {
  plain: { color: 'var(--ink)', backgroundColor: 'transparent' },
  styles: [
    { types: ['comment', 'prolog'], style: { color: 'var(--ink-faint)', fontStyle: 'italic' } },
    { types: ['keyword', 'builtin', 'operator-keyword'], style: { color: 'var(--sanguine)' } },
    { types: ['string', 'char', 'template-string'], style: { color: 'var(--olive)' } },
    { types: ['number', 'boolean', 'constant'], style: { color: 'var(--ochre)' } },
    { types: ['punctuation', 'operator'], style: { color: 'var(--ink-soft)' } },
    { types: ['function'], style: { fontWeight: '600' } },
  ],
};

export function CodeBlock({ code, lineNumbers = true, className }: { code: string; lineNumbers?: boolean; className?: string }) {
  return (
    <Highlight theme={notebook} code={code.trimEnd()} language="tsx">
      {({ tokens, getLineProps, getTokenProps }) => (
        <pre className={clsx('overflow-x-auto rounded-md bg-code px-4 py-3.5 font-mono text-[13px] leading-6', className)}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })} className="table-row">
              {lineNumbers && <span className="table-cell select-none pr-4 text-right text-ink-faint/70">{i + 1}</span>}
              <span className="table-cell whitespace-pre">
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </span>
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}
