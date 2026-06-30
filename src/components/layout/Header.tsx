    import { useState } from "react";
    import { ChevronDown } from "lucide-react";

    const LANGUAGES = ["한국어", "English", "ไทย", "Tiếng Việt"];

    export const Header = () => {
    const [langOpen, setLangOpen] = useState(false);
    const [currentLang, setCurrentLang] = useState("한국어");
    const [logoHover, setLogoHover] = useState(false);

    return (
        <header className="w-full h-[80px] md:h-[110px] border-b border-gray-300/50 shrink-0 z-30 bg-[#ffffff] flex justify-center">
        <div className="w-full max-w-[1200px] h-full px-6 md:px-14 grid grid-cols-3 items-center mx-auto">

            {/* left spacer */}
            <div className="flex-1 flex justify-start opacity-0 pointer-events-none">
            <div className="w-[80px] md:w-[120px]"></div>
            </div>

            {/* logo */}
            <div
            onClick={() => window.location.reload()}
            className={`shrink-0 flex flex-col items-center gap-1 cursor-pointer select-none transition-opacity duration-200 ${
                logoHover ? "opacity-45" : "opacity-100"
            }`}
            onMouseEnter={() => setLogoHover(true)}
            onMouseLeave={() => setLogoHover(false)}
            >
            <span className="font-KimSaeng text-[18px] md:text-[28px] text-gray-900 tracking-tight whitespace-nowrap">
                나의 한글 이름 짓기
            </span>

            <span className="font-KimSaeng text-[12px] md:text-[15px] text-gray-400 tracking-widest whitespace-nowrap">
                Get Your Hangeul Name
            </span>
            </div>

            {/* language */}
            <div className="flex-1 flex justify-end shrink-0">
            <div className="relative">

                {/* 버튼 */}
                <button
                onClick={(e) => {
                    e.stopPropagation();
                    setLangOpen((p) => !p);
                }}
                className="flex items-center gap-1.5 text-[13px] md:text-[20px] text-gray-600 hover:text-gray-900 transition-colors bg-[#ffffff] px-3 py-1.5 rounded-full"
                >
                <img
                    src="/icons/language_icon.svg"
                    alt="language"
                    className="w-5 h-5 translate-y-[0.8px]"
                />
                <span className="font-sanrif font-bold">
                    {currentLang}
                </span>
                
                <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                    langOpen ? "rotate-180" : "rotate-0"
                    }`}
                />
                </button>

                {/* 드롭다운 */}
                <div
                className={`absolute right-0 top-full mt-3 w-40 md:w-44 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-[60] origin-top-right transition-all duration-200 ${
                    langOpen
                    ? "opacity-100 scale-100 pointer-events-auto"
                    : "opacity-0 scale-95 pointer-events-none"
                }`}
                >
                <div className="py-1">
                    {LANGUAGES.map((lang) => (
                    <button
                        key={lang}
                        onClick={(e) => {
                        e.stopPropagation();
                        setCurrentLang(lang);
                        setLangOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-[12px] md:text-[13px] text-gray-700 hover:bg-gray-100 transition-colors font-sans"
                    >
                        <span>{lang}</span>

                        {/* 체크 표시 */}
                        {currentLang === lang && (
                        <span className="text-[#1e4a38] font-bold">✔</span>
                        )}
                    </button>
                    ))}
                </div>
                </div>

            </div>
            </div>

        </div>

        {langOpen && (
            <div
            className="fixed inset-0 z-[50] cursor-default"
            onClick={() => setLangOpen(false)}
            />
        )}
        </header>
    );
    };