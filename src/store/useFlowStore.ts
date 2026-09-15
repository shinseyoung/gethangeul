import { create } from 'zustand';

export type Language = 'ko' | 'en' | 'vi' | 'th';

export const LANGUAGES: { code: Language; endonym: string; english: string }[] = [
  { code: 'en', endonym: 'English', english: 'English' },
  { code: 'ko', endonym: '한국어', english: 'Korean' },
  { code: 'vi', endonym: 'Tiếng Việt', english: 'Vietnamese' },
  { code: 'th', endonym: 'ไทย', english: 'Thai' },
];

export const STEPS = [
  'landing', 'gender', 'vibe', 'personality', 'nature', 'surname', 'loading', 'result',
] as const;
export type StepId = (typeof STEPS)[number];

/** The four question screens, in order — used for the progress rail. */
export const QUESTION_STEPS = ['gender', 'vibe', 'personality', 'nature'] as const;
export type QuestionStep = (typeof QUESTION_STEPS)[number];

/** The site has three rooms. The address says which one you are in. */
export type Tool = 'name' | 'pair' | 'impression' | 'kdrama' | 'fortune';

const LANG_KEY = 'gethangeul.lang';
const SUPPORTED = LANGUAGES.map((l) => l.code);
const PATH_LANG = /^\/(ko|en|vi|th)(?=\/|$)/;
const PATH_TOOL = /^\/(?:ko|en|vi|th)\/(pair|impression|kdrama|fortune)(?=\/|$)/;

/** The URL wins: a shared link must open in the language it was shared in. */
export function langFromPath(): Language | null {
  if (typeof location === 'undefined') return null;
  const m = PATH_LANG.exec(location.pathname);
  return m ? (m[1] as Language) : null;
}

export function toolFromPath(): Tool {
  if (typeof location === 'undefined') return 'name';
  return (PATH_TOOL.exec(location.pathname)?.[1] as Tool) ?? 'name';
}

