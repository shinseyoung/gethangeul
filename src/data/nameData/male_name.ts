// src/data/nameData.ts

export interface MultiLangText {
  ko: string;
  en?: string;
  th?: string;
  vi?: string;
}

export interface NameItem {
  id: string;
  hangul: string;
  hanja: string;           // 추후 업데이트 가능 (현재는 기본값)
  shortMeaning: MultiLangText;
  poeticQuote: MultiLangText;
  gender: ('male' | 'female' | 'neutral')[];
  vibes: string[];
  personalities: string[];
  nature: string[];
}

// 🟢 번역 작업을 뒤로 미루고, 100개 이름의 '알고리즘 매칭 태그'만 빠르게 구축한 코어 풀
export const NAME_DATA: NameItem[] = [

  // ==================== [남성 트렌드 이름 35선] ====================
  { id: 'ijun', hangul: '이준', hanja: '怡俊', gender: ['male'], vibes: ['trendy', 'bright'], personalities: ['radiant', 'enterprising'], nature: ['summer', 'sea'], shortMeaning: { ko: '기쁘고 뛰어난' }, poeticQuote: { ko: '밝은 웃음과 뛰어난 지혜를 가진 사람' } },
  { id: 'doyun', hangul: '도윤', hanja: '度潤', gender: ['male'], vibes: ['strong', 'calm'], personalities: ['dependable', 'upright'], nature: ['mountain', 'autumn'], shortMeaning: { ko: '깊은 품격과 윤택함' }, poeticQuote: { ko: '듬직한 바위처럼 세상을 윤택하게 하는 존재' } },
  { id: 'seojun', hangul: '서준', hanja: '瑞俊', gender: ['male'], vibes: ['trendy', 'strong'], personalities: ['upright', 'enterprising'], nature: ['summer', 'mountain'], shortMeaning: { ko: '상서롭고 준수한' }, poeticQuote: { ko: '상서로운 기운으로 앞길을 열어가는 리더' } },
  { id: 'hajun', hangul: '하준', hanja: '夏俊', gender: ['male'], vibes: ['bright', 'strong'], personalities: ['radiant', 'enterprising'], nature: ['summer', 'sea'], shortMeaning: { ko: '여름날의 열정과 준수함' }, poeticQuote: { ko: '여름 태양처럼 뜨겁고 준수한 인재' } },
  { id: 'jiho', hangul: '지호', hanja: '智皓', gender: ['male'], vibes: ['calm', 'trendy'], personalities: ['inquisitive', 'prudent'], nature: ['autumn', 'forest'], shortMeaning: { ko: '지혜롭고 밝은' }, poeticQuote: { ko: '명석한 지혜로 세상을 밝게 비추는 눈' } },
  { id: 'suho', hangul: '수호', hanja: '守護', gender: ['male'], vibes: ['strong', 'calm'], personalities: ['dependable', 'considerate'], nature: ['mountain', 'forest'], shortMeaning: { ko: '지키고 보호하는' }, poeticQuote: { ko: '소중한 사람들을 따뜻하게 지켜주는 듬직한 나무' } },
  // (중략 - 남성 이름 29개 동일 구조로 추가)

];