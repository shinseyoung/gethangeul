// Runnable check for the font stacks: what may be re-ordered per language, and
// what may never move at all.
// Run with: npm run check
import { readFileSync } from 'node:fs';

let failures = 0;
function ok(label: string, condition: boolean, detail?: unknown) {
  if (condition) return;
  failures += 1;
  console.error(`  FAIL  ${label}${detail === undefined ? '' : ` — ${JSON.stringify(detail)}`}`);
}

const css = readFileSync('src/index.css', 'utf8');
const config = readFileSync('tailwind.config.js', 'utf8');

/** `'A', "B", C` -> `['A', 'B', 'C']` — quotes and spacing dropped. The config
 *  writes its entries double-quoted around single quotes, so strip both. */
const families = (list: string) =>
  list.split(',').map((f) => f.trim().replace(/^['"]+|['"]+$/g, '')).filter(Boolean);

/** The stacks tailwind.config.js defines, by utility name. */
const defaults = new Map<string, string[]>();
for (const [, name, list] of config.matchAll(/^\s{8}(\w+): \[([^\]]+)\]/gm)) {
  defaults.set(name, families(list));
}
ok('the config stacks parsed', defaults.size >= 5, [...defaults.keys()]);

// --- what a language may do to a stack ------------------------------------
// Leading with the page's own face fixes the line box (see the note in
// index.css). Re-ordering is the whole point; dropping is always a bug, and it
// is invisible until someone writes in the script that went missing. That is
// how every Thai character on a Korean page came to be drawn by the system
// serif: 'Noto Sans Thai' had quietly fallen out of the override.

const overrides = [...css.matchAll(/html\[lang='(\w+)'\] \.font-(\w+) \{\s*font-family: ([^;]+);/g)];
ok('the language overrides parsed', overrides.length >= 2, overrides.length);

for (const [, lang, utility, list] of overrides) {
  const base = defaults.get(utility);
  ok(`${utility} is a real stack`, base !== undefined, utility);
  if (!base) continue;

  const got = families(list);
  const dropped = base.filter((f) => !got.includes(f));
  ok(`html[lang='${lang}'] .font-${utility} drops no face from the default stack`,
    dropped.length === 0, dropped);
  ok(`html[lang='${lang}'] .font-${utility} leads with that language's own face`,
    got[0] !== base[0], got[0]);
}

// The placeholder rule is written out separately because ::placeholder is its
// own pseudo-element; it is meant to be the body stack and drifts if hand-edited.
const placeholder = /html\[lang='ko'\] input::placeholder \{\s*font-family: ([^;]+);/.exec(css);
const koBody = /html\[lang='ko'\] \.font-body \{\s*font-family: ([^;]+);/.exec(css);
ok('the ko placeholder stack is the ko body stack',
  placeholder !== null && koBody !== null
  && families(placeholder[1]).join('|') === families(koBody[1]).join('|'),
  placeholder?.[1]);

// --- the stack that may not be re-ordered ---------------------------------
// The language menu is eight fixed words in four scripts. Restyling them when
// the language changes means the list you are choosing from redraws under the
// cursor, and it redraws while the panel is still on screen.

const endonym = defaults.get('endonym');
ok('there is an endonym stack', endonym !== undefined);
ok('it covers Latin, Hangul and Thai',
  !!endonym && ['Newsreader', 'Gowun Batang', 'Noto Sans Thai'].every((f) => endonym.includes(f)),
  endonym);
ok('it holds the same faces as the body stack — it is the order that is pinned, not the look',
  !!endonym && [...endonym].sort().join('|') === [...(defaults.get('body') ?? [])].sort().join('|'),
  endonym);
ok('no language re-orders it',
  !/html\[lang='\w+'\][^{]*\.font-endonym/.test(css));

// `eyebrow` is @apply font-body, and tailwind copies the html[lang='ko']
// variant along with it — so `eyebrow` moves with the language too, and the
// language menu may not use it either.
const header = readFileSync('src/components/layout/Header.tsx', 'utf8');
// to the next top-level declaration — the row's own `}: { ... }` props line
// starts with a brace, so "up to the first `}` in column 0" stops far too early
const start = header.indexOf('function LanguageRow');
ok('found LanguageRow', start !== -1);
if (start !== -1) {
  const rest = header.slice(start + 1);
  const end = rest.search(/\n(?:function|const|export) /);
  const row = end === -1 ? rest : rest.slice(0, end);
  // whole class names only — `tracking-eyebrow` is a letter-spacing, not the
  // `.eyebrow` component that carries a font-family with it
  const moving = ['font-body', 'font-disp', 'eyebrow']
    .filter((c) => new RegExp(`(?<![\\w-])${c}(?![\\w-])`).test(row));
  ok('the menu row uses no class the language re-orders', moving.length === 0, moving);
  ok('the menu row is typed with the pinned stack', row.includes('font-endonym'));
}

// --- the panels leave at once ---------------------------------------------
// Both close on a click that also changes the page behind them. A panel still
// fading while that lands is a panel you watch change.
const closedStates = [...header.matchAll(/: '(pointer-events-none[^']*)'/g)].map((m) => m[1]);
ok('both panels have a closed state', closedStates.length === 2, closedStates.length);
ok('neither animates on the way out',
  closedStates.every((s) => s.includes('duration-0')), closedStates);

// --- the language lands before the page is measured -----------------------
// OpticalText centres text in a layout effect. Layout effects run before
// passive ones, so a language set in a useEffect leaves every label on the
// page measured against the font it is leaving for one painted frame.
const store = readFileSync('src/store/useFlowStore.ts', 'utf8');
ok('the store writes html[lang] itself', /applyLang/.test(store));
ok('setLang writes it before the state change',
  /setLang: \(lang\) => \{[\s\S]*?applyLang\(lang\);[\s\S]*?set\(\{ lang/.test(store));
ok('so does the back button',
  /syncFromPath[\s\S]{0,200}?applyLang\(fromUrl\)/.test(store));

// --- report ---------------------------------------------------------------

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log('all typography checks passed');
