import { create } from 'zustand';
import type { Genre } from '../data/kdramaScenes';
import { drawVariants, type Answers, type Variants } from '../data/situations';

export type Language = 'ko' | 'en' | 'vi' | 'th';

export const LANGUAGES: { code: Language; endonym: string; english: string }[] = [
  { code: 'en', endonym: 'English', english: 'English' },
  { code: 'ko', endonym: '한국어', english: 'Korean' },
  { code: 'vi', endonym: 'Tiếng Việt', english: 'Vietnamese' },
  { code: 'th', endonym: 'ไทย', english: 'Thai' },
];

export const STEPS = [
  'landing', 'gender', 'cup', 'train', 'dinner', 'lift', 'market', 'evening',
  'pick', 'surname', 'loading', 'result',
] as const;
export type StepId = (typeof STEPS)[number];

/** The six situation screens, in order — used for the progress rail. */
export const QUESTION_STEPS = ['cup', 'train', 'dinner', 'lift', 'market', 'evening'] as const;
export type QuestionStep = (typeof QUESTION_STEPS)[number];

/** The site has three rooms. The address says which one you are in. */
export type Tool = 'name' | 'pair' | 'impression' | 'kdrama' | 'fortune';

/* renamed with the site. An old visitor loses a remembered language once,
   which the detect bar then offers to set again. */
const LANG_KEY = 'ganada.lang';
/* The name outlives the tab. Without this the site has no profile, only a
   session: every reload put the visitor back at an empty field, and every room
   they walked into asked who they were again. */
const NAME_KEY = 'ganada.name';
const KOREAN_KEY = 'ganada.korean';
const SUPPORTED = LANGUAGES.map((l) => l.code);
const PATH_LANG = /^\/(ko|en|vi|th)(?=\/|$)/;
const PATH_TOOL = /^\/(?:ko|en|vi|th)\/(pair|impression|kdrama|fortune)(?=\/|$)/;

/* Where the site is served from: '/' in dev and on a domain of its own,
   '/<repo>/' on a GitHub project page. Every path the router reads and writes
   goes through it — without that, /ganada/ko reads as no language at all, and
   the address it writes back is one the server has never heard of. */
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');

/** location.pathname with the base taken off, so the patterns above match the
 *  same way wherever the site is hosted. */
function routePath(): string {
  const path = location.pathname;
  return BASE && path.startsWith(BASE) ? path.slice(BASE.length) || '/' : path;
}

/** The URL wins: a shared link must open in the language it was shared in. */
export function langFromPath(): Language | null {
  if (typeof location === 'undefined') return null;
  const m = PATH_LANG.exec(routePath());
  return m ? (m[1] as Language) : null;
}

export function toolFromPath(): Tool {
  if (typeof location === 'undefined') return 'name';
  return (PATH_TOOL.exec(routePath())?.[1] as Tool) ?? 'name';
}

export function pathFor(lang: Language, tool: Tool): string {
  return tool === 'name' ? `${BASE}/${lang}` : `${BASE}/${lang}/${tool}`;
}

function readStoredLang(): Language | null {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    return saved && (SUPPORTED as string[]).includes(saved) ? (saved as Language) : null;
  } catch {
    return null;
  }
}

