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
export interface SurnameItem {
  id: string;
  hangul: string;
  hanja: string;
  roman: string;
  /** percentage of the South Korean population, 2015 census, rounded */
  share: number;
}
