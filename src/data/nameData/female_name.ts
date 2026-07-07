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

  // ==================== [여성 트렌드 이름 35선] ====================
  { id: 'seoa', hangul: '서아', hanja: '瑞妸', gender: ['female'], vibes: ['lovely', 'bright'], personalities: ['radiant', 'genuine'], nature: ['spring', 'flower'], shortMeaning: { ko: '상서롭고 아름다운' }, poeticQuote: { ko: '봄꽃처럼 화사하고 아름다운 행복' } },
  { id: 'iseo', hangul: '이서', hanja: '怡瑞', gender: ['female'], vibes: ['soft', 'calm'], personalities: ['considerate', 'prudent'], nature: ['spring', 'forest'], shortMeaning: { ko: '기쁘고 상서로운' }, poeticQuote: { ko: '기분 좋은 바람처럼 평온을 몰고 오는 사람' } },
  { id: 'hayun', hangul: '하윤', hanja: '夏潤', gender: ['female'], vibes: ['bright', 'trendy'], personalities: ['radiant', 'enterprising'], nature: ['summer', 'sea'], shortMeaning: { ko: '햇살처럼 윤택한' }, poeticQuote: { ko: '생동감 넘치는 에너지로 주위를 빛내는 존재' } },
  { id: 'seoyun', hangul: '서윤', hanja: '瑞潤', gender: ['female'], vibes: ['calm', 'soft'], personalities: ['prudent', 'considerate'], nature: ['autumn', 'river'], shortMeaning: { ko: '상서롭고 부드러운' }, poeticQuote: { ko: '맑은 강물처럼 지혜롭고 부드러운 마음' } },
  { id: 'harin', hangul: '하린', hanja: '夏潾', gender: ['female'], vibes: ['lovely', 'bright'], personalities: ['radiant', 'whimsical'], nature: ['summer', 'river'], shortMeaning: { ko: '맑고 투명한 물결' }, poeticQuote: { ko: '여름 시냇물처럼 영롱하고 사랑스러운 아이' } },
  { id: 'arin', hangul: '아린', hanja: '雅潾', gender: ['female'], vibes: ['mystic', 'soft'], personalities: ['sensitive', 'genuine'], nature: ['spring', 'river'], shortMeaning: { ko: '우아하고 맑은' }, poeticQuote: { ko: '신비롭고 맑은 미소를 가진 아름다운 사람' } }
  // (중략 - 여성 이름 29개 동일 구조로 추가)
];