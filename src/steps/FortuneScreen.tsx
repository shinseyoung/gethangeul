import { useMemo } from 'react';
import { useFlowStore } from '../store/useFlowStore';
import { useTranslation } from '../hooks/useTranslation';
import { useImageShare } from '../hooks/useImageShare';
import { hangulFor } from '../utils/romanToHangul';
import { LUCKS, tell } from '../utils/fortune';
import { sentences } from '../utils/sentences';
import MountainWash from '../components/MountainWash';
import TraitMeter from '../components/TraitMeter';
import OpticalText from '../components/OpticalText';
import Note from '../components/Note';
import AdSlot from '../components/AdSlot';
import Button from '../components/Button';
import BirthdayPicker from '../components/BirthdayPicker';

/**
 * 한국 이름 운세 — the fifth room.
 *
 * The 띠 is the headline and the fortunes are the game around it. Every Korean
 * knows their animal, a foreigner living here gets asked theirs within a month,
 * and almost none of them can answer — that is the thing worth handing over. A
 * room whose headline is four bars of percentage is a room nobody screenshots.
 */

/** The 오방색, as ink rather than flat colour, so the card stays of a piece. */
const SWATCH: Record<string, string> = {
  blue: '#4F7A8A',
  red: '#A83B27',
  yellow: '#C9971F',
  white: '#D8D3C9',
  black: '#3A3D42',
};

