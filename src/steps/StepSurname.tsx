import { useState } from 'react';
import { useFlowStore } from '../store/useFlowStore';
import { useTranslation } from '../hooks/useTranslation';
import { useEnterAdvance } from '../hooks/useEnterAdvance';
import { useSurname } from '../hooks/useSurname';
import { familyToken } from '../utils/surnameMatcher';
import { SURNAME_DATABASE } from '../data/surnameDatabase';
import type { SurnameItem } from '../types/name';
import CheckMark from '../components/CheckMark';
import Button, { ArrowLeft, ArrowRight } from '../components/Button';

/**
 * Picking a family name, which is not a fifth question.
 *
 * A Korean surname is inherited, not chosen by temperament, so it must never
 * fall out of the four answers — this screen exists so the site does not teach
 * that it does. Sound narrows forty to a handful; the rest stay one tap away.
 */
export default function StepSurname() {
  const { givenName, lang, surnameId, setSurname, next, prev } = useFlowStore();
  const { t } = useTranslation();
  const { surname, suggestion, chosen } = useSurname();

  /* the same thing 다음 does: an untouched screen takes the suggestion */
  useEnterAdvance(true, () => { if (!surnameId) setSurname(surname.id); next(); });

  const suggested = suggestion.matches;
  const suggestedIds = new Set(suggested.map((s) => s.id));
  const rest = SURNAME_DATABASE.filter((s) => !suggestedIds.has(s.id));
  const token = familyToken(givenName, lang);

  // Coming back from the result to change a surname that was picked out of the
  // full list: leaving it collapsed showed a screen with nothing selected on it.
  const [showAll, setShowAll] = useState(() => !suggestedIds.has(surname.id));

  const Card = ({ item }: { item: SurnameItem }) => {
    // Nothing on this screen is "chosen" until the visitor chooses. The opening
    // guess is marked as a suggestion instead, because a card wearing the same
    // selected state as every other screen claims an answer nobody gave.
    const on = chosen && item.id === surname.id;
    const suggested = !chosen && item.id === surname.id;
    return (
      <button
        type="button"
        aria-pressed={on}
        onClick={() => setSurname(on ? null : item.id)}
        className={`focus-ring flex min-h-[78px] items-center gap-3.5 rounded-2xl border-[1.5px] p-3.5 text-left transition-colors duration-150 ${
          on
            ? 'border-accent bg-accent/[0.05]'
            : suggested
              ? 'border-dashed border-accent/50 bg-accent/[0.02] hover:border-solid hover:border-accent'
              : 'border-rule bg-paper-hi hover:border-rule-strong hover:bg-paper-lo/60'
        }`}
      >
        <span className={`font-brush text-[32px] leading-none ${on || suggested ? 'text-ink' : 'text-ink-2'}`}>
          {item.hangul}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-baseline gap-1.5">
            <span className="font-disp text-[17px] leading-none text-ink">{item.roman}</span>
            <span className="text-[12px] leading-none text-ink-4">{item.hanja}</span>
          </span>
          <span className="text-[12.5px] leading-snug text-ink-3">{t(`surnames.${item.id}.meaning`)}</span>
          <span className="text-[11px] leading-none text-ink-4">
            {item.share < 0.1
              ? t('surname.share_rare')
              : String(t('surname.share')).replace('{share}', String(item.share))}
          </span>
        </span>
        {suggested ? (
          <span className="eyebrow shrink-0 text-[7.5px] tracking-[0.18em] text-accent">
            {t('surname.suggested')}
          </span>
        ) : (
          <CheckMark on={on} />
        )}
      </button>
    );
  };

  const grid = 'grid gap-2.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-1 flex-col px-6 pb-8 pt-5 lg:px-4">
      <div className="pb-5 pt-7">
        <span className="eyebrow text-[8.5px] tracking-[0.26em] text-accent">{t('surname.eyebrow')}</span>
        <h2 className="mb-2.5 mt-3 -ml-[0.035em] text-pretty font-disp text-[29px] leading-[1.1] tracking-tight text-ink md:text-[38px]">
          {t('surname.title')}
        </h2>
        <p className="text-[14px] leading-relaxed text-ink-3 md:text-[15px]">{t('surname.sub')}</p>
      </div>

      {suggested.length > 0 ? (
        <>
          <div className="mb-3.5 flex items-center gap-2.5">
            <span className="eyebrow">
              {String(t('surname.sounds_like')).replace('{name}', token ?? '')}
            </span>
            <span className="hairline" />
          </div>
          <div className={grid}>
            {suggested.map((item) => <Card key={item.id} item={item} />)}
          </div>

          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="focus-ring mt-4 self-start rounded-full border border-rule bg-paper-hi px-4 py-2 text-[12.5px] text-ink-2 transition-colors hover:border-rule-strong"
          >
            {showAll ? t('surname.browse_fewer') : t('surname.browse_all')}
          </button>

          {showAll && (
            <div className={`${grid} mt-4`}>
              {rest.map((item) => <Card key={item.id} item={item} />)}
            </div>
          )}
        </>
      ) : (
        <>
          <p className="mb-4 rounded-sm border border-l-[3px] border-rule border-l-pig-jeok bg-paper-hi p-3.5 text-[13px] leading-relaxed text-ink-3">
            {suggestion.tried ? t('surname.sounds_none') : t('surname.no_family_name')}
          </p>
          <div className={grid}>
            {SURNAME_DATABASE.map((item) => <Card key={item.id} item={item} />)}
          </div>
        </>
      )}

      <div className="mt-auto flex items-center justify-between gap-4 pt-9">
        <Button variant="ghost" onClick={prev} className="px-3">
          <ArrowLeft />
          {t('layout.buttons.prev')}
        </Button>
        <Button onClick={() => { if (!surnameId) setSurname(surname.id); next(); }}>
          {t('layout.buttons.next')}
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
