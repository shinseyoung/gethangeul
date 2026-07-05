import React from 'react';
import { useFlowStore } from '../store/useFlowStore';
import { motion, type Variants } from 'framer-motion';
import { Download, Share2, RotateCcw, Sparkles, CheckCircle2 } from 'lucide-react';

// 유저 선택 속성에 따른 파스텔 톤 컬러 추출
const getDynamicPastelColor = (vibe: string | null, personality: string | null): string => {
  const colorMap: Record<string, string> = {
    bright: '#fecaca', serene: '#bfdbfe', comfortable: '#bbf7d0', warm: '#ddd6fe',
    mysterious: '#c7d2fe', chic: '#fde047', badass: '#cbd5e1', lovely: '#fbcfe8',
    considerate: '#fecdd3', honest: '#a7f3d0', intellectual: '#a5b4fc', enterprising: '#facc15',
    cautious: '#7dd3fc', upright: '#fed7aa', delicate: '#f472b6',
  };
  return colorMap[vibe || ''] || colorMap[personality || ''] || '#cbd5e1';
};

// 선택한 각 키워드에 맞춘 파스텔 해시태그 칩 스타일
const getKeywordTags = (gender: string | null, vibe: string | null, personality: string | null, seasonNature: string | null) => {
  const tags = [];
  if (gender === 'male') tags.push({ text: '남성', bg: 'bg-blue-50 border-blue-200/60 text-blue-700' });
  else if (gender === 'female') tags.push({ text: '여성', bg: 'bg-rose-50 border-rose-200/60 text-rose-700' });
  else if (gender === 'neutral') tags.push({ text: '성별무관', bg: 'bg-slate-50 border-slate-200/60 text-slate-700' });

  if (vibe) tags.push({ text: vibe, bg: 'bg-rose-50 border-rose-200/60 text-rose-700' });
  if (personality) tags.push({ text: personality, bg: 'bg-amber-50 border-amber-200/60 text-amber-800' });
  if (seasonNature) tags.push({ text: seasonNature, bg: 'bg-emerald-50 border-emerald-200/60 text-emerald-700' });
  return tags;
};

// 모서리 꾸밈 수채화 SVG 일러스트
const DynamicCornerIllustration = ({ seasonNature, color }: { seasonNature: string | null; color: string }) => {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-sm transition-all duration-700" style={{ filter: 'blur(0.8px)' }}>
      {seasonNature === 'spring' && <path d="M100,20 C120,60 160,80 180,100 C160,120 120,140 100,180 C80,140 40,120 20,100 C40,80 80,60 100,20 Z" fill={color} />}
      {seasonNature === 'summer' && <circle cx="100" cy="100" r="70" fill={color} />}
      {seasonNature === 'autumn' && <path d="M100,10 L130,70 L190,80 L145,120 L160,180 L100,150 L40,180 L55,120 L10,80 L70,70 Z" fill={color} />}
      {seasonNature === 'winter' && <path d="M100,15 L115,85 L185,100 L115,115 L100,185 L85,115 L15,100 L85,85 Z" fill={color} />}
      {seasonNature === 'mountain' && <path d="M20,180 L80,60 L120,120 L160,40 L190,180 Z" fill={color} />}
      {seasonNature === 'sea' && <path d="M10,140 Q55,90 100,140 T190,140 L190,190 L10,190 Z" fill={color} />}
      {seasonNature === 'river' && <path d="M20,40 Q100,100 60,180 C120,160 160,80 180,40 Z" fill={color} />}
      {(!seasonNature || seasonNature === 'forest') && <path d="M100,20 C150,70 170,120 100,180 C30,120 50,70 100,20 Z" fill={color} />}
    </svg>
  );
};

