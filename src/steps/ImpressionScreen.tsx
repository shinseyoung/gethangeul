import { useMemo } from 'react';
import { useFlowStore } from '../store/useFlowStore';
import { useTranslation } from '../hooks/useTranslation';
import { useImageShare } from '../hooks/useImageShare';
import { hangulFor, looksKorean } from '../utils/romanToHangul';
import { AXES, blendKey, readName } from '../utils/nameTraits';
import { surnameById } from '../utils/surnameMatcher';
import MountainWash from '../components/MountainWash';
import TraitMeter from '../components/TraitMeter';
import OptionMark from '../components/OptionMark';
import AdSlot from '../components/AdSlot';
import Button from '../components/Button';

/**
 * 첫인상 판독기 — the third room.
 *
 * The name flow asks questions and hands back a name. This runs the other
 * direction: a name in, and the five things a Korean ear notices about it. Same
 * scorer the match card labels itself with, so the two rooms cannot disagree.
 */

/** The five axes borrow marks the quiz already uses, so nothing new was drawn. */
const MARK: Record<string, string> = {
  friendly: 'considerate',
  refined: 'trendy',
  cute: 'lovely',
  calm: 'calm',
  uncommon: 'mystic',
};

export default function ImpressionScreen() {
  const { impressionName, setImpressionName } = useFlowStore();
  const { t } = useTranslation();

  const read = useMemo(() => hangulFor(impressionName), [impressionName]);
  const shapeOk = useMemo(() => looksKorean(impressionName), [impressionName]);
  const reading = useMemo(() => (read && shapeOk ? readName(read.hangul) : null), [read, shapeOk]);

  const { captureRef, isSaving, isSharing, handleDownload, handleShare } =
    useImageShare(reading ? `hangeul-impression-${reading.given}` : 'hangeul-impression');

  const surname = surnameById(reading?.surnameId ?? null);

  return (
    <div className="mx-auto w-full max-w-[620px] px-5 pb-24 pt-6 lg:px-4">
      <span className="eyebrow text-[8.5px] tracking-[0.26em] text-accent">{t('impression.eyebrow')}</span>
      <h1 className="mb-2.5 mt-3 -ml-[0.035em] text-pretty font-disp text-[31px] leading-[1.08] tracking-tight text-ink md:text-[40px]">
        {t('impression.title')}
      </h1>
      <p className="text-[14px] leading-relaxed text-ink-3 md:text-[15px]">{t('impression.sub')}</p>

      <div className="mt-7">
        <label htmlFor="impression-name" className="eyebrow mb-2 block text-[8.5px] text-ink-4">
          {t('impression.label')}
        </label>
        <input
          id="impression-name"
          type="text"
          value={impressionName}
          onChange={(e) => setImpressionName(e.target.value)}
          placeholder={t('impression.placeholder')}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="h-[56px] w-full rounded-2xl border-[1.5px] border-rule-strong bg-paper-hi px-5 font-disp text-[20px] text-ink caret-accent outline-none transition-colors duration-150 placeholder:font-body placeholder:text-[15px] placeholder:text-ink-4 focus:border-accent"
        />
        <span className="mt-2 block h-[22px] font-brush text-[19px] leading-none text-accent">
          {read?.hangul}
        </span>
      </div>

      <p className="mt-1 text-[12px] leading-relaxed text-ink-4">{t('impression.hint')}</p>

      {reading === null ? (
        <p className="mt-7 rounded-sm border border-l-[3px] border-rule border-l-pig-jeok bg-paper-hi p-3.5 text-[13px] leading-relaxed text-ink-3">
          {t(read && !shapeOk ? 'impression.not_korean' : 'impression.waiting')}
        </p>
      ) : (
        <>
          {/* the card: this is what gets screenshotted, so no ad goes inside it */}
          <div
            ref={captureRef}
            className="relative mt-7 overflow-hidden rounded-3xl border border-rule-strong bg-paper-hi px-6 pb-8 pt-9 shadow-[0_26px_56px_-36px_rgba(23,24,26,0.4)] md:px-8"
          >
            <MountainWash season="autumn" className="absolute inset-x-0 bottom-0 h-[170px]" />
            <div className="pointer-events-none absolute inset-2 rounded-[20px] border border-rule" />

            <div className="relative flex flex-col items-center">
              <span className="eyebrow text-[8.5px] tracking-[0.26em] text-ink-4">{t('impression.card_label')}</span>

              <span className="mt-4 font-brush text-[40px] leading-none text-ink">
                {surname && <span className="text-[28px] text-ink-4">{surname.hangul}</span>}
                {reading.given}
              </span>

              <span className="my-6 block h-px w-11 bg-accent" />

              <div className="flex w-full max-w-[280px] flex-col gap-3.5">
                {AXES.map((axis) => (
                  <span key={axis} className="flex items-center gap-3">
                    <OptionMark id={MARK[axis]} active size={26} />
                    <span className="flex-1 font-disp text-[15px] leading-none text-ink-2">
                      {t(`impression.axis.${axis}`)}
                    </span>
                    <TraitMeter score={reading.traits[axis]} label={t(`impression.axis.${axis}`)} />
                  </span>
                ))}
              </div>

              <span className="my-6 block h-px w-11 bg-rule-strong" />

              <span className="max-w-[320px] text-center text-[13px] leading-relaxed text-ink-2">
                {t(`impression.blend.${blendKey(reading.top[0], reading.top[1])}`)}
              </span>

              {reading.known.length > 0 && (
                <span className="mt-4 flex max-w-[320px] flex-col gap-2">
                  {reading.known.map((item) => (
                    <span key={item.roman} className="text-center text-[12px] leading-relaxed text-ink-3">
                      <span className="font-brush text-[15px] text-ink-2">{item.syllable}</span>
                      {' — '}
                      {t(`syllables.${item.roman}`)}
                    </span>
                  ))}
                </span>
              )}

              <span className="eyebrow mt-7 text-[9px] tracking-[0.28em] text-ink-4">GETHANGEUL.COM</span>
            </div>
          </div>

          {surname && (
            <p className="mt-3 text-[12px] leading-relaxed text-ink-4">{t('impression.family_note')}</p>
          )}

          <div className="mt-4 flex flex-col gap-2.5">
            <Button full onClick={handleDownload} disabled={isSaving || isSharing}>
              {isSaving ? t('result.buttons.downloading') : t('result.buttons.download')}
            </Button>
            <Button full variant="secondary" onClick={handleShare} disabled={isSaving || isSharing}>
              {isSharing ? t('result.buttons.sharing') : t('result.buttons.share')}
            </Button>
          </div>
        </>
      )}

      <p className="mt-7 whitespace-pre-line text-[12.5px] leading-relaxed text-ink-4">
        {t('impression.disclaimer')}
      </p>

      <AdSlot size="300x250" className="mt-8" />
    </div>
  );
}
