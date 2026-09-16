import { useMemo } from 'react';
import { useFlowStore } from '../store/useFlowStore';
import { useTranslation } from '../hooks/useTranslation';
import { useImageShare } from '../hooks/useImageShare';
import { GENRES, SCENE_COUNT, sceneAt, type Genre } from '../data/kdramaScenes';
import { ACTS, AXES, SCENES_PER_ACT, actOf, cast } from '../utils/kdramaCasting';
import { hangulFor } from '../utils/romanToHangul';
import { sentences } from '../utils/sentences';
import { withParticles } from '../utils/particles';
import MountainWash from '../components/MountainWash';
import TraitMeter from '../components/TraitMeter';
import OptionMark from '../components/OptionMark';
import OpticalText from '../components/OpticalText';
import AdSlot from '../components/AdSlot';
import Button, { ArrowLeft, ArrowRight } from '../components/Button';

/**
 * K-드라마 — the fourth room.
 *
 * The other three rooms read something you already have: a name you typed, two
 * names you picked. This one reads what you would *do*, and hands back a work
 * rather than a reading — a poster for the drama you just starred in, with
 * your name in its title.
 *
 * You pick the genre and give a name, then walk twelve scenes that fork three
 * times. The six roles the engine works out are the index into the title and
 * the logline; the words 주인공 and 첫사랑 never reach this screen. Telling
 * someone they are a careful lead is the 첫인상 room's job, and it does it in
 * one step rather than twelve.
 */

/** Borrowed from the quiz set, so a genre needs no new drawing. */
const GENRE_MARK: Record<Genre, string> = {
  chaebol: 'trendy',
  makjang: 'strong',
  highteen: 'bright',
  idol: 'lovely',
};

/** The four axes borrow marks the quiz already uses, so nothing new was drawn. */
const MARK: Record<string, string> = {
  romance: 'lovely',
  presence: 'strong',
  warmth: 'considerate',
  mischief: 'whimsical',
};

/**
 * What the scenes call you: the Hangul the site already makes on a Korean page,
 * your own spelling everywhere else. `사라 씨` is the line a Korean would say;
 * `Sarah 씨` is a line nobody says.
 */
function displayName(name: string, lang: string): string {
  const trimmed = name.trim();
  if (lang !== 'ko') return trimmed;
  return hangulFor(trimmed)?.hangul ?? trimmed;
}

