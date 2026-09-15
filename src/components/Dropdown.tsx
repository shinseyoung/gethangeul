import { useEffect, useRef, useState } from 'react';

/**
 * A number picker that looks like the rest of the site.
 *
 * `<select>` was correct and ugly: the list it drops is the operating system's,
 * not ours, and there is no property that reaches inside it — on Windows it is
 * a grey system menu in the system font, arriving in the middle of a page built
 * out of ink washes. This is the same disclosure the header menus use, so a
 * year list looks like a room list.
 *
 * Not a `role="listbox"`: that promises arrow-key navigation, and these are
 * plain buttons in a panel. Tab and Enter reach every option, Escape and a
 * click outside close it, and the current value is focused when it opens, which
 * is the part that matters with a hundred and twenty-five years in the list.
 */

interface Props {
  /** what this field is, for assistive tech — there is no visible label */
  label: string;
  value: number;
  /** shown when nothing is chosen yet */
  placeholder: string;
  options: number[];
  onChange: (value: number) => void;
  /** appended to the trigger, for flex sizing */
  className?: string;
}

export default function Dropdown({ label, value, placeholder, options, onChange, className = '' }: Props) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onClick = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  /* 1998 is eighty rows down a list that opens at 2044, so the panel opens on
     the year already chosen rather than at the top of it */
  useEffect(() => {
    if (!open || !panel.current) return;
    const current = panel.current.querySelector<HTMLButtonElement>('[data-current="true"]');
    (current ?? panel.current.querySelector('button'))?.focus({ preventScroll: true });
    current?.scrollIntoView({ block: 'center' });
  }, [open]);

  return (
    <div ref={box} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`focus-ring flex h-[56px] w-full items-center justify-between gap-2 rounded-2xl border-[1.5px] bg-paper-hi px-4 text-left font-disp text-[17px] transition-colors duration-150 ${
          open ? 'border-accent' : 'border-rule-strong hover:border-accent/40'
        } ${value ? 'text-ink' : 'text-ink-4'}`}
      >
        <span className="truncate">{value || placeholder}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"
          className={`h-3 w-3 shrink-0 text-ink-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* leaves at once, like the header panels: a list still fading while the
          value under it has already changed is a list you watch change */}
      <div
        ref={panel}
        /* out of the accessibility tree while closed, or a screen reader reads
           a hundred and twenty-five years sitting under the field. Its buttons
           are already untabbable when closed, so nothing focusable is hidden. */
        aria-hidden={!open}
        className={`absolute inset-x-0 top-full z-40 mt-2 max-h-[264px] overflow-y-auto overscroll-contain rounded-2xl border border-rule-strong bg-paper-hi py-1 shadow-[0_20px_44px_-26px_rgba(23,24,26,0.45)] transition-opacity ease-out ${
          open ? 'opacity-100 duration-150' : 'pointer-events-none opacity-0 duration-0'
        }`}
      >
        {options.map((option) => {
          const on = option === value;
          return (
            <button
              key={option}
              type="button"
              data-current={on}
              tabIndex={open ? 0 : -1}
              onClick={() => { onChange(option); setOpen(false); }}
              className={`flex min-h-[40px] w-full items-center border-l-[3px] px-4 text-left font-disp text-[16px] transition-colors hover:bg-paper-lo ${
                on ? 'border-accent bg-accent/5 text-ink' : 'border-transparent text-ink-2'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
