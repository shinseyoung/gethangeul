import { sentences } from '../utils/sentences';

/**
 * The small print under a card — "just for fun", what the arithmetic really is.
 *
 * One block per sentence, rather than one paragraph with newlines in the copy.
 * The newlines were doing half the job: a sentence too long for the column
 * still wrapped wherever it ran out, and at 375 that left a last line carrying
 * one word. `text-wrap: balance`, which evens those out everywhere else on the
 * site, is ignored on an element whose white-space is a pre variant — so the
 * very blocks that most needed it were the ones opted out of it.
 */
export default function Disclaimer({ children }: { children: string }) {
  return (
    <p className="mt-7 text-[12.5px] leading-relaxed text-ink-4">
      {sentences(children).map((line) => (
        <span key={line} className="block">{line}</span>
      ))}
    </p>
  );
}
