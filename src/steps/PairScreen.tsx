import { useMemo } from 'react';
import { useFlowStore } from '../store/useFlowStore';
import { useTranslation } from '../hooks/useTranslation';
import { useImageShare } from '../hooks/useImageShare';
import { hangulFor } from '../utils/romanToHangul';
import { compatibility } from '../utils/nameCompat';
import MountainWash from '../components/MountainWash';
import AdSlot from '../components/AdSlot';
import Button from '../components/Button';

/**
 * 이름궁합 — the second room.
 *
 * The whole appeal is that the visitor can see the arithmetic, so the fold is
 * drawn rather than hidden: it makes the game legible instead of oracular, and
 * it explains, without a word of apology, why swapping the two names changes
 * the answer. That has always been how the game works.
 */

/** One input, with the Hangul it was read as underneath it. */
function NameField({
  id, label, value, hangul, onChange, placeholder,
}: {
  id: string;
  label: string;
  value: string;
  hangul: string | null;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex-1">
      <label htmlFor={id} className="eyebrow mb-2 block text-[8.5px] text-ink-4">{label}</label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className="h-[56px] w-full rounded-2xl border-[1.5px] border-rule-strong bg-paper-hi px-5 font-disp text-[20px] text-ink caret-accent outline-none transition-colors duration-150 placeholder:font-body placeholder:text-[15px] placeholder:text-ink-4 focus:border-accent"
      />
      <span className="mt-2 block h-[22px] font-brush text-[19px] leading-none text-accent">
        {hangul}
      </span>
    </div>
  );
}

