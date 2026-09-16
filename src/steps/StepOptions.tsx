import { QUESTION_STEPS, useFlowStore, type QuestionStep } from '../store/useFlowStore';
import { useTranslation } from '../hooks/useTranslation';
import { useEnterAdvance } from '../hooks/useEnterAdvance';
import { SITUATIONS } from '../data/situations';
import { sentences } from '../utils/sentences';
import ProgressRail from '../components/ProgressRail';
import CheckMark from '../components/CheckMark';
import Button, { ArrowLeft, ArrowRight } from '../components/Button';

/**
 * One screen per situation.
 *
 * This used to be four grids of adjectives, which asked the visitor to judge
 * how 서연 sounds — a job nobody outside Korea can do. Six moments from a day
 * here ask what they would *do*, and the site reads the adjectives out of that.
 *
 * No marks on these cards. The ink drawings are one per adjective, and there
 * are no adjectives on this screen any more; a plum branch beside a sentence
 * about a barista is decoration pretending to be information.
 */
export default function StepOptions({ step }: { step: QuestionStep }) {
  const { nameAnswers, nameVariants, setNameAnswer, next, prev } = useFlowStore();
  const { t } = useTranslation();

  const index = QUESTION_STEPS.indexOf(step);
  const situation = SITUATIONS[index];
  /* one of three tellings of the same question. Which one changes nothing about
     the answer: the tags sit on the situation, not on the telling. */
  const variant = situation.variants[nameVariants[index] ?? 0];
  const key = `situations.${situation.id}.${variant.id}`;
  const selected = nameAnswers[index];

  useEnterAdvance(selected !== null && selected !== undefined, next);

  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-1 flex-col px-6 pb-8 pt-5 lg:px-4">
      <ProgressRail current={step} />

      <div className="pb-5 pt-7">
        {/* one block per sentence: a situation is where you are and then what is
            happening, and the two wrapping together read as one run-on */}
        <h2 className="mb-2.5 -ml-[0.035em] flex flex-col text-pretty font-disp text-[29px] leading-[1.1] tracking-tight text-ink md:text-[38px]">
          {sentences(String(t(`${key}.title`))).map((line) => (
            <span key={line} className="block">{line}</span>
          ))}
        </h2>
        <p className="text-[14px] leading-relaxed text-ink-3 md:text-[15px]">
          {t(`${key}.description`)}
        </p>
      </div>

      <div className="grid gap-2.5">
        {variant.options.map((optionId, o) => {
          const on = selected === o;
          return (
            <button
              key={optionId}
              type="button"
              aria-pressed={on}
              onClick={() => setNameAnswer(index, o)}
              /* border width is identical in both states so the box never
                 resizes — that shift is what made these feel like they wobbled */
              className={`focus-ring flex min-h-[68px] items-center gap-3 rounded-2xl border-[1.5px] p-4 text-left transition-colors duration-150 ${
                on
                  ? 'border-accent bg-accent/[0.05]'
                  : 'border-rule bg-paper-hi hover:border-rule-strong hover:bg-paper-lo/60'
              }`}
            >
              <span className={`min-w-0 flex-1 text-balance font-disp text-[17px] leading-snug md:text-[18px] ${on ? 'text-ink' : 'text-ink-2'}`}>
                {t(`${key}.options.${optionId}`)}
              </span>
              <CheckMark on={on} />
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 pt-9">
        <Button variant="ghost" onClick={prev} className="px-3">
          <ArrowLeft />
          {t('layout.buttons.prev')}
        </Button>
        <Button onClick={next} disabled={selected === null || selected === undefined}>
          {t('layout.buttons.next')}
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
