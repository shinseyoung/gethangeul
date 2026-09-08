import { useEffect, useState } from 'react';
import { useFlowStore } from '../store/useFlowStore';
import { useTranslation } from '../hooks/useTranslation';
import { useMatches } from '../hooks/useMatches';
import { useImageShare } from '../hooks/useImageShare';
import { markColor } from '../components/OptionMark';
import MountainWash, { SEASON_WASH } from '../components/MountainWash';
import AdSlot from '../components/AdSlot';
import Button from '../components/Button';
import OpticalText from '../components/OpticalText';

const SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const;

function tint(hex: string, alpha: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** ko-KR speech synthesis: free, already in the browser, and the single most
 *  useful thing this audience asked for. Hidden entirely when unsupported. */
function useSpeech(text: string) {
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

export default function StepResult() {
  const { seasonNature, gender, vibe, personality, restart } = useFlowStore();
  const { t } = useTranslation();
  const { matches, sound } = useMatches();

  const match = matches[0];

  const name = match?.name;
  const { captureRef, isSaving, isSharing, handleDownload, handleShare } = useImageShare(
    name ? `hangeul-name-${name.id}` : 'hangeul-name',
  );
  const { supported: canSpeak, speak } = useSpeech(name?.hangul ?? '');

  if (!name) return null;

  const season = (SEASONS as readonly string[]).includes(seasonNature ?? '') ? seasonNature! : 'slate';
  const wash = SEASON_WASH[season] ?? SEASON_WASH.slate;
  const roman = name.id.charAt(0).toUpperCase() + name.id.slice(1);
  const isPureKorean = name.hangul === name.hanja;

  const SPARE = ['#C9971F', '#6E5A7A', '#A83B27', '#5B7A5C', '#C4744A', '#3E6BA8'];
  const used = new Set<string>();
  // The card carries the visitor's four answers, not this name's traits.
  // Hiding a tag when the name did not happen to hold it meant some cards came
  // back with one tag and some with none, which reads as a bug.
  const tags = ([
    seasonNature ? { id: seasonNature, group: 'nature' } : null,
    vibe ? { id: vibe, group: 'vibe' } : null,
    personality ? { id: personality, group: 'personality' } : null,
    gender ? { id: gender, group: 'gender' } : null,
  ].filter(Boolean) as { id: string; group: string }[])
    // "winter" and "calm" are both cool by nature, so they resolve to the same
    // pigment and the card goes monochrome. Nudge any repeat onto a free hue.
    .map((tag) => {
      let color = markColor(tag.id);
      if (used.has(color)) color = SPARE.find((c) => !used.has(c)) ?? color;
      used.add(color);
      return { ...tag, color };
    });

  return (
    <div className="mx-auto w-full max-w-[560px] px-5 pb-24 pt-6 lg:max-w-[620px] lg:px-4">
      {/* --- the card: this is what gets screenshotted, so no ad goes inside it --- */}
      <div
        ref={captureRef}
        className="relative overflow-hidden rounded-3xl border border-rule-strong bg-paper-hi px-6 pb-8 pt-9 shadow-[0_26px_56px_-36px_rgba(23,24,26,0.4)] md:px-8"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(126% 58% at 50% 0%, rgba(${wash.rgb},0.17) 0%, rgba(${wash.rgb},0) 64%),
                         radial-gradient(78% 46% at 0% 34%, rgba(${wash.rgb},0.13) 0%, rgba(${wash.rgb},0) 60%)`,
          }}
        />
        <MountainWash season={season} className="absolute inset-x-0 bottom-0 h-[190px]" />
        <div className="pointer-events-none absolute inset-2 rounded-[20px] border border-rule" />

        <div className="relative flex flex-col items-center">
          <span className="eyebrow text-[8.5px] tracking-[0.26em] text-ink-4">{t('result.title')}</span>

          {/* the name sits on the card's centre line; the hanja hangs off its
              lower right without taking part in the centring */}
          <div className="relative mt-4">
            <span className="block font-brush text-[84px] leading-[0.92] tracking-[0.07em] text-ink md:text-[96px]">
              {name.hangul}
            </span>
            {!isPureKorean && (
              <span className="absolute -bottom-1 left-full ml-2.5 whitespace-nowrap text-[16px] tracking-[0.14em] text-ink-4 md:text-[17px]">
                {name.hanja}
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2.5 rounded-full border border-rule bg-white/70 py-1.5 pl-4 pr-1.5">
            <span className="font-disp text-[19px] text-ink-2">{roman}</span>
            {canSpeak && (
              <>
                <span className="block h-[15px] w-px bg-rule" />
                <button
                  type="button"
                  onClick={speak}
                  aria-label={t('result.buttons.listen')}
                  className="focus-ring flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-accent transition-colors hover:bg-accent-deep"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8} strokeLinecap="round"
                    strokeLinejoin="round" aria-hidden="true" className="h-4 w-4">
                    <path d="M10.5 5 6 8.8H3v6.4h3l4.5 3.8z" />
                    <path d="M14.4 9.6a3.4 3.4 0 0 1 0 4.8" />
                    <path d="M17.2 6.8a7.4 7.4 0 0 1 0 10.4" />
                  </svg>
                </button>
              </>
            )}
          </div>

          <span className="my-5 block h-px w-11 bg-accent" />
          <span className="eyebrow text-center text-[9px] text-ink-4">
            {t(`names.${name.id}.shortMeaning`)}
          </span>

          <p className="mt-3.5 max-w-[300px] whitespace-pre-line text-pretty text-center font-disp text-[20px] leading-snug text-ink md:text-[22px]">
            “{t(`names.${name.id}.poeticQuote`)}”
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-1.5">
            {tags.map(({ id, group, color }) => {
              return (
                <span
                  key={id}
                  className="inline-flex h-[26px] items-center rounded-full border px-3 text-[10.5px] uppercase leading-none tracking-wider"
                  style={{ color, backgroundColor: tint(color, 0.1), borderColor: tint(color, 0.3) }}
                >
                  {t(`options.${group}.${id}`)}
                </span>
              );
            })}
          </div>

          <span className="eyebrow mt-7 text-[9px] tracking-[0.28em] text-ink-4">GETHANGEUL.COM</span>
        </div>
      </div>

      {sound.tried && !sound.matched && (
        <p className="mt-4 rounded-sm border border-l-[3px] border-rule border-l-pig-jeok bg-paper-hi p-3.5 text-[13px] leading-relaxed text-ink-3">
          {t('result.no_sound')}
        </p>
      )}

      {/* --- actions --- */}
      <div className="mt-4 flex flex-col gap-2.5">
        <Button full onClick={handleDownload} disabled={isSaving || isSharing}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"
            strokeLinejoin="round" aria-hidden="true" className="h-[17px] w-[17px]">
            <path d="M12 3v12M7.5 10.5 12 15l4.5-4.5M4 19h16" />
          </svg>
          {isSaving ? t('result.buttons.downloading') : t('result.buttons.download')}
        </Button>

        <Button full variant="secondary" onClick={handleShare} disabled={isSaving || isSharing}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"
            strokeLinejoin="round" aria-hidden="true" className="h-[16px] w-[16px]">
            <circle cx="18" cy="5.5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="18.5" r="2.5" />
            <path d="M8.2 10.8 15.8 6.8M8.2 13.2l7.6 4" />
          </svg>
          {isSharing ? t('result.buttons.sharing') : t('result.buttons.share')}
        </Button>
      </div>

      {/* --- retry loop: the reason anyone comes back --- */}
      <div className="mt-9">
        <div className="mb-3.5 flex items-center gap-2.5">
          <span className="eyebrow">{t('result.before_you_go')}</span>
          <span className="hairline" />
        </div>
        <div className="flex flex-col gap-2.5">
          {[
            { mark: 'start', title: t('result.start_over'), desc: t('result.start_over_desc'), action: restart },
          ].map((row) => (
            <button
              key={row.mark}
              type="button"
              onClick={row.action}
              className="focus-ring flex min-h-[64px] items-center gap-3.5 rounded-2xl border border-rule bg-paper-hi p-4 text-left transition-colors hover:border-rule-strong"
            >
              <img
                src={`/marks/${row.mark}.webp`}
                alt=""
                width={34}
                height={34}
                className="block h-[34px] w-[34px] shrink-0 object-contain mix-blend-multiply"
              />
              {/* both lines ride high in their line boxes, so the block —
                  not only its measured first line — carries the correction */}
              <span className="flex flex-1 translate-y-[3px] flex-col justify-center gap-1.5">
                <OpticalText className="block font-disp text-[18px] leading-none text-ink">
                  {row.title}
                </OpticalText>
                <span className="text-[12.5px] leading-[1.4] text-ink-3">{row.desc}</span>
              </span>
              <svg viewBox="0 0 24 24" fill="none" stroke="#ABAFB3" strokeWidth={1.8} strokeLinecap="round"
                strokeLinejoin="round" aria-hidden="true" className="h-[15px] w-[15px] shrink-0">
                <path d="M9 5.5 15.5 12 9 18.5" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <AdSlot size="300x250" className="mt-8" />
    </div>
  );
}
