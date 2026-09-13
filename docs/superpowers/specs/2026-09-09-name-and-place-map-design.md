# 한국식 이름 + 장소 고지도 — 설계

2026-09-09

## 1. 무엇을 만드나

외국인이 이름과 4문항에 답하면 **한국식 이름**과 **그 이름이 속한 실제 한국의 장소**를 받고,
조선 고지도 미학의 지도 위에 붉은 인장으로 찍힌 **소장 가능한 카드 한 장**을 가져간다.

축은 '한글'도 '한국 정보'도 아니다: **한국을 소재로 한, 내 것인, 아름다운 소장물.**

## 2. 왜 이 축인가

세 조건을 동시에 만족해야 했다 — (a) 기존에 없는 사이트, (b) 바이럴 요소, (c) 공적 명분.

기각한 대안:

- **한국식 이름 짓기 단독 심화** — Korean name generator는 이미 다수 존재. (a) 미달.
- **한국 정보 포괄 사이트(관광/한류/생활)** — Korea.net, VisitKorea, Creatrip, Soompi가 정부·기업 예산으로 운영 중. 개인이 이길 판이 아니고 (a) 미달.
- **촬영지 정보 DB 단독** — 2026년에는 LLM이 "이 장면 어디야?"를 즉답한다. 정보로는 못 이긴다.
- **사주/운세 개인화** — 바이럴·수익은 최상이나 (c) 공적 명분이 성립하지 않는다.

남는 방어선은 하나다: **LLM이 줄 수 없는 것 = 개인화된, 아름다운, 공유 가능한 결과물.**
그래서 제품의 얼굴은 정보가 아니라 **지도의 미학**이며, 이는 취향이 아니라 생존 조건이다.

기존 코드가 이미 이 방향을 갖고 있다는 점도 근거다: `MountainWash`(수묵 산맥), 손글씨 폰트,
한지 색 토큰, 그리고 4번째 질문이 이미 `spring / summer / mountain / sea / river / forest` —
**장소 축**이다.

## 3. 사용자 흐름 — 단계를 늘리지 않는다

```
landing(이름 입력) → gender → vibe → personality → nature → loading → result
```

현재와 **동일**하다. 단계를 늘리면 이탈만 늘어난다. 늘리는 것은 결과의 깊이뿐이다.

## 4. 결과 화면 — 두 겹

1. **이름** (기존) — 한글 / 한자 / 뜻 / 한국어 발음(`speechSynthesis`)
2. **장소** (신규) — 그 이름의 자연을 가진 실제 한국의 한 곳. 고지도 위 붉은 인장으로 찍히고,
   화면 진입 시 그 지점으로 부드럽게 줌인된다.

두 겹이 한 장의 PNG로 저장·공유된다 (`useImageShare` 재사용).

## 5. 장소 데이터

`src/data/placeDatabase.ts`:

```ts
export interface PlaceItem {
  id: string;              // 'jirisan'
  hangul: string;          // '지리산'
  hanja?: string;          // '智異山'
  roman: string;           // 'Jirisan'
  region: string;          // i18n 키
  coord: [number, number]; // [경도, 위도]
  nature: string[];        // StepOptions의 nature 어휘와 동일
  vibes: string[];         // NameItem의 vibe 어휘와 동일 — 가산점용
}
```

설명문은 4개 언어이므로 인라인하지 않고 `src/data/locales/<lang>/places.json`에
`places.<id>.blurb` 로 둔다.

**nature 어휘는 `nameDatabase.ts`의 11종을 쓴다** — `spring summer autumn winter mountain sea
river forest sun sky flower`. `StepOptions`가 사용자에게 보여주는 것은 이 중 8종뿐이고
`sun / sky / flower`는 이름에만 붙어 있다. 장소가 **답변이 아니라 이름**에서 도출되므로(§9)
어휘 기준은 이름 쪽이어야 한다.

**규모: 55~88곳.** 11종 × 5~8곳. 혼자 유지 가능한 범위로 못 박는다.
**불변식: 모든 nature 태그에 장소가 최소 5곳** — 검증에서 강제한다.

대상은 자연·전통 장소(산·강·바다·섬·사찰·한옥·서원)로 한정한다. 문 닫지 않고 바뀌지 않으므로
유지보수가 사실상 0이고, 저작권 리스크가 없다.

## 6. 고지도 컴포넌트

`src/components/InkMap.tsx`.

- **MapLibre / Mapbox를 쓰지 않는다.** 확대·검색되는 GIS가 필요한 제품이 아니다. 결과물이
  소장물이므로 스타일링이 완전히 통제되는 SVG가 더 예쁘고 가볍고 무료다.
- 한국 전도 윤곽은 공개 라이선스 GeoJSON(시도 경계)을 `scripts/build-map.mjs`가 단순화해
  SVG path 문자열로 뽑아 `src/data/koreaOutline.ts`에 커밋한다. 빌드 타임 1회, 런타임 의존성 0.
- 좌표 → SVG 위치는 equirectangular 선형 변환. 한국(124–132°E, 33–39°N) 범위에서 왜곡은
  무시 가능하다. `ponytail:` 코멘트로 한계와 교체 시점을 남긴다.
- 해안선은 `MountainWash`가 쓰는 `feTurbulence` + `feDisplacementMap` 필터를 그대로 태워
  먹이 한지에 번진 가장자리를 만든다. 바탕은 기존 `paper` 토큰.
