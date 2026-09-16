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
 * The first fix embedded the real faces and was far worse: a cold save took
 * 111 seconds. The page's Korean stack pulls around thirty unicode-range
 * subsets, and a megabyte of base64 in a foreignObject is not something a
 * browser rasterises in any useful time.
 *
 * So ask Google for less. `?text=` returns a face cut down to exactly the
 * characters given — the 374 KB of Gowun Batang subsets this card was dragging
 * along become 25 KB for the seventy-five characters actually on it. Measured
 * on the impression card: 1.28 MB and no image after 18s, against 793 KB
 * (nearly all of it our own brush face, which is not Google's to subset) and a
 * finished PNG in 560 ms.
 */

/** the finished CSS, built once per session and started before it is needed */
let building: Promise<string> | null = null;
/** each font file as a data URL, kept so a second card pays nothing */
const files = new Map<string, Promise<string>>();

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

/** every `url(...)` in the CSS, replaced by the bytes it points at */
async function inline(css: string, base?: string): Promise<string> {
  const found = [...css.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map((m) => m[1]);
  let out = css;
  for (const href of found) {
    if (href.startsWith('data:')) continue;
    const url = new URL(href, base ?? location.href).href;
    if (!files.has(url)) files.set(url, dataUrl(url));
    out = out.replace(href, await files.get(url)!);
  }
  return out;
}

/**
 * The families the node actually leads with.
 *
 * Without this the card drags in every face the page ever loaded: the Korean
 * stack names Newsreader, Instrument Serif and Noto Sans Thai as fallbacks, and
 * on a card that only ever sets Korean those came to 632 KB of the megabyte —
 * for glyphs nothing on it uses. Reading the computed stacks is exact and free.
 */
function familiesIn(node: HTMLElement): Set<string> {
  const out = new Set<string>();
  const add = (el: Element) => {
    out.add(getComputedStyle(el).fontFamily.split(',')[0].replace(/['"]/g, '').trim());
    for (const child of el.children) add(child);
  };
  add(node);
  return out;
}

/**
 * Our own @font-face rules, with the files inlined.
 *
 * Passing fontEmbedCSS replaces html-to-image's own collection outright, so the
 * same-origin faces it would have found for itself — the brush the name is set
 * in — have to come along too, or they go missing with everything else.
 */
async function localFaces(families: Set<string>): Promise<string> {
  const out: string[] = [];
  for (const sheet of document.styleSheets) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; // another origin — that is what the Google half is for
    }
    for (const rule of rules) {
      if (!(rule instanceof CSSFontFaceRule)) continue;
      const family = /font-family:\s*["']?([^"';]+)["']?/.exec(rule.cssText);
      if (!family || !families.has(family[1].trim())) continue;
      out.push(await inline(rule.cssText, sheet.href ?? undefined));
    }
  }
  return out.join('\n');
}

async function build(node: HTMLElement): Promise<string> {
  try {
    const families = familiesIn(node);
    const parts: string[] = [];

    /* Re-ask for each family the card uses, cut to the card's own characters.
       The weights come from the page's own link, so a face the design never
       asks for is never fetched. */
    const href = googleHref();
    if (href) {
      const text = [...new Set([...(node.innerText ?? '')].filter((c) => c.trim()))].join('');
      const specs = new URL(href).searchParams.getAll('family')
        .filter((spec) => families.has(spec.split(':')[0].replace(/\+/g, ' ')));
      if (specs.length > 0 && text) {
        const url = 'https://fonts.googleapis.com/css2?'
          + specs.map((s) => `family=${encodeURIComponent(s)}`).join('&')
          + `&text=${encodeURIComponent(text)}`;
        parts.push(await inline(await (await fetch(url)).text()));
      }
    }

    parts.push(await localFaces(families));
    return parts.join('\n');
  } catch {
    return '';
  }
}

/**
 * Start building, if nothing has yet.
 *
 * Called while the card is on screen rather than when Save is pressed: it is
 * the same work either way, and the difference is whether anyone is waiting.
 */
export function warmFontEmbed(node: HTMLElement): void {
  if (!building) building = build(node);
}

/**
 * @font-face rules for everything `node` says, with the font files inlined.
 *
 * Returns '' if it is not ready in time or anything goes wrong. An export in
 * the wrong font is worth having; one that never arrives is not.
 */
export function fontEmbedCSS(node: HTMLElement, within = 2000): Promise<string> {
  warmFontEmbed(node);
  return Promise.race([
    building!.catch(() => ''),
    new Promise<string>((resolve) => setTimeout(() => resolve(''), within)),
  ]);
}