export default function PairScreen() {
  const { pairA, pairB, setPair, setTool, restart } = useFlowStore();
  const { t } = useTranslation();

  const readA = useMemo(() => hangulFor(pairA), [pairA]);
  const readB = useMemo(() => hangulFor(pairB), [pairB]);
  const result = useMemo(
    () => (readA && readB ? compatibility(readA.hangul, readB.hangul) : null),
    [readA, readB],
  );

  const { captureRef, isSaving, isSharing, handleDownload, handleShare } = useImageShare(
    result?.percent !== null && result ? `hangeul-match-${result.percent}` : 'hangeul-match',
  );

  const percent = result?.percent ?? null;

  return (
    <div className="mx-auto w-full max-w-[620px] px-5 pb-24 pt-6 lg:px-4">
      <span className="eyebrow text-[8.5px] tracking-[0.26em] text-accent">{t('pair.eyebrow')}</span>
      <h1 className="mb-2.5 mt-3 -ml-[0.035em] text-pretty font-disp text-[31px] leading-[1.08] tracking-tight text-ink md:text-[40px]">
        {t('pair.title')}
      </h1>
      <p className="text-[14px] leading-relaxed text-ink-3 md:text-[15px]">{t('pair.sub')}</p>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:gap-4">
        <NameField
          id="pair-a"
          label={t('pair.you')}
          value={pairA}
          hangul={readA?.hangul ?? null}
          onChange={(v) => setPair('a', v)}
          placeholder={t('pair.you_placeholder')}
        />
        <NameField
          id="pair-b"
          label={t('pair.them')}
          value={pairB}
          hangul={readB?.hangul ?? null}
          onChange={(v) => setPair('b', v)}
          placeholder={t('pair.them_placeholder')}
        />
      </div>

      <p className="mt-1 text-[12px] leading-relaxed text-ink-4">{t('pair.hint')}</p>

      {percent === null ? (
        <p className="mt-7 rounded-sm border border-l-[3px] border-rule border-l-pig-jeok bg-paper-hi p-3.5 text-[13px] leading-relaxed text-ink-3">
          {t('pair.waiting')}
        </p>
      ) : (
        <>
          {/* the card: this is what gets screenshotted, so no ad goes inside it */}
          <div
            ref={captureRef}
            className="relative mt-7 overflow-hidden rounded-3xl border border-rule-strong bg-paper-hi px-6 pb-8 pt-9 shadow-[0_26px_56px_-36px_rgba(23,24,26,0.4)] md:px-8"
          >
            <MountainWash season="spring" className="absolute inset-x-0 bottom-0 h-[170px]" />
            <div className="pointer-events-none absolute inset-2 rounded-[20px] border border-rule" />

            <div className="relative flex flex-col items-center">
              <span className="eyebrow text-[8.5px] tracking-[0.26em] text-ink-4">{t('pair.card_label')}</span>

              <span className="mt-3 font-brush text-[22px] leading-none text-ink-2">
                {readA!.hangul} <span className="text-ink-4">×</span> {readB!.hangul}
              </span>

              <span className="mt-5 block font-disp text-[76px] leading-none tracking-tight text-ink md:text-[92px]">
                {percent}
                <span className="text-[38px] text-ink-3 md:text-[44px]">%</span>
              </span>

              <span className="my-6 block h-px w-11 bg-accent" />

              {/* the fold, drawn — the reason this reads as a game and not an oracle */}
              <div className="flex flex-col items-center gap-[7px]">
                <div className="flex justify-center gap-[7px]">
                  {result!.cells.map((cell, i) => (
                    <span key={i} className="flex w-[26px] flex-col items-center gap-1">
                      <span className="font-brush text-[17px] leading-none text-ink-2">{cell.char}</span>
                      <span className="text-[11px] leading-none text-ink-4 tabular-nums">{cell.strokes}</span>
                    </span>
                  ))}
                </div>
                {result!.rows.slice(1).map((row, r) => (
                  <div key={r} className="flex justify-center gap-[7px]">
                    {row.map((digit, i) => (
                      <span
                        key={i}
                        className={`w-[26px] text-center text-[13px] leading-[1.5] tabular-nums ${
                          r === result!.rows.length - 2 ? 'font-medium text-accent' : 'text-ink-3'
                        }`}
                      >
                        {digit}
                      </span>
                    ))}
                  </div>
                ))}
              </div>

              <span className="eyebrow mt-7 text-[9px] tracking-[0.28em] text-ink-4">GETHANGEUL.COM</span>
            </div>
          </div>

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
        {t('pair.disclaimer')}
      </p>

      {/* the other room, for anyone who arrived here from a shared image */}
      <div className="mt-9">
        <div className="mb-3.5 flex items-center gap-2.5">
          <span className="eyebrow">{t('pair.no_name_label')}</span>
          <span className="hairline" />
        </div>
        <button
          type="button"
          onClick={() => { restart(); setTool('name'); }}
          className="focus-ring flex min-h-[64px] w-full items-center gap-3.5 rounded-2xl border border-rule bg-paper-hi p-4 text-left transition-colors hover:border-rule-strong"
        >
          <img
            src="/marks/start.webp"
            alt=""
            width={34}
            height={34}
            className="block h-[34px] w-[34px] shrink-0 object-contain mix-blend-multiply"
          />
          {/* the block carries the correction, measured: this lands the ink of
              both lines on the row's centre line within half a pixel */}
          <span className="flex flex-1 translate-y-[3px] flex-col justify-center gap-1.5">
            {/* a plain line-height, not OpticalText: inside a two-line block the
                correction that matters is the block's, and OpticalText centring
                each line in its own box fought it and won by 9px */}
            <span className="block font-disp text-[18px] leading-[1.25] text-ink">
              {t('pair.no_name')}
            </span>
            <span className="text-[12.5px] leading-[1.4] text-ink-3">{t('pair.no_name_desc')}</span>
          </span>
          <svg viewBox="0 0 24 24" fill="none" stroke="#ABAFB3" strokeWidth={1.8} strokeLinecap="round"
            strokeLinejoin="round" aria-hidden="true" className="h-[15px] w-[15px] shrink-0">
            <path d="M9 5.5 15.5 12 9 18.5" />
          </svg>
        </button>
      </div>

      <AdSlot size="300x250" className="mt-8" />
    </div>
  );
}
