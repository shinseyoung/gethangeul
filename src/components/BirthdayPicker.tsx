import { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import Dropdown from './Dropdown';

/**
 * A birthday as three fields.
 *
 * `<input type="date">` was doing the job correctly and looking nothing like
 * the rest of the site: the calendar it opens is the browser's own, not ours,
 * and there is no way to dress it. Splitting it into year, month and day fixed
 * that halfway — `<select>` drops an operating-system menu, which was the same
 * complaint one layer down. All three are the site's own panel now.
 */

const FIRST = 1920;
/* The list ran to 2044 because that is where the Seollal table ends, which is
   the range the zodiac reader can answer for — not the range a person can be
   born in. That put eighteen dead years above the newest real one, every one of
   them in the way.
   2030 is the floor rather than the ceiling: it keeps a few years of headroom
   without the scroll, and the `max` means the list still grows on its own once
   the calendar passes it, instead of needing an edit in 2031. */
const LAST = Math.max(2030, new Date().getUTCFullYear());
const YEARS = Array.from({ length: LAST - FIRST + 1 }, (_, i) => LAST - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

/** Days in a month, so February in a leap year offers 29 and never 31. */
function daysIn(year: number, month: number): number {
  if (!year || !month) return 31;
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

const DAYS = (year: number, month: number) =>
  Array.from({ length: daysIn(year, month) }, (_, i) => i + 1);

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

  return (
    <div className="flex gap-2">
      <Dropdown
        label={String(t('fortune.year'))}
        placeholder={String(t('fortune.year'))}
        className="flex-[1.3]"
        value={y}
        options={YEARS}
        onChange={(year) => set(year, m, d)}
      />
      <Dropdown
        label={String(t('fortune.month'))}
        placeholder={String(t('fortune.month'))}
        className="flex-1"
        value={m}
        options={MONTHS}
        onChange={(month) => set(y, month, d)}
      />
      <Dropdown
        label={String(t('fortune.day'))}
        placeholder={String(t('fortune.day'))}
        className="flex-1"
        value={d}
        options={DAYS(y, m)}
        onChange={(day) => set(y, m, day)}
      />
    </div>
  );
}