- 마커는 붉은 인장. `Seal` 컴포넌트를 공유한다.
- **pan/zoom 인터랙션은 MVP 밖.** 결과 화면은 해당 지점으로 CSS transform 트랜지션만 한다.

## 7. 인장(전각)

`src/components/Seal.tsx`. 이름의 한자(없으면 한글)를 붉은 사각 안에 세로쓰기. 테두리는 같은
turbulence 필터로 살짝 불규칙하게 — 진짜 도장의 눌린 느낌. 결과 카드와 지도 마커가 같은
컴포넌트를 쓴다.

## 8. 공유와 SEO — 지금 깨져 있는 것

방향과 무관하게 1순위다. 바이럴로 크겠다는 사이트인데 루프가 물리적으로 끊겨 있다.

1. **`og:image` / `og:title` / `description` 없음** ([index.html](../../../index.html)) — 링크를
   붙여넣어도 미리보기가 뜨지 않는다. `<title>`도 `gethangeul`이다.
   OG 이미지는 MVP에서 사이트 공통 1장(고지도 + 인장). 결과별 동적 OG는 서버가 필요하므로 범위 밖.
2. **결과가 URL로 공유되지 않음** — [App.tsx](../../../src/App.tsx)에서 `step`이 store에만 있어
   공유받은 사람은 랜딩으로 떨어진다.
   경로를 `/{lang}/n/{nameId}` (예: `/en/n/gangwoo`)로 열고, 진입 시 그 이름으로 결과를 복원한다.
   **답변을 URL에 담을 필요가 없다** — 장소 매칭이 이름 id에서 결정적으로 나오기 때문이다.
   `useFlowStore`의 `PATH_LANG` 정규식과 `pathForLang`을 확장한다.
   공유받은 사람에게는 "너도 만들어봐" CTA를 붙인다.
3. **프리렌더 없음** — 빌드 후 `/en`, `/ko`, `/vi`, `/th` 4장의 정적 HTML을 생성해 각 언어의
   title/description/og:locale을 박는다. 스크립트 하나. 이름별 400페이지는 범위 밖.

## 9. 장소 매칭

`src/utils/placeMatcher.ts`. `nameMatcher.ts`의 `hash01`을 export해서 재사용한다.

**입력은 사용자의 답변이 아니라 확정된 `NameItem` 하나다.** `placeFor(name): PlaceItem`.

- `name.nature`와 `place.nature`가 겹치면 후보, `name.vibes` 겹침은 가산점.
- 동점은 `hash01(place.id + name.id)`로 결정적으로 깬다.
- **결정성이 요구사항이다** — 공유 URL이 이름 id만 담으므로(§8), 같은 이름은 항상 같은 장소여야
  한다. (`nameMatcher.ts`가 이미 같은 이유로 `Math.random()`을 버린 전례가 있다.)

답변(`seasonNature`)을 매칭에 쓰면 URL에 답변까지 실어야 하고 공유 링크가 길고 깨지기 쉬워진다.
"이 이름의 자연이 여기다"가 의미상으로도 더 낫다.

## 10. 측정과 공적 트랙

- **Cloudflare Web Analytics.** 쿠키 없음, 무료, 국가별 분해 제공.
  GA4를 쓰지 않는 이유: 랜딩 카피가 "nothing stored"를 약속하고 있어 모순된다. 그리고 심사에
  필요한 숫자는 **이용 국가 수 / 해외 이용자 수**뿐이다.
- 심사 언어에 맞춰 처음부터 이 두 숫자를 뽑을 수 있게 만든다.
- 접촉 경로: 한국관광공사(지역관광 KPI), 문화재청·국립중앙박물관(고지도), KF 공공외교 공모전.
  시즌 이벤트(한글날·문화의 달)가 기관 접촉 진입로다.
- 고지도는 원본 이미지를 쓰지 않고 자체 SVG를 그리므로 저작권 이슈가 없다.

## 11. 수익

기존 `AdSlot`을 유지한다. 결과 화면 체류가 길어지는 것이 유일한 개선 레버다.
B2B(지역 관광·여행사)는 트래픽 실적이 생긴 뒤.

## 12. 범위 밖 — 나중에, 조건부

- **K-콘텐츠 촬영지 레이어.** 조건: 배포 후 월 방문이 유지되는 것이 확인되면. 그 전에는 데이터
  노동을 넣지 않는다. 붙일 때도 스틸컷 없이 장소만 — 저작권 회피.
- 지도 pan/zoom 탐색 화면
- 이름별 정적 페이지 / 결과별 동적 OG 이미지
- 인쇄용 고해상도 인장, 커스텀 전서체
- 백엔드, 계정, 데이터베이스

## 13. 검증

기존 `scripts/check.mjs` + `scripts/matcher.check.ts` 패턴을 따른다(테스트 프레임워크 없음).
`scripts/place.check.ts`를 추가하고 `check.mjs`가 둘 다 돌린다.

- `nameDatabase`에 쓰인 11개 nature 태그 각각에 장소 ≥ 5개
- 모든 `place.nature` 태그가 `nameDatabase`의 어휘 안에 존재
- 모든 `NameItem`이 장소를 하나 이상 얻는다 (`placeFor`가 절대 빈손이 아니다)
- 모든 좌표가 124–132°E, 33–39°N 안
- 모든 장소에 4개 언어 blurb 존재
- `placeFor(name)`이 결정적 — 같은 이름은 항상 같은 장소