export default function KdramaScreen() {
  const {
    kdramaAnswers, kdramaStep, koreanName, kdramaGenre, lang,
    setKdramaAnswer, setKdramaStep, setKoreanName, setKdramaGenre, resetKdrama,
  } = useFlowStore();
  const { t } = useTranslation();
  const casting = useMemo(() => cast(kdramaAnswers), [kdramaAnswers]);

  const { captureRef, isSaving, isSharing, handleDownload, handleShare } = useImageShare(
    casting ? `ganada-kdrama-${casting.typeKey}` : 'ganada-kdrama',
  );

  const onCard = kdramaStep > SCENE_COUNT;
  /* the placeholder is in the copy rather than around it, so a scene with no
     name in it needs no special case — replace finds nothing and the line
     stands as written */
  const who = displayName(koreanName, lang);
  /* the name goes in, and then the particles that depend on it: Korean picks
     between 은/는 and 과/와 by the syllable in front, and the syllable in front
     is a name the copy has never seen */
  const named = (copy: unknown) => withParticles(String(copy).replace(/\{name\}/g, who), who);

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
        <div className="mt-7 grid gap-2.5 sm:grid-cols-2">
          {GENRES.map((g) => {
            const on = kdramaGenre === g;
            return (
              <button
                key={g}
                type="button"
                aria-pressed={on}
                onClick={() => setKdramaGenre(g)}
                className={`focus-ring flex min-h-[72px] items-center gap-3.5 rounded-2xl border-[1.5px] p-3.5 text-left transition-colors duration-150 ${
                  on ? 'border-accent bg-accent/[0.05]' : 'border-rule bg-paper-hi hover:border-rule-strong hover:bg-paper-lo/60'
                }`}
              >
                <OptionMark id={GENRE_MARK[g]} active={on} size={34} />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className={`block font-disp text-[17px] leading-tight ${on ? 'text-ink' : 'text-ink-2'}`}>
                    {t(`kdrama.genre.${g}.label`)}
                  </span>
                  <span className="block text-[12px] leading-snug text-ink-4">
                    {t(`kdrama.genre.${g}.tagline`)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-7">
          <label htmlFor="kdrama-name" className="eyebrow mb-2 block text-[8.5px] text-ink-4">
            {t('kdrama.name_label')}
          </label>
          <input
            id="kdrama-name"
            type="text"
            value={koreanName}
            onChange={(e) => setKoreanName(e.target.value)}
            placeholder={String(t('kdrama.name_placeholder'))}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="h-[56px] w-full rounded-2xl border-[1.5px] border-rule-strong bg-paper-hi px-5 font-disp text-[20px] text-ink caret-accent outline-none transition-colors duration-150 placeholder:font-body placeholder:text-[15px] placeholder:text-ink-4 focus:border-accent"
          />
          {/* only on a Korean page: elsewhere the preview would repeat what was
              just typed, which reads as the field stuttering */}
          <span className="mt-2 block h-[22px] font-brush text-[19px] leading-none text-accent">
            {lang === 'ko' ? displayName(koreanName, lang) : ''}
          </span>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-4">{t('kdrama.name_hint')}</p>
        </div>

        <Button full className="mt-6" disabled={kdramaGenre === null || koreanName.trim() === ''} onClick={() => setKdramaStep(1)}>
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

  /* Past the intro both are set. A deep link straight into scene seven is the
     only way to be here without them, and half the scenes speak to the name
     while the genre decides which twelve they are, so it goes back to the top.
     Placed here rather than above the intro so the rest of the component can
     see that kdramaGenre is a Genre. */
  if (kdramaGenre === null || koreanName.trim() === '') {
    setKdramaStep(0);
    return null;
  }

  // ---- the six questions --------------------------------------------------
  if (!onCard) {
    const index = kdramaStep - 1;
    const scene = sceneAt(kdramaGenre, index, kdramaAnswers);
    const selected = kdramaAnswers[index];
    const act = actOf(index);


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

        {/* one block per sentence, the way the premise and the recaps are set.
            A scene is a slug line and then what happens — "회식 2차." wrapping
            into the middle of the next clause read as one long run-on. */}
        <h2 className="mb-2.5 mt-3 -ml-[0.035em] flex flex-col text-pretty font-disp text-[29px] leading-[1.1] tracking-tight text-ink md:text-[38px]">
          {sentences(named(t(`kdrama.${kdramaGenre}.q.${scene.id}.title`))).map((line) => (
            <span key={line} className="block">{line}</span>
          ))}
        </h2>

        <div className="mt-6 grid gap-2.5">
          {scene.options.map((optionId, o) => {
            const on = selected === o;
            return (
              <button
                key={optionId}
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
                  {named(t(`kdrama.${kdramaGenre}.q.${scene.id}.options.${optionId}`))}
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
  if (!casting) {
    // only reachable if the step was pushed past the questions unanswered
    setKdramaStep(1);
    return null;
  }

  /* The six roles and the two tempers are the index into the poster, never a
     word on it. 주인공 on a card is a verdict about a person; a title is a
     thing that exists because they played it. */
  const poster = `kdrama.${kdramaGenre}.poster.${casting.typeKey}`;

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
          <span className="eyebrow text-[8.5px] tracking-[0.26em] text-ink-4">
            {t(`kdrama.genre.${kdramaGenre}.label`)}
          </span>

          <OpticalText className="mt-3 block text-center font-disp text-[27px] leading-tight text-ink md:text-[31px]">
            {named(t(`${poster}.title`))}
          </OpticalText>

          <span className="mt-2.5 block text-[11.5px] leading-none text-ink-4">
            {t(`kdrama.genre.${kdramaGenre}.slot`)}
          </span>

          <span className="my-6 block h-px w-11 bg-accent" />

          <div className="flex w-full max-w-[280px] flex-col gap-3.5">
            {AXES.map((axis) => (
              <span key={axis} className="flex items-center gap-3">
                {/* the same tile the quiz options and the impression card use —
                    a mark on bare paper beside a tiled one reads as a
                    background that was meant to be taken off */}
                <OptionMark id={MARK[axis]} active size={26} />
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
            {sentences(named(t(`${poster}.logline`))).map((line) => (
              <span key={line} className="block">{line}</span>
            ))}
          </span>

          <span className="eyebrow mt-7 text-[9px] tracking-[0.28em] text-ink-4">GANADA.COM</span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        <Button full onClick={handleDownload} disabled={isSaving || isSharing}>
          {isSaving ? t('result.buttons.downloading') : t('result.buttons.download')}
        </Button>
        <Button full variant="secondary" onClick={handleShare} disabled={isSaving || isSharing}>
          {isSharing ? t('result.buttons.sharing') : t('result.buttons.share')}
        </Button>
        <Button variant="ghost" full className="mt-1" onClick={resetKdrama}>
          {t('kdrama.again')}
        </Button>
      </div>

      <p className="mt-7 whitespace-pre-line text-[12.5px] leading-relaxed text-ink-4">
        {t('kdrama.disclaimer')}
      </p>

      <AdSlot size="300x250" className="mt-8" />
    </div>
  );
}
