import React, { useMemo } from 'react'
import { useFlowStore } from '../store/useFlowStore';
import { getRecommendedName } from '../utils/nameMatcher';
import { motion, type Variants } from 'framer-motion';
import { Download, Share2, RotateCcw } from 'lucide-react';
import { useImageShare } from '../hooks/useImageShare';
// 🟢 다국어 연동 훅 추가
import { useTranslation } from '../hooks/useTranslation';

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

const STEP_COLOR_MAP: Record<string, string> = {
  male: '#bae6fd', female: '#fbcfe8', neutral: '#e2e8f0', bright: '#fecaca', radiant: '#ffe880',
  calm: '#bfdbfe', prudent: '#bfdbfe', natural: '#cce2cb', genuine: '#cce2cb', soft: '#c4bee2',
  whimsical: '#c4bee2', mystic: '#c7d2fe', inquisitive: '#c7d2fe', trendy: '#ffe880',
  enterprising: '#ffe0b2', strong: '#cbd5e1', dependable: '#cbd5e1', lovely: '#ffc5bf',
  considerate: '#ffc5bf', upright: '#fcd5ce', sensitive: '#fad2e1', spring: '#fcd5ce',
  summer: '#ffe880', autumn: '#ffe0b2', winter: '#bfdbfe', mountain: '#cbd5e1',
  sea: '#c7d2fe', river: '#b7d7e8', forest: '#cce2cb',
};

