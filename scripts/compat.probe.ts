import { strokesOf } from '../src/utils/strokes';
import { compatibility } from '../src/utils/nameCompat';
console.log('김민서', strokesOf('김민서').map(c => c.strokes));
console.log('박다혜', strokesOf('박다혜').map(c => c.strokes));
const r = compatibility('김민서', '박다혜');
console.log('cells', r.cells.map(c => `${c.char}${c.strokes}`).join(' '));
r.rows.forEach(row => console.log(row.join(' ')));
console.log('=> ', r.percent + '%');