// 🎎 남성 / 성별무관 공용 - 참고 시안과 동일한 형태의 전통 회문(回紋) 코너 장식.
// 꼭짓점의 마름모 매듭 + 겹겹이 포개진 사각 브래킷(回자 문양) + 가장자리 촘촘한 눈금 톱니로 구성.
// viewBox 원점(0,0)이 프레임의 실제 모서리 꼭짓점과 정확히 겹치도록 설계 → overflow-visible로 꼭짓점 매듭이 살짝 밖으로 삐져나오게 배치.
const FretCorner = () => {
  const brackets = [
    { path: 'M7 37 V7 H37', width: 1.6, opacity: 1 },
    { path: 'M13 31 V13 H31', width: 1.2, opacity: 0.8 },
    { path: 'M19 25 V19 H25', width: 0.9, opacity: 0.55 },
  ];
  const tickPositions = [6.5, 12, 17.5, 23, 28.5, 34];
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-full h-full overflow-visible">
      {/* 겹겹이 포개진 사각 브래킷 (回자 문양) */}
      {brackets.map((b) => (
        <path key={b.path} d={b.path} stroke="currentColor" strokeWidth={b.width} strokeLinecap="square" opacity={b.opacity} />
      ))}
      {/* 가장자리를 따라 촘촘하게 배치된 눈금 톱니 */}
      {tickPositions.map((p) => (
        <rect key={`h-${p}`} x={p - 0.7} y={1.1} width={1.4} height={1.4} fill="currentColor" opacity={0.5} />
      ))}
      {tickPositions.map((p) => (
        <rect key={`v-${p}`} x={1.1} y={p - 0.7} width={1.4} height={1.4} fill="currentColor" opacity={0.5} />
      ))}
      {/* 브래킷 겹 사이 보조 대각선 */}
      {[15.5, 22, 28.5].map((p) => (
        <line key={`d-${p}`} x1={p} y1={4.5} x2={4.5} y2={p} stroke="currentColor" strokeWidth={0.6} opacity={0.22} />
      ))}
      {/* 가장 안쪽 브래킷이 맞물리는 포인트 사각 */}
      <rect x="19" y="19" width="6" height="6" fill="currentColor" fillOpacity={0.14} />
      {/* 꼭짓점 매듭 다이아몬드 - 프레임의 실제 모서리 지점에 위치 */}
      <rect x="-2.1" y="-2.1" width="4.2" height="4.2" fill="currentColor" opacity={0.92} transform="rotate(45 0 0)" />
    </svg>
  );
};

// 🌸 여성 전용 - 가지를 타고 흐르는 매화(벚꽃) 코너 일러스트 (꽃송이/잎/봉오리 밀도 상향)
const BlossomCorner = () => {
  const flowers = [
    { cx: 11, cy: 8, r: 3.8 },
    { cx: 22, cy: 4, r: 2.6 },
    { cx: 3, cy: 17, r: 2.6 },
    { cx: 18, cy: 15, r: 1.9 },
    { cx: 27, cy: 11, r: 1.5 },
  ];
  const leaves = [
    { cx: 15, cy: 17, rx: 3.2, ry: 1.3, rot: 40 },
    { cx: 6, cy: 13, rx: 2.6, ry: 1.1, rot: -30 },
    { cx: 24, cy: 8, rx: 2.4, ry: 1, rot: 15 },
  ];
  const buds = [
    [17, 21], [24, 15], [1, 27], [30, 6],
  ];
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
      {/* 곡선 가지 - 더 멀리 뻗어 코너 전체를 채움 */}
      <path d="M0 0 Q10 2 13 9 Q16 16 9 20 Q4 23 6 30 Q7 35 2 39" stroke="currentColor" strokeWidth={1} strokeLinecap="round" fill="none" opacity={0.5} />
      <path d="M13 9 Q19 8 24 3" stroke="currentColor" strokeWidth={0.8} strokeLinecap="round" fill="none" opacity={0.4} />
      <path d="M9 20 Q17 18 23 12" stroke="currentColor" strokeWidth={0.7} strokeLinecap="round" fill="none" opacity={0.35} />
      {/* 잎사귀 */}
      {leaves.map((l, i) => (
        <ellipse key={i} cx={l.cx} cy={l.cy} rx={l.rx} ry={l.ry} fill="currentColor" fillOpacity={0.22} transform={`rotate(${l.rot} ${l.cx} ${l.cy})`} />
      ))}
      {/* 5장 꽃잎 매화송이 (루프로 회전 배치) */}
      {flowers.map((f, idx) => (
        <g key={idx} opacity={0.95 - idx * 0.1}>
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse
              key={deg}
              cx={f.cx}
              cy={f.cy - f.r * 0.85}
              rx={f.r * 0.5}
              ry={f.r * 0.95}
              fill="currentColor"
              fillOpacity={0.32}
              transform={`rotate(${deg} ${f.cx} ${f.cy})`}
            />
          ))}
          <circle cx={f.cx} cy={f.cy} r={f.r * 0.26} fill="currentColor" fillOpacity={0.85} />
        </g>
      ))}
      {/* 자잘한 꽃봉오리 점 */}
      {buds.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={0.9} fill="currentColor" fillOpacity={0.55} />
      ))}
    </svg>
  );
};

