import type { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * The five screens each had their own hand-rolled button. They are one thing
 * now, and they are pills rather than hard black rectangles.
 *
 * Stability matters as much as shape here: every variant keeps the same border
 * width, padding and height in every state, and only colour transitions — so a
 * button never resizes or nudges under the cursor.
 */

type Variant = 'primary' | 'secondary' | 'ghost';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** 'box' matches the input field's corner, for a button that sits beside one */
  shape?: 'pill' | 'box';
  full?: boolean;
  children: ReactNode;
}

const BASE =
  'focus-ring inline-flex items-center justify-center gap-2.5 border font-disp ' +
  'transition-colors duration-150 select-none disabled:cursor-not-allowed';

const SIZE = 'min-h-[54px] px-7 py-3 text-[19px]';

const VARIANT: Record<Variant, string> = {
  primary:
    'border-transparent bg-accent text-white shadow-[0_10px_26px_-12px_rgba(31,99,232,0.65)] ' +
    'hover:bg-accent-deep disabled:bg-rule disabled:text-ink-4 disabled:shadow-none',
  secondary:
    'border-rule-strong bg-paper-hi text-ink-2 hover:border-ink-4 hover:bg-paper-lo ' +
    'disabled:text-ink-4 disabled:hover:border-rule-strong disabled:hover:bg-paper-hi',
  ghost:
    'border-transparent bg-transparent text-ink-3 hover:text-accent ' +
    'disabled:text-ink-4',
};

export default function Button({
  variant = 'primary',
  shape = 'pill',
  full = false,
  className = '',
  children,
  ...rest
}: Props) {
  const radius = shape === 'box' ? 'rounded-2xl' : 'rounded-full';
  return (
    <button
      type="button"
      className={`${BASE} ${radius} ${SIZE} ${VARIANT[variant]} ${full ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ArrowRight({ className = 'h-[17px] w-[17px]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M5 12h13M12 5.5 18.5 12 12 18.5" />
    </svg>
  );
}

export function ArrowLeft({ className = 'h-[15px] w-[15px]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M19 12H6M12 5.5 5.5 12 12 18.5" />
    </svg>
  );
}
