// Runnable check that every language says everything English says. The room
// copy is written in English first, so a key added there and forgotten
// elsewhere is the failure this catches.
// Run with: npm run check
import { readFileSync, readdirSync } from 'node:fs';

let failures = 0;
function ok(label: string, condition: boolean, detail?: unknown) {
  if (condition) return;
  failures += 1;
  console.error(`  FAIL  ${label}${detail === undefined ? '' : ` — ${JSON.stringify(detail)}`}`);
}

const DIR = 'src/data/locales';
const LANGS = readdirSync(DIR).filter((l) => l !== 'en');

/** Dotted leaf paths -> their string, so two files can be compared key by key. */
function flatten(value: unknown, prefix = '', into: Record<string, string> = {}) {
  if (typeof value === 'string') {
    into[prefix] = value;
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) flatten(v, prefix ? `${prefix}.${k}` : k, into);
  }
  return into;
}

const read = (lang: string, file: string) =>
  flatten(JSON.parse(readFileSync(`${DIR}/${lang}/${file}`, 'utf8')));

const files = readdirSync(`${DIR}/en`).filter((f) => f.endsWith('.json'));
ok('the English locale has files', files.length > 0, files);

// Example names, brand lines and loanwords are meant to read the same in every
// language. Everything else still matching English word for word was never
// translated.
const SHARED = /(^|[._])(placeholder|placeholder_long|copyright)$/;
const LOANWORDS = new Set(['genre.makjang.label']);

for (const lang of LANGS) {
  const missing: string[] = [];
  const untranslated: string[] = [];
  const stray: string[] = [];

  for (const file of files) {
    const en = read('en', file);
    const other = read(lang, file);
    for (const [key, english] of Object.entries(en)) {
      if (!(key in other)) missing.push(`${file}:${key}`);
      else if (other[key] === english && english.length > 3
        && !SHARED.test(key) && !LOANWORDS.has(key)) untranslated.push(`${file}:${key}`);
    }
    for (const key of Object.keys(other)) if (!(key in en)) stray.push(`${file}:${key}`);
  }

  ok(`${lang} says everything English says`, missing.length === 0, missing.slice(0, 10));
  ok(`${lang} has no English left in it`, untranslated.length === 0, untranslated.slice(0, 10));
  ok(`${lang} has no keys English dropped`, stray.length === 0, stray.slice(0, 10));
}

// Copy that interpolates has to keep its placeholders, or the sentence breaks
// in that language only.
for (const file of files) {
  const en = read('en', file);
  for (const lang of LANGS) {
    const other = read(lang, file);
    for (const [key, english] of Object.entries(en)) {
      // The set, not the count: Korean drops a repeated subject where English
      // names it twice. Inventing or losing a placeholder is the real break.
      const names = (copy: string) => [...new Set([...copy.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))].sort();
      const wanted = names(english);
      if (wanted.length === 0 || !(key in other)) continue;
      const got = names(other[key]);
      ok(`${lang} ${file}:${key} keeps its placeholders`, String(got) === String(wanted), { wanted, got });
    }
  }
}

if (failures > 0) process.exit(1);
console.log('all locale checks passed');
