import React from 'react';

// 100% 복원: 남성 / 성별무관 공용 전통 회문(回紋) 코너 장식
const FretCorner = () => {
  const brackets = [
    { path: 'M7 37 V7 H37', width: 1.6, opacity: 1 },
    { path: 'M13 31 V13 H31', width: 1.2, opacity: 0.8 },
    { path: 'M19 25 V19 H25', width: 0.9, opacity: 0.55 },
  ];
  const tickPositions = [6.5, 12, 17.5, 23, 28.5, 34];
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-full h-full overflow-visible">
      {brackets.map((b) => (
        <path key={b.path} d={b.path} stroke="currentColor" strokeWidth={b.width} strokeLinecap="square" opacity={b.opacity} />
      ))}
      {tickPositions.map((p) => (
        <rect key={`h-${p}`} x={p - 0.7} y={1.1} width={1.4} height={1.4} fill="currentColor" opacity={0.5} />
      ))}
      {tickPositions.map((p) => (
        <rect key={`v-${p}`} x={1.1} y={p - 0.7} width={1.4} height={1.4} fill="currentColor" opacity={0.5} />
      ))}
      {[15.5, 22, 28.5].map((p) => (
        <line key={`d-${p}`} x1={p} y1={4.5} x2={4.5} y2={p} stroke="currentColor" strokeWidth={0.6} opacity={0.22} />
      ))}
      <rect x="19" y="19" width="6" height="6" fill="currentColor" fillOpacity={0.14} />
      <rect x="-2.1" y="-2.1" width="4.2" height="4.2" fill="currentColor" opacity={0.92} transform="rotate(45 0 0)" />
    </svg>
  );
};

// 100% 복원: 여성 전용 매화 코너 일러스트
const BlossomCorner = () => {
  const flowers = [
    { cx: 11, cy: 8, r: 3.8 }, { cx: 22, cy: 4, r: 2.6 }, { cx: 3, cy: 17, r: 2.6 },
    { cx: 18, cy: 15, r: 1.9 }, { cx: 27, cy: 11, r: 1.5 },
  ];
  const leaves = [
    { cx: 15, cy: 17, rx: 3.2, ry: 1.3, rot: 40 }, { cx: 6, cy: 13, rx: 2.6, ry: 1.1, rot: -30 },
    { cx: 24, cy: 8, rx: 2.4, ry: 1, rot: 15 },
  ];
  const buds = [[17, 21], [24, 15], [1, 27], [30, 6]];
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
      <path d="M0 0 Q10 2 13 9 Q16 16 9 20 Q4 23 6 30 Q7 35 2 39" stroke="currentColor" strokeWidth={1} strokeLinecap="round" fill="none" opacity={0.5} />
      <path d="M13 9 Q19 8 24 3" stroke="currentColor" strokeWidth={0.8} strokeLinecap="round" fill="none" opacity={0.4} />
      <path d="M9 20 Q17 18 23 12" stroke="currentColor" strokeWidth={0.7} strokeLinecap="round" fill="none" opacity={0.35} />
      {leaves.map((l, i) => (
        <ellipse key={i} cx={l.cx} cy={l.cy} rx={l.rx} ry={l.ry} fill="currentColor" fillOpacity={0.22} transform={`rotate(${l.rot} ${l.cx} ${l.cy})`} />
      ))}
      {flowers.map((f, idx) => (
        <g key={idx} opacity={0.95 - idx * 0.1}>
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse key={deg} cx={f.cx} cy={f.cy - f.r * 0.85} rx={f.r * 0.5} ry={f.r * 0.95} fill="currentColor" fillOpacity={0.32} transform={`rotate(${deg} ${f.cx} ${f.cy})`} />
          ))}
          <circle cx={f.cx} cy={f.cy} r={f.r * 0.26} fill="currentColor" fillOpacity={0.85} />
        </g>
      ))}
      {buds.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={0.9} fill="currentColor" fillOpacity={0.55} />
      ))}
    </svg>
  );
};

