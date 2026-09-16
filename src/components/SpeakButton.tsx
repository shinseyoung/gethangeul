import { useSpeech } from '../hooks/useSpeech';

/**
 * Say the name out loud.
 *
 * Renders nothing at all when the browser has no Korean voice installed: a
 * button that plays an English reading of Hangul is worse than no button.
 */
export default function SpeakButton({ text, label }: { text: string; label: string }) {
  const { supported, speak } = useSpeech(text);
  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={speak}
      aria-label={label}
      className="focus-ring flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-rule-strong bg-paper-hi text-ink-3 transition-colors hover:border-accent hover:text-accent"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"
        strokeLinejoin="round" aria-hidden="true" className="h-[17px] w-[17px]">
        <path d="M10.5 5 6 8.8H3v6.4h3l4.5 3.8z" />
        <path d="M14.4 9.6a3.4 3.4 0 0 1 0 4.8" />
        <path d="M17.2 6.8a7.4 7.4 0 0 1 0 10.4" />
      </svg>
    </button>
  );
}
