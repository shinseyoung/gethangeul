/**
 * The webfont CSS html-to-image cannot read for itself.
 *
 * It builds its own @font-face block by walking document.styleSheets, and a
 * stylesheet from another origin has no readable cssRules — so everything
 * served by Google Fonts was silently missing from every exported card. The
 * picture came out in Georgia, which is wider than Gowun Batang, so the text
 * reflowed and words dropped onto lines of their own. Nobody would have called
 * that a font bug; it looked like the card was just badly set.
 *
 * The rules can be fetched even though they cannot be read, and the font files
 * themselves are CORS-enabled, so this fetches both and hands html-to-image the
 * finished CSS. Only the faces the card's own characters need: the stylesheet
 * carries around 212 of them, split by unicode-range, and one Korean name plus
 * a line of description wants about thirty.
 */

/** the stylesheet text, and each font file as a data URL — fetched once */
let sheet: Promise<string> | null = null;
const files = new Map<string, Promise<string>>();

const FACE = /@font-face[^}]*}/g;
const URL_IN = /url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/;
const RANGE = /unicode-range:\s*([^;]+);/;
/** `U+ac00-d7a3`, `U+f9ca-fa0b`, `U+25?` — the wildcard form spans its digits */
const SPAN = /U\+([0-9A-Fa-f?]+)(?:-([0-9A-Fa-f]+))?/;

function googleHref(): string | null {
  const links = document.querySelectorAll<HTMLLinkElement>('link[rel=stylesheet]');
  for (const link of links) if (link.href.includes('fonts.googleapis.com')) return link.href;
  return null;
}

async function dataUrl(url: string): Promise<string> {
  const blob = await (await fetch(url)).blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/** does this face's unicode-range cover anything the node actually says? */
function needed(face: string, used: Set<number>): boolean {
  const declared = RANGE.exec(face);
  if (!declared) return true;
  return declared[1].split(',').some((part) => {
    const span = SPAN.exec(part.trim());
    if (!span) return false;
    const low = parseInt(span[1].replace(/\?/g, '0'), 16);
    const high = span[2] ? parseInt(span[2], 16) : parseInt(span[1].replace(/\?/g, 'F'), 16);
    for (const code of used) if (code >= low && code <= high) return true;
    return false;
  });
}

/**
 * @font-face rules for everything `node` says, with the font files inlined.
 *
 * Returns '' if anything at all goes wrong — an export in the wrong font is
 * worth having; an export that throws is not.
 */
export async function fontEmbedCSS(node: HTMLElement): Promise<string> {
  try {
    const href = googleHref();
    if (!href) return '';
    if (!sheet) sheet = fetch(href).then((r) => r.text());
    const css = await sheet;

    const used = new Set<number>();
    for (const char of node.innerText ?? '') used.add(char.codePointAt(0) as number);

    const wanted = (css.match(FACE) ?? []).filter((face) => needed(face, used));
    const out = await Promise.all(wanted.map(async (face) => {
      const file = URL_IN.exec(face);
      if (!file) return face;
      const url = file[1];
      if (!files.has(url)) files.set(url, dataUrl(url));
      return face.replace(url, await files.get(url)!);
    }));
    return out.join('\n');
  } catch {
    return '';
  }
}
