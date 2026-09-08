// One ink-wash drawing per option, in its own pigment tile.
//
// These were hanja for a while, which reads as Chinese on a site about Korean
// names. They are brush drawings now — a plum branch for spring, a crane for
// grace — painted in the same manner as the mountain on the landing page, so
// the quiz looks like the rest of the site.
//
// The files are ink on white and composite with `multiply`: the white falls
// away into whatever the tile is tinted, and no alpha channel has to be cut
// around a watercolour edge.

const PIG = {
  cheong: '#4F7A8A',
  nok: '#5B7A5C',
  hwangto: '#C9971F',
  ja: '#6E5A7A',
  jeok: '#A83B27',
  hoe: '#5A6470',
  rose: '#B8607A',
  ram: '#3E6BA8',
  galsaek: '#C4744A',
  // two more, so the twelve traits do not have to share nine pigments
  dam: '#3F7F6E',
  cheol: '#7A5C3E',
} as const;

const MARKS: Record<string, { color: string }> = {
  // gender — a scholar's gat, a binyeo hairpin, a folded hanji knot
  male: { color: PIG.ram },
  female: { color: PIG.rose },
  neutral: { color: PIG.hoe },

  // vibe — sun through cloud, ripples, bamboo, a feather,
  //        a crescent in mist, a folding fan, a standing rock, a peony bud
  bright: { color: PIG.hwangto },
  calm: { color: PIG.cheong },
  natural: { color: PIG.nok },
  soft: { color: PIG.galsaek },
  mystic: { color: PIG.ja },
  trendy: { color: PIG.jeok },
  strong: { color: PIG.hoe },
  lovely: { color: PIG.rose },

  // personality — sunrise, a teacup, a stone bridge, a kite, a droplet,
  //               a lantern, a boat, stacked stones, bamboo, a bird,
  //               a crane, a pine on rock
  radiant: { color: PIG.hwangto },
  considerate: { color: PIG.rose },
  dependable: { color: PIG.ram },
  whimsical: { color: PIG.ja },
  genuine: { color: PIG.nok },
  inquisitive: { color: PIG.cheong },
  enterprising: { color: PIG.jeok },
  prudent: { color: PIG.hoe },
  upright: { color: PIG.galsaek },
  sensitive: { color: PIG.rose },
  graceful: { color: PIG.dam },
  resilient: { color: PIG.cheol },

  // season & nature
  spring: { color: PIG.rose },
  summer: { color: PIG.hwangto },
  autumn: { color: PIG.galsaek },
  winter: { color: PIG.cheong },
  mountain: { color: PIG.hoe },
  sea: { color: PIG.ram },
  river: { color: PIG.cheong },
  forest: { color: PIG.nok },
};

export function markColor(id: string): string {
  return MARKS[id]?.color ?? PIG.hoe;
}

function tint(hex: string, alpha: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

interface Props {
  id: string;
  active?: boolean;
  size?: number;
  className?: string;
}

export default function OptionMark({ id, active = false, size = 40, className = '' }: Props) {
  const mark = MARKS[id];
  if (!mark) return null;

  return (
    <span
      aria-hidden="true"
      className={`block shrink-0 overflow-hidden rounded-lg transition-colors duration-200 ${className}`}
      style={{
        width: size,
        height: size,
        boxSizing: 'border-box',
        backgroundColor: tint(mark.color, active ? 0.16 : 0.09),
        border: `1px solid ${tint(mark.color, active ? 0.4 : 0.2)}`,
      }}
    >
      <img
        src={`/marks/${id}.webp`}
        alt=""
        width={size}
        height={size}
        decoding="async"
        className="block h-full w-full object-contain mix-blend-multiply"
      />
    </span>
  );
}
