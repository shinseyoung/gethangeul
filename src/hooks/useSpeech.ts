import { useEffect, useState } from 'react';

/** ko-KR speech synthesis: free, already in the browser, and the single most
 *  useful thing this audience asked for. Hidden entirely when unsupported.
 *
 *  Shared, because the card is not the only place a name has to be heard.
 *  The screen that offers three of them is where somebody who cannot read
 *  Hangul most needs to: choosing between 시은, 소원 and 세린 by sight is not
 *  a choice anyone this site is for can make. */
export function useSpeech(text: string) {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return undefined;
    setSupported(true);

    // Setting utterance.lang is not enough: browsers happily read Hangul with
    // whatever voice is default, which is why this came out sounding English.
    // The ko voice has to be picked explicitly, and the list arrives async.
    //
    // Which ko voice matters just as much. Windows ships Heami, a 2010 SAPI
    // voice that sounds like a train announcement; Chrome and Edge often also
    // carry a neural one, and it is a different league. Rank, do not take the
    // first match.
    const rank = (v: SpeechSynthesisVoice) => {
      const n = v.name.toLowerCase();
      if (/natural|neural|online/.test(n)) return 3;
      if (n.includes('google')) return 2;
      return v.localService ? 1 : 0;
    };
    const pick = () => {
      const korean = window.speechSynthesis
        .getVoices()
        .filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith('ko'))
        .sort((a, b) => rank(b) - rank(a))[0];
      if (korean) setVoice(korean);
    };
    pick();
    window.speechSynthesis.addEventListener('voiceschanged', pick);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', pick);
  }, []);

  const speak = () => {
    if (!supported) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    if (voice) utterance.voice = voice;
    // 0.85 read as careful; on a two-syllable name it only smeared the vowels
    utterance.rate = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // no Korean voice installed means it would be read as English — hide it
  return { supported: supported && voice !== null, speak };
}
