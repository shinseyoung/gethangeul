import { useEffect, useRef, useState } from 'react';
import { useFlowStore } from '../store/useFlowStore';
import { useTranslation } from '../hooks/useTranslation';
import WordDraw from '../components/WordDraw';
import AdSlot from '../components/AdSlot';
import Button, { ArrowRight } from '../components/Button';

/**
 * The loading beat: a word writes itself while a number climbs, and nothing
 * else is on screen until it finishes. The display slot and the button fade up
 * afterwards, so the moment stays clean and the slot still gets real dwell time.
 */

const DURATION = 3400;
const WORD = '한글';

/** slow, then quick, then settling — a constant rate reads as a machine */
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export default function StepLoading() {
  const next = useFlowStore((s) => s.next);
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const raw = Math.min(1, (now - start) / DURATION);
      setProgress(ease(raw));
      if (raw < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);

    // Browsers stop firing rAF in a background tab. Without this, switching away
    // mid-load and coming back to a different tab leaves the bar frozen and the
    // button disabled for good; a timer finishes the job either way.
    const safety = setTimeout(() => setProgress(1), DURATION + 250);

    return () => {
      cancelAnimationFrame(frame.current);
      clearTimeout(safety);
    };
  }, []);

  const done = progress >= 0.999;
  const pct = Math.round(progress * 100);

  const stages = [t('loading.stage1'), t('loading.stage2'), t('loading.stage3'), t('loading.stage4')];
  const stage = stages[Math.min(stages.length - 1, Math.floor(progress * stages.length))];

  return (
    <div className="relative flex w-full flex-1 flex-col">
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-[900ms] ease-out"
        style={{
          opacity: 0.25 + progress * 0.55,
          background: 'radial-gradient(115% 62% at 50% 20%, rgba(31,99,232,0.15) 0%, rgba(31,99,232,0) 62%)',
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[520px] flex-1 flex-col px-6 pb-8 lg:px-4">
        <div
          className="flex flex-col items-center justify-center transition-[min-height,padding] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ minHeight: done ? '34vh' : '68vh', paddingTop: done ? 12 : 0 }}
        >
          <WordDraw
            text={WORD}
            progress={progress}
            className="w-full max-w-[230px] text-ink"
          />

          <div className="mt-7 flex items-baseline gap-2.5">
            <span className="font-disp text-[22px] leading-none tabular-nums text-accent">{pct}%</span>
            <span className="text-[13.5px] leading-none text-ink-3">{done ? t('loading.ready') : stage}</span>
          </div>
        </div>

        <div
          className="flex flex-1 flex-col justify-end transition-all duration-500 ease-out"
          style={{
            opacity: done ? 1 : 0,
            transform: done ? 'translateY(0)' : 'translateY(14px)',
            pointerEvents: done ? 'auto' : 'none',
          }}
          aria-hidden={!done}
        >
          <AdSlot size="336x280" />
          <Button full onClick={next} disabled={!done} className="mt-6">
            {t('weaving.reveal')}
            <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