// 🎋 남성 전용 - 참고 시안처럼 테두리를 뚫고 안쪽으로 뻗어 들어오는 붓터치 스타일 대나무 한 무리.
// 살짝 휘어진 줄기 + 마디 표시 + 끝에 부채꼴로 퍼지는 댓잎 다발로 구성.
const BambooAccent = () => (
  <svg viewBox="0 0 40 90" fill="none" className="w-full h-full overflow-visible">
    {/* 줄기 - 아래(테두리 바깥)에서 위(프레임 안쪽)로 살짝 휘어지며 뻗음 */}
    <path
      d="M9 88 C6 70 11 54 7 37 C5 24 9 13 15 2"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      fill="none"
      opacity={0.55}
    />
    {/* 마디 표시 */}
    <line x1="4" y1="70" x2="13" y2="67" stroke="currentColor" strokeWidth={1.4} opacity={0.5} />
    <line x1="8" y1="50" x2="16" y2="47.5" stroke="currentColor" strokeWidth={1.4} opacity={0.5} />
    <line x1="6" y1="30" x2="14" y2="28" stroke="currentColor" strokeWidth={1.4} opacity={0.5} />
    {/* 끝에서 부채꼴로 퍼지는 댓잎 다발 (5장) */}
    <g opacity={0.8}>
      <path d="M15 4 C10 -5 3 -8 -4 -3 C5 -4 11 1 15 8 Z" fill="currentColor" />
      <path d="M15 4 C20 -7 29 -10 37 -4 C27 -5 19 1 16 9 Z" fill="currentColor" />
      <path d="M12 11 C5 6 -4 6 -9 13 C0 9 8 11 14 17 Z" fill="currentColor" opacity={0.85} />
      <path d="M16 13 C24 8 33 10 37 18 C29 13 21 15 17 21 Z" fill="currentColor" opacity={0.85} />
      <path d="M13 19 C7 17 1 20 -1 27 C5 21 11 22 16 28 Z" fill="currentColor" opacity={0.7} />
    </g>
  </svg>
);

// ☁️ 성별무관 전용 - 참고 시안과 같은 여러 겹의 여의운(如意雲) 실루엣 + 안쪽 결선.
// 테두리 네 변(상/하/좌/우) 모두에 배치되므로 정방향 뷰박스로 설계하고 배치 시 rotate로 방향을 맞춘다.
const CloudMotif = () => (
  <svg viewBox="0 0 26 16" fill="none" className="w-full h-full overflow-visible">
    <path
      d="M3 12.5 Q0.4 12.3 0.5 9.3 Q0.6 6.3 3.7 6.5 Q3.8 3 7.2 2.8 Q9.2 0.5 12.2 2 Q14.7 0.1 17.2 2.1 Q20.8 0.9 22 4.2 Q25.4 4.1 25 7.6 Q25.8 10.7 22.2 11.4 Q20.1 13.3 17 11.8 Q14 13.7 10.9 11.8 Q7.3 13.7 4.7 11.6 Q3.7 12.6 3 12.5 Z"
      stroke="currentColor"
      strokeWidth={0.85}
      fill="currentColor"
      fillOpacity={0.12}
    />
    {/* 구름 안쪽 결 표현 (음영선) */}
    <path d="M4 9.8 Q7.2 11.4 10.8 9.9" stroke="currentColor" strokeWidth={0.55} opacity={0.35} fill="none" />
    <path d="M13.2 9.7 Q16.8 11.4 20.4 9.7" stroke="currentColor" strokeWidth={0.55} opacity={0.35} fill="none" />
  </svg>
);

