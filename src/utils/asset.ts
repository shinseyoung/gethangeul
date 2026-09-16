/**
 * A path to something in public/, as the browser must actually request it.
 *
 * Vite rewrites these in HTML and CSS but not in JavaScript, so a file named
 * in a string literal — every brush mark, the mountain — went on asking for
 * /marks/… while the page itself was served from /gethangeul/. Absolutely
 * everything else loaded; only the pictures were missing.
 */
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');

export const asset = (path: string) => `${BASE}/${path.replace(/^\/+/, '')}`;
