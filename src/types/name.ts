export interface MultiLangText {
  ko: string;
  en?: string;
  th?: string;
  vi?: string;
}

export interface NameItem {
  id: string;
  hangul: string;
  hanja: string;
  gender: ('male' | 'female' | 'neutral')[];
  vibes: string[];
  personalities: string[];
  nature: string[];
}