// 💠 공통 - 좌/우 테두리를 따라 규칙적으로 반복되는 작은 마름모 포인트.
// 참고 시안은 상/하단은 중앙 다이아몬드 하나만, 좌/우 변에는 여러 개의 자잘한 포인트가 반복되는 구조라
// 상/하단과 좌/우단의 장식을 분리했다 (상/하단 중앙 다이아몬드는 TraditionalGenderBorder에서 별도 렌더).
const EdgeBeads = ({ dotClass }: { dotClass: string }) => {
  const positions = [22, 38, 62, 78]; // % 위치 (모서리/중앙 도트와 겹치지 않는 지점)
  return (
    <>
      {positions.map((p) => (
        <span
          key={`l-${p}`}
          style={{ top: `${p}%` }}
          className={`absolute -left-[3px] -translate-y-1/2 w-[5px] h-[5px] rotate-45 ${dotClass} opacity-70`}
        />
      ))}
      {positions.map((p) => (
        <span
          key={`r-${p}`}
          style={{ top: `${p}%` }}
          className={`absolute -right-[3px] -translate-y-1/2 w-[5px] h-[5px] rotate-45 ${dotClass} opacity-70`}
        />
      ))}
    </>
  );
};

// 🟢 [버그 완전 수리] 한국어('남자') 대신 실제 스토어 상태값('male' | 'female' | 'neutral') 매핑!
// 🟢 [디자인 전면 개편 v3 - 참고 시안 정합] 참고 이미지(파랑=남성 / 먹색=성별무관)와 동일한 구조로 재설계:
//   1) 얇은 이중선(double line) 테두리
//   2) 네 모서리에 꼭짓점 다이아몬드 + 겹겹이 포갠 回자 브래킷 코너 장식 (남성/무관 공용, 색상만 분기)
//   3) 상/하단 중앙에 작은 채워진 다이아몬드 포인트 1개씩
//   4) 좌/우 변에는 촘촘한 마름모 비즈 포인트 반복
//   5) 남성 전용 - 좌/우 변에 비대칭으로 뻗어 들어오는 대나무 잎 다발 2곳
//   6) 성별무관 전용 - 네 변(상/하/좌/우) 전체에 고르게 배치되는 구름(여의운) 문양 8곳
const TraditionalGenderBorder = ({ gender }: { gender: string | null }) => {
  const theme = (() => {
    switch (gender) {
      case 'male':
        return { border: 'border-blue-300/70', text: 'text-blue-400', dot: 'bg-blue-400', variant: 'male' as const };
      case 'female':
        return { border: 'border-pink-300/70', text: 'text-pink-400', dot: 'bg-pink-400', variant: 'female' as const };
      default: // 'neutral' 또는 null
        return { border: 'border-slate-300/70', text: 'text-slate-400', dot: 'bg-slate-400', variant: 'neutral' as const };
    }
  })();

  // 여성은 매화 코너, 남성/무관은 회문 코너 (색상만 테마로 분기)
  const CornerOrnament = theme.variant === 'female' ? BlossomCorner : FretCorner;

  return (
    <div className="absolute inset-4 md:inset-5 pointer-events-none z-0">
      {/* 얇은 이중선(double line) 테두리 - 참고 시안 특유의 겹선 프레임 */}
      <div className={`absolute inset-0 border ${theme.border} rounded-lg transition-all duration-500`} />
      <div className={`absolute inset-[3px] border ${theme.border} rounded-md opacity-60 transition-all duration-500`} />

      {/* 좌/우 변을 따라 반복되는 마름모 비즈 포인트 */}
      <EdgeBeads dotClass={theme.dot} />

      {/* 좌/우 변 정중앙 포인트 */}
      <span className={`absolute top-1/2 -left-[3px] -translate-y-1/2 w-[7px] h-[7px] rotate-45 ${theme.dot} opacity-80`} />
      <span className={`absolute top-1/2 -right-[3px] -translate-y-1/2 w-[7px] h-[7px] rotate-45 ${theme.dot} opacity-80`} />

      {/* 1. 좌상단 (확대된 回자 코너 문양, 꼭짓점이 프레임 모서리에 정확히 맞물림) */}
      <div className={`absolute -top-[7px] -left-[7px] w-16 h-16 md:w-[4.6rem] md:h-[4.6rem] ${theme.text} transition-colors duration-500`}>
        <CornerOrnament />
      </div>
      {/* 2. 우상단 (90도 회전) */}
      <div className={`absolute -top-[7px] -right-[7px] w-16 h-16 md:w-[4.6rem] md:h-[4.6rem] ${theme.text} rotate-90 transition-colors duration-500`}>
        <CornerOrnament />
      </div>
      {/* 3. 우하단 (180도 회전) */}
      <div className={`absolute -bottom-[7px] -right-[7px] w-16 h-16 md:w-[4.6rem] md:h-[4.6rem] ${theme.text} rotate-180 transition-colors duration-500`}>
        <CornerOrnament />
      </div>
      {/* 4. 좌하단 (270도 회전) */}
      <div className={`absolute -bottom-[7px] -left-[7px] w-16 h-16 md:w-[4.6rem] md:h-[4.6rem] ${theme.text} -rotate-90 transition-colors duration-500`}>
        <CornerOrnament />
      </div>

      {/* 상/하단 중앙 다이아몬드 포인트 (참고 시안처럼 꽉 채워진 형태) */}
      <span className={`absolute -top-[4px] left-1/2 -translate-x-1/2 w-[9px] h-[9px] rotate-45 ${theme.dot} opacity-85`} />
      <span className={`absolute -bottom-[4px] left-1/2 -translate-x-1/2 w-[9px] h-[9px] rotate-45 ${theme.dot} opacity-85`} />

      {/* 남성 전용 - 좌/우 변에 비대칭으로 뻗어 들어오는 대나무 잎 다발 2곳 */}
      {theme.variant === 'male' && (
        <>
          <div className={`absolute top-[24%] -left-3.5 w-9 h-20 md:w-10 md:h-24 ${theme.text} opacity-80`}>
            <BambooAccent />
          </div>
          <div className={`absolute top-[56%] -right-3.5 w-9 h-20 md:w-10 md:h-24 ${theme.text} opacity-80 scale-x-[-1]`}>
            <BambooAccent />
          </div>
        </>
      )}

      {/* 성별무관 전용 - 네 변(상/하/좌/우) 전체에 고르게 배치되는 구름 문양 (총 8곳) */}
      {theme.variant === 'neutral' && (
        <>
          {/* 상단 - 좌/우 대칭 2곳 */}
          <div className={`absolute -top-2.5 left-[22%] -translate-x-1/2 w-9 h-5.5 ${theme.text} opacity-65`}>
            <CloudMotif />
          </div>
          <div className={`absolute -top-2.5 right-[22%] translate-x-1/2 w-9 h-5.5 ${theme.text} opacity-65 scale-x-[-1]`}>
            <CloudMotif />
          </div>
          {/* 하단 - 좌/우 대칭 2곳 */}
          <div className={`absolute -bottom-2.5 left-[22%] -translate-x-1/2 w-9 h-5.5 ${theme.text} opacity-65 scale-y-[-1]`}>
            <CloudMotif />
          </div>
          <div className={`absolute -bottom-2.5 right-[22%] translate-x-1/2 w-9 h-5.5 ${theme.text} opacity-65 -scale-x-[1] scale-y-[-1]`}>
            <CloudMotif />
          </div>
          {/* 좌측 - 상/하 대칭 2곳 (90도 회전) */}
          <div className={`absolute top-[30%] -left-4 w-9 h-5.5 -translate-y-1/2 rotate-90 ${theme.text} opacity-60`}>
            <CloudMotif />
          </div>
          <div className={`absolute top-[70%] -left-4 w-9 h-5.5 -translate-y-1/2 rotate-90 ${theme.text} opacity-60 scale-x-[-1]`}>
            <CloudMotif />
          </div>
          {/* 우측 - 상/하 대칭 2곳 (-90도 회전) */}
          <div className={`absolute top-[30%] -right-4 w-9 h-5.5 -translate-y-1/2 -rotate-90 ${theme.text} opacity-60`}>
            <CloudMotif />
          </div>
          <div className={`absolute top-[70%] -right-4 w-9 h-5.5 -translate-y-1/2 -rotate-90 ${theme.text} opacity-60 scale-x-[-1]`}>
            <CloudMotif />
          </div>
        </>
      )}
    </div>
  );
};