function readStored(key: string): string {
  try {
    return localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

function store(key: string, value: string) {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch { /* private mode */ }
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

  /* Your own name, as you type it — "seyoung", "Sarah", or already 하린.
     One field, not one per room: the site has a single subject, and asking
     five times is what made five features feel like five sites. */
  givenName: string;
  /* The Korean name you ended up with, always hangul. The quiz writes it when
     it settles on one; typing your own name writes what it romanises to. Every
     room downstream of the name reads this and asks nothing. */
  koreanName: string;
  setKoreanName: (value: string) => void;
  /* Back to the front, on a screen of its own.
     It had been buried on the surname screen to keep the flow from opening
     with a form. But it is a hard filter on the whole pool — answering it last
     means the six situations were scored against names the visitor was never
     going to be shown. Asked first, and with 성별 무관 a real answer rather
     than a blank, it reads as the first thing the name is built from. */
  gender: 'male' | 'female' | 'neutral' | null;
  /* Which of the three offered names was taken — an index into the match list,
     and null until one is. Defaulting to 0 meant the screen opened with the top
     name already ticked, which is the old behaviour wearing a choice: the
     visitor had not chosen it, the scorer had. */
  picked: number | null;
  setPicked: (index: number) => void;
  /** one option index per situation, null until answered */
  nameAnswers: Answers;
  /* Which telling of each situation this visit is getting. Drawn once, not
     per render, so stepping back and forward does not reshuffle the quiz
     under the visitor. Only the wording changes: the tags belong to the
     situation, so a shared card still reproduces for whoever opens it. */
  nameVariants: Variants;
  /** null until the surname screen resolves one; never null past it */
  surnameId: string | null;

  /** the two names on the compatibility screen; A is yours, prefilled on entry */
  pairA: string;
  pairB: string;

  /** the fortune room's other field — the one thing it needs that a name isn't */
  fortuneBirthday: string;
  setFortuneBirthday: (value: string) => void;

  /** one option index per question, null until answered */
  kdramaAnswers: (number | null)[];
  /** 0 is the intro, 1..12 are the scenes, 13 is the card */
  kdramaStep: number;
  /** which drama they are in; null until they pick one */
  kdramaGenre: Genre | null;
  setKdramaAnswer: (index: number, option: number) => void;
  setKdramaStep: (step: number) => void;
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

  picked: null,
  setPicked: (picked) => set({ picked }),
  givenName: typeof window === 'undefined' ? '' : readStored(NAME_KEY),
  koreanName: typeof window === 'undefined' ? '' : readStored(KOREAN_KEY),
  setKoreanName: (koreanName) => {
    store(KOREAN_KEY, koreanName);
    set({ koreanName });
  },
  gender: null,
  nameAnswers: Array(6).fill(null),
  nameVariants: drawVariants(),
  surnameId: null,
  pairA: '',
  pairB: '',

  fortuneBirthday: '',
  setFortuneBirthday: (fortuneBirthday) => set({ fortuneBirthday }),

  kdramaAnswers: Array(12).fill(null),
  kdramaStep: 0,
  kdramaGenre: null,
  setKdramaAnswer: (index, option) => set((s) => {
    const next = [...s.kdramaAnswers];
    next[index] = option;
    return { kdramaAnswers: next };
  }),
  setKdramaStep: (kdramaStep) => set({ kdramaStep }),
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
    /* Answers are what goes stale between visits, not the name. Every room used
       to clear its own copy of the name on the way out, which is the same bug
       as asking for it on the way in — you were a stranger again one tap later. */
    if (tool === 'name') s.restart();
    else if (tool === 'kdrama') { s.resetKdrama(); s.setKdramaGenre(null); }
    else if (tool === 'pair') s.setPair('b', '');
    else if (tool === 'fortune') s.setFortuneBirthday('');
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

  setGivenName: (givenName) => {
    store(NAME_KEY, givenName);
    set({ givenName });
  },
  setGender: (gender) => set({ gender }),
  setNameAnswer: (index, option) => set((state) => {
    const next = [...state.nameAnswers];
    next[index] = option;
    return { nameAnswers: next };
  }),
  setSurname: (surnameId) => set({ surnameId }),
  setPair: (which, value) => set(which === 'a' ? { pairA: value } : { pairB: value }),


  /* The only way back: answer again and get another name.
     Neither name is cleared. This runs on the way out of the room as well as
     from the button, so clearing the Korean name here would wipe the profile
     every time someone walked from their result to the fortune room — and the
     quiz overwrites it the moment it settles on another one anyway. */
  restart: () => set({
    step: 'landing', gender: null, picked: null,
    nameAnswers: Array(6).fill(null), surnameId: null,
    // starting over draws again: that is the whole point of writing three
    nameVariants: drawVariants(),
  }),
}));
