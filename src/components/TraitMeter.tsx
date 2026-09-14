/**
 * One score, as five dots.
 *
 * Floor-plus-one rather than a straight round, so the range is 1–5 and a row is
 * never empty: an empty row reads as a rendering fault, not as a low score.
 */
export default function TraitMeter({ score, label }: { score: number; label: string }) {
  const filled = Math.min(5, Math.floor(score / 20) + 1);
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
