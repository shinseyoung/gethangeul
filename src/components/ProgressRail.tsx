import { QUESTION_STEPS } from '../store/useFlowStore';
import { useTranslation } from '../hooks/useTranslation';

/**
 * The rail across the top of every question, and of the surname screen.
 *
 * The answered slots briefly held the ink drawing the visitor had picked. It
 * looked better and read worse: a plum branch at 26px does not tell anyone they
 * answered "spring", so the rail stopped saying where you were and started
 * asking you to decode it. Marks of position beat marks of content here.
 */
const SLOTS = [...QUESTION_STEPS, 'surname'] as const;
type Slot = (typeof SLOTS)[number];

export default function ProgressRail({ current }: { current: Slot }) {
  const { t } = useTranslation();
  const index = SLOTS.indexOf(current);

  return (
    <div>
      <div className="flex items-center gap-2">
        {SLOTS.map((slot, i) => (
          <span key={slot} className="contents">
            <span
              className={`block h-[9px] w-[9px] rotate-45 border ${
                i < index ? 'border-accent bg-accent'
                  : i === index ? 'border-[1.5px] border-accent bg-paper'
                  : 'border-rule-strong bg-paper'
              }`}
            />
            {i < SLOTS.length - 1 && (
              <span className={`h-px flex-1 ${i < index ? 'bg-accent' : 'bg-rule'}`} />
            )}
          </span>
        ))}
      </div>
      <div className="mt-2.5 flex justify-between">
        {SLOTS.map((slot, i) => (
          <span key={slot} className={`eyebrow text-[8.5px] ${i === index ? 'text-accent' : 'text-ink-4'}`}>
            {t(`layout.steps.${i + 1}`)}
          </span>
        ))}
      </div>
    </div>
  );
}
