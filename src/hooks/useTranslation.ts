import { useFlowStore, type Language } from '../store/useFlowStore';

import koCommon from '../data/locales/ko/common.json';
import enCommon from '../data/locales/en/common.json';
import viCommon from '../data/locales/vi/common.json';
import thCommon from '../data/locales/th/common.json';

import koNames from '../data/locales/ko/names.json';
import enNames from '../data/locales/en/names.json';
import viNames from '../data/locales/vi/names.json';
import thNames from '../data/locales/th/names.json';

type TranslationData = typeof koCommon & { names: typeof koNames };

const translations: Record<Language, TranslationData> = {
  ko: { ...koCommon, names: koNames } as TranslationData,
  en: { ...enCommon, names: enNames } as unknown as TranslationData,
  vi: { ...viCommon, names: viNames } as unknown as TranslationData,
  th: { ...thCommon, names: thNames } as unknown as TranslationData,
};

function lookup(dict: unknown, path: string): unknown {
  let node: unknown = dict;
  for (const key of path.split('.')) {
    if (node && typeof node === 'object' && key in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return node;
}

export function useTranslation() {
  const lang = useFlowStore((state) => state.lang);
  const dict = translations[lang] ?? translations.en;

  /**
   * Falls back to English before giving up. Without this, a key that exists in
   * en but not yet in vi/th renders as the raw dotted path on screen — which is
   * how half-translated releases end up shipping "name.sound_title" to users.
   */
  const t = (path: string): any => {
    const hit = lookup(dict, path);
    if (hit !== undefined) return hit;
    const fallback = lookup(translations.en, path);
    return fallback !== undefined ? fallback : path;
  };

  return { t, lang };
}
