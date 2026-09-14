import { useFlowStore, type Language } from '../store/useFlowStore';

import koCommon from '../data/locales/ko/common.json';
import enCommon from '../data/locales/en/common.json';
import viCommon from '../data/locales/vi/common.json';
import thCommon from '../data/locales/th/common.json';

import koNames from '../data/locales/ko/names.json';
import enNames from '../data/locales/en/names.json';
import viNames from '../data/locales/vi/names.json';
import thNames from '../data/locales/th/names.json';

import koSurnames from '../data/locales/ko/surnames.json';
import enSurnames from '../data/locales/en/surnames.json';
import viSurnames from '../data/locales/vi/surnames.json';
import thSurnames from '../data/locales/th/surnames.json';

import koSyllables from '../data/locales/ko/syllables.json';
import enSyllables from '../data/locales/en/syllables.json';
import viSyllables from '../data/locales/vi/syllables.json';
import thSyllables from '../data/locales/th/syllables.json';

type TranslationData = typeof koCommon & {
  names: typeof koNames;
  surnames: typeof koSurnames;
  syllables: typeof koSyllables;
};

const translations: Record<Language, TranslationData> = {
  ko: { ...koCommon, names: koNames, surnames: koSurnames, syllables: koSyllables } as TranslationData,
  en: { ...enCommon, names: enNames, surnames: enSurnames, syllables: enSyllables } as unknown as TranslationData,
  vi: { ...viCommon, names: viNames, surnames: viSurnames, syllables: viSyllables } as unknown as TranslationData,
  th: { ...thCommon, names: thNames, surnames: thSurnames, syllables: thSyllables } as unknown as TranslationData,
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
