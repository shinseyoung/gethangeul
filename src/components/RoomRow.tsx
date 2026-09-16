import OptionMark from '../components/OptionMark';

/**
 * One tappable row: a mark, a title, a line of description, a chevron.
 *
 * The name result screen has carried these since it was the only screen with
 * anywhere to send anyone. Now that the name is the site's one piece of state,
 * the profile hands it on the same way, so the row lives here rather than in
 * whichever screen happened to draw it first.
 */
export default function RoomRow({
  mark, title, desc, onClick,
}: {
  mark: string;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring flex min-h-[64px] items-center gap-3.5 rounded-2xl border border-rule bg-paper-hi p-4 text-left transition-colors hover:border-rule-strong"
    >
      {/* tiled, like every other mark on the site. Bare on paper the wash read
          as a background nobody had got round to removing. */}
      <OptionMark id={mark} size={34} />
      {/* both lines ride high in their line boxes, so the block — not only its
          measured first line — carries the correction */}
      <span className="flex flex-1 translate-y-[3px] flex-col justify-center gap-1.5">
        {/* a plain line-height, not OpticalText: inside a two-line block the
            correction that matters is the block's, and OpticalText centring
            each line in its own box fought it and won by 9px */}
        <span className="block font-disp text-[18px] leading-[1.25] text-ink">{title}</span>
        <span className="text-[12.5px] leading-[1.4] text-ink-3">{desc}</span>
      </span>
      <svg viewBox="0 0 24 24" fill="none" stroke="#ABAFB3" strokeWidth={1.8} strokeLinecap="round"
        strokeLinejoin="round" aria-hidden="true" className="h-[15px] w-[15px] shrink-0">
        <path d="M9 5.5 15.5 12 9 18.5" />
      </svg>
    </button>
  );
}
