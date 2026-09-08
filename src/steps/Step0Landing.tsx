import { useFlowStore } from '../store/useFlowStore';
import { useTranslation } from '../hooks/useTranslation';
import Button, { ArrowRight } from '../components/Button';
import ChromaticImage from '../components/ChromaticImage';

/** One brush drawing per promise: a tied knot, a scroll, a bell, a seal. */
const FEATURE_MARKS = [
  { id: 'feature-bond', color: '#3E6BA8' },
  { id: 'feature-meaning', color: '#6E5A7A' },
  { id: 'feature-sound', color: '#4F7A8A' },
  { id: 'feature-keep', color: '#A83B27' },
];

function tint(hex: string, alpha: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

export default function Step0Landing() {
  const { givenName, setGivenName, next } = useFlowStore();
  const { t } = useTranslation();
  const features: { title: string; desc: string }[] = t('landing.features') || [];

  return (
    <div className="relative w-full">
      {/* The original painting, at 32 KB instead of 1.7 MB. It is masked rather
          than covered: two flat gradients over it washed it out entirely and
          left a hard seam where the block ended. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[92vh] overflow-hidden">
        <ChromaticImage
          src="/bg-mountain.webp"
          alt=""
          backgroundColor="#EDF1F9"
          /* far below the reference values: on a misty ink painting the effect
             should read as the air moving, not as a glitch */
          zoom={0.05}
          displacement={0.014}
          chromaticShift={0.0035}
          tilt={0}
          className="absolute inset-0 opacity-70"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 4%, #000 34%, #000 62%, transparent 96%)',
            maskImage: 'linear-gradient(to bottom, transparent 4%, #000 34%, #000 62%, transparent 96%)',
          }}
        />
        {/* a soft scrim only where the type sits, so the headline stays legible
            without flattening the whole picture */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(58% 34% at 50% 40%, rgba(237,241,249,0.92) 0%, rgba(237,241,249,0.55) 55%, rgba(237,241,249,0) 100%)',
          }}
        />
      </div>
      <div className="grain" />

      <section className="relative z-10 flex min-h-[calc(100dvh-150px)] flex-col items-center justify-center px-6 py-14 text-center">
        <h1 className="max-w-[740px] whitespace-pre-line font-disp text-[38px] leading-[1.06] tracking-tight text-ink md:text-[58px]">
          {t('landing.title_main')}
        </h1>

        <p className="mt-4 max-w-[460px] text-pretty text-[15.5px] leading-relaxed text-ink-3 md:text-[17px]">
          {t('landing.subtitle')}
        </p>

        <div className="mt-10 w-full max-w-[560px]">
          <label htmlFor="given-name" className="sr-only">{t('name.label')}</label>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <input
              id="given-name"
              type="text"
              value={givenName}
              onChange={(e) => setGivenName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') next(); }}
              placeholder={t('name.placeholder_long')}
              /* the browser's saved-name dropdown covered the field on every
                 focus, which is not a suggestion anyone asked this site for */
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
              className="h-[60px] flex-1 rounded-2xl border-[1.5px] border-rule-strong bg-paper-hi px-6 text-center font-disp text-[22px] text-ink caret-accent shadow-[0_8px_24px_-18px_rgba(23,24,26,0.35)] outline-none transition-colors duration-150 placeholder:font-body placeholder:text-[16px] placeholder:text-ink-4 focus:border-accent sm:text-left"
            />
            <Button shape="box" onClick={next} className="h-[60px] shrink-0 px-7">
              {t('landing.cta_button')}
              <ArrowRight />
            </Button>
          </div>

          <p className="mt-5 text-[12.5px] leading-relaxed text-ink-4">{t('landing.trust')}</p>
        </div>
      </section>

      <section className="relative z-10 px-6 pb-14 pt-4 lg:mx-auto lg:w-[1024px] lg:px-4 xl:w-[1200px]">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="eyebrow">{t('landing.features_label')}</span>
          <span className="hairline" />
        </div>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => {
            const mark = FEATURE_MARKS[i] ?? FEATURE_MARKS[0];
            return (
              <li
                key={i}
                className="flex flex-col gap-3 rounded-2xl border border-rule bg-paper-hi p-5 transition-colors duration-150 hover:border-rule-strong"
              >
                <span
                  className="block h-11 w-11 overflow-hidden rounded-xl"
                  style={{
                    boxSizing: 'border-box',
                    backgroundColor: tint(mark.color, 0.1),
                    border: `1px solid ${tint(mark.color, 0.22)}`,
                  }}
                  aria-hidden="true"
                >
                  <img
                    src={`/marks/${mark.id}.webp`}
                    alt=""
                    width={44}
                    height={44}
                    className="block h-full w-full object-contain mix-blend-multiply"
                  />
                </span>
                <span className="font-disp text-[20px] leading-tight text-ink">{f.title}</span>
                <span className="text-pretty text-[13.5px] leading-relaxed text-ink-3">{f.desc}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
