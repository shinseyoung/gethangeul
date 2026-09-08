import { useTranslation } from '../hooks/useTranslation';

/**
 * A display slot. The label sits outside the frame, the well is visibly sunken,
 * and the height is reserved before anything loads so the page never jumps.
 *
 * Placement rules that matter and are easy to lose later:
 *  - nothing within 24px of a button
 *  - no slot on the landing page or on any of the four question screens
 *  - nothing inside the name card, which is the thing people screenshot
 */

type Size = '336x280' | '300x250' | '320x50' | '300x600' | 'fluid';

const BOX: Record<Size, { h: number; label: string }> = {
  '336x280': { h: 280, label: '336 × 280' },
  '300x250': { h: 250, label: '300 × 250' },
  '320x50': { h: 50, label: '320 × 50' },
  '300x600': { h: 600, label: '300 × 600' },
  fluid: { h: 250, label: '' },
};

interface Props {
  size: Size;
  className?: string;
  /** hide the rule + label, for the sticky anchor */
  bare?: boolean;
}

export default function AdSlot({ size, className = '', bare = false }: Props) {
  const { t } = useTranslation();
  const box = BOX[size];

  return (
    <div className={className}>
      {!bare && (
        <div className="mb-2 flex items-center gap-2.5">
          <span className="eyebrow text-[8.5px] tracking-[0.24em] text-ink-4">
            {t('result.ads.label')}
          </span>
          <span className="hairline" />
        </div>
      )}
      <div
        style={{ minHeight: box.h }}
        className="flex w-full items-center justify-center rounded-2xl border border-dashed border-rule-strong bg-ground-deep/60"
      >
        {/* Replace with the ad script. The box keeps its height either way. */}
        <span className="eyebrow text-[9px] text-ink-4">{box.label}</span>
      </div>
    </div>
  );
}
