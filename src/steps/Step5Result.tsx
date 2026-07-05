import React from 'react';
import { useFlowStore } from '../store/useFlowStore';
import { motion, type Variants } from 'framer-motion';
import { Download, Share2, RotateCcw, Sparkles } from 'lucide-react';

// 🟢 [개선 3] 영어 ID -> 사용자 선택 한글 라벨 완벽 매핑 딕셔너리
const VIBE_MAP: Record<string, string> = {
  bright: '밝고 긍정적인', calm: '차분하고 단아한', natural: '자연스럽고 편안한', soft: '부드럽고 따뜻한',
  mystic: '신비롭고 매력적인', trendy: '세련되고 트렌디한', strong: '강인하고 멋진', lovely: '사랑스럽고 귀여운',
};

const PERSONALITY_MAP: Record<string, string> = {
  radiant: '밝고 긍정적인', considerate: '따뜻하고 배려하는', dependable: '책임감있고 신뢰하는', whimsical: '창의적이고 독창적인',
  genuine: '자연스럽고 솔직한', inquisitive: '지적이고 탐구적인', enterprising: '도전적이고 진취적인', prudent: '차분하고 신중한',
  upright: '정직하고 원칙적인', sensitive: '감성적이고 섬세한',
};

const NATURE_MAP: Record<string, string> = {
  spring: '봄', summer: '여름', autumn: '가을', winter: '겨울',
  mountain: '산', sea: '바다', river: '강', forest: '숲',
};

// 유저 선택 속성에 따른 파스텔 톤 컬러 추출
const getDynamicPastelColor = (vibe: string | null, personality: string | null): string => {
  const colorMap: Record<string, string> = {
    bright: '#fecaca', serene: '#bfdbfe', comfortable: '#bbf7d0', warm: '#ddd6fe',
    mystic: '#c7d2fe', trendy: '#fde047', strong: '#cbd5e1', lovely: '#fbcfe8',
    considerate: '#fecdd3', dependable: '#a7f3d0', inquisitive: '#a5b4fc', enterprising: '#facc15',
    prudent: '#7dd3fc', upright: '#fed7aa', sensitive: '#f472b6',
  };
  return colorMap[vibe || ''] || colorMap[personality || ''] || '#cbd5e1';
};

