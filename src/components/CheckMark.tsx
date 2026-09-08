/**
 * The radio that becomes a filled check when picked — the small piece of motion
 * that makes a list of options feel answered rather than merely clicked.
 *
 * The ring and the disc occupy the same box at the same size in both states, so
 * selecting never nudges the row.
 */
export default function CheckMark({ on, size = 22 }: { on: boolean; size?: number }) {
  return (
    <span
      className="relative shrink-0"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span
        className={`absolute inset-0 rounded-full border-[1.5px] transition-colors duration-150 ${
          on ? 'border-transparent' : 'border-rule-strong'
        }`}
      />
      {on && (
        <span className="animate-check absolute inset-0 flex items-center justify-center rounded-full bg-accent">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: size * 0.58, height: size * 0.58 }}
          >
            <path className="animate-check-draw" pathLength={30} d="M5 12.5 10 17.5 19 7" />
          </svg>
        </span>
      )}
    </span>
  );
}