export function pathFor(lang: Language, tool: Tool): string {
  return tool === 'name' ? `/${lang}` : `/${lang}/${tool}`;
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
const initialTool = toolFromPath();
if (typeof history !== 'undefined' && !fromPath) {
  history.replaceState({}, '', pathFor(initialLang, initialTool) + location.search);
}

interface FlowState {
  step: StepId;
  tool: Tool;
  lang: Language;
  /** true until the visitor picks a language themselves — gates the detect bar */
  langAutoPicked: boolean;

  givenName: string;
  gender: 'male' | 'female' | 'neutral' | null;
  vibe: string | null;
  personality: string | null;
  seasonNature: string | null;
  /** null until the surname screen resolves one; never null past it */
  surnameId: string | null;

  /** the two names on the compatibility screen, kept across navigation */
  pairA: string;
  pairB: string;

  /** the name on the first-impression screen, kept across navigation */
  impressionName: string;
  setImpressionName: (value: string) => void;

  /** the fortune room's two fields, kept across navigation */
  fortuneName: string;
  fortuneBirthday: string;
  setFortuneName: (value: string) => void;
  setFortuneBirthday: (value: string) => void;

  /** one option index per question, null until answered */
  kdramaAnswers: (number | null)[];
  /** 0 is the intro, 1..6 are the questions, 7 is the card */
  kdramaStep: number;
  /** how many times "다른 이름으로" has been pressed */
  kdramaReroll: number;
  setKdramaAnswer: (index: number, option: number) => void;
  setKdramaStep: (step: number) => void;
  bumpKdramaReroll: () => void;
  resetKdrama: () => void;

  setStep: (step: StepId) => void;
  next: () => void;
  prev: () => void;

  setTool: (tool: Tool) => void;
  setLang: (lang: Language) => void;
  syncFromPath: () => void;
  dismissLangHint: () => void;

  setGivenName: (name: string) => void;
  setGender: (v: FlowState['gender']) => void;
  setVibe: (v: string | null) => void;
  setPersonality: (v: string | null) => void;
  setSeasonNature: (v: string | null) => void;
  /** null clears the choice and hands the screen back to its suggestion */
  setSurname: (id: string | null) => void;
  setPair: (which: 'a' | 'b', value: string) => void;
  setAnswer: (step: QuestionStep, value: string | null) => void;
  answerFor: (step: QuestionStep) => string | null;

  restart: () => void;
}

/**
 * The attribute every font stack keys off, written the moment the language
 * changes rather than in an effect afterwards.
 *
 * OpticalText measures its centring in a layout effect, and layout effects run
 * before passive ones — so with the attribute set in App's useEffect, every
 * label on the page was measured against the font it was *leaving* and painted
 * one frame up to 1.5px out of place before correcting itself.
 */
const applyLang = (lang: Language) => {
  if (typeof document !== 'undefined') document.documentElement.lang = lang;
};

const shift = (step: StepId, by: number): StepId => {
  const i = STEPS.indexOf(step);
  return STEPS[Math.min(STEPS.length - 1, Math.max(0, i + by))];
};

export const useFlowStore = create<FlowState>((set, get) => ({
  step: 'landing',
  tool: initialTool,
  lang: initialLang,
  langAutoPicked: fromPath === null && stored === null,

  givenName: '',
  gender: null,
  vibe: null,
  personality: null,
  seasonNature: null,
  surnameId: null,
  pairA: '',
  pairB: '',
  impressionName: '',
  setImpressionName: (impressionName) => set({ impressionName }),

  fortuneName: '',
  fortuneBirthday: '',
  setFortuneName: (fortuneName) => set({ fortuneName }),
  setFortuneBirthday: (fortuneBirthday) => set({ fortuneBirthday }),

  kdramaAnswers: Array(12).fill(null),
  kdramaStep: 0,
  kdramaReroll: 0,
  setKdramaAnswer: (index, option) => set((s) => {
    const next = [...s.kdramaAnswers];
    next[index] = option;
    return { kdramaAnswers: next };
  }),
  setKdramaStep: (kdramaStep) => set({ kdramaStep }),
  bumpKdramaReroll: () => set((s) => ({ kdramaReroll: s.kdramaReroll + 1 })),
  /* the casting is the result; only the name may be re-rolled, so this clears
     everything and sends the visitor back to the first question */
  resetKdrama: () => set({ kdramaAnswers: Array(12).fill(null), kdramaStep: 0, kdramaReroll: 0 }),

  setStep: (step) => set({ step }),
  next: () => set((s) => ({ step: shift(s.step, 1) })),
  prev: () => set((s) => ({ step: shift(s.step, -1) })),

  setTool: (tool) => {
    if (typeof history !== 'undefined') {
      history.pushState({}, '', pathFor(get().lang, tool) + location.search);
    }
    set({ tool });
  },
  setLang: (lang) => {
    try { localStorage.setItem(LANG_KEY, lang); } catch { /* private mode */ }
    if (typeof history !== 'undefined') {
      history.pushState({}, '', pathFor(lang, get().tool) + location.search);
    }
    applyLang(lang);
    set({ lang, langAutoPicked: false });
  },
  /** the browser's back button moving between /en, /ko and /en/pair */
  syncFromPath: () => {
    const fromUrl = langFromPath();
    if (fromUrl) applyLang(fromUrl);
    set({
      tool: toolFromPath(),
      ...(fromUrl ? { lang: fromUrl, langAutoPicked: false } : {}),
    });
  },
  dismissLangHint: () => set({ langAutoPicked: false }),

  setGivenName: (givenName) => set({ givenName }),
  setGender: (gender) => set({ gender }),
  setVibe: (vibe) => set({ vibe }),
  setPersonality: (personality) => set({ personality }),
  setSeasonNature: (seasonNature) => set({ seasonNature }),
  setSurname: (surnameId) => set({ surnameId }),
  setPair: (which, value) => set(which === 'a' ? { pairA: value } : { pairB: value }),

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

  /** The only way back: answer again and get another name. */
  restart: () => set({
    step: 'landing', givenName: '', gender: null, vibe: null,
    personality: null, seasonNature: null, surnameId: null,
  }),
}));