// 100% 복원: 남성 전용 대나무 일러스트
const BambooAccent = () => (
  <svg viewBox="0 0 40 90" fill="none" className="w-full h-full overflow-visible">
    <path d="M9 88 C6 70 11 54 7 37 C5 24 9 13 15 2" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" fill="none" opacity={0.55} />
    <line x1="4" y1="70" x2="13" y2="67" stroke="currentColor" strokeWidth={1.4} opacity={0.5} />
    <line x1="8" y1="50" x2="16" y2="47.5" stroke="currentColor" strokeWidth={1.4} opacity={0.5} />
    <line x1="6" y1="30" x2="14" y2="28" stroke="currentColor" strokeWidth={1.4} opacity={0.5} />
    <g opacity={0.8}>
      <path d="M15 4 C10 -5 3 -8 -4 -3 C5 -4 11 1 15 8 Z" fill="currentColor" />
      <path d="M15 4 C20 -7 29 -10 37 -4 C27 -5 19 1 16 9 Z" fill="currentColor" />
      <path d="M12 11 C5 6 -4 6 -9 13 C0 9 8 11 14 17 Z" fill="currentColor" opacity={0.85} />
      <path d="M16 13 C24 8 33 10 37 18 C29 13 21 15 17 21 Z" fill="currentColor" opacity={0.85} />
      <path d="M13 19 C7 17 1 20 -1 27 C5 21 11 22 16 28 Z" fill="currentColor" opacity={0.7} />
    </g>
  </svg>
);

// 100% 복원: 성별무관 전용 구름 일러스트
const CloudMotif = () => (
  <svg viewBox="0 0 26 16" fill="none" className="w-full h-full overflow-visible">
    <path d="M3 12.5 Q0.4 12.3 0.5 9.3 Q0.6 6.3 3.7 6.5 Q3.8 3 7.2 2.8 Q9.2 0.5 12.2 2 Q14.7 0.1 17.2 2.1 Q20.8 0.9 22 4.2 Q25.4 4.1 25 7.6 Q25.8 10.7 22.2 11.4 Q20.1 13.3 17 11.8 Q14 13.7 10.9 11.8 Q7.3 13.7 4.7 11.6 Q3.7 12.6 3 12.5 Z" stroke="currentColor" strokeWidth={0.85} fill="currentColor" fillOpacity={0.12} />
    <path d="M4 9.8 Q7.2 11.4 10.8 9.9" stroke="currentColor" strokeWidth={0.55} opacity={0.35} fill="none" />
    <path d="M13.2 9.7 Q16.8 11.4 20.4 9.7" stroke="currentColor" strokeWidth={0.55} opacity={0.35} fill="none" />
  </svg>
);

const EdgeBeads = ({ dotClass }: { dotClass: string }) => {
  const positions = [22, 38, 62, 78];
  return (
    <>
      {positions.map((p) => (
        <span key={`l-${p}`} style={{ top: `${p}%` }} className={`absolute -left-[3px] -translate-y-1/2 w-[5px] h-[5px] rotate-45 ${dotClass} opacity-70`} />
      ))}
      {positions.map((p) => (
        <span key={`r-${p}`} style={{ top: `${p}%` }} className={`absolute -right-[3px] -translate-y-1/2 w-[5px] h-[5px] rotate-45 ${dotClass} opacity-70`} />
      ))}
    </>
  );
};

