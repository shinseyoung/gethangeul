import { useState, useEffect } from "react";

interface Step0Props {
  onNext: () => void;
}

// =====================================================================
// 📁 3. src/steps/Step0Landing.tsx
// =====================================================================
const FEATURES = [
  { 
    iconSrc: "/icons/Landing/user_icon.svg", 
    title: "나만을 위한 맞춤 이름", 
    desc: "당신의 성격과 가치관을\n반영한 특별한 한글 이름입니다." 
  },
  { 
    iconSrc: "/icons/Landing/book_icon.svg", 
    title: "이름 속에 담긴 의미", 
    desc: "글자가 가진\n아름다운 의미를 알려드려요." 
  },
  { 
    iconSrc: "/icons/Landing/share_icon.svg", 
    title: "공유하고 간직하는 경험", 
    desc: "이름과 의미를 이미지로\n다운로드하고 공유해보세요." 
  },
  { 
    iconSrc: "/icons/Landing/shield_icon.svg", 
    title: "안심하고 사용하세요", 
    desc: "입력하신 정보는 안전하게 보호되며,\n저장되지 않습니다." 
  },
];

export default function Step0Landing({ onNext }: Step0Props) {
  const [visible, setVisible] = useState(false);
  const [btnHover, setBtnHover] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    // [개선 1] h-[100dvh]를 h-full로 변경 -> 헤더와 푸터 사이의 남은 공간에 완벽히 맞추어 푸터 밀림 현상 해결
    <div
      className="relative h-full w-full flex flex-col overflow-y-hidden overflow-x-hidden font-serif bg-[#ffffff]"
      style={{ fontFamily: "'Gowun Batang', serif" }} 
    >
      <div
        className={`relative z-10 flex flex-col min-h-full w-full mx-auto transition-all duration-700 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >


        {/* 본문 영역 */}
        {/* main은 flex-1과 shrink-0을 가져서 콘텐츠가 넘칠 때 찌그러지지 않고 부모에 스크롤을 발생시킵니다. */}
        <main className="relative flex-1 flex flex-col shrink-0">
          
          <div
            className="absolute inset-0 z-0 bg-cover bg-bottom bg-no-repeat"
            style={{ backgroundImage: "url('/bg_mountain.png')" }}
          />
          <div
            className="absolute inset-0 z-0"
            style={{
              background:
              "linear-gradient(to right, rgba(255,255,255,1) 0%,rgba(255,255,255,1) 50%,rgba(255,255,255,0) 100%)"
                
            }}
          />

          {/* [개선 2] justify-between을 justify-center gap-10 md:gap-14 로 변경
              양끝으로 밀어붙여 압축(Squash)되는 현상을 막고, 확대 시 자연스럽게 요소 간 고정 거리를 유지합니다. */}
          <div className="relative z-10 w-full lg:w-[1024px] xl:w-[1200px] mx-auto px-6 lg:px-4 py-8 md:py-12 flex flex-col flex-1 justify-center gap-10 md:gap-14">
            
            {/* 메인 텍스트 영역 (shrink-0을 부여해 확대 시 텍스트 영역 자체가 압축되는 것 방지) */}
            <div className="flex flex-col max-w-[800px] shrink-0 items-start text-left">
              <h1 className="text-[32px] sm:text-[42px] md:text-[52px] font-bold text-gray-900 leading-[1.3] mb-4 md:mb-6 tracking-tight break-keep">
                모든 한글 이름에는{' '}
                <br className="block md:hidden" />
                <span className="inline-block mt-1 md:mt-0">예쁜 이야기가 담겨 있습니다.</span>
              </h1>

              <p className="text-[16px] md:text-[20px] text-gray-500 mb-8 md:mb-10 leading-relaxed break-keep">
                당신만의 특별한 이름을 찾아보세요.
              </p>

              <div>
                <button
                  onClick={onNext}
                  onMouseEnter={() => setBtnHover(true)}
                  onMouseLeave={() => setBtnHover(false)}
                  className={`relative inline-flex items-center gap-3 bg-[#1e4a38] text-white rounded-full text-[16px] md:text-[17px] font-bold shadow-lg overflow-hidden px-8 py-3.5 md:px-10 md:py-4 transition-all duration-200 ${
                    btnHover ? "bg-[#2a6350] -translate-y-[1px] shadow-xl" : ""
                  }`}
                >
                  내 이름 찾기
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform duration-200 ${
                      btnHover ? "translate-x-1" : "translate-x-0"
                    }`}
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 4단 피쳐 블록 (shrink-0 부여) */}
            <div className="border border-gray-200/80 rounded-2xl bg-white/40 backdrop-blur-sm overflow-hidden shadow-sm shrink-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:gap-y-0 lg:divide-x divide-gray-200/70">
                {FEATURES.map((f, i) => {
                  return (
                    <div
                      key={i}
                      className={`flex items-start sm:items-center gap-3.5 px-5 py-5 transition-all duration-700 ease-out sm:border-t-0 ${
                        i === 1 || i === 3 ? "sm:border-l border-gray-200/70 lg:border-l-0" : ""
                      } ${
                        i > 1 ? "sm:border-t border-gray-200/70 lg:border-t-0" : ""
                      } ${
                        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                      }`}
                      style={{ transitionDelay: `${200 + i * 80}ms` }}
                    >
                      {/* 🛠️ 개선: 불필요한 div 래퍼를 걷어내고 img 태그로 직관적으로 렌더링 */}
                      <img 
                        src={f.iconSrc} 
                        alt={f.title} 
                        draggable={false} // 드래그 방지
                        className="w-10 h-10 object-contain shrink-0 mt-0.5 sm:mt-0 select-none pointer-events-none border-0 outline-none" 
                        // drop-shadow를 완전히 제거하고, Step 1처럼 상호작용(터치/선택)을 막는 방어 코드를 추가했습니다.
                      />
                      <div>
                        <p className="text-left text-[13px] md:text-[14px] font-bold text-gray-800 mb-1 leading-snug">
                          {f.title}
                        </p>
                        <p className="text-left text-[11px] md:text-[12px] text-gray-500 leading-relaxed font-sans break-keep whitespace-pre-line">
                          {f.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>


      </div>
    </div>
  );
}