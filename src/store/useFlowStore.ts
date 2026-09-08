import { create } from 'zustand';

export type Language = 'ko' | 'en' | 'vi' | 'th';

export const LANGUAGES: { code: Language; endonym: string; english: string }[] = [
  { code: 'en', endonym: 'English', english: 'English' },
  { code: 'ko', endonym: '한국어', english: 'Korean' },
  { code: 'vi', endonym: 'Tiếng Việt', english: 'Vietnamese' },
  { code: 'th', endonym: 'ไทย', english: 'Thai' },
];

export const STEPS = [
  'landing', 'gender', 'vibe', 'personality', 'nature', 'loading', 'choice', 'result',
] as const;
export type StepId = (typeof STEPS)[number];

/** The four question screens, in order — used for the progress rail. */
export const QUESTION_STEPS = ['gender', 'vibe', 'personality', 'nature'] as const;
export type QuestionStep = (typeof QUESTION_STEPS)[number];

const LANG_KEY = 'gethangeul.lang';
const SUPPORTED = LANGUAGES.map((l) => l.code);
const PATH_LANG = /^\/(ko|en|vi|th)(?=\/|$)/;

/** The URL wins: a shared link must open in the language it was shared in. */
export function langFromPath(): Language | null {
  if (typeof location === 'undefined') return null;
  const m = PATH_LANG.exec(location.pathname);
  return m ? (m[1] as Language) : null;
}

export function pathForLang(lang: Language): string {
  const rest = typeof location === 'undefined' ? '' : location.pathname.replace(PATH_LANG, '');
  return `/${lang}${rest}`;
}

function readStoredLang(): Language | null {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    return saved && (SUPPORTED as string[]).includes(saved) ? (saved as Language) : null;
  } catch {
    return null;
  }
}

function detectLang(): { lang: Language; fromBrowser: boolean } {
  if (typeof navigator === 'undefined') return { lang: 'en', fromBrowser: false };
  const tags = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of tags) {
    const base = (tag ?? '').toLowerCase().split('-')[0];
    const hit = SUPPORTED.find((code) => code === base);
    if (hit) return { lang: hit, fromBrowser: true };
  }
  // Everyone this site is for reads something other than Korean. Defaulting to
  // 'ko' meant an English speaker landed on a page they could not read.
  return { lang: 'en', fromBrowser: false };
}

const fromPath = langFromPath();
const stored = typeof window === 'undefined' ? null : readStoredLang();
const detected = detectLang();
const initialLang = fromPath ?? stored ?? detected.lang;

// land every visit on a language URL, so the address bar always says which one
if (typeof history !== 'undefined' && !fromPath) {
  history.replaceState({}, '', pathForLang(initialLang) + location.search);
}

interface FlowState {
  step: StepId;
  lang: Language;
  /** true until the visitor picks a language themselves — gates the detect bar */
  langAutoPicked: boolean;

  givenName: string;
  gender: 'male' | 'female' | 'neutral' | null;
  vibe: string | null;
  personality: string | null;
  seasonNature: string | null;
  /** which of the three candidates the visitor kept */
  chosenId: string | null;

  setStep: (step: StepId) => void;
  next: () => void;
  prev: () => void;

  setLang: (lang: Language) => void;
  syncLangFromPath: () => void;
  dismissLangHint: () => void;

  setGivenName: (name: string) => void;
  setGender: (v: FlowState['gender']) => void;
  setVibe: (v: string | null) => void;
  setPersonality: (v: string | null) => void;
  setSeasonNature: (v: string | null) => void;
  setAnswer: (step: QuestionStep, value: string | null) => void;
  answerFor: (step: QuestionStep) => string | null;

  choose: (id: string) => void;
  reset: () => void;
  restart: () => void;
}

const shift = (step: StepId, by: number): StepId => {
  const i = STEPS.indexOf(step);
  return STEPS[Math.min(STEPS.length - 1, Math.max(0, i + by))];
};

export const useFlowStore = create<FlowState>((set, get) => ({
  step: 'landing',
  lang: initialLang,
  langAutoPicked: fromPath === null && stored === null,

  givenName: '',
  gender: null,
  vibe: null,
  personality: null,
  seasonNature: null,
  chosenId: null,

  setStep: (step) => set({ step }),
  next: () => set((s) => ({ step: shift(s.step, 1) })),
  prev: () => set((s) => ({ step: shift(s.step, -1) })),

  setLang: (lang) => {
    try { localStorage.setItem(LANG_KEY, lang); } catch { /* private mode */ }
    if (typeof history !== 'undefined') {
      history.pushState({}, '', pathForLang(lang) + location.search);
    }
    set({ lang, langAutoPicked: false });
  },
  /** the browser's back button moving between /en and /ko */
  syncLangFromPath: () => {
    const fromUrl = langFromPath();
    if (fromUrl) set({ lang: fromUrl, langAutoPicked: false });
  },
  dismissLangHint: () => set({ langAutoPicked: false }),

  setGivenName: (givenName) => set({ givenName }),
  setGender: (gender) => set({ gender }),
  setVibe: (vibe) => set({ vibe }),
  setPersonality: (personality) => set({ personality }),
  setSeasonNature: (seasonNature) => set({ seasonNature }),

  setAnswer: (step, value) => {
    if (step === 'gender') set({ gender: value as FlowState['gender'] });
    else if (step === 'vibe') set({ vibe: value });
    else if (step === 'personality') set({ personality: value });
    else set({ seasonNature: value });
  },
  answerFor: (step) => {
    const s = get();
    if (step === 'gender') return s.gender;
    if (step === 'vibe') return s.vibe;
    if (step === 'personality') return s.personality;
    return s.seasonNature;
  },

  choose: (chosenId) => set({ chosenId, step: 'result' }),

/** Back to the three candidates, answers intact — "show me another" */
  reset: () => set({ step: 'choice', chosenId: null }),

  /** Back to the very start, name included */
  restart: () => set({
    step: 'landing', givenName: '', gender: null, vibe: null,
    personality: null, seasonNature: null, chosenId: null,
  }),
}));
