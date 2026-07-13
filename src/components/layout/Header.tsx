import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useFlowStore, type Language } from "../../store/useFlowStore";

const LANGUAGES: { code: Language; name: string }[] = [
  { code: "ko", name: "한국어" },
  { code: "en", name: "English" },
  { code: "vi", name: "Tiếng Việt" },
  { code: "th", name: "ไทย" },
];

export const Header = () => {
  const [langOpen, setLangOpen] = useState(false);
  const [logoHover, setLogoHover] = useState(false);
  const { lang, setLang } = useFlowStore();
  const currentLangName = LANGUAGES.find((l) => l.code === lang)?.name || "한국어";

  return (
    // 🟢 개선 1: 높이를 h-[70px] md:h-[92px]로 정밀 축소하여 화면 하단 푸터(Footer)의 안정적인 가시성 확보
    <header className="w-full h-[70px] md:h-[92px] border-b border-gray-300/50 shrink-0 bg-[#ffffff] flex justify-center sticky top-0 z-30">
      
      {/* 본문 콘텐츠 시작/끝 정렬 라인과 100% 수직 일치 (w-full lg:w-[1024px] xl:w-[1200px] px-4 md:px-6 lg:px-4) */}
      <div className="w-full lg:w-[1024px] xl:w-[1200px] h-full px-4 md:px-6 lg:px-4 flex items-center justify-between mx-auto">

        {/* 좌측 정렬 로고 영역 */}
        <div
          onClick={() => window.location.reload()}
          className={`flex flex-col items-start gap-0.5 cursor-pointer select-none transition-opacity duration-200 ${
            logoHover ? "opacity-45" : "opacity-100"
          }`}
          onMouseEnter={() => setLogoHover(true)}
          onMouseLeave={() => setLogoHover(false)}
        >
          {/* 🟢 개선 2: 슬림해진 헤더 높이에 맞추어 폰트 크기를 text-[30px]로 미세 조율하여 상하 여백의 시각적 숨통 확보 */}
          <span className="font-KimSaeng text-xl md:text-[30px] text-[#1e4a38] tracking-widest leading-none mt-1 whitespace-nowrap">
            나의 한글 이름 짓기
          </span>
          <span className="text-[9px] md:text-[10px] text-[#1e4a38]/60 font-sans font-bold tracking-[0.2em] uppercase whitespace-nowrap mt-0.5 md:mt-1 ml-[2.5px]">
            Get Your Hangeul Name
          </span>
        </div>

        {/* 우측 정렬 언어 변경 영역 (1안 캡슐 다이어트 유지) */}
        <div className="relative">
          {/* 상하 정렬 균형을 위해 py-2 분기 최적화 */}
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1 md:gap-2 px-2.5 py-1.5 md:px-4 md:py-2 rounded-full bg-gray-50/80 hover:bg-gray-100 border border-gray-200/60 transition-all text-[#1e4a38]"
          >
            <img src="/icons/language_icon.svg" alt="Language" className="w-5 h-5 opacity-80 shrink-0" />
            
            <ChevronDown size={14} className={`transition-transform duration-200 opacity-60 shrink-0 ${langOpen ? "rotate-180" : ""}`} />
          </button>

          {/* 언어 선택 드롭다운 메뉴 리스트 */}
          <div
            className={`absolute top-full right-0 mt-2 w-32 md:w-36 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50 origin-top-right transition-all duration-200 ${
              langOpen
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            <div className="py-1">
              {LANGUAGES.map((item, index) => {
                // 사용자가 전역 상태로 선택한 언어와 일치하는지 비교합니다.
                const isSelected = lang === item.code;
                
                return (
                  <button
                    key={index}
                    onClick={() => {
                      setLang(item.code);  // 언어 변경!
                      setLangOpen(false);  // 메뉴 닫기!
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-[12px] md:text-[13px] text-gray-700 hover:bg-gray-100 transition-colors font-sans text-left"
                  >
                    <span>{item.name}</span>
                    
                    {item.code === lang && (
                    <span className="text-[#1e4a38] font-bold">✓</span>)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {langOpen && (
        <div
          className="fixed inset-0 z-40 cursor-default"
          onClick={() => setLangOpen(false)}
        />
      )}
    </header>
  );
};