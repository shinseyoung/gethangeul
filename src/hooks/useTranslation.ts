import { useFlowStore, type Language } from '../store/useFlowStore';
import koCommon from '../data/locales/ko/common.json';
import enCommon from '../data/locales/en/common.json';
import viCommon from '../data/locales/vi/common.json';
import thCommon from '../data/locales/th/common.json';

type TranslationData = typeof koCommon;

const translations: Record<Language, TranslationData> = {
  ko: koCommon as TranslationData,
  en: enCommon as TranslationData,
  vi: viCommon as TranslationData,
  th: thCommon as TranslationData,
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