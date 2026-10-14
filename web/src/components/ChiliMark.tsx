import { MARK, markSvgPaths } from '../lib/chiliMark';

const { body, facet } = markSvgPaths();

/** Flat CHILI publish mark for the header. */
export function ChiliMark({ className }: { className?: string }) {
  return (
    <svg viewBox="-0.05 -0.05 2.07 2.1" className={className} aria-hidden>
      <path d={body} fill={MARK.colors.body} />
      <path d={facet} fill={MARK.colors.facet} />
    </svg>
  );
}