export default function FortuneScreen() {
  const { fortuneName, fortuneBirthday, setFortuneName, setFortuneBirthday } = useFlowStore();
  const { t } = useTranslation();

  const read = useMemo(() => hangulFor(fortuneName), [fortuneName]);
  const fortune = useMemo(
    () => (read && fortuneBirthday ? tell(read.hangul, fortuneBirthday) : null),
    [read, fortuneBirthday],
  );

  const { captureRef, isSaving, isSharing, handleDownload, handleShare } = useImageShare(
    fortune ? `hangeul-fortune-${fortune.reading.animal}` : 'hangeul-fortune',
  );

  const field = 'h-[56px] w-full rounded-2xl border-[1.5px] border-rule-strong bg-paper-hi px-5 font-disp text-[20px] text-ink caret-accent outline-none transition-colors duration-150 placeholder:font-body placeholder:text-[15px] placeholder:text-ink-4 focus:border-accent';

  /* both filled but nothing to tell means the year is outside the Seollal
     table — say so rather than guessing at an animal */
  const outOfRange = Boolean(read && fortuneBirthday && !fortune);

  return (
    <div className="mx-auto w-full max-w-[620px] px-5 pb-24 pt-6 lg:px-4">
      <span className="eyebrow text-[8.5px] tracking-[0.26em] text-accent">{t('fortune.eyebrow')}</span>
      <h1 className="mb-2.5 mt-3 -ml-[0.035em] text-pretty font-disp text-[31px] leading-[1.08] tracking-tight text-ink md:text-[40px]">
        {t('fortune.title')}
      </h1>
      <p className="text-[14px] leading-relaxed text-ink-3 md:text-[15px]">{t('fortune.sub')}</p>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:gap-4">
        <div className="flex-1">
          <label htmlFor="fortune-name" className="eyebrow mb-2 block text-[8.5px] text-ink-4">
            {t('fortune.name_label')}
          </label>
          <input
            id="fortune-name"
            type="text"
            value={fortuneName}
            onChange={(e) => setFortuneName(e.target.value)}
            placeholder={t('fortune.name_placeholder')}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className={field}
          />
          <span className="mt-2 block h-[22px] font-brush text-[19px] leading-none text-accent">
            {read?.hangul}
          </span>
        </div>
        <div className="flex-1">
          <label htmlFor="fortune-birthday" className="eyebrow mb-2 block text-[8.5px] text-ink-4">
            {t('fortune.birthday_label')}
          </label>
          <BirthdayPicker value={fortuneBirthday} onChange={setFortuneBirthday} />
          <span className="mt-2 block h-[22px]" />
        </div>
      </div>

      {fortune === null ? (
        <Note>{t(outOfRange ? 'fortune.out_of_range' : 'fortune.waiting')}</Note>
      ) : (
        <>
          {/* the card: this is what gets screenshotted, so no ad goes inside it */}
          <div
            ref={captureRef}
            className="relative mt-7 overflow-hidden rounded-3xl border border-rule-strong bg-paper-hi px-6 pb-8 pt-9 shadow-[0_26px_56px_-36px_rgba(23,24,26,0.4)] md:px-8"
          >
            <MountainWash season={fortune.reading.season} className="absolute inset-x-0 bottom-0 h-[170px]" />
            <div className="pointer-events-none absolute inset-2 rounded-[20px] border border-rule" />

            <div className="relative flex flex-col items-center">
              <span className="eyebrow text-[8.5px] tracking-[0.26em] text-ink-4">{t('fortune.card_label')}</span>

              <OpticalText className="mt-3 block text-center font-disp text-[30px] leading-tight text-ink md:text-[34px]">
                {String(t('fortune.you_are')).replace('{animal}', String(t(`fortune.animal.${fortune.reading.animal}.name`)))}
              </OpticalText>

              <span className="mt-4 font-brush text-[26px] leading-none text-ink-2">{read!.hangul}</span>
              <span className="eyebrow mt-2 text-[8px] tracking-[0.22em] text-ink-4">{fortuneBirthday}</span>

              <span className="my-6 block h-px w-11 bg-accent" />

              <span className="flex max-w-[330px] flex-col gap-1 text-center text-[13px] leading-relaxed text-ink-2">
                {sentences(String(t(`fortune.animal.${fortune.reading.animal}.line`))).map((line) => (
                  <span key={line} className="block">{line}</span>
                ))}
              </span>

              <span className="my-6 block h-px w-11 bg-rule-strong" />

              <div className="flex w-full max-w-[280px] flex-col gap-3.5">
                {LUCKS.map((luck) => (
                  <span key={luck} className="flex items-center gap-3">
                    <OpticalText className="block flex-1 font-disp text-[15px] leading-none text-ink-2">
                      {String(t(`fortune.luck.${luck}`))}
                    </OpticalText>
                    <TraitMeter score={fortune.scores[luck]} label={String(t(`fortune.luck.${luck}`))} />
                  </span>
                ))}
              </div>

              <span className="my-6 block h-px w-11 bg-rule-strong" />

              <div className="flex w-full max-w-[330px] items-start justify-between gap-3 text-center">
                <span className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="eyebrow text-[7.5px] text-ink-4">{t('fortune.lucky_colour')}</span>
                  <span
                    className="block h-[18px] w-[18px] rounded-full border border-rule-strong"
                    style={{ background: SWATCH[fortune.colour] }}
                    aria-hidden="true"
                  />
                  <span className="text-[11.5px] leading-tight text-ink-2">{t(`fortune.colour.${fortune.colour}`)}</span>
                </span>
                <span className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="eyebrow text-[7.5px] text-ink-4">{t('fortune.lucky_number')}</span>
                  <span className="block font-disp text-[20px] leading-none text-ink">{fortune.number}</span>
                </span>
                <span className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="eyebrow text-[7.5px] text-ink-4">{t('fortune.lucky_dish')}</span>
                  <span className="text-[11.5px] leading-tight text-ink-2">{t(`fortune.dish.${fortune.dish}.name`)}</span>
                </span>
              </div>

              <span className="mt-4 flex max-w-[330px] flex-col gap-1 text-center text-[12px] leading-relaxed text-ink-3">
                {sentences(String(t(`fortune.dish.${fortune.dish}.line`))).map((line) => (
                  <span key={line} className="block">{line}</span>
                ))}
              </span>

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
        {t('fortune.disclaimer')}
      </p>

      <AdSlot size="300x250" className="mt-8" />
    </div>
  );
}