const hexToRgba = (hex: string, alpha: number): string => {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// 🟢 [복원 및 TS 에러 해결] 원본 로직 유지. 태그 텍스트에 다국어가 적용되도록 t 함수만 인자로 받음
const getKeywordTags = (gender: string | null, vibe: string | null, personality: string | null, seasonNature: string | null, t: any) => {
  const tags = [];
  if (gender === 'male') tags.push({ text: t("options.gender.male") || '남성', color: STEP_COLOR_MAP.male });
  else if (gender === 'female') tags.push({ text: t("options.gender.female") || '여성', color: STEP_COLOR_MAP.female });
  else if (gender === 'neutral') tags.push({ text: t("options.gender.neutral") || '성별무관', color: STEP_COLOR_MAP.neutral });

  if (vibe && VIBE_MAP[vibe]) tags.push({ text: t(`options.vibe.${vibe}`) || VIBE_MAP[vibe], color: STEP_COLOR_MAP[vibe] || '#e2e8f0' });
  if (personality && PERSONALITY_MAP[personality]) tags.push({ text: t(`options.personality.${personality}`) || PERSONALITY_MAP[personality], color: STEP_COLOR_MAP[personality] || '#e2e8f0' });
  if (seasonNature && NATURE_MAP[seasonNature]) tags.push({ text: t(`options.nature.${seasonNature}`) || NATURE_MAP[seasonNature], color: STEP_COLOR_MAP[seasonNature] || '#e2e8f0' });
  return tags;
};

// --- 아래 UI 컴포넌트들은 단 1px도 변경 없이 원본 그대로 복구 ---
const FretCorner = () => {
  const brackets = [
    { path: 'M7 37 V7 H37', width: 1.6, opacity: 1 },
    { path: 'M13 31 V13 H31', width: 1.2, opacity: 0.8 },
    { path: 'M19 25 V19 H25', width: 0.9, opacity: 0.55 },
  ];
  const tickPositions = [6.5, 12, 17.5, 23, 28.5, 34];
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-full h-full overflow-visible">
      {brackets.map((b) => <path key={b.path} d={b.path} stroke="currentColor" strokeWidth={b.width} strokeLinecap="square" opacity={b.opacity} />)}
      {tickPositions.map((p) => <rect key={`h-${p}`} x={p - 0.7} y={1.1} width={1.4} height={1.4} fill="currentColor" opacity={0.5} />)}
      {tickPositions.map((p) => <rect key={`v-${p}`} x={1.1} y={p - 0.7} width={1.4} height={1.4} fill="currentColor" opacity={0.5} />)}
      {[15.5, 22, 28.5].map((p) => <line key={`d-${p}`} x1={p} y1={4.5} x2={4.5} y2={p} stroke="currentColor" strokeWidth={0.6} opacity={0.22} />)}
      <rect x="19" y="19" width="6" height="6" fill="currentColor" fillOpacity={0.14} />
      <rect x="-2.1" y="-2.1" width="4.2" height="4.2" fill="currentColor" opacity={0.92} transform="rotate(45 0 0)" />
    </svg>
  );
};

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
      {leaves.map((l, i) => <ellipse key={i} cx={l.cx} cy={l.cy} rx={l.rx} ry={l.ry} fill="currentColor" fillOpacity={0.22} transform={`rotate(${l.rot} ${l.cx} ${l.cy})`} />)}
      {flowers.map((f, idx) => (
        <g key={idx} opacity={0.95 - idx * 0.1}>
          {[0, 72, 144, 216, 288].map((deg) => <ellipse key={deg} cx={f.cx} cy={f.cy - f.r * 0.85} rx={f.r * 0.5} ry={f.r * 0.95} fill="currentColor" fillOpacity={0.32} transform={`rotate(${deg} ${f.cx} ${f.cy})`} />)}
          <circle cx={f.cx} cy={f.cy} r={f.r * 0.26} fill="currentColor" fillOpacity={0.85} />
        </g>
      ))}
      {buds.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={0.9} fill="currentColor" fillOpacity={0.55} />)}
    </svg>
  );
};

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
      {positions.map((p) => <span key={`l-${p}`} style={{ top: `${p}%` }} className={`absolute -left-[3px] -translate-y-1/2 w-[5px] h-[5px] rotate-45 ${dotClass} opacity-70`} />)}
      {positions.map((p) => <span key={`r-${p}`} style={{ top: `${p}%` }} className={`absolute -right-[3px] -translate-y-1/2 w-[5px] h-[5px] rotate-45 ${dotClass} opacity-70`} />)}
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
    <div className="absolute inset-3 md:inset-5 pointer-events-none z-0">
      <div className={`absolute inset-0 border ${theme.border} rounded-lg transition-all duration-500`} />
      <div className={`absolute inset-[3px] border ${theme.border} rounded-md opacity-60 transition-all duration-500`} />

      <EdgeBeads dotClass={theme.dot} />

      <span className={`absolute top-1/2 -left-[3px] -translate-y-1/2 w-[7px] h-[7px] rotate-45 ${theme.dot} opacity-80`} />
      <span className={`absolute top-1/2 -right-[3px] -translate-y-1/2 w-[7px] h-[7px] rotate-45 ${theme.dot} opacity-80`} />

      <div className={`absolute -top-[7px] -left-[7px] w-12 h-12 md:w-[4.6rem] md:h-[4.6rem] ${theme.text} transition-colors duration-500`}><CornerOrnament /></div>
      <div className={`absolute -top-[7px] -right-[7px] w-12 h-12 md:w-[4.6rem] md:h-[4.6rem] ${theme.text} rotate-90 transition-colors duration-500`}><CornerOrnament /></div>
      <div className={`absolute -bottom-[7px] -right-[7px] w-12 h-12 md:w-[4.6rem] md:h-[4.6rem] ${theme.text} rotate-180 transition-colors duration-500`}><CornerOrnament /></div>
      <div className={`absolute -bottom-[7px] -left-[7px] w-12 h-12 md:w-[4.6rem] md:h-[4.6rem] ${theme.text} -rotate-90 transition-colors duration-500`}><CornerOrnament /></div>

      <span className={`absolute -top-[4px] left-1/2 -translate-x-1/2 w-[9px] h-[9px] rotate-45 ${theme.dot} opacity-85`} />
      <span className={`absolute -bottom-[4px] left-1/2 -translate-x-1/2 w-[9px] h-[9px] rotate-45 ${theme.dot} opacity-85`} />

      {theme.variant === 'male' && (
        <>
          <div className={`absolute top-[24%] -left-3 w-7 h-16 md:w-10 md:h-24 ${theme.text} opacity-80`}><BambooAccent /></div>
          <div className={`absolute top-[56%] -right-3 w-7 h-16 md:w-10 md:h-24 ${theme.text} opacity-80 scale-x-[-1]`}><BambooAccent /></div>
        </>
      )}

      {theme.variant === 'neutral' && (
        <>
          <div className={`absolute -top-2.5 left-[22%] -translate-x-1/2 w-7 h-4 md:w-9 md:h-5.5 ${theme.text} opacity-65`}><CloudMotif /></div>
          <div className={`absolute -top-2.5 right-[22%] translate-x-1/2 w-7 h-4 md:w-9 md:h-5.5 ${theme.text} opacity-65 scale-x-[-1]`}><CloudMotif /></div>
          <div className={`absolute -bottom-2.5 left-[22%] -translate-x-1/2 w-7 h-4 md:w-9 md:h-5.5 ${theme.text} opacity-65 scale-y-[-1]`}><CloudMotif /></div>
          <div className={`absolute -bottom-2.5 right-[22%] translate-x-1/2 w-7 h-4 md:w-9 md:h-5.5 ${theme.text} opacity-65 -scale-x-[1] scale-y-[-1]`}><CloudMotif /></div>
        </>
      )}
    </div>
  );
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
  const { t } = useTranslation();

  // 🟢 [복원 및 TS 에러 2554 해결] 원본 형태의 인자 전달 복구
  const resultName = useMemo(() => {
    return getRecommendedName(gender, vibe, personality, seasonNature);
  }, [gender, vibe, personality, seasonNature]);

  const keywordTags = getKeywordTags(gender, vibe, personality, seasonNature, t);

  const genderColorClass = 
    gender === 'male' ? 'bg-blue-400 text-blue-500' : 
    gender === 'female' ? 'bg-pink-400 text-pink-500' : 'bg-slate-400 text-slate-500';

  const isPureKorean = resultName?.hangul === resultName?.hanja;

  const badgeTheme = useMemo(() => {
    switch (gender) {
      case 'male': 
        return 'text-blue-500 border-blue-300/60 bg-blue-50/50';
      case 'female': 
        return 'text-pink-500 border-pink-300/60 bg-pink-50/50';
      default: 
        return 'text-slate-500 border-slate-300/60 bg-slate-50/50';
    }
  }, [gender]);

  // 🟢 [복원 및 TS 에러 2339, 2345 해결] 원본 파일에 있던 훅 인터페이스 완전 복구
  const { captureRef, isSaving, isSharing, handleDownload, handleShare } = useImageShare(
    `나의한글이름_${resultName?.hangul}`
  );

  // 데이터 로딩 중 방어막
  if (!resultName) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-12 items-stretch justify-start lg:justify-center pt-4 lg:pt-0 min-h-0"
    >
      <motion.div 
        variants={cardVariants}
        className="flex-1 w-full bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-[24px] md:rounded-[30px] shadow-xl flex flex-col justify-between relative overflow-hidden min-h-[550px] lg:min-h-0"
      >
        <div 
          ref={captureRef}
          className="flex-1 flex flex-col relative min-h-0 w-full bg-white"
        >
          
          <TraditionalGenderBorder gender={gender} />

          <div className="relative z-10 flex flex-col min-h-0 flex-1 justify-between items-center text-center px-6 md:px-12 py-6 md:py-8 gap-4 md:gap-6">
            
            <div className="w-full flex flex-col justify-center items-center mt-2 md:mt-3 shrink-0 opacity-60">
              <span className="text-xs md:text-sm font-serif font-bold tracking-[0.2em] text-gray-400">
                {t("result.title") || "나의 한글 이름"}
              </span>
            </div>

            <div className="flex justify-center items-baseline shrink-0 w-full relative">
              <div className="inline-flex items-baseline justify-center relative -translate-x-0 sm:-translate-x-0.5 md:-translate-x-1">
                <h2 className="text-5xl sm:text-6xl md:text-7xl font-KimSaeng text-gray-900 tracking-[0.3em] pl-[0.3em] drop-shadow-sm text-center leading-none">
                  {resultName.hangul}
                </h2>
                {!isPureKorean ? (
                  <span className="absolute left-full pl-2 md:pl-4 bottom-0 text-xl sm:text-2xl md:text-4xl font-serif font-normal text-gray-400 tracking-widest whitespace-nowrap leading-none">
                    {resultName.hanja}
                  </span>
                ) : (
                  <span className={`absolute left-full ml-2 md:ml-3 bottom-1 md:bottom-1.5 text-[10px] md:text-xs font-serif font-bold tracking-widest border px-2 py-0.5 rounded-md whitespace-nowrap leading-none shadow-xs transition-colors duration-500 ${badgeTheme}`}>
                    {t("result.pure_korean") || "순우리말"}
                  </span>
                )}
              </div>
            </div>

            <div className="w-full flex justify-center items-center">
              <div 
                className={`w-40 sm:w-56 md:w-72 h-5 md:h-8 transition-colors duration-500 opacity-80 ${genderColorClass.split(' ')[0]}`}
                style={{
                  maskImage: "url('icons/Common/name_under_icon.svg')", WebkitMaskImage: "url('icons/Common/name_under_icon.svg')",
                  maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center',
                  maskSize: 'contain', WebkitMaskSize: 'contain'
                }}
              />
            </div>

            {/* 🟢 [복원 및 TS 에러 2339 해결] 원본 디자인 태그 100% 보존 후, 에러났던 Object 속성들을 t() 함수로 교체 */}
            <p className="text-xs md:text-sm font-bold text-gray-900 tracking-wider shrink-0">
              {t("result.meaning_prefix") || "뜻"}{t(`names.${resultName.id}.shortMeaning`)}
            </p>
            <p className="text-lg sm:text-xl md:text-2xl font-serif font-extrabold text-[#1e4a38] leading-[1.6] break-keep drop-shadow-sm w-full max-w-[90%] md:max-w-lg mx-auto shrink-0 px-2">
              {t(`names.${resultName.id}.poeticQuote`)}
            </p>
            
            <div className="w-full shrink-0">
              <div className="flex flex-wrap justify-center items-center gap-2 md:gap-2.5 max-w-lg md:max-w-3xl mx-auto px-4">
                {keywordTags.map((tag, idx) => (
                  <span 
                    key={idx}
                    style={{ backgroundColor: hexToRgba(tag.color, 0.22), borderColor: tag.color }}
                    className="px-3 py-1.5 md:px-4 md:py-2 rounded-full border text-gray-900 text-xs md:text-sm font-extrabold shadow-2xs transition-transform hover:-translate-y-0.5 duration-300 whitespace-nowrap"
                  >
                    #{tag.text}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* 캡처에 포함되지 않는 하단 제어 버튼 바 */}
        <div className="relative z-10 border-t border-gray-100 bg-white/40 backdrop-blur-xs py-4 px-4 md:py-5 md:px-8 flex flex-col md:flex-row items-center gap-3 md:justify-between shrink-0 w-full">
          <button 
            onClick={resetFlow}
            disabled={isSaving || isSharing}
            className={`w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3.5 md:py-3 rounded-[16px] md:rounded-full text-sm font-bold text-gray-600 bg-gray-100/80 transition-colors shrink-0 ${isSaving || isSharing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
          >
            <RotateCcw size={15} strokeWidth={2.5} className="shrink-0" />
            <span>{t("result.buttons.retry") || "다시 하기"}</span>
          </button>
          
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <button 
              onClick={handleShare}
              disabled={isSaving || isSharing}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-3.5 md:px-5 md:py-3 rounded-[16px] md:rounded-full text-sm font-bold text-gray-700 bg-white border border-gray-300 transition-all shadow-sm ${isSaving || isSharing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
            >
              <Share2 size={15} className="shrink-0" />
              <span>{isSharing ? (t("result.buttons.sharing") || '준비 중...') : (t("result.buttons.share") || '결과 공유')}</span>
            </button>
            <button 
              onClick={handleDownload}
              disabled={isSaving || isSharing}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-3.5 md:px-6 md:py-3 rounded-[16px] md:rounded-full text-sm font-bold text-white bg-[#1e4a38] transition-all shadow-md ${isSaving || isSharing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#143427] hover:shadow-lg'}`}
            >
              <Download size={15} className="shrink-0" />
              <span>{isSaving ? (t("result.buttons.saving") || '저장 중...') : (t("result.buttons.download") || '이미지 저장')}</span>
            </button>
          </div>
        </div>
      </motion.div>

      <div className="hidden lg:flex w-[340px] flex-col gap-5 shrink-0 min-h-0">
        <div className="flex-1 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-[26px] p-4 shadow-xl flex flex-col justify-center items-center relative overflow-hidden min-h-[140px]">
          <div className="absolute inset-0 bg-slate-50/50 pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center justify-center gap-1">
            <span className="text-[9px] font-extrabold tracking-widest text-gray-400 bg-gray-200/60 px-2 py-0.5 rounded">ADVERTISEMENT</span>
            <p className="text-sm font-extrabold text-gray-400 mt-1">스폰서 배너 광고</p>
            <span className="text-[10px] font-medium text-gray-400/80">[ 상단 디스플레이 영역 ]</span>
          </div>
        </div>

        <div className="h-[240px] bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-[26px] p-4 shadow-xl flex flex-col justify-center items-center relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-slate-50/50 pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center justify-center gap-1">
            <span className="text-[9px] font-extrabold tracking-widest text-gray-400 bg-gray-200/60 px-2 py-0.5 rounded">ADVERTISEMENT</span>
            <p className="text-sm font-extrabold text-gray-400 mt-1">광고</p>
            <span className="text-[10px] font-medium text-gray-400/80">[ 300 × 250 디스플레이 배너 영역 ]</span>
          </div>
        </div>
      </div>

      <div className="lg:hidden w-full h-[80px] bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-[20px] shadow-sm flex flex-col items-center justify-center shrink-0 mt-6 mb-8">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-extrabold tracking-widest text-white bg-gray-400 px-2 py-0.5 rounded">AD</span>
          <span className="text-xs font-bold text-gray-500">모바일 띠 배너 광고 영역</span>
        </div>
      </div>

    </motion.div>
  );
}