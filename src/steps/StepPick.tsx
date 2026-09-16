import { useFlowStore } from '../store/useFlowStore';
import { useTranslation } from '../hooks/useTranslation';
import { useMatches } from '../hooks/useMatches';
import Button from '../components/Button';
import CheckMark from '../components/CheckMark';

/**
 * Three names, and the visitor takes one.
 *
 * The scorer has always ranked the pool and returned three; the flow simply
 * handed over the top one and threw the other two away. Showing them is what
 * makes the answer feel chosen rather than assigned — and the second and third
 * are genuinely close, so there is a decision to make.
 */
export default function StepPick() {
  const { picked, setPicked, next, prev } = useFlowStore();
  const { t } = useTranslation();
  const { matches } = useMatches();

  if (matches.length === 0) return null;

  return (
    <div className="mx-auto w-full max-w-[620px] px-5 pb-24 pt-6 lg:px-4">
      <span className="eyebrow text-[8.5px] tracking-[0.26em] text-accent">{t('pick.eyebrow')}</span>
      <h1 className="mb-2.5 mt-3 -ml-[0.035em] font-disp text-[31px] leading-[1.08] tracking-tight text-ink md:text-[40px]">
        {t('pick.title')}
      </h1>
      <p className="text-[14px] leading-relaxed text-ink-3 md:text-[15px]">{t('pick.sub')}</p>

      <div className="mt-7 flex flex-col gap-2.5">
        {matches.map((match, i) => {
          const on = picked === i;
          return (
            <button
              key={match.name.id}
              type="button"
              aria-pressed={on}
              onClick={() => setPicked(i)}
              className={`focus-ring flex min-h-[86px] items-center gap-5 rounded-2xl border-[1.5px] px-5 py-4 text-left transition-colors duration-150 ${
                on ? 'border-accent bg-accent/[0.05]' : 'border-rule bg-paper-hi hover:border-rule-strong'
              }`}
            >
              <span className="font-brush text-[34px] leading-none text-ink">{match.name.hangul}</span>
              <span className="flex flex-1 flex-col gap-1.5">
                <span className="block font-disp text-[15px] leading-none text-ink-2">
                  {match.name.id.charAt(0).toUpperCase() + match.name.id.slice(1)}
                </span>
                <span className="text-[12.5px] leading-[1.4] text-ink-3">
                  {t(`names.${match.name.id}.shortMeaning`)}
                </span>
              </span>
              <CheckMark on={on} />
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={prev}>{t('layout.buttons.prev')}</Button>
        <Button onClick={next}>{t('layout.buttons.next')}</Button>
      </div>
    </div>
  );
}
