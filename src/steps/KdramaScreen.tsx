import { useMemo, useState } from 'react';
import { useFlowStore } from '../store/useFlowStore';
import { useTranslation } from '../hooks/useTranslation';
import { useImageShare } from '../hooks/useImageShare';
import { QUESTIONS } from '../data/kdramaQuestions';
import { ACTS, AXES, SCENES_PER_ACT, actOf, cast, recapKey, type ActId } from '../utils/kdramaCasting';
import { nameFor } from '../utils/kdramaName';
import { sentences } from '../utils/sentences';
import MountainWash from '../components/MountainWash';
import TraitMeter from '../components/TraitMeter';
import OpticalText from '../components/OpticalText';
import AdSlot from '../components/AdSlot';
import Button, { ArrowLeft, ArrowRight } from '../components/Button';

/**
 * K-Drama 이름 테스트 — the fourth room.
 *
 * The other three rooms read something you already have: a name you typed, two
 * names you picked. This one reads what you would *do*, and the casting is the
 * result — the name that comes with it is the gift, not the headline. That is
 * the whole reason it is not the name generator wearing a different hat.
 */

/** The four axes borrow marks the quiz already uses, so nothing new was drawn. */
const MARK: Record<string, string> = {
  romance: 'lovely',
  presence: 'strong',
  warmth: 'considerate',
  mischief: 'whimsical',
};

