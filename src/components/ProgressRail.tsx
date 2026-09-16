import { QUESTION_STEPS } from '../store/useFlowStore';
import { useTranslation } from '../hooks/useTranslation';

/**
 * The rail across the top of every situation, and of the surname screen.
 *
 * The answered slots briefly held the ink drawing the visitor had picked. It
 * looked better and read worse: a plum branch at 26px does not tell anyone they
 * answered "spring", so the rail stopped saying where you were and started
 * asking you to decode it. Marks of position beat marks of content here.
 *
 * Each label hangs off its own diamond rather than living in a second row.
 * A row of its own spaced the label *boxes* evenly, which is not the same as
 * putting each label over its mark — measured at seven slots, 회식 sat 15px
 * left of the diamond it belonged to.
 *
 * Below `sm` only the current label is shown. Seven of them do not fit on a
 * phone at any size worth reading, and a row of overlapping words is worse than
 * no words at all: the diamonds still say how far along you are.
 */
/* The timeline is the walk, and only the walk: six situations, six diamonds.
   Everything either side of it is a decision rather than a stop — who the
   name is for, which of the three it is, which family it joins — and each of
   those stands on a screen of its own with no rail at all. A rail that grows
   a diamond every time the flow gains a screen stops telling anyone how far
   along they are, which is the only thing it is for. */
const SLOTS = [...QUESTION_STEPS] as const;
type Slot = (typeof SLOTS)[number];

export default function ProgressRail({ current }: { current: Slot }) {
  const { t } = useTranslation();
  const index = SLOTS.indexOf(current);
  const last = SLOTS.length - 1;

  return (
    <div className="relative flex items-center gap-2 pb-6">
      {SLOTS.map((slot, i) => (
        <span key={slot} className="contents">
          <span className="relative block h-[9px] w-[9px] shrink-0">
            <span
              className={`block h-full w-full rotate-45 border ${
                i < index ? 'border-accent bg-accent'
                  : i === index ? 'border-[1.5px] border-accent bg-paper'
                  : 'border-rule-strong bg-paper'
              }`}
            />
            {/* every label centred on its own diamond, the ends included. The
                first and last were clamped to the rail's edges so they could
                not overhang it, which put them off their marks by half their
                own width — the one place the eye checks the alignment. The few
                pixels they hang into belong to the screen's own padding. */}
            <span
              className={`eyebrow absolute left-1/2 top-[15px] -translate-x-1/2 whitespace-nowrap text-[8.5px] ${
                i === index ? 'text-accent' : 'text-ink-4 max-sm:hidden'
              }`}
            >
              {t(`layout.steps.${slot}`)}
            </span>
          </span>
          {i < last && (
            <span className={`h-px flex-1 ${i < index ? 'bg-accent' : 'bg-rule'}`} />
          )}
        </span>
      ))}
    </div>
  );
}