const MOCK_RESULT = {
  hangul: '서온',
  hanja: '舒溫',
  shortMeaning: '상서롭고 따뜻한',
  poeticQuote: '“ 따뜻한 마음으로 사람들을 비추는 빛 ”',
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export default function Step5Result() {
  const { gender, vibe, personality, seasonNature, resetFlow } = useFlowStore();
  const dynamicColor = getDynamicPastelColor(vibe, personality);
  const keywordTags = getKeywordTags(gender, vibe, personality, seasonNature);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full h-full flex flex-col lg:flex-row gap-5 lg:gap-6 items-stretch justify-center min-h-0 overflow-hidden"
    >
      {/* =========================================================================
          <좌측 영역 - 2/3 차지> 메인 카드 본체
          ========================================================================= */}
      <motion.div 
        variants={cardVariants}
        className="flex-1 lg:w-2/3 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-[30px] shadow-xl flex flex-col justify-between relative overflow-hidden min-h-0"
      >
        {/* 상단 캔버스 영역 (버튼 침범 차단 격리) */}
        <div className="flex-1 flex flex-col relative min-h-0 w-full">
          
          {/* 🟢 성별 맞춤 한국 전통 테두리 프레임 (male / female / neutral 완벽 연동) */}
          <TraditionalGenderBorder gender={gender} />

          {/* 모서리 맞춤형 동적 수채화 이미지 */}
          <div className="absolute -top-12 -right-12 w-52 h-52 md:w-64 md:h-64 pointer-events-none opacity-30 z-0">
            <DynamicCornerIllustration seasonNature={seasonNature} color={dynamicColor} />
          </div>
          <div className="absolute -bottom-12 -left-12 w-52 h-52 md:w-64 md:h-64 pointer-events-none opacity-30 rotate-180 z-0">
            <DynamicCornerIllustration seasonNature={seasonNature} color={dynamicColor} />
          </div>

          {/* --- 중앙 집중 감성 타이포그래피 내부 알맹이 컨테이너 --- */}
          <div className="relative z-10 flex flex-col min-h-0 flex-1 justify-around items-center text-center my-auto px-10 py-6 md:py-8">
            
            {/* 상단 라벨 */}
            <div className="inline-flex items-center gap-1.5 bg-[#1e4a38]/10 text-[#1e4a38] px-4.5 py-1.5 rounded-full text-xs md:text-sm font-extrabold tracking-wider shadow-2xs shrink-0">
              <Sparkles size={14} />
              <span>당신을 위한 한글 이름</span>
            </div>

            {/* 한글 이름 수평 정중앙 + 한자 1/2 크기 우측 베이스라인 칼각 일치 */}
            <div className="relative inline-flex items-baseline justify-center my-1 md:my-3 shrink-0">
              <h2 className="text-7xl md:text-8xl font-extrabold text-gray-900 tracking-tight drop-shadow-sm text-center">
                {MOCK_RESULT.hangul}
              </h2>
              <span className="absolute left-full pl-3.5 md:pl-5 bottom-0 pb-[3px] md:pb-[6px] text-4xl md:text-5xl font-serif font-normal text-gray-400 tracking-widest whitespace-nowrap">
                {MOCK_RESULT.hanja}
              </span>
            </div>

            {/* 뜻 풀이 및 시사문 */}
            <div className="flex flex-col items-center gap-3 max-w-lg mx-auto shrink-0 my-1">
              <p className="text-base md:text-xl font-bold text-gray-500 tracking-wide">
                뜻 : {MOCK_RESULT.shortMeaning}
              </p>
              <p className="text-2xl md:text-3xl font-serif font-extrabold text-[#1e4a38] leading-relaxed break-keep drop-shadow-sm">
                {MOCK_RESULT.poeticQuote}
              </p>
            </div>

            {/* 하단 컬러 키워드 해시태그 칩 */}
            <div className="flex flex-col items-center gap-2.5 w-full shrink-0">
              <span className="text-[11px] md:text-xs font-bold text-gray-400 tracking-widest uppercase">
                이름에 담긴 고유 키워드
              </span>
              <div className="flex flex-wrap justify-center items-center gap-2.5 max-w-xl">
                {keywordTags.map((tag, idx) => (
                  <span 
                    key={idx}
                    className={`px-4 py-1.5 md:py-2 rounded-2xl border text-xs md:text-sm font-extrabold shadow-sm transition-transform hover:-translate-y-0.5 ${tag.bg}`}
                  >
                    #{tag.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 하단 제어 버튼 바 (버튼 침범 없는 회색 구분선 마감 및 넘침 차단) */}
        <div className="relative z-10 border-t border-gray-100 bg-white/40 backdrop-blur-xs py-4 px-6 md:py-5 md:px-8 flex items-center justify-between shrink-0 w-full">
          <button 
            onClick={resetFlow}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-full text-xs md:text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors shrink-0 whitespace-nowrap min-w-[125px] md:min-w-[135px]"
          >
            <RotateCcw size={15} strokeWidth={2.5} className="shrink-0" />
            <span>다시 하기</span>
          </button>
          
          <div className="flex items-center gap-2 md:gap-2.5 shrink-0">
            <button className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-full text-xs md:text-sm font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap">
              <Share2 size={15} className="shrink-0" />
              <span>결과 공유</span>
            </button>
            <button className="flex items-center justify-center gap-1.5 px-6 py-3 rounded-full text-xs md:text-sm font-bold text-white bg-[#1e4a38] hover:bg-[#143427] transition-all shadow-md hover:shadow-lg whitespace-nowrap">
              <Download size={15} className="shrink-0" />
              <span>이미지 저장</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* =========================================================================
          <우측 영역 - 1/3 차지> 우측 100% 보존
          ========================================================================= */}
      <div className="w-full lg:w-[340px] xl:w-[360px] flex flex-col gap-5 shrink-0 min-h-0 overflow-hidden">
        <div className="flex-1 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-[26px] p-5 shadow-xl flex flex-col justify-center items-center relative overflow-hidden min-h-[140px]">
          <div className="absolute inset-0 bg-slate-50/40 pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center gap-1.5 text-center">
            <CheckCircle2 size={18} className="text-gray-300" />
            <p className="text-[11px] font-bold tracking-widest text-gray-300 uppercase">
              콘텐츠 준비 중
            </p>
          </div>
        </div>

        <div className="h-[240px] bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-[26px] p-4 shadow-xl flex flex-col justify-center items-center relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-slate-50/50 pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center justify-center gap-1">
            <span className="text-[9px] font-extrabold tracking-widest text-gray-400 bg-gray-200/60 px-2 py-0.5 rounded">
              ADVERTISEMENT
            </span>
            <p className="text-sm font-extrabold text-gray-400 mt-1">
              광고
            </p>
            <span className="text-[10px] font-medium text-gray-400/80">
              [ 300 × 250 디스플레이 배너 영역 ]
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}