export default function KdramaScreen() {
  const {
    kdramaAnswers, kdramaStep, kdramaReroll,
    setKdramaAnswer, setKdramaStep, bumpKdramaReroll, resetKdrama,
  } = useFlowStore();
  const { t } = useTranslation();
  /* which act's opening card has already been read. Held here rather than in the
     store because it is about this sitting, not about the answers — going back
     into the previous act and forward again must not replay the beat. */
  const [actSeen, setActSeen] = useState<ActId | null>(null);

  const casting = useMemo(() => cast(kdramaAnswers), [kdramaAnswers]);

  /* the seed is the answers themselves, so the first name a visitor sees is
     fixed by what they said rather than by when they said it */
  const seed = useMemo(
    () => kdramaAnswers.reduce<number>((sum, a) => sum + (a ?? 0), 0),
    [kdramaAnswers],
  );
  const name = casting ? nameFor(casting.role, seed, kdramaReroll) : null;

  const { captureRef, isSaving, isSharing, handleDownload, handleShare } = useImageShare(
    casting ? `hangeul-kdrama-${casting.typeKey}` : 'hangeul-kdrama',
  );

  const onCard = kdramaStep > QUESTIONS.length;

  // ---- the intro ----------------------------------------------------------
  if (kdramaStep === 0) {
    return (
      <div className="mx-auto w-full max-w-[620px] px-5 pb-24 pt-6 lg:px-4">
        <span className="eyebrow text-[8.5px] tracking-[0.26em] text-accent">{t('kdrama.eyebrow')}</span>
        <h1 className="mb-2.5 mt-3 -ml-[0.035em] text-pretty font-disp text-[31px] leading-[1.08] tracking-tight text-ink md:text-[40px]">
          {t('kdrama.title')}
        </h1>
        <p className="text-[14px] leading-relaxed text-ink-3 md:text-[15px]">{t('kdrama.sub')}</p>
        <span className="mt-7 flex flex-col gap-1.5 border-l-[3px] border-rule pl-4 text-[14px] leading-relaxed text-ink-2">
          {sentences(String(t('kdrama.premise'))).map((line) => (
            <span key={line} className="block">{line}</span>
          ))}
        </span>
        <Button full className="mt-8" onClick={() => setKdramaStep(1)}>
          {t('kdrama.start')}
          <ArrowRight />
        </Button>
        <p className="mt-7 whitespace-pre-line text-[12.5px] leading-relaxed text-ink-4">
          {t('kdrama.disclaimer')}
        </p>
        <AdSlot size="300x250" className="mt-8" />
      </div>
    );
  }

  // ---- the six questions --------------------------------------------------
  if (!onCard) {
    const index = kdramaStep - 1;
    const question = QUESTIONS[index];
    const selected = kdramaAnswers[index];
    const act = actOf(index);
    const recap = recapKey(act, kdramaAnswers);

    /* the beat between acts. It does not advance the step, so Back from the
       scene after it returns to the previous act's last scene rather than here. */
    if (index % SCENES_PER_ACT === 0 && recap !== null && actSeen !== act) {
      return (
        <div className="mx-auto flex w-full max-w-[620px] flex-1 flex-col justify-center px-6 pb-8 pt-5 lg:px-4">
          <span className="eyebrow text-[8.5px] tracking-[0.26em] text-accent">
            {t(`kdrama.act.${act}`)}
          </span>
          <span className="mt-5 flex flex-col gap-1.5 font-disp text-[22px] leading-snug text-ink md:text-[26px]">
            {sentences(String(t(`kdrama.recap.${recap}`))).map((line) => (
              <span key={line} className="block">{line}</span>
            ))}
          </span>
          <Button full className="mt-9" onClick={() => setActSeen(act)}>
            {t('kdrama.next')}
            <ArrowRight />
          </Button>
        </div>
      );
    }

    return (
      <div className="mx-auto flex w-full max-w-[900px] flex-1 flex-col px-6 pb-8 pt-5 lg:px-4">
        {/* four act marks over three scene marks. Twelve dots in a line reads as
            "ten more to go", which is the feeling four acts exist to avoid. */}
        <div className="flex items-center gap-1.5 pt-2" aria-hidden="true">
          {ACTS.map((a) => (
            <span key={a} className={`h-[3px] flex-1 rounded-full transition-colors ${
              ACTS.indexOf(a) <= ACTS.indexOf(act) ? 'bg-accent' : 'bg-rule'
            }`} />
          ))}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5" aria-hidden="true">
          {Array.from({ length: SCENES_PER_ACT }, (_, i) => (
            <span key={i} className={`h-[2px] w-4 rounded-full transition-colors ${
              i <= index % SCENES_PER_ACT ? 'bg-accent/50' : 'bg-rule'
            }`} />
          ))}
        </div>
        <span className="eyebrow mt-4 text-[8.5px] tracking-[0.26em] text-ink-4">
          {t(`kdrama.act.${act}`)} · {index % SCENES_PER_ACT + 1} / {SCENES_PER_ACT}
        </span>

        <h2 className="mb-2.5 mt-3 -ml-[0.035em] text-pretty font-disp text-[29px] leading-[1.1] tracking-tight text-ink md:text-[38px]">
          {t(`kdrama.q.${question.id}.title`)}
        </h2>

        <div className="mt-6 grid gap-2.5">
          {question.options.map((option, o) => {
            const on = selected === o;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={on}
                onClick={() => setKdramaAnswer(index, o)}
                /* border width is identical in both states so the box never
                   resizes — that shift is what made these feel like they wobbled */
                className={`focus-ring flex min-h-[68px] items-center rounded-2xl border-[1.5px] p-4 text-left transition-colors duration-150 ${
                  on ? 'border-accent bg-accent/[0.05]' : 'border-rule bg-paper-hi hover:border-rule-strong hover:bg-paper-lo/60'
                }`}
              >
                <span className={`min-w-0 flex-1 text-balance font-disp text-[17px] leading-snug md:text-[18px] ${on ? 'text-ink' : 'text-ink-2'}`}>
                  {t(`kdrama.q.${question.id}.options.${option.id}`)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 pt-9">
          <Button variant="ghost" onClick={() => setKdramaStep(kdramaStep - 1)} className="px-3">
            <ArrowLeft />
            {t('kdrama.prev')}
          </Button>
          <Button onClick={() => setKdramaStep(kdramaStep + 1)} disabled={selected === null}>
            {t('kdrama.next')}
            <ArrowRight />
          </Button>
        </div>
      </div>
    );
  }

  // ---- the card -----------------------------------------------------------
  if (!casting || !name) {
    // only reachable if the step was pushed past the questions unanswered
    setKdramaStep(1);
    return null;
  }

  /* the locale owns the word order: English wants the article in front of the
     pair, Korean wants the temper in its adjectival form and no article at all */
  const headline = String(t('kdrama.headline'))
    .replace('{temper}', String(t(`kdrama.temper.${casting.temper}`)))
    .replace('{role}', String(t(`kdrama.role.${casting.role}`)));

  return (
    <div className="mx-auto w-full max-w-[620px] px-5 pb-24 pt-6 lg:px-4">
      {/* this is what gets screenshotted, so no ad and no button goes inside it */}
      <div
        ref={captureRef}
        className="relative mt-2 overflow-hidden rounded-3xl border border-rule-strong bg-paper-hi px-6 pb-8 pt-9 shadow-[0_26px_56px_-36px_rgba(23,24,26,0.4)] md:px-8"
      >
        <MountainWash season="summer" className="absolute inset-x-0 bottom-0 h-[170px]" />
        <div className="pointer-events-none absolute inset-2 rounded-[20px] border border-rule" />

        <div className="relative flex flex-col items-center">
          <span className="eyebrow text-[8.5px] tracking-[0.26em] text-ink-4">{t('kdrama.card_label')}</span>

          <OpticalText className="mt-3 block text-center font-disp text-[27px] leading-tight text-ink md:text-[31px]">
            {headline}
          </OpticalText>

          <span className="mt-5 font-brush text-[40px] leading-none text-ink">{name.hangul}</span>
          <span className="eyebrow mt-2 text-[8.5px] tracking-[0.24em] text-ink-4">{name.id}</span>

          <span className="my-6 block h-px w-11 bg-accent" />

          <div className="flex w-full max-w-[280px] flex-col gap-3.5">
            {AXES.map((axis) => (
              <span key={axis} className="flex items-center gap-3">
                <img
                  src={`/marks/${MARK[axis]}.webp`}
                  alt=""
                  width={26}
                  height={26}
                  className="block h-[26px] w-[26px] shrink-0 object-contain mix-blend-multiply"
                />
                <OpticalText className="block flex-1 font-disp text-[15px] leading-none text-ink-2">
                  {String(t(`kdrama.axis.${axis}`))}
                </OpticalText>
                <TraitMeter score={casting.scores[axis]} label={String(t(`kdrama.axis.${axis}`))} />
              </span>
            ))}
          </div>

          <span className="my-6 block h-px w-11 bg-rule-strong" />

          {/* one block per sentence, so a break never lands mid-clause */}
          <span className="flex max-w-[320px] flex-col text-center text-[13px] leading-relaxed text-ink-2">
            {sentences(String(t(`kdrama.type.${casting.typeKey}`))).map((line) => (
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
        <div className="mt-1 flex gap-2.5">
          <Button variant="ghost" className="flex-1" onClick={bumpKdramaReroll}>
            {t('kdrama.reroll')}
          </Button>
          <Button variant="ghost" className="flex-1" onClick={resetKdrama}>
            {t('kdrama.again')}
          </Button>
        </div>
      </div>

      <p className="mt-7 whitespace-pre-line text-[12.5px] leading-relaxed text-ink-4">
        {t('kdrama.disclaimer')}
      </p>

      <AdSlot size="300x250" className="mt-8" />
    </div>
  );
}
