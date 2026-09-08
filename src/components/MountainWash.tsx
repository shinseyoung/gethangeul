import { useId } from 'react';

/**
 * Watercolour mountains. The silhouette is drawn as SVG and pushed through a
 * turbulence displacement so its edges bleed like pigment into wet paper —
 * which costs nothing to load, recolours per season, and stays sharp at any
 * size. (bg_mountain.png was 1.7 MB and could do none of those.)
 *
 * It never sits behind body copy: callers fade it out above the text.
 */

export const SEASON_WASH: Record<string, { rgb: string; hills: [string, string, string] }> = {
  spring: { rgb: '201,136,146', hills: ['#D5A8AE', '#BE8791', '#9C666F'] },
  summer: { rgb: '184,144,31', hills: ['#D9BE72', '#C1A241', '#977A26'] },
  autumn: { rgb: '174,98,54', hills: ['#CE9670', '#B4744A', '#8C5330'] },
  winter: { rgb: '79,122,138', hills: ['#9AB4C0', '#6E93A2', '#48697A'] },
  slate: { rgb: '110,128,142', hills: ['#93A3AE', '#6E808E', '#4B5B68'] },
};

interface Props {
  season?: keyof typeof SEASON_WASH | string;
  className?: string;
  /** fade the lower edge out, so nothing bleeds into text below */
  fade?: boolean;
}

export default function MountainWash({ season = 'slate', className = '', fade = false }: Props) {
  const id = useId().replace(/:/g, '');
  const { hills } = SEASON_WASH[season] ?? SEASON_WASH.slate;

  const maskStyle = fade
    ? {
        WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 62%, transparent 97%)',
        maskImage: 'linear-gradient(to bottom, #000 0%, #000 62%, transparent 97%)',
      }
    : undefined;

  return (
    <div className={`pointer-events-none ${className}`} style={maskStyle} aria-hidden="true">
      <svg viewBox="0 0 390 300" width="100%" height="100%" fill="none" preserveAspectRatio="none">
        <defs>
          <filter id={`wc-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.013 0.028" numOctaves="4" seed="9" result="t" />
            <feDisplacementMap in="SourceGraphic" in2="t" scale="11" xChannelSelector="R" yChannelSelector="G" />
            <feGaussianBlur stdDeviation="1.3" />
          </filter>
        </defs>
        <g filter={`url(#wc-${id})`}>
          <path
            d="M0 214 L54 142 L96 178 L146 98 L196 168 L226 132 L276 192 L318 150 L360 196 L390 162 L390 300 L0 300 Z"
            fill={hills[0]} fillOpacity="0.17"
          />
          <path
            d="M0 244 L48 194 L92 224 L140 168 L186 216 L236 182 L280 228 L330 192 L372 230 L390 210 L390 300 L0 300 Z"
            fill={hills[1]} fillOpacity="0.2"
          />
          <path
            d="M0 272 L60 244 L112 266 L166 236 L216 262 L270 238 L326 268 L390 246 L390 300 L0 300 Z"
            fill={hills[2]} fillOpacity="0.22"
          />
        </g>
      </svg>
    </div>
  );
}