export const TraditionalGenderBorder = ({ gender }: { gender: string | null }) => {
  const theme = (() => {
    switch (gender) {
      case 'male': return { border: 'border-blue-300/70', text: 'text-blue-400', dot: 'bg-blue-400', variant: 'male' as const };
      case 'female': return { border: 'border-pink-300/70', text: 'text-pink-400', dot: 'bg-pink-400', variant: 'female' as const };
      default: return { border: 'border-slate-300/70', text: 'text-slate-400', dot: 'bg-slate-400', variant: 'neutral' as const };
    }
  })();

  const CornerOrnament = theme.variant === 'female' ? BlossomCorner : FretCorner;

  return (
    <div className="absolute inset-4 md:inset-5 pointer-events-none z-0">
      <div className={`absolute inset-0 border ${theme.border} rounded-lg transition-all duration-500`} />
      <div className={`absolute inset-[3px] border ${theme.border} rounded-md opacity-60 transition-all duration-500`} />

      <EdgeBeads dotClass={theme.dot} />

      <span className={`absolute top-1/2 -left-[3px] -translate-y-1/2 w-[7px] h-[7px] rotate-45 ${theme.dot} opacity-80`} />
      <span className={`absolute top-1/2 -right-[3px] -translate-y-1/2 w-[7px] h-[7px] rotate-45 ${theme.dot} opacity-80`} />

      {/* 100% 복원: 원본 고유 치수(w-16 md:w-[4.6rem]) 복구 */}
      <div className={`absolute -top-[7px] -left-[7px] w-16 h-16 md:w-[4.6rem] md:h-[4.6rem] ${theme.text} transition-colors duration-500`}><CornerOrnament /></div>
      <div className={`absolute -top-[7px] -right-[7px] w-16 h-16 md:w-[4.6rem] md:h-[4.6rem] ${theme.text} rotate-90 transition-colors duration-500`}><CornerOrnament /></div>
      <div className={`absolute -bottom-[7px] -right-[7px] w-16 h-16 md:w-[4.6rem] md:h-[4.6rem] ${theme.text} rotate-180 transition-colors duration-500`}><CornerOrnament /></div>
      <div className={`absolute -bottom-[7px] -left-[7px] w-16 h-16 md:w-[4.6rem] md:h-[4.6rem] ${theme.text} -rotate-90 transition-colors duration-500`}><CornerOrnament /></div>

      <span className={`absolute -top-[4px] left-1/2 -translate-x-1/2 w-[9px] h-[9px] rotate-45 ${theme.dot} opacity-85`} />
      <span className={`absolute -bottom-[4px] left-1/2 -translate-x-1/2 w-[9px] h-[9px] rotate-45 ${theme.dot} opacity-85`} />

      {/* 100% 복원: 대나무 양사방 완벽 배치 */}
      {theme.variant === 'male' && (
        <>
          <div className={`absolute top-[24%] -left-3.5 w-9 h-20 md:w-10 md:h-24 ${theme.text} opacity-80`}><BambooAccent /></div>
          <div className={`absolute top-[56%] -right-3.5 w-9 h-20 md:w-10 md:h-24 ${theme.text} opacity-80 scale-x-[-1]`}><BambooAccent /></div>
        </>
      )}

      {/* 100% 복원: 구름 사방 8방향 디테일 회귀 */}
      {theme.variant === 'neutral' && (
        <>
          <div className={`absolute -top-2.5 left-[22%] -translate-x-1/2 w-9 h-5.5 ${theme.text} opacity-65`}><CloudMotif /></div>
          <div className={`absolute -top-2.5 right-[22%] translate-x-1/2 w-9 h-5.5 ${theme.text} opacity-65 scale-x-[-1]`}><CloudMotif /></div>
          <div className={`absolute -bottom-2.5 left-[22%] -translate-x-1/2 w-9 h-5.5 ${theme.text} opacity-65 scale-y-[-1]`}><CloudMotif /></div>
          <div className={`absolute -bottom-2.5 right-[22%] translate-x-1/2 w-9 h-5.5 ${theme.text} opacity-65 -scale-x-[1] scale-y-[-1]`}><CloudMotif /></div>
          <div className={`absolute top-[30%] -left-4 w-9 h-5.5 -translate-y-1/2 rotate-90 ${theme.text} opacity-60`}><CloudMotif /></div>
          <div className={`absolute top-[70%] -left-4 w-9 h-5.5 -translate-y-1/2 rotate-90 ${theme.text} opacity-60 scale-x-[-1]`}><CloudMotif /></div>
          <div className={`absolute top-[30%] -right-4 w-9 h-5.5 -translate-y-1/2 -rotate-90 ${theme.text} opacity-60`}><CloudMotif /></div>
          <div className={`absolute top-[70%] -right-4 w-9 h-5.5 -translate-y-1/2 -rotate-90 ${theme.text} opacity-60 scale-x-[-1]`}><CloudMotif /></div>
        </>
      )}
    </div>
  );
};