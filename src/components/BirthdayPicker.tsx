import { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';

/**
 * A birthday as three plain selects.
 *
 * `<input type="date">` was doing the job correctly and looking nothing like
 * the rest of the site: the calendar it opens is the browser's own, not ours,
 * and there is no way to dress it. Three selects are the site's own controls,
 * they read the same in every locale because each part is labelled, and picking
 * a year in a list beats scrolling a calendar back forty years.
 */

const FIRST = 1920;
const LAST = 2044;
const YEARS = Array.from({ length: LAST - FIRST + 1 }, (_, i) => LAST - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

/** Days in a month, so February in a leap year offers 29 and never 31. */
function daysIn(year: number, month: number): number {
  if (!year || !month) return 31;
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

const pad = (n: number) => String(n).padStart(2, '0');

interface Props {
  /** 'YYYY-MM-DD', or '' until all three are chosen */
  value: string;
  onChange: (iso: string) => void;
}

export default function BirthdayPicker({ value, onChange }: Props) {
  const { t } = useTranslation();

  /* The three parts live here, not in `value`.
     `value` is a whole date or nothing, so deriving the selects from it meant a
     half-finished birthday had nowhere to be: picking a year emitted '', which
     came straight back as no year, and the thing could never be completed. */
  const [parts, setParts] = useState(() => {
    const [yy, mm, dd] = value ? value.split('-').map(Number) : [0, 0, 0];
    return { y: yy || 0, m: mm || 0, d: dd || 0 };
  });
  const { y, m, d } = parts;

  const set = (year: number, month: number, day: number) => {
    // a day that no longer exists — 31 May, then February — clamps rather than
    // silently emitting a date the zodiac reader will refuse
    const clamped = year && month && day ? Math.min(day, daysIn(year, month)) : day;
    setParts({ y: year, m: month, d: clamped });
    onChange(year && month && clamped ? `${year}-${pad(month)}-${pad(clamped)}` : '');
  };

  const field = 'h-[56px] w-full appearance-none rounded-2xl border-[1.5px] border-rule-strong bg-paper-hi px-4 font-disp text-[17px] text-ink outline-none transition-colors duration-150 focus:border-accent';

  return (
    <div className="flex gap-2">
      <select
        aria-label={String(t('fortune.year'))}
        className={`${field} flex-[1.3]`}
        value={y || ''}
        onChange={(e) => set(Number(e.target.value), m, d)}
      >
        <option value="" disabled>{t('fortune.year')}</option>
        {YEARS.map((year) => <option key={year} value={year}>{year}</option>)}
      </select>
      <select
        aria-label={String(t('fortune.month'))}
        className={`${field} flex-1`}
        value={m || ''}
        onChange={(e) => set(y, Number(e.target.value), d)}
      >
        <option value="" disabled>{t('fortune.month')}</option>
        {MONTHS.map((month) => <option key={month} value={month}>{month}</option>)}
      </select>
      <select
        aria-label={String(t('fortune.day'))}
        className={`${field} flex-1`}
        value={d || ''}
        onChange={(e) => set(y, m, Number(e.target.value))}
      >
        <option value="" disabled>{t('fortune.day')}</option>
        {Array.from({ length: daysIn(y, m) }, (_, i) => i + 1)
          .map((day) => <option key={day} value={day}>{day}</option>)}
      </select>
    </div>
  );
}
