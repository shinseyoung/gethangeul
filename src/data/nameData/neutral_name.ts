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
  // ==================== [중성/공용 이름 30선] ====================
  { id: 'ian', hangul: '이안', hanja: '理安', gender: ['neutral', 'male'], vibes: ['trendy', 'calm'], personalities: ['inquisitive', 'prudent'], nature: ['sea', 'winter'], shortMeaning: { ko: '이치에 맞고 평온한' }, poeticQuote: { ko: '맑은 이치로 세상을 평온하게 하는 빛' } },
  { id: 'jian', hangul: '지안', hanja: '智安', gender: ['neutral', 'female'], vibes: ['calm', 'soft'], personalities: ['prudent', 'considerate'], nature: ['autumn', 'forest'], shortMeaning: { ko: '지혜롭고 평온한' }, poeticQuote: { ko: '지혜로운 마음으로 평온을 주는 사람' } },
  { id: 'siwoo', hangul: '시우', hanja: '始佑', gender: ['neutral', 'male'], vibes: ['natural', 'calm'], personalities: ['genuine', 'sensitive'], nature: ['summer', 'river'], shortMeaning: { ko: '은혜로운 비' }, poeticQuote: { ko: '세상에 생기를 불어넣는 단비 같은 존재' } },
  { id: 'eunwoo', hangul: '은우', hanja: '恩宇', gender: ['neutral', 'male'], vibes: ['soft', 'calm'], personalities: ['considerate', 'dependable'], nature: ['spring', 'sky'], shortMeaning: { ko: '은혜로운 세상' }, poeticQuote: { ko: '넓은 마음으로 따뜻함을 베푸는 사람' } },
  { id: 'seowoo', hangul: '서우', hanja: '瑞宇', gender: ['neutral', 'female'], vibes: ['natural', 'bright'], personalities: ['genuine', 'radiant'], nature: ['spring', 'forest'], shortMeaning: { ko: '상서로운 세상' }, poeticQuote: { ko: '자연스럽고 상서로운 기운을 담은 빛' } },
  { id: 'yeonwoo', hangul: '연우', hanja: '然宇', gender: ['neutral'], vibes: ['calm', 'soft'], personalities: ['genuine', 'considerate'], nature: ['autumn', 'forest'], shortMeaning: { ko: '자연스럽고 넉넉한' }, poeticQuote: { ko: '세상과 부드럽게 조화를 이루는 마음' } },
  { id: 'wooju', hangul: '우주', hanja: '宇宙', gender: ['neutral'], vibes: ['trendy', 'mystic'], personalities: ['whimsical', 'enterprising'], nature: ['sea', 'winter'], shortMeaning: { ko: '넓고 무한한 우주' }, poeticQuote: { ko: '밤하늘의 별처럼 무한한 가능성을 품은 사람' } },
  { id: 'yuon', hangul: '유온', hanja: '裕溫', gender: ['neutral'], vibes: ['soft', 'calm'], personalities: ['considerate', 'dependable'], nature: ['spring', 'forest'], shortMeaning: { ko: '넉넉하고 따뜻한' }, poeticQuote: { ko: '햇살처럼 따뜻하고 너그러운 마음' } },
  { id: 'rowoon', hangul: '로운', hanja: '路雲', gender: ['neutral', 'male'], vibes: ['trendy', 'bright'], personalities: ['enterprising', 'radiant'], nature: ['summer', 'mountain'], shortMeaning: { ko: '이로운 구름' }, poeticQuote: { ko: '자유로운 구름처럼 세상에 이로움을 주는 존재' } },
  { id: 'seoon', hangul: '서온', hanja: '舒溫', gender: ['neutral', 'female'], vibes: ['soft', 'warm'], personalities: ['considerate', 'sensitive'], nature: ['spring', 'forest'], shortMeaning: { ko: '부드럽고 따뜻한' }, poeticQuote: { ko: '따뜻한 마음으로 주위를 비추는 부드러운 빛' } },
  // (중략 - 중성 이름 20개 동일 구조로 추가)

];