// 🟢 [개선 3] 선택한 각 키워드에 맞춘 한국어 파스텔 해시태그 칩 생성
const getKeywordTags = (gender: string | null, vibe: string | null, personality: string | null, seasonNature: string | null) => {
  const tags = [];
  if (gender === 'male') tags.push({ text: '남성', bg: 'bg-blue-50 border-blue-200/60 text-blue-700' });
  else if (gender === 'female') tags.push({ text: '여성', bg: 'bg-rose-50 border-rose-200/60 text-rose-700' });
  else if (gender === 'neutral') tags.push({ text: '성별무관', bg: 'bg-slate-50 border-slate-200/60 text-slate-700' });

  if (vibe && VIBE_MAP[vibe]) tags.push({ text: VIBE_MAP[vibe], bg: 'bg-rose-50 border-rose-200/60 text-rose-700' });
  if (personality && PERSONALITY_MAP[personality]) tags.push({ text: PERSONALITY_MAP[personality], bg: 'bg-amber-50 border-amber-200/60 text-amber-800' });
  if (seasonNature && NATURE_MAP[seasonNature]) tags.push({ text: NATURE_MAP[seasonNature], bg: 'bg-emerald-50 border-emerald-200/60 text-emerald-700' });
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

// 남성 / 성별무관 공용 전통 회문(回紋) 코너 장식
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

// 여성 전용 매화 코너 일러스트
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

// 남성 전용 대나무 일러스트
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

// 성별무관 전용 구름 일러스트
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

const TraditionalGenderBorder = ({ gender }: { gender: string | null }) => {
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

      <div className={`absolute -top-[7px] -left-[7px] w-16 h-16 md:w-[4.6rem] md:h-[4.6rem] ${theme.text} transition-colors duration-500`}><CornerOrnament /></div>
      <div className={`absolute -top-[7px] -right-[7px] w-16 h-16 md:w-[4.6rem] md:h-[4.6rem] ${theme.text} rotate-90 transition-colors duration-500`}><CornerOrnament /></div>
      <div className={`absolute -bottom-[7px] -right-[7px] w-16 h-16 md:w-[4.6rem] md:h-[4.6rem] ${theme.text} rotate-180 transition-colors duration-500`}><CornerOrnament /></div>
      <div className={`absolute -bottom-[7px] -left-[7px] w-16 h-16 md:w-[4.6rem] md:h-[4.6rem] ${theme.text} -rotate-90 transition-colors duration-500`}><CornerOrnament /></div>

      <span className={`absolute -top-[4px] left-1/2 -translate-x-1/2 w-[9px] h-[9px] rotate-45 ${theme.dot} opacity-85`} />
      <span className={`absolute -bottom-[4px] left-1/2 -translate-x-1/2 w-[9px] h-[9px] rotate-45 ${theme.dot} opacity-85`} />

      {theme.variant === 'male' && (
        <>
          <div className={`absolute top-[24%] -left-3.5 w-9 h-20 md:w-10 md:h-24 ${theme.text} opacity-80`}><BambooAccent /></div>
          <div className={`absolute top-[56%] -right-3.5 w-9 h-20 md:w-10 md:h-24 ${theme.text} opacity-80 scale-x-[-1]`}><BambooAccent /></div>
        </>
      )}

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

  // 성별별 아이콘 및 텍스트 색상 분기
  const genderColorClass = 
    gender === 'male' ? 'bg-blue-400 text-blue-500' : 
    gender === 'female' ? 'bg-pink-400 text-pink-500' : 'bg-slate-400 text-slate-500';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full h-full flex flex-col lg:flex-row gap-5 lg:gap-6 items-stretch justify-center min-h-0 overflow-hidden"
    >
      {/* <좌측 영역 - 2/3 차지> 메인 카드 본체 */}
      <motion.div 
        variants={cardVariants}
        className="flex-1 lg:w-2/3 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-[30px] shadow-xl flex flex-col justify-between relative overflow-hidden min-h-0"
      >
        <div className="flex-1 flex flex-col relative min-h-0 w-full">
          
          <TraditionalGenderBorder gender={gender} />

          {/* 🟢 [개선 4] 수채화 일러스트를 테두리(inset-4) 안쪽 컨테이너로 안착 및 약간 안쪽으로 이동 */}
          <div className="absolute inset-4 md:inset-5 pointer-events-none overflow-hidden rounded-lg z-0">
            <div className="absolute -top-4 -right-4 w-48 h-48 md:w-56 md:h-56 opacity-35">
              <DynamicCornerIllustration seasonNature={seasonNature} color={dynamicColor} />
            </div>
            <div className="absolute -bottom-4 -left-4 w-48 h-48 md:w-56 md:h-56 opacity-35 rotate-180">
              <DynamicCornerIllustration seasonNature={seasonNature} color={dynamicColor} />
            </div>
          </div>

          <div className="relative z-10 flex flex-col min-h-0 flex-1 justify-around items-center text-center my-auto px-10 py-5 md:py-6">
            
            {/* 🟢 [개선 1] 상단 라벨 위치를 더 아래로 내려 이름 영역과 자연스럽게 붙임 */}
            <div className="inline-flex items-center gap-1.5 bg-[#1e4a38]/10 text-[#1e4a38] px-4.5 py-1.5 rounded-full text-xs md:text-sm font-extrabold tracking-wider shadow-2xs mt-4 md:mt-6 mb-1 shrink-0">
              <Sparkles size={14} />
              <span>당신을 위한 한글 이름</span>
            </div>

            {/* 이름 및 한자 영역 */}
            <div className="flex flex-col items-center justify-center my-1 md:my-2 shrink-0">
              <div className="relative inline-flex items-baseline justify-center">
                <h2 className="text-7xl md:text-8xl font-extrabold text-gray-900 tracking-tight drop-shadow-sm text-center">
                  {MOCK_RESULT.hangul}
                </h2>
                <span className="absolute left-full pl-3.5 md:pl-5 bottom-0 pb-[3px] md:pb-[6px] text-4xl md:text-5xl font-serif font-normal text-gray-400 tracking-widest whitespace-nowrap">
                  {MOCK_RESULT.hanja}
                </span>
              </div>

              {/* 🟢 [개선 2] 이름과 뜻 사이의 name_under_icon.svg (성별 동적 컬러 투영) */}
              <div 
                className={`w-56 md:w-64 h-8 md:h-7 mt-4 mb-4 transition-colors duration-500 opacity-80 ${genderColorClass.split(' ')[0]}`}
                style={{
                  maskImage: "url('icons/Common/name_under_icon.svg')",
                  WebkitMaskImage: "url('icons/Common/name_under_icon.svg')",
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  WebkitMaskPosition: 'center',
                  maskSize: 'contain',
                  WebkitMaskSize: 'contain'
                }}
              />
            </div>

            {/* 뜻 풀이 및 시사문 */}
            <div className="flex flex-col items-center gap-2.5 max-w-lg mx-auto shrink-0 my-1">
              <p className="text-base md:text-xl font-bold text-gray-500 tracking-wide">
                뜻 : {MOCK_RESULT.shortMeaning}
              </p>
              <p className="text-2xl md:text-3xl font-serif font-extrabold text-[#1e4a38] leading-relaxed break-keep drop-shadow-sm">
                {MOCK_RESULT.poeticQuote}
              </p>
            </div>

            {/* 🟢 [개선 3] 하단 키워드 해시태그 (완벽한 한글 변환 출력) */}
            <div className="flex flex-col items-center gap-2.5 w-full shrink-0 mt-2">
              <span className="text-[11px] md:text-xs font-bold text-gray-400 tracking-widest uppercase">
                이름에 담긴 고유 키워드
              </span>
              <div className="flex flex-wrap justify-center items-center gap-2 max-w-xl">
                {keywordTags.map((tag, idx) => (
                  <span 
                    key={idx}
                    className={`px-3.5 py-1.5 md:py-2 rounded-2xl border text-xs md:text-sm font-extrabold shadow-sm transition-transform hover:-translate-y-0.5 ${tag.bg}`}
                  >
                    #{tag.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 하단 제어 버튼 바 */}
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
          🟢 [개선 5] <우측 영역 - 1/3 차지> 상단/하단 모두 디스플레이 배너 광고 영역으로 변경
          ========================================================================= */}
      <div className="w-full lg:w-[340px] xl:w-[360px] flex flex-col gap-5 shrink-0 min-h-0 overflow-hidden">
        
        {/* 상단 광고 박스 */}
        <div className="flex-1 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-[26px] p-4 shadow-xl flex flex-col justify-center items-center relative overflow-hidden min-h-[140px]">
          <div className="absolute inset-0 bg-slate-50/50 pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center justify-center gap-1">
            <span className="text-[9px] font-extrabold tracking-widest text-gray-400 bg-gray-200/60 px-2 py-0.5 rounded">
              ADVERTISEMENT
            </span>
            <p className="text-sm font-extrabold text-gray-400 mt-1">
              스폰서 배너 광고
            </p>
            <span className="text-[10px] font-medium text-gray-400/80">
              [ 상단 디스플레이 영역 ]
            </span>
          </div>
        </div>

        {/* 하단 광고 박스 */}
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