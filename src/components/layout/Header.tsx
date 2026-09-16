import { useEffect, useRef, useState } from 'react';
import { LANGUAGES, useFlowStore } from '../../store/useFlowStore';
import { useTranslation } from '../../hooks/useTranslation';
import OpticalText from '../OpticalText';

function Globe({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
    </svg>
  );
}

/** One menu row. Each language needs its own optical correction, and a hook
 *  cannot be called in a loop, so the row is its own component.
 *
 *  `font-endonym`, not `font-body` — and not `eyebrow`, which @apply pulls the
 *  html[lang='ko'] variant of `font-body` into. These eight words are the same
 *  in every language, so they must not be restyled by the language: picking
 *  Korean used to redraw all eight, 12–20% wider or narrower, while the menu
 *  was still fading out under the cursor. */
function LanguageRow({
  endonym, english, selected, onSelect,
}: { endonym: string; english: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className={`flex min-h-[52px] w-full items-center border-l-[3px] px-4 text-left transition-colors hover:bg-paper-lo ${
        selected ? 'border-accent bg-accent/5' : 'border-transparent'
      }`}
    >
      {/* the pair is top-heavy — 15px over 8px — so it carries a small bias
          on top of each script's own optical correction */}
      <span className="flex flex-col justify-center gap-[3px]">
        <OpticalText
          bias={1}
          className={`block font-endonym text-[15px] leading-none ${selected ? 'text-ink' : 'text-ink-2'}`}
        >
          {endonym}
        </OpticalText>
        <OpticalText
          bias={1}
          className="block font-endonym text-[8px] font-semibold uppercase leading-none tracking-eyebrow text-ink-4"
        >
          {english}
        </OpticalText>
      </span>
    </button>
  );
}

export function Header() {
  const { lang, setLang, langAutoPicked, dismissLangHint, tool, setTool, koreanName } = useFlowStore();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];
  const others = LANGUAGES.filter((l) => l.code !== lang);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-30 w-full shrink-0 bg-ground/90 backdrop-blur-md">
      <div className="flex h-[58px] w-full items-center justify-between border-b border-rule px-6 md:h-[70px] lg:mx-auto lg:w-[1024px] lg:px-4 xl:w-[1200px]">
        <button
          type="button"
          /* Out to the landing, wherever you are. It is the one place a name
             starts, and with the name remembered the field is already filled,
             so this is one tap from any room back to the beginning rather than
             a reset that throws your place away. */
          onClick={() => {
            const s = useFlowStore.getState();
            s.setTool('name');
            s.restart();
          }}
          className="focus-ring flex flex-col gap-[5px] text-left transition-opacity hover:opacity-70"
        >
          {/* No line under it. Every phrase that covered all five rooms came out
              as vague as the rooms are various — "Korea, for fun" says nothing
              the landing page does not say better. A wordmark that does not
              explain itself is the more confident of the two. */}
          <span /* uppercase costs width: GANADA at 22px measured 99px against
     gethangeul's 62, which is most of what the bar has at 375. */
          className="font-disp text-[18px] uppercase leading-none tracking-[0.06em] text-ink sm:text-[22px] md:text-[25px]">
            ganada
          </span>
        </button>

        {/* Your name, and nothing else.
            Two dropdowns listing five rooms was a menu of features, which is
            what the site stopped being: there is one subject here and the rooms
            all hang off it. So the header carries the subject. Tapping it goes
            to the reading, which is where the four rooms are listed — one link
            back rather than a copy of the whole map in the bar.
            Nothing before there is a name: then the logo is the only way, and
            it goes to the landing, which is the only place a name starts. */}
        {koreanName && (
          <button
            type="button"
            onClick={() => setTool('impression')}
            aria-label={String(t('rooms.impression.title'))}
            aria-current={tool === 'impression' ? 'page' : undefined}
            className={`focus-ring flex min-h-[38px] max-w-[42vw] items-center rounded-full px-3 transition-colors ${
              tool === 'impression' ? 'bg-accent/[0.09]' : 'hover:bg-accent/[0.05]'
            }`}
          >
            <OpticalText
              className={`block truncate font-brush text-[17px] leading-none md:text-[19px] ${
                tool === 'impression' ? 'text-accent' : 'text-ink-2'
              }`}
            >
              {koreanName}
            </OpticalText>
          </button>
        )}

        <div className="relative" ref={boxRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-haspopup="listbox"
            /* this button has no fill of its own, so it hovers straight onto the blue
               ground — the warm-grey paper-lo read as yellow there */
            className={`focus-ring flex min-h-[44px] items-center gap-2 rounded-full border px-3.5 text-ink-2 transition-colors ${
              open ? 'border-accent bg-accent/[0.07]' : 'border-rule-strong hover:border-accent/40 hover:bg-accent/[0.06]'
            }`}
          >
            <OpticalText className="block font-endonym text-[13.5px] leading-none">
              {current.endonym}
            </OpticalText>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"
              className={`h-3 w-3 shrink-0 text-ink-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          <div
            role="listbox"
            /* fades only, and leaves at once: the click that closes it also
               changes the page behind it — here, into another language */
            className={`absolute right-0 top-full z-50 mt-2 w-[230px] overflow-hidden rounded-2xl border border-rule-strong bg-paper-hi shadow-[0_20px_44px_-26px_rgba(23,24,26,0.45)] transition-[opacity,transform] ease-out ${
              open ? 'translate-y-0 opacity-100 duration-150' : 'pointer-events-none -translate-y-1 opacity-0 duration-0'
            }`}
          >
            {LANGUAGES.map((item) => (
              <LanguageRow
                key={item.code}
                endonym={item.endonym}
                english={item.english}
                selected={item.code === lang}
                onSelect={() => { setLang(item.code); setOpen(false); }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Shown once, when the language was guessed from the browser rather than chosen. */}
      {langAutoPicked && (
        <div className="border-b border-rule bg-accent/[0.045]">
          <div className="flex w-full items-start gap-3 px-6 py-3 lg:mx-auto lg:w-[1024px] lg:px-4 xl:w-[1200px]">
            <Globe className="mt-0.5 h-[15px] w-[15px] shrink-0 text-accent" />
            <div className="flex flex-1 flex-col gap-2">
              <span className="text-[12.5px] leading-snug text-ink-2">
                {String(t('header.detected')).replace('{lang}', current.endonym)}
              </span>
              <div className="flex flex-wrap gap-2">
                {others.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setLang(item.code)}
                    className={`focus-ring rounded-full border border-rule-strong bg-paper-hi px-3 py-1.5 text-[12px] text-ink-2 font-endonym transition-colors hover:border-accent hover:text-accent`}
                  >
                    {item.endonym}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={dismissLangHint}
              className="focus-ring eyebrow shrink-0 text-[8px] text-ink-4 hover:text-ink-2"
            >
              {t('header.dismiss')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
