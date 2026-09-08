import { useFlowStore } from '../store/useFlowStore';
import { useTranslation } from '../hooks/useTranslation';
import { useMatches } from '../hooks/useMatches';
import { markColor } from '../components/OptionMark';
import type { Match } from '../utils/nameMatcher';

/**
 * nameMatcher already scored and sorted all 114 names and then threw away
 * everything but the top one. Showing three costs a slice and buys a page view,
 * a real sense of choice, and a result the visitor picked rather than received.
 */

function tint(hex: string, alpha: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function Candidate({ match, rank, onPick }: { match: Match; rank: number; onPick: () => void }) {
  const { t } = useTranslation();
  const { vibe, personality, seasonNature } = useFlowStore();
  const closest = rank === 0;

  const tags = [
    seasonNature && match.name.nature.includes(seasonNature) ? seasonNature : null,
    vibe && match.name.vibes.includes(vibe) ? vibe : null,
    personality && match.name.personalities.includes(personality) ? personality : null,
  ].filter(Boolean) as string[];

  const group = (id: string) =>
    seasonNature === id ? 'nature' : vibe === id ? 'vibe' : personality === id ? 'personality' : 'gender';

  return (
    <button
      type="button"
      onClick={onPick}
      className={`focus-ring relative w-full rounded-3xl p-5 text-left transition-colors duration-150 ${
        closest ? 'border-[1.5px] border-accent bg-paper-hi shadow-[0_16px_34px_-26px_rgba(31,99,232,0.45)]' : 'border-[1.5px] border-rule bg-paper-hi hover:border-rule-strong'
      }`}
    >
      {closest && (
        <span className="absolute -top-px right-5 rounded-b-lg bg-accent px-2.5 py-[3px] text-[8.5px] font-semibold uppercase tracking-[0.2em] text-paper">
          {t('choice.closest')}
        </span>
      )}

      <div className="flex items-end gap-3.5">
        <span className="font-brush text-[48px] leading-[0.9] tracking-wide text-ink md:text-[54px]">
          {match.name.hangul}
        </span>
        <div className="flex flex-col gap-0.5 pb-1">
          <span className="font-disp text-[21px] leading-none text-ink-2">
            {match.name.id.charAt(0).toUpperCase() + match.name.id.slice(1)}
          </span>
          {match.name.hanja !== match.name.hangul && (
            <span className="text-[13px] tracking-[0.12em] text-ink-4">{match.name.hanja}</span>
          )}
        </div>
      </div>

      <div className="my-3.5 h-px bg-rule" />

      <p className="mb-3 font-disp text-[17px] leading-snug text-ink md:text-[18px]">
        “{t(`names.${match.name.id}.shortMeaning`)}”
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        {tags.map((id) => {
          const color = markColor(id);
          return (
            <span
              key={id}
              className="rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wider"
              style={{ color, backgroundColor: tint(color, 0.1), borderColor: tint(color, 0.3) }}
            >
              {t(`options.${group(id)}.${id}`)}
            </span>
          );
        })}
      </div>
    </button>
  );
}

export default function StepChoice() {
  const { choose, prev } = useFlowStore();
  const { t } = useTranslation();
  const { matches, sound } = useMatches();

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col px-6 pb-10 pt-7 lg:px-4">
      <div className="mb-4 flex items-center gap-2">
        <span className="block h-px w-3.5 bg-accent" />
        <span className="eyebrow text-accent">{t('choice.eyebrow')}</span>
      </div>

      <h2 className="mb-2.5 -ml-[0.035em] whitespace-pre-line font-disp text-[31px] leading-[1.14] tracking-tight text-ink md:text-[38px]">
        {t('choice.title')}
      </h2>
      <p className="mb-6 whitespace-pre-line text-[14px] leading-relaxed text-ink-3">{t('choice.sub')}</p>

      {sound.tried && !sound.matched && (
        <p className="mb-6 rounded-sm border border-l-[3px] border-rule border-l-pig-jeok bg-paper-hi p-3.5 text-[13px] leading-relaxed text-ink-3">
          {t('choice.no_sound')}
        </p>
      )}

      <div className="flex flex-col gap-3.5">
        {matches.map((match, i) => (
          <Candidate key={match.name.id} match={match} rank={i} onPick={() => choose(match.name.id)} />
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center gap-3.5">
        <span className="h-px w-full bg-rule" />
        <button
          type="button"
          onClick={prev}
          className="focus-ring min-h-[44px] text-[13.5px] text-ink-3 hover:text-accent"
        >
          {t('choice.change')}
        </button>
      </div>
    </div>
  );
}
