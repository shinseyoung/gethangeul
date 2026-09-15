import { create } from 'zustand';
import type { Genre } from '../data/kdramaScenes';
import type { Answers } from '../data/situations';

export type Language = 'ko' | 'en' | 'vi' | 'th';

export const LANGUAGES: { code: Language; endonym: string; english: string }[] = [
  { code: 'en', endonym: 'English', english: 'English' },
  { code: 'ko', endonym: '한국어', english: 'Korean' },
  { code: 'vi', endonym: 'Tiếng Việt', english: 'Vietnamese' },
  { code: 'th', endonym: 'ไทย', english: 'Thai' },
];

export const STEPS = [
  'landing', 'cup', 'train', 'dinner', 'lift', 'market', 'evening', 'surname', 'loading', 'result',
] as const;
export type StepId = (typeof STEPS)[number];

/** The six situation screens, in order — used for the progress rail. */
export const QUESTION_STEPS = ['cup', 'train', 'dinner', 'lift', 'market', 'evening'] as const;
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
  /* Not a question any more: it is the one genuinely administrative field
     in the flow, and asking it first set the form tone for everything after.
     It lives on the surname screen now, where it reads as part of assembling
     a name rather than as the first thing the site wants to know about you. */
  gender: 'male' | 'female' | 'neutral' | null;
  /** one option index per situation, null until answered */
  nameAnswers: Answers;
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
  /** 0 is the intro, 1..12 are the scenes, 13 is the card */
  kdramaStep: number;
  /** the visitor's own name, and the only name in the room */
  kdramaName: string;
  /** which drama they are in; null until they pick one */
  kdramaGenre: Genre | null;
  setKdramaAnswer: (index: number, option: number) => void;
  setKdramaStep: (step: number) => void;
  setKdramaName: (name: string) => void;
  setKdramaGenre: (genre: Genre | null) => void;
  resetKdrama: () => void;

  setStep: (step: StepId) => void;
  next: () => void;
  prev: () => void;

  setTool: (tool: Tool) => void;
  /** put one room back to its first screen, wherever you are standing */
  resetTool: (tool: Tool) => void;
  setLang: (lang: Language) => void;
  syncFromPath: () => void;
  dismissLangHint: () => void;

  setGivenName: (name: string) => void;
  setGender: (v: FlowState['gender']) => void;
  setNameAnswer: (index: number, option: number) => void;
  /** null clears the choice and hands the screen back to its suggestion */
  setSurname: (id: string | null) => void;
  setPair: (which: 'a' | 'b', value: string) => void;

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
  nameAnswers: Array(6).fill(null),
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
  /* both asked for before the first scene: six of the twelve speak to the
     name, and the genre decides which twelve they are */
  kdramaName: '',
  kdramaGenre: null,
  setKdramaAnswer: (index, option) => set((s) => {
    const next = [...s.kdramaAnswers];
    next[index] = option;
    return { kdramaAnswers: next };
  }),
  setKdramaStep: (kdramaStep) => set({ kdramaStep }),
  setKdramaName: (kdramaName) => set({ kdramaName }),
  setKdramaGenre: (kdramaGenre) => set({ kdramaGenre }),
  /* the casting is the result, so this clears the answers and sends the visitor
     back to the first scene. The name stays: they are still themselves. */
  resetKdrama: () => set({ kdramaAnswers: Array(12).fill(null), kdramaStep: 0 }),

  setStep: (step) => set({ step }),
  next: () => set((s) => ({ step: shift(s.step, 1) })),
  prev: () => set((s) => ({ step: shift(s.step, -1) })),

  setTool: (tool) => {
    if (typeof history !== 'undefined') {
      history.pushState({}, '', pathFor(get().lang, tool) + location.search);
    }
    /* Clear the room being left, not the one being entered. Half-finished
       answers kept coming back hours later — you looked at one room, came back,
       and found somebody else's session waiting. Resetting on the way out and
       not on the way in is also what keeps the hand-offs working: the name
       result fills the pair room's first field and then switches to it, so the
       room being entered must be left alone. */
    const from = get().tool;
    if (from !== tool) get().resetTool(from);
    set({ tool });
  },
  resetTool: (tool) => {
    const s = get();
    if (tool === 'name') s.restart();
    // the name goes too, unlike resetKdrama, which is "다시 하기" on the card and
    // should not make someone type their own name in again to answer again
    else if (tool === 'kdrama') { s.resetKdrama(); s.setKdramaName(''); s.setKdramaGenre(null); }
    else if (tool === 'impression') s.setImpressionName('');
    else if (tool === 'pair') { s.setPair('a', ''); s.setPair('b', ''); }
    else if (tool === 'fortune') { s.setFortuneName(''); s.setFortuneBirthday(''); }
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
  setNameAnswer: (index, option) => set((state) => {
    const next = [...state.nameAnswers];
    next[index] = option;
    return { nameAnswers: next };
  }),
  setSurname: (surnameId) => set({ surnameId }),
  setPair: (which, value) => set(which === 'a' ? { pairA: value } : { pairB: value }),


  /** The only way back: answer again and get another name. */
  restart: () => set({
    step: 'landing', givenName: '', gender: null,
    nameAnswers: Array(6).fill(null), surnameId: null,
  }),
}));
