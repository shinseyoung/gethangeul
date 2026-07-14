import { useFlowStore, type Language } from '../store/useFlowStore';

// 🟢 1. 기존 common.json 임포트 (원본 유지)
import koCommon from '../data/locales/ko/common.json';
import enCommon from '../data/locales/en/common.json';
import viCommon from '../data/locales/vi/common.json';
import thCommon from '../data/locales/th/common.json';

// 🟢 2. 추가: 각 언어별 names.json 임포트
import koNames from '../data/locales/ko/names.json';
import enNames from '../data/locales/en/names.json';
import viNames from '../data/locales/vi/names.json';
import thNames from '../data/locales/th/names.json';

// 🟢 3. 타입 병합: common.json 타입에 names 객체 타입을 추가
type TranslationData = typeof koCommon & { names: typeof koNames };

// 🟢 4. 데이터 병합: 기존 common 데이터에 names 데이터를 'names' 키로 추가
const translations: Record<Language, TranslationData> = {
  ko: { ...koCommon, names: koNames } as TranslationData,
  en: { ...enCommon, names: enNames } as unknown as TranslationData,
  vi: { ...viCommon, names: viNames } as unknown as TranslationData,
  th: { ...thCommon, names: thNames } as unknown as TranslationData,
};

export function useTranslation() {
  const lang = useFlowStore((state) => state.lang);
  const currentDict = translations[lang] || translations.ko;

  const t = (path: string): any => {
    const keys = path.split('.');
    let result: any = currentDict;

    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key as keyof typeof result];
      } else {
        return path;
      }
    }

    return result;
  };

  return { t, lang };
}