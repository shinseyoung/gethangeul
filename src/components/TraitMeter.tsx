/**
 * One score, as five dots.
 *
 * Floor-plus-one rather than a straight round, so the range is 1–5 and a row is
 * never empty: an empty row reads as a rendering fault, not as a low score.
 *
 * Exported so scripts/traits.check.ts can assert against the real formula
 * instead of a hand-copied one that would go stale silently the next time this
 * changed.
 */
export const bucketOf = (score: number) => Math.min(5, Math.floor(score / 20) + 1);

export default function TraitMeter({ score, label }: { score: number; label: string }) {
  const filled = bucketOf(score);
  return (
    <span className="flex gap-[5px]" role="img" aria-label={`${label}: ${filled} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`h-[7px] w-[7px] rounded-full ${i < filled ? 'bg-accent' : 'bg-rule-strong'}`}
        />
      ))}
    </span>
  );
}
