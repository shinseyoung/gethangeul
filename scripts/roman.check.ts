// Runnable check for the romaniser: the spellings Korea actually uses, and the
// western names that must not move when they are added.
// Run with: npm run check
import { romanToHangul } from '../src/utils/romanToHangul';

let failures = 0;
function ok(label: string, condition: boolean, detail?: unknown) {
  if (condition) return;
  failures += 1;
  console.error(`  FAIL  ${label}${detail === undefined ? '' : ` — ${JSON.stringify(detail)}`}`);
}

function reads(input: string, want: string) {
  const got = romanToHangul(input);
  ok(`${input} reads ${want}`, got === want, got);
}

// --- the older romanisation -----------------------------------------------
// Half of Korea spells ㅓ and ㅕ with a `u` — it is what most passports issued
// before 2000 carry, and people keep writing it. Read literally, `seyoung` came
// out 세요웅: the `yo` digraph took the first two letters and left `ung` behind.

reads('seyoung', '세영');
reads('seyeong', '세영');
reads('young', '영');
reads('yeong', '영');
reads('jung', '정');
reads('jeong', '정');
reads('sung', '성');
reads('seong', '성');
reads('hyung', '형');
reads('myung', '명');
reads('byung', '병');
reads('chung', '청');
reads('hyun', '현');
reads('hyeon', '현');
reads('dohyun', '도현');
reads('yoon', '윤');

// --- and the ones the rule must not swallow --------------------------------
// A `u` is only ㅓ when `ng` closes it, and a `yu` is only ㅕ when a consonant
// opened the syllable. Without both halves, 준 becomes 정 and 유나 becomes 여나.

reads('jun', '준');
reads('joon', '준');
reads('yun', '윤');
reads('yuna', '유나');
reads('seung', '승');
reads('eun', '은');
reads('hoon', '훈');
reads('woo', '우');
reads('jiwoo', '지우');
reads('minjun', '민준');
reads('seoyeon', '서연');
reads('soyeon', '소연');
reads('taeyang', '태양');
reads('dong', '동');
reads('minseo', '민서');
reads('chaewon', '채원');
reads('jimin', '지민');
reads('jiho', '지호');

// --- western names ---------------------------------------------------------
// This room is for foreigners first; a Korean-spelling rule that moved any of
// these would have cost more than it bought.

reads('sarah', '사라');
reads('anna', '안나');
reads('miller', '밀러');
reads('smith', '스미스');
reads('emily', '에밀리');
reads('chris', '크리스');
reads('oscar', '오스카');
reads('marco', '마르코');
reads('david', '데이비드');

// --- known limits ----------------------------------------------------------
// Pinned as they are, not as we would like them, so a future change that fixes
// one of these fails loudly and gets read rather than silently drifting.

// `k` and `p` are ㅋ and ㅍ because this room takes western names first: Kate
// and Kyle need them. Korean spells 경 `kyung` and 박 `park` with the plain
// consonants, so those arrive aspirated. hangulFor's surname table catches the
// common surnames; a given name like 경 does not have one to catch it.
reads('kyung', '켱');
reads('park', '파르크');

// `haeun` is 하은 to a Korean and 해운 by the letters, and nothing short of a
// dictionary tells them apart — `ae` is a real digraph and so is `eu`.
reads('haeun', '해운');

// A space is kept, because hangulFor splits surname from given name on it.
reads('se young', '세 영');

// --- report ---------------------------------------------------------------

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log('all romaniser checks passed');
