import { useFlowStore } from '../store/useFlowStore';
import { useTranslation } from '../hooks/useTranslation';
import Button from '../components/Button';
import ProgressRail from '../components/ProgressRail';

/**
 * The first screen after the landing: who the name is for.
 *
 * It used to sit on the surname screen, out of the way, so the flow would not
 * open with a form. But it is a hard filter on the whole pool — asked last, the
 * six situations had been scored against names the visitor was never going to
 * be offered. Asked first, everything after it is narrowed before it is scored.
 *
 * Three answers, all of them real. 성별 무관 keeps the whole pool and rewards
 * names actually tagged neutral, which is a different result from either of the
 * other two rather than a way of skipping the question.
 */
const CHOICES = ['female', 'male', 'neutral'] as const;

export default function StepGender() {
  const { gender, setGender, next } = useFlowStore();
  const { t } = useTranslation();

  return (
    <div className="mx-auto w-full max-w-[620px] px-5 pb-24 pt-6 lg:px-4">
      <ProgressRail current="gender" />

      <span className="eyebrow text-[8.5px] tracking-[0.26em] text-accent">{t('gender.eyebrow')}</span>
      <h1 className="mb-2.5 mt-3 -ml-[0.035em] font-disp text-[31px] leading-[1.08] tracking-tight text-ink md:text-[40px]">
        {t('gender.title')}
      </h1>
      <p className="text-[14px] leading-relaxed text-ink-3 md:text-[15px]">{t('gender.sub')}</p>

      <div className="mt-7 flex flex-col gap-2.5">
        {CHOICES.map((choice) => {
          const on = gender === choice;
          return (
            <button
              key={choice}
              type="button"
              aria-pressed={on}
              onClick={() => { setGender(choice); next(); }}
              className={`focus-ring flex min-h-[64px] items-center rounded-2xl border-[1.5px] px-5 text-left transition-colors duration-150 ${
                on ? 'border-accent bg-accent/[0.05]' : 'border-rule bg-paper-hi hover:border-rule-strong'
              }`}
            >
              <span className="flex flex-col gap-1">
                <span className="block font-disp text-[18px] leading-[1.25] text-ink">
                  {t(`options.gender.${choice}`)}
                </span>
                <span className="text-[12.5px] leading-[1.4] text-ink-3">
                  {t(`gender.note.${choice}`)}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={next} disabled={gender === null}>{t('layout.buttons.next')}</Button>
      </div>
    </div>
  );
}
