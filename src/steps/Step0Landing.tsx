import { useState, useEffect } from "react";
import { useTranslation } from "../hooks/useTranslation";

interface Step0Props {
  onNext: () => void;
}

// 🟢 1. 언어에 따라 변하지 않는 정적 아이콘 에셋만 별도 배열로 깔끔하게 분리합니다.
const FEATURE_ICONS = [
  "/icons/Landing/user_icon.svg",
  "/icons/Landing/book_icon.svg",
  "/icons/Landing/share_icon.svg",
  "/icons/Landing/shield_icon.svg",
];

export default function Step0Landing({ onNext }: Step0Props) {
  const [visible, setVisible] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  
  // 🟢 2. 커스텀 다국어 훅에서 번역 함수(t)를 가져옵니다.
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // 🟢 3. common.json의 landing.features 배열을 가져옵니다. (안전성 방어 코드 포함)
  const featureTexts: Array<{ title: string; desc: string }> = t("landing.features") || [];

  return (
    <div
      className="relative h-full w-full flex flex-col overflow-y-hidden overflow-x-hidden font-serif bg-[#ffffff]"
      style={{ fontFamily: "'Gowun Batang', serif" }}
    >
      <div
        className={`relative z-10 flex flex-col min-h-full w-full mx-auto transition-[opacity,transform] duration-700 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        <main className="relative flex-1 flex flex-col shrink-0">
          <div
            className="absolute inset-0 z-0 bg-cover bg-bottom bg-no-repeat"
            style={{ backgroundImage: "url('/bg_mountain.png')" }}
          />
          <div
            className="absolute inset-0 z-0"
            style={{
              background:
                "linear-gradient(to right, rgba(255,255,255,1) 0%,rgba(255,255,255,1) 50%,rgba(255,255,255,0) 100%)",
            }}
          />

          <div className="relative z-10 w-full lg:w-[1024px] xl:w-[1200px] mx-auto px-6 lg:px-4 py-8 md:py-12 flex flex-col flex-1 justify-center gap-10 md:gap-14 transform-gpu will-change-transform backface-hidden">
            
            {/* 메인 텍스트 영역 */}
            <div className="flex flex-col max-w-[800px] shrink-0 items-start text-left min-h-[150px] sm:min-h-0">
              {/* 🟢 개선: whitespace-pre-line을 적용해 JSON 내부의 \n 개행이 언어별로 자연스럽게 작동하도록 유도 */}
              <h1 className="text-[32px] sm:text-[42px] md:text-[52px] font-bold text-gray-900 leading-[1.3] mb-4 md:mb-6 tracking-tight break-keep whitespace-pre-line">
                {t("landing.title_main")}
              </h1>

              <p className="text-[16px] md:text-[20px] text-gray-500 mb-8 md:mb-10 leading-relaxed break-keep whitespace-pre-line">
                {t("landing.subtitle")}
              </p>

              <div>
                <button
                  onClick={onNext}
                  onMouseEnter={() => setBtnHover(true)}
                  onMouseLeave={() => setBtnHover(false)}
                  className={`relative inline-flex items-center gap-3 bg-[#1e4a38] text-white rounded-full text-[16px] md:text-[17px] font-bold shadow-lg overflow-hidden px-8 py-3.5 md:px-10 md:py-4 transition-[opacity,transform] duration-200 ${
                    btnHover ? "bg-[#2a6350] -translate-y-[1px] shadow-xl" : ""
                  }`}
                >
                  {t("landing.cta_button")}
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

            {/* 4단 피처 블록 */}
            <div className="border border-gray-200/80 rounded-2xl bg-white/40 backdrop-blur-sm overflow-hidden shadow-sm shrink-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:gap-y-0 lg:divide-x divide-gray-200/70">
                {featureTexts.map((f, i) => {
                  return (
                    <div
                      key={i}
                      className={`transform-gpu will-change-transform backface-hidden flex items-center gap-3.5 px-5 py-5 transition-[opacity,transform] duration-700 ease-out sm:border-t-0 ${
                        i === 1 || i === 3 ? "sm:border-l border-gray-200/70 lg:border-l-0" : ""
                      } ${
                        i > 1 ? "sm:border-t border-gray-200/70 lg:border-t-0" : ""
                      } ${
                        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                      }`}
                      style={{ transitionDelay: `${200 + i * 80}ms` }}
                    >
                      <img
                        src={FEATURE_ICONS[i]}
                        alt={f.title}
                        width={40}
                        height={40}
                        draggable={false}
                        className="block w-10 h-10 object-contain shrink-0 select-none pointer-events-none border-0 outline-none"
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