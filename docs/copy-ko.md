# 대사 원고 (한국어)

고칠 곳만 고쳐서 돌려주시면 그대로 반영하겠습니다.
각 줄 앞의 `[키]`는 건드리지 마시고, 그 뒤 문장만 바꿔 주세요.
나머지 3개 언어(en/vi/th)는 한국어 확정된 뒤에 맞추겠습니다.

0부와 1부는 보내주신 원고가 반영된 상태입니다.
`[reasons.*]` 줄은 제가 새로 맞춰 쓴 것이라 손봐 주시면 좋겠습니다 — 결과 카드에
`"{a}, {b}. 그래서 {이름}입니다."` 형태로 두 개가 뽑혀 들어갑니다.

---

# 0부 · 이름짓기 — 앞뒤 화면

## 성별 고르기 (첫 화면)

- [gender.eyebrow] 성별
- [gender.title] 어떤 이름을 찾아볼까요?
- [gender.sub] 이름에 따라 자연스럽게 들리는 느낌이 달라요.
  - [options.gender.female] 여성
    [gender.note.female] 보통 한국에서 여자 이름으로 들리는 이름들.
  - [options.gender.male] 남성
    [gender.note.male] 보통 한국에서 남자 이름으로 들리는 이름들.
  - [options.gender.neutral] 성별 무관
    [gender.note.neutral] 어느 쪽으로도 자연스럽게 들리는 이름들.

## 이름 세 개 중 고르기 (상황 질문 다음)

- [pick.eyebrow] 이름 후보
- [pick.title] 당신의 이름을 골라주세요.
- [pick.sub] 셋 다 당신의 답에서 나온 이름이에요. 한 번씩 소리 내어 보세요.

## 결과 카드의 한 줄

- [result.because] {a}, {b}. 그래서 {name}입니다.

## 진행 막대 라벨

- [layout.steps.cup] 카페
- [layout.steps.train] 막차
- [layout.steps.dinner] 회식
- [layout.steps.lift] 엘리베이터
- [layout.steps.market] 시장
- [layout.steps.evening] 마지막 저녁

---

# 1부 · 이름짓기 — 상황 질문

여섯 개 상황이 순서대로 나오고, 상황마다 표현이 세 가지입니다.
접속할 때마다 셋 중 하나가 뽑힙니다.

보기 아래 들여쓴 `[reasons.*]` 는 그 보기를 고른 사람을 한마디로 말하는 줄입니다.
결과 카드에 두 개가 뽑혀 나가니, 보기와 짝이 맞게 읽히면 됩니다.

## 1. 카페  `cup`

### 표현 order

- [cup.order.title] 카페에 자리가 생겼습니다. 어디에 앉을까요?
- [cup.order.description] 빈자리가 몇 군데 보입니다. 눈에 먼저 들어오는 곳은 어디인가요?
  - [cup.order.own] 창가 쪽, 밖이 잘 보이는 자리
    [reasons.own] 밖을 보고 앉는 사람
  - [cup.order.short] 사람들이 오가는 길목에 가까운 자리
    [reasons.short] 사람 오가는 걸 보는 사람
  - [cup.order.korean] 구석진 곳, 조용히 앉을 수 있는 자리
    [reasons.korean] 조용한 구석을 찾는 사람
  - [cup.order.whatever] 가운데쯤, 어느 자리에서나 주변이 보이는 곳
    [reasons.whatever] 가운데가 편한 사람

### 표현 mispronounce

- [cup.mispronounce.title] 카페에 앉아 있는데 옆자리 사람이 먼저 말을 겁니다.
- [cup.mispronounce.description] 처음 보는 사람인데, 생각보다 자연스럽게 말을 걸어왔습니다.
  - [cup.mispronounce.repeat] 웃으면서 자연스럽게 받아 준다
    [reasons.repeat] 웃으면서 받아 주는 사람
  - [cup.mispronounce.adopt] 짧게 대답하고 다시 내 할 일을 한다
    [reasons.adopt] 제 할 일로 돌아오는 사람
  - [cup.mispronounce.nod] 먼저 얼굴을 확인한다
    [reasons.nod] 먼저 얼굴부터 보는 사람
  - [cup.mispronounce.prettier] 무시한다
    [reasons.prettier] 굳이 대꾸하지 않는 사람

### 표현 regular

- [cup.regular.title] 카페에서 혼자 시간을 보내고 있습니다. 누군가 옆자리에 앉았습니다.
- [cup.regular.description] 자리를 옮길 수도 있고, 그냥 있을 수도 있습니다.
  - [cup.regular.usual] 그대로 앉아 있는다
    [reasons.usual] 자리를 안 옮기는 사람
  - [cup.regular.newthing] 다른 자리로 옮긴다
    [reasons.newthing] 슬쩍 자리를 옮기는 사람
  - [cup.regular.sameseat] 먼저 얼굴을 확인한다.
    [reasons.sameseat] 먼저 얼굴부터 보는 사람
  - [cup.regular.theirname] 옆자리에 앉은 사람에게 먼저 말을 건다
    [reasons.theirname] 먼저 말을 거는 사람

## 2. 막차  `train`

### 표현 grandmother

- [train.grandmother.title] 막차입니다. 앞에 할머니가 서 계십니다.
- [train.grandmother.description] 자리는 이미 다 찼고, 아무도 먼저 움직이지 않습니다.
  - [train.grandmother.standup] 말없이 일어나 자리를 내어 드린다
    [reasons.standup] 말보다 먼저 몸이 움직이는 사람
  - [train.grandmother.tap] 옆 사람에게 눈치를 준다
    [reasons.tap] 옆 사람에게 눈치를 주는 사람
  - [train.grandmother.gesture] 일단 상황을 지켜본다
    [reasons.gesture] 일단 지켜보는 사람
  - [train.grandmother.pretend] 자는 척을 한다
    [reasons.pretend] 모른 척이 편한 사람

### 표현 sleeper

- [train.sleeper.title] 옆 사람이 잠들면서 당신 어깨에 기댔습니다.
- [train.sleeper.description] 깨울지, 그냥 둘지 잠깐 고민하게 됩니다.
  - [train.sleeper.still] 그냥 그대로 있는다
    [reasons.still] 불편해도 가만있는 사람
  - [train.sleeper.wake] 살짝 깨워서 자리를 바로잡는다
    [reasons.wake] 솔직하게 깨우는 사람
  - [train.sleeper.shift] 조용히 자세만 고쳐 앉는다
    [reasons.shift] 티 안 나게 고쳐 주는 사람
  - [train.sleeper.almost] 어깨에서 살짝 밀어내고 자세를 바로잡는다
    [reasons.almost] 말없이 밀어내는 사람

### 표현 lost

- [train.lost.title] 누가 길을 묻는데, 한국어가 잘 통하지 않습니다.
- [train.lost.description] 지도를 켜면 금방 찾을 수도 있을 것 같습니다.
  - [train.lost.walkthem] 가는 데까지 같이 걸어 준다
    [reasons.walkthem] 끝까지 데려다주는 사람
  - [train.lost.honest] 아는 만큼만 말해 준다
    [reasons.honest] 아는 만큼만 말하는 사람
  - [train.lost.mapit] 지도를 켜서 같이 찾아본다
    [reasons.mapit] 같이 들여다보는 사람
  - [train.lost.wherefrom] 도망간다
    [reasons.wherefrom] 그 자리를 뜨는 사람

## 3. 회식  `dinner`

### 표현 pour

- [dinner.pour.title] 회식 자리입니다. 옆자리 동료가 잔을 채워 줍니다.
- [dinner.pour.description] 옆자리 사람이 잔을 내밀었습니다.
  - [dinner.pour.twohands] 바로 그 사람 잔을 채워 준다
    [reasons.twohands] 바로 잔을 채워 주는 사람
  - [dinner.pour.pourback] 따르면서 상대와 눈을 마주친다
    [reasons.pourback] 눈을 맞추고 따르는 사람
  - [dinner.pour.ask] 내 술부터 한 모금 마신다
    [reasons.ask] 제 속도로 가는 사람
  - [dinner.pour.toast] 못 본 척한다
    [reasons.toast] 못 본 척하는 사람

### 표현 lastbite

- [dinner.lastbite.title] 접시에 딱 한 점이 남았습니다.
- [dinner.lastbite.description] 아무도 먼저 손을 대지 않고 있습니다.
  - [dinner.lastbite.leaveit] 끝까지 그냥 둔다.
    [reasons.leaveit] 끝까지 안 집는 사람
  - [dinner.lastbite.offerit] 제일 윗사람 앞접시에 놓아 드린다
    [reasons.offerit] 윗사람부터 챙기는 사람
  - [dinner.lastbite.askname] 자연스럽게 본인이 먹는다
    [reasons.askname] 말없이 집는 사람
  - [dinner.lastbite.rps] 가위바위보 하자고 한다
    [reasons.rps] 판을 만드는 사람

### 표현 noraebang

- [dinner.noraebang.title] 2차는 노래방입니다.
- [dinner.noraebang.description] 다들 한 곡씩 부르고 있고, 이제 당신 차례입니다.
  - [dinner.noraebang.knowone] 아는 곡 하나를 정확하게 부른다
    [reasons.knowone] 잘하는 걸 확실히 하는 사람
  - [dinner.noraebang.singalong] 다 같이 부를 수 있는 걸 고른다
    [reasons.singalong] 같이 할 걸 고르는 사람
  - [dinner.noraebang.learnit] 노래를 잘 못한다고 말하고 안 부른다
    [reasons.learnit] 못하는 건 못한다고 하는 사람
  - [dinner.noraebang.dancefirst] 미리 화장실로 도망간다
    [reasons.dancefirst] 미리 빠져나가는 사람

## 4. 엘리베이터  `lift`

### 표현 closing

- [lift.closing.title] 3분 지각. 엘리베이터 문이 닫히고 있습니다.
- [lift.closing.description] 안에 사람이 있고, 눈이 마주쳤습니다.
  - [lift.closing.run] 뛴다. 문틈에 손을 넣는다
    [reasons.run] 일단 뛰고 보는 사람
  - [lift.closing.wave] 손을 흔들며 “잠깐만요!”라고 외친다
    [reasons.wave] 웃으면서 부탁하는 사람
  - [lift.closing.wait] 그냥 보낸다. 다음 거 탄다
    [reasons.wait] 서두르지 않는 사람
  - [lift.closing.stairs] 계단으로 방향을 튼다
    [reasons.stairs] 혼자 해결하는 사람

### 표현 full

- [lift.full.title] 꽉 찬 엘리베이터. 한 사람 들어갈 자리는 남아 있습니다.
- [lift.full.description] 문이 곧 닫힐 것 같습니다.
  - [lift.full.squeeze] 그 틈으로 조용하게 쏙 들어간다
    [reasons.squeeze] 비집고 들어가는 사람
  - [lift.full.sorry] “죄송합니다.” 하면서 조심스럽게 들어간다
    [reasons.sorry] 미안하다고 먼저 하는 사람
  - [lift.full.next] 걸어가며 “기다려 주세요”라고 소리친다
    [reasons.next] 기다려 달라고 말하는 사람
  - [lift.full.silentin] 다음 엘리베이터를 기다린다
    [reasons.silentin] 다음 걸 기다리는 사람

### 표현 button

- [lift.button.title] 엘리베이터 안에서 뒤에 선 사람이 층을 눌러 달라고 합니다.
- [lift.button.description] 당신은 버튼 앞에 서 있습니다.
  - [lift.button.askfloor] 웃으면서 해당 층을 눌러 준다
    [reasons.askfloor] 웃으면서 눌러 주는 사람
  - [lift.button.smilepress] 말없이 해당 층을 눌러 준다
    [reasons.smilepress] 말없이 눌러 주는 사람
  - [lift.button.quietpress] 직접 손으로 버튼을 누르라고 말한다
    [reasons.quietpress] 직접 하라고 말하는 사람
  - [lift.button.already] 무시한다
    [reasons.already] 굳이 나서지 않는 사람

## 5. 시장  `market`

### 표현 extra

- [market.extra.title] 시장 아주머니가 하나를 더 얹어 주셨습니다. 돈은 받지 않으십니다.
- [market.extra.description] 웃으면서 그냥 가져가라고 하십니다.
  - [market.extra.insist] “돈 드릴게요.” 하고 돈을 건넨다
    [reasons.insist] 빚은 안 지는 사람
  - [market.extra.accept] “감사합니다.” 하고 웃으며 받는다
    [reasons.accept] 고마운 건 크게 말하는 사람
  - [market.extra.return] “그럼 이것도 하나 더 주세요.” 하고 농담한다
    [reasons.return] 농담으로 받는 사람
  - [market.extra.regular] 거절한다
    [reasons.regular] 그냥 사양하는 사람

### 표현 haggle

- [market.haggle.title] 가격표를 보니 생각보다 비쌉니다.
- [market.haggle.description] 조금 깎아 달라고 말해도 괜찮을 것 같습니다.
  - [market.haggle.asked] 그냥 적힌 가격을 그대로 낸다
    [reasons.asked] 부르는 값을 그대로 내는 사람
  - [market.haggle.smileask] “조금만 깎아 주실 수 있어요?” 하고 물어본다
    [reasons.smileask] 웃으면서 물어보는 사람
  - [market.haggle.buymore] 다른 가게 가격부터 확인해 본다
    [reasons.buymore] 먼저 알아보는 사람
  - [market.haggle.checkfirst] 사는 것을 포기한다
    [reasons.checkfirst] 아니면 그만두는 사람

### 표현 change

- [market.change.title] 거스름돈을 세어 보니 돈을 더 받았습니다.
- [market.change.description] 이미 집에 거의 도착한 상황입니다.
  - [market.change.goback] 바로 가게로 돌아가 돌려드린다
    [reasons.goback] 그 자리에서 돌려주는 사람
  - [market.change.handback] 웃으면서 주머니에 넣는다
    [reasons.handback] 웃으면서 넣어 두는 사람
  - [market.change.nexttime] 다음에 가면 말씀드리기로 한다
    [reasons.nexttime] 다음을 기약하는 사람
  - [market.change.countit] 기부한다
    [reasons.countit] 다른 데로 보내는 사람

## 6. 마지막 저녁  `evening`

### 표현 lastnight

- [evening.lastnight.title] 한국에서 보내는 마지막 저녁입니다. 오늘은 어디로 갈까요?
- [evening.lastnight.description] 오늘 하루가 끝나기 전에 한 곳만 갈 수 있습니다.
  - [evening.lastnight.hangang] 한강. 천천히 걸으면서 해 지는 걸 본다
    [reasons.hangang] 물가에서 시간이 잘 가는 사람
  - [evening.lastnight.bukhansan] 산. 조용한 길을 따라 천천히 걷는다
    [reasons.bukhansan] 조용한 데로 가는 사람
  - [evening.lastnight.sea] 바다. 밤이 깊어질 때까지 앉아 있는다
    [reasons.sea] 멀리까지 가 보는 사람
  - [evening.lastnight.alley] 동네 골목. 가게들을 천천히 구경하며 걷는다
    [reasons.alley] 가까운 데서 찾는 사람

### 표현 photo

- [evening.photo.title] 마지막으로 사진 한 장만 남길 수 있다면요?
- [evening.photo.description] 한국에서 본 것 중 하나만 남겨 간다면 어떤 장면일까요?
  - [evening.photo.bridge] 다리 위에서 바라본 강과 하늘
    [reasons.bridge] 넓은 걸 담는 사람
  - [evening.photo.throughtrees] 나무 사이로 들어온 햇빛
    [reasons.throughtrees] 빛을 보는 사람
  - [evening.photo.wintersun] 겨울 바다 위로 떠오른 해
    [reasons.wintersun] 추워도 나가는 사람
  - [evening.photo.wallflower] 골목 담장에 피어 있던 꽃
    [reasons.wallflower] 작은 걸 보는 사람

### 표현 weather

- [evening.weather.title] 한국에서 가장 보고 싶은 날씨는 무엇인가요?
- [evening.weather.description] 아직 한국에서 만나보지 못한 날씨도 괜찮아요.
  - [evening.weather.summerwind] 한강에 바람이 부는 여름 저녁
    [reasons.summerwind] 바람을 기억하는 사람
  - [evening.weather.autumnleaves] 단풍으로 물든 가을의 산
    [reasons.autumnleaves] 색을 기억하는 사람
  - [evening.weather.winterclear] 눈이 내린 서울의 겨울 아침
    [reasons.winterclear] 맑은 걸 좋아하는 사람
  - [evening.weather.springday] 벚꽃이 피는 봄날의 거리
    [reasons.springday] 봄을 기다리는 사람

---

# 2부 · K-드라마 — 장면과 보기  (아직 손대지 않은 부분)

장르마다 스물한 장면이 있고, 한 번 볼 때 그중 열두 장면을 지납니다.
`{name}` 은 사용자의 이름이 들어가는 자리이니 지우지 마세요.
`{은/는}` 처럼 빗금이 있는 것은 받침에 따라 자동으로 골라지는 조사입니다 — 짝을 유지해 주세요.

## 재벌 로맨스  `chaebol`

- [chaebol.intern] 첫 출근. 사수가 팀에 소개합니다. “오늘부터 같이 일할 {name} 씨예요.”
  - [chaebol.intern.stare] 인사하는 내내, 아까 복도에서 마주친 사람만 보인다
  - [chaebol.intern.brief] 짧게 인사하고, 묻는 말에만 또박또박 답한다
  - [chaebol.intern.learn] 한 명씩 눈 맞추면서 이름을 따라 불러 본다
  - [chaebol.intern.mutter] “잘 부탁드립니다” 하고, 속으로 “...살려주세요”

- [chaebol.elevator] 하필 그 사람이랑 둘이 엘리베이터에 탔습니다. 12층까지 올라가야 합니다.
  - [chaebol.elevator.mirror] 층수만 보고 있는데, 거울로 눈이 마주친다
  - [chaebol.elevator.ask] “몇 층 누르세요?” 먼저 묻는다
  - [chaebol.elevator.hold] 짐이 많아 보여서 말없이 열림 버튼을 잡아준다
  - [chaebol.elevator.joke] “여기서 멈추면 뉴스 나오는 거죠?”

- [chaebol.rumour] 회사 단톡방이 이미 정해놨습니다. “{name} 씨랑 그분, 둘이 뭐 있는 거 맞지?”
  - [chaebol.rumour.sowhat] “뭐 있으면요?” 하고 보낸다
  - [chaebol.rumour.silence] 읽고 답을 안 한다. 다음 날 아무도 그 얘기를 못 꺼낸다
  - [chaebol.rumour.offer] 그 사람한테 먼저 “불편하면 제가 정리할게요”
  - [chaebol.rumour.rename] 아무 말 없이 단톡방 이름만 바꿔 놓는다

- [chaebol.overnight] 10시. 사무실에 둘만 남았습니다. “{name} 씨, 아직 안 가요?”
  - [chaebol.overnight.stay2] 모니터만 보면서 아직 멀었다고 한다
  - [chaebol.overnight.coffee2] 커피 두 잔을 타 온다. 묻지도 않고
  - [chaebol.overnight.blanket] 에어컨 세다고 겉옷을 걸쳐 준다
  - [chaebol.overnight.playlist] 스피커를 켠다. 야근용 플레이리스트가 있다

- [chaebol.hoesik] 회식 2차. 부장님이 마이크를 쥐여줍니다. “{name} 씨, 한 곡 해야지.”
  - [chaebol.hoesik.ballad] 발라드를 고르고, 한 사람 쪽은 안 본다
  - [chaebol.hoesik.stand] 일어나서 마이크를 받는다. 노래는 그다음 문제
  - [chaebol.hoesik.swap] 부장님 애창곡을 대신 넣어 드린다
  - [chaebol.hoesik.tambourine] 탬버린을 집어 든다. 노래는 안 한다

- [chaebol.sickday] 그 사람이 몸살로 결근했습니다. 단톡방에 “{name} 씨, 시간 되면 좀 들여다봐 줄래요?”
  - [chaebol.sickday.porridge2] 죽만 문 앞에 두고 온다. 벨은 안 누르고
  - [chaebol.sickday.doctor] 병원부터 데려간다. 접수도 대신 한다
  - [chaebol.sickday.text2] “약 먹었어요?” 두 시간마다 보낸다
  - [chaebol.sickday.soup] 닭백숙을 끓여 온다. 한 솥을

- [chaebol.talent] 워크샵 장기자랑. 하필 {name} 씨랑 그 사람이 한 조입니다.
  - [chaebol.talent.duet] 듀엣곡을 고른다. 아무 말 없이
  - [chaebol.talent.mc] 사회를 자원한다. 무대는 통째로 당신 것
  - [chaebol.talent.backup] 그 사람 뒤에서 조용히 받쳐 준다
  - [chaebol.talent.costume] 의상을 맞춰 온다. 아무도 안 시켰는데

- [chaebol.rooftop] 옥상. 그 사람이 혼자 있고, 방금까지 운 게 보입니다.
  - [chaebol.rooftop.beside] 옆에 가서 선다. 갈 생각이 없어 보이게
  - [chaebol.rooftop.coffee] 못 본 척 내려갔다가, 캔커피만 놓고 온다
  - [chaebol.rooftop.tissue] 휴지를 건네고 “천천히 얘기해요”
  - [chaebol.rooftop.weather] “여기 바람 세죠” 하고 딴 얘기부터 꺼낸다

- [chaebol.rival] 건물주 아들이 그 사람한테 관심을 보입니다. 차도 사람도 여기 사람 같지가 않습니다.
  - [chaebol.rival.overtime] 아무 말 안 한다. 대신 그날 야근을 같이 한다
  - [chaebol.rival.between] “누구시죠?” 하고 사이에 선다
  - [chaebol.rival.defer] 그 사람이 좋으면 그게 맞는 거라고 생각한다
  - [chaebol.rival.photo] 차 사진을 찍어서 단톡방에 올린다

- [chaebol.mother] 그 사람 어머니가 만나자고 합니다. 앉자마자 봉투를 밀어 놓습니다. “{name} 씨라고 했죠.”
  - [chaebol.mother.refuse] 봉투를 그대로 두고 “저는 그런 거 받을 생각 없습니다”
  - [chaebol.mother.return] 봉투를 다시 밀어 드리고, 끝까지 존댓말로 듣는다
  - [chaebol.mother.listen] “걱정되시는 거 압니다” 부터 말한다
  - [chaebol.mother.open] 봉투를 열어 보고 “이걸로 뭘 하면 되죠?”

- [chaebol.chairman] 회장실로 부릅니다. “자네가 그 {name} 씨인가.”
  - [chaebol.chairman.state] “네. 그리고 그 사람 얘기라면 저한테 하시죠.”
  - [chaebol.chairman.bow] 인사만 하고, 회장님이 먼저 말하길 기다린다
  - [chaebol.chairman.praise] 그 사람 얘기가 나오자 좋은 말만 골라서 한다
  - [chaebol.chairman.deal] 조건이 뭐냐고 먼저 묻는다

- [chaebol.quitting] 그 사람이 사표를 냈습니다. “{name} 씨한테는 말하고 가려고요.”
  - [chaebol.quitting.follow2] “어디로 가는데요. 저도 그만둘까요.”
  - [chaebol.quitting.reason] 이유부터 끝까지 듣는다. 말은 그다음에
  - [chaebol.quitting.hold2] 사표를 받아서 도로 서랍에 넣는다
  - [chaebol.quitting.joke2] “환송회는 제가 잡을게요” 하고 웃는다

- [chaebol.leak] 사내 메신저가 털렸습니다. {name} 씨랑 그 사람 대화가 통째로.
  - [chaebol.leak.own] “네, 제가 보낸 거 맞습니다” 하고 인정한다
  - [chaebol.leak.delete] 전산팀부터 찾아가 원본을 잡는다
  - [chaebol.leak.check] 그 사람한테 먼저 간다. “괜찮아요?”
  - [chaebol.leak.screenshot] 제일 웃긴 대목을 캡처해서 본인이 올린다

- [chaebol.hospital] 새벽 두 시, 병원 복도. 아무도 당신한테 무슨 일인지 말해주지 않습니다.
  - [chaebol.hospital.wait] 복도 끝 의자에 앉아서 아침까지 기다린다
  - [chaebol.hospital.family] 간호사실로 가서 보호자라고 말한다
  - [chaebol.hospital.porridge] 편의점에 내려가 죽이랑 담요를 사 온다
  - [chaebol.hospital.talk] 옆자리 보호자랑 한 시간째 얘기 중이다

- [chaebol.contract] “{name} 씨. 딱 3개월만, 사귀는 척해 주면 안 돼요?”
  - [chaebol.contract.real] “3개월 뒤에 진짜가 되면요?”
  - [chaebol.contract.terms] 조건을 적자고 한다. 기간, 범위, 끝내는 방법까지
  - [chaebol.contract.why] 이유부터 묻는다. 얼마나 급한 건지
  - [chaebol.contract.rings] “좋아요” 하고, 다음 날 커플링을 사 온다

- [chaebol.snow] 첫눈이 옵니다. 첫눈 오면 보자고 했던 게, 둘 다 기억납니다.
  - [chaebol.snow.go] 약속했던 자리로 그냥 간다. 연락은 안 하고
  - [chaebol.snow.call] “지금 나와요” 하고 전화한다
  - [chaebol.snow.text3] “눈 온다” 한 줄만 보낸다
  - [chaebol.snow.snowman] 눈사람부터 만들어서 사진을 보낸다

- [chaebol.board] 이사회. 안건 마지막 줄에 당신 이름이 올라가 있습니다.
  - [chaebol.board.omit] 발언 순서가 와도 그 사람 얘기는 안 꺼낸다
  - [chaebol.board.speak] 손을 들고 먼저 말한다
  - [chaebol.board.credit] 공을 전부 팀 이름으로 돌린다
  - [chaebol.board.walk] 자료를 덮고 그냥 나간다

- [chaebol.airport] 그 사람이 공항이라는 연락을 받았습니다. 두 시간 남았습니다.
  - [chaebol.airport.drive] 차를 몬다. 도착할 때까지 전화는 안 한다
  - [chaebol.airport.ring] 전화부터 건다. “거기 그대로 있어요.”
  - [chaebol.airport.letter] 편지를 써서 데스크에 맡긴다
  - [chaebol.airport.gate] 게이트 앞에 먼저 가서 기다린다

- [chaebol.press] 사내 결혼설이 기사로 나갔습니다. 사진까지 붙어서.
  - [chaebol.press.quiet] 아무 말도 안 한다. 부정도 안 하고
  - [chaebol.press.deny] 공식적으로 아니라고 낸다
  - [chaebol.press.shield] 그 사람 쪽 피해부터 막는다
  - [chaebol.press.frame] 기사를 액자에 넣어 책상에 올려 둔다

- [chaebol.wrist] 사람들 다 보는 데서, 그 사람이 당신 손목을 잡습니다.
  - [chaebol.wrist.follow] 안 뿌리친다. 그대로 따라 나간다
  - [chaebol.wrist.greet] 손을 풀고, 사람들한테 먼저 인사를 한다
  - [chaebol.wrist.regrip] 손을 고쳐 잡는다. 손목 말고 손으로
  - [chaebol.wrist.laugh] “여기서요?” 하고 웃는다

- [chaebol.ramyeon] 늦은 밤, 집 앞. “{name} 씨, 라면 먹고 갈래요?”
  - [chaebol.ramyeon.stay] “라면은 됐고요.” 하고 그 자리에 선다
  - [chaebol.ramyeon.up] “네.” 하고 먼저 올라간다
  - [chaebol.ramyeon.tomorrow] “오늘은 갈게요. 내일 봬요”
  - [chaebol.ramyeon.two] “물 올려요. 저 두 개 먹어요”

### 포스터 (결과 카드)

- [chaebol.poster.lead_direct] 《{name}, 회장님의 계산 밖》
  - [chaebol.poster.lead_direct.logline] 남들은 마지막 화까지 아낄 말을 {name}{은/는} 2화에 해버립니다. 회장님 계획에 없던 변수가 하나 생겼습니다.
- [chaebol.poster.lead_careful] 《{name}의 조용한 인수》
  - [chaebol.poster.lead_careful.logline] 소리 한 번 지르지 않고 {name}{은/는} 열두 화를 끌고 갑니다. 다들 기다리게 해놓고 마지막에 한 번에 터뜨립니다.
- [chaebol.poster.firstLove_direct] 《{name}의 계약 연애》
  - [chaebol.poster.firstLove_direct.logline] 3개월만 버티면 되는 계약이었습니다. {name}{은/는} 계약서에 없던 걸 하나씩 하기 시작합니다.
- [chaebol.poster.firstLove_careful] 《{name}, 말하지 못한 3개월》
  - [chaebol.poster.firstLove_careful.logline] {name}{은/는} 끝까지 말하지 않았습니다. 그래서 그 사람은 아직도 그때 받은 우산을 못 버립니다.
- [chaebol.poster.spark_direct] 《{name}, 사내연애 금지》
  - [chaebol.poster.spark_direct.logline] 타이밍이 두 화쯤 어긋나다가, {name}{이/가} 그냥 물어봅니다. 보는 사람은 시원하고 작가는 난감합니다.
- [chaebol.poster.spark_careful] 《{name}{과/와} 그 사람 사이, 1분》
  - [chaebol.poster.spark_careful.logline] {name}{과/와} 그 사람은 같은 문 앞에 1분 차이로 계속 도착합니다. 아무 말도 안 했는데 사내가 다 압니다.
- [chaebol.poster.second_direct] 《{name}, 8화의 고백》
  - [chaebol.poster.second_direct.logline] {name}{은/는} 8화에서 말하고, 안 되면 깔끔하게 물러납니다. 그날 밤 시청자 절반이 편을 바꿉니다.
- [chaebol.poster.second_careful] 《{name}{은/는} 오늘도 밥을 챙긴다》
  - [chaebol.poster.second_careful.logline] {name}{은/는} 밥 먹었냐고 묻는 쪽입니다. 끝까지 말은 안 하고, 사람들은 마지막 화까지 그 얘기로 싸웁니다.
- [chaebol.poster.rival_direct] 《{name}, 회의실의 적》
  - [chaebol.poster.rival_direct.logline] {name}{은/는} 늦게, 더 잘 입고 와서 아무도 꺼내기 싫던 말을 합니다. 맞는 말이라 더 얄밉습니다.
- [chaebol.poster.rival_careful] 《{name}{은/는} 이미 알고 있었다》
  - [chaebol.poster.rival_careful.logline] {name}{은/는} 아무하고도 싸우지 않습니다. 나중에 보면 {name} 말이 맞았을 뿐이고, 알았을 땐 이미 늦었습니다.
- [chaebol.poster.bestie_direct] 《{name}, 이 회사의 분위기》
  - [chaebol.poster.bestie_direct.logline] {name}{은/는} 나오는 장면마다 다 가져갑니다. 원래 절반은 대본에 없던 장면입니다.
- [chaebol.poster.bestie_careful] 《{name}{이/가} 없으면 안 되는 회사》
  - [chaebol.poster.bestie_careful.logline] {name}{은/는} 데려다주고, 1화에서 한 말을 기억하고, 생색은 안 냅니다. 없으면 이 회사가 안 돌아갑니다.

## 막장  `makjang`

- [makjang.wedding] 결혼식장. 신부 측 하객석에 {name} 씨 자리가 있습니다. 신랑은 오늘 처음 봅니다.
  - [makjang.wedding.groom] 신랑 얼굴만 계속 본다
  - [makjang.wedding.back] 맨 뒤에 앉는다. 식이 끝날 때까지
  - [makjang.wedding.hands] 신부한테 먼저 가서 손을 잡는다
  - [makjang.wedding.envelope] 축의금 봉투에 이름을 안 쓴다

- [makjang.slap] 김치 싸대기가 날아갔습니다. 맞은 건 당신이 아니었습니다.
  - [makjang.slap.toward] 맞은 사람 쪽으로 천천히 간다
  - [makjang.slap.wrist2] 김치를 든 손목을 잡는다
  - [makjang.slap.towel] 물수건부터 가져온다
  - [makjang.slap.film] 휴대폰을 든다. 일단 찍는다

- [makjang.photo2] 서랍에서 오래된 사진이 나왔습니다. 스무 살쯤의 여자가 {name} 씨랑 너무 닮았습니다.
  - [makjang.photo2.ask2] 사진을 들고 어머니한테 간다
  - [makjang.photo2.drawer] 사진을 도로 넣고 서랍을 잠근다
  - [makjang.photo2.careful] 누구냐고 조심스럽게 묻는다
  - [makjang.photo2.copy] 사진을 찍어만 두고 아무한테도 안 보낸다

- [makjang.hospital2] 병실. 처음 보는 사람이 {name} 씨 이름을 부릅니다.
  - [makjang.hospital2.handonly] 손만 잡고 아무것도 안 묻는다
  - [makjang.hospital2.whoareyou] 누구시냐고 바로 묻는다
  - [makjang.hospital2.tuck] 이불부터 여며 드린다
  - [makjang.hospital2.chart] 간호사를 불러서 차트를 본다

- [makjang.will] 유언장 낭독. 변호사가 {name} 씨 이름을 부릅니다.
  - [makjang.will.listen2] 듣기만 한다. 표정도 안 바꾸고
  - [makjang.will.reread] 일어나서 전문을 다시 읽어 달라고 한다
  - [makjang.will.hold3] 옆자리 사람 손을 잡아 준다
  - [makjang.will.copy2] 변호사한테 사본을 달라고 한다

- [makjang.orphan] 보육원 기록에 {name} 씨 이름이 있습니다. 1998년에.
  - [makjang.orphan.stare2] 기록만 한참 들여다본다
  - [makjang.orphan.callnow] 원장한테 바로 전화한다
  - [makjang.orphan.others] 그때 같이 있던 사람들을 먼저 찾는다
  - [makjang.orphan.take2] 기록을 복사해서 가방에 넣는다

- [makjang.twin] 길에서 {name} 씨랑 똑같이 생긴 사람을 봤다는 연락이 옵니다.
  - [makjang.twin.keep2] 사진만 받아 두고 답은 안 한다
  - [makjang.twin.gothere] 그 자리로 바로 간다
  - [makjang.twin.hush] 가족한테는 말하지 않기로 한다
  - [makjang.twin.mimic] 그 사람 흉내를 내서 사진을 찍어 보낸다

- [makjang.dna] 친자 확인 결과가 봉투째 도착했습니다. 아직 안 뜯었습니다.
  - [makjang.dna.openit] 그 자리에서 뜯는다
  - [makjang.dna.lawyer] 변호사 앞에서 같이 뜯기로 한다
  - [makjang.dna.showher] 어머니한테 먼저 보여 드린다
  - [makjang.dna.fridge] 봉투째 냉장고에 넣어 둔다

- [makjang.stepmother] 새어머니가 당신 방을 정리해 뒀습니다. 사진 액자만 빼고요.
  - [makjang.stepmother.nothing3] 액자 얘기는 꺼내지 않는다
  - [makjang.stepmother.whereis] 액자 어디 있냐고 바로 묻는다
  - [makjang.stepmother.thanks] 정리해 주셔서 고맙다고 한다
  - [makjang.stepmother.bigger] 액자를 새로 사서 더 크게 걸어 둔다

- [makjang.amnesia] 그 사람이 사고 뒤로 {name} 씨를 못 알아봅니다.
  - [makjang.amnesia.again2] 매일 같은 얘기를 처음부터 다시 한다
  - [makjang.amnesia.doctor2] 의사 말부터 끝까지 듣는다
  - [makjang.amnesia.okay] 기억 안 나도 괜찮다고 먼저 말한다
  - [makjang.amnesia.photos] 예전 사진을 몰래 병실에 걸어 둔다

- [makjang.boardroom] 이사회. 지분 얘기가 나오고, {name} 씨 이름이 호명됩니다.
  - [makjang.boardroom.protect] 그 사람 지분은 안 건드린다고 못 박는다
  - [makjang.boardroom.readall] 서류를 끝까지 읽고 나서 말한다
  - [makjang.boardroom.staff] 회사에 남은 사람들 얘기부터 꺼낸다
  - [makjang.boardroom.delay] 표결을 다음 주로 미루자고 한다

- [makjang.deathbed] 임종 직전, 어머니가 {name} 씨 손을 잡고 뭔가 말하려고 합니다.
  - [makjang.deathbed.listenclose] 귀를 가까이 대고 끝까지 듣는다
  - [makjang.deathbed.family2] 다른 가족부터 병실로 부른다
  - [makjang.deathbed.dontspeak] 괜찮다고, 말 안 해도 된다고 한다
  - [makjang.deathbed.record] 녹음 버튼을 누른다

- [makjang.swap2] 병원에서 연락이 왔습니다. 1998년에 아기가 바뀌었을 수도 있답니다. {name} 씨요.
  - [makjang.swap2.gohome] 지금 키워 준 부모한테 바로 간다
  - [makjang.swap2.records] 병원에 기록 전부를 요구한다
  - [makjang.swap2.theirs] 상대편 가족 걱정부터 한다
  - [makjang.swap2.alone2] 아무한테도 말 안 하고 혼자 알아본다

- [makjang.crash] 빗길. 브레이크. 그리고 전화 한 통이 계속 울립니다.
  - [makjang.crash.nopick] 전화를 안 받고 그 자리에 선다
  - [makjang.crash.call119] 119부터 부른다
  - [makjang.crash.umbrella] 우산을 씌워 준다. 자기는 다 젖으면서
  - [makjang.crash.dashcam] 블랙박스부터 챙긴다

- [makjang.secret2] 어머니가 20년 동안 말하지 않은 게 있답니다. “{name} 씨한테는 말하고 가야 할 것 같아서.”
  - [makjang.secret2.nowhere] 듣겠다고 한다. 지금, 여기서
  - [makjang.secret2.quieter] 자리를 옮기자고 한다. 조용한 데로
  - [makjang.secret2.dontneed] 말하기 힘들면 안 해도 된다고 한다
  - [makjang.secret2.knew] 이미 알고 있었다고 말한다

- [makjang.rain] 비. 그 사람이 우산도 없이 서 있습니다.
  - [makjang.rain.soaked] 옆에 가서 같이 젖는다
  - [makjang.rain.tocar] 우산을 씌우고 차까지 데려간다
  - [makjang.rain.giveit] 우산만 주고 먼저 간다
  - [makjang.rain.throwit] 우산을 던져 주고 뛴다

- [makjang.funeral] 장례식장. 상주 자리에 당신 이름이 붙어 있습니다.
  - [makjang.funeral.sit2] 자리에 앉는다. 아무 말도 안 하고
  - [makjang.funeral.greet2] 조문객을 하나하나 맞는다
  - [makjang.funeral.beside2] 우는 사람 옆에 가서 앉는다
  - [makjang.funeral.swapname] 명패를 떼서 다른 사람 이름을 붙인다

- [makjang.reunion2] 20년 만에 그 사람이 문 앞에 서 있습니다.
  - [makjang.reunion2.silent3] 문을 열고 아무 말도 안 한다
  - [makjang.reunion2.comein] 들어오라고 먼저 말한다
  - [makjang.reunion2.meal] 밥부터 차린다
  - [makjang.reunion2.interest] “20년이면 이자도 붙는데요” 한다

- [makjang.trial] 법정. 증인석에 당신이 앉아 있습니다.
  - [makjang.trial.onlyasked] 묻는 말에만 답한다
  - [makjang.trial.more2] 묻지 않은 것까지 말한다
  - [makjang.trial.dontlook] 그 사람 쪽은 끝까지 안 본다
  - [makjang.trial.gallery] 방청석을 향해 한마디 한다

- [makjang.confront] 다 모인 자리입니다. 이제 당신이 입을 엽니다.
  - [makjang.confront.callthem] 제일 먼저 그 사람 이름을 부른다
  - [makjang.confront.papers] 서류를 꺼내 놓고 기다린다
  - [makjang.confront.neither] 누구 편도 안 들겠다고 먼저 말한다
  - [makjang.confront.playit] 녹음 파일을 튼다

- [makjang.forgive] “{name} 씨. 이제 손 한 번만 잡아 주면 돼요.”
  - [makjang.forgive.sitdown] 손은 안 잡고, 그 자리에 앉는다
  - [makjang.forgive.takeit] 손을 잡는다. 사람들 다 보는 데서
  - [makjang.forgive.later] “조금만 더 있다가요.”
  - [makjang.forgive.eat] “손은 됐고, 밥부터 먹죠.”

### 포스터 (결과 카드)

- [makjang.poster.lead_direct] 《{name}, 그 집의 진짜 이름》
  - [makjang.poster.lead_direct.logline] {name}{은/는} 봉투를 그 자리에서 뜯습니다. 그날 이후 이 집 사람 누구도 예전으로 못 돌아갑니다.
- [makjang.poster.lead_careful] 《{name}{은/는} 20년을 기다렸다》
  - [makjang.poster.lead_careful.logline] {name}{은/는} 20년을 아무 말 없이 지나 보냈습니다. 그리고 딱 한 번, 다 모인 자리에서 입을 엽니다.
- [makjang.poster.firstLove_direct] 《{name}, 비 오는 날의 약속》
  - [makjang.poster.firstLove_direct.logline] 우산도 없이 서 있던 사람을 {name}{은/는} 결국 못 지나칩니다. 그 한 번이 100회를 끌고 갑니다.
- [makjang.poster.firstLove_careful] 《{name}, 서랍 속의 사진》
  - [makjang.poster.firstLove_careful.logline] 서랍 속 사진 한 장을 {name}{은/는} 도로 넣었습니다. 아무한테도 묻지 않았고, 그래서 아무것도 끝나지 않았습니다.
- [makjang.poster.spark_direct] 《{name}, 두 번째 만남》
  - [makjang.poster.spark_direct.logline] {name}{은/는} 두 번째로 마주친 자리에서 바로 물어봅니다. 온 집안이 그 질문 하나로 뒤집힙니다.
- [makjang.poster.spark_careful] 《{name}{과/와} 그 사람의 1998년》
  - [makjang.poster.spark_careful.logline] {name}{과/와} 그 사람은 1998년에 한 번 스쳤습니다. 둘 다 그걸 모르고, 보는 사람만 압니다.
- [makjang.poster.second_direct] 《{name}, 상주석의 이름》
  - [makjang.poster.second_direct.logline] 상주 자리에 {name} 이름이 붙어 있었습니다. {name}{은/는} 앉았고, 그날 밤 시청자 절반이 편을 바꿉니다.
- [makjang.poster.second_careful] 《{name}{은/는} 끝까지 남았다》
  - [makjang.poster.second_careful.logline] 다들 돌아간 뒤에도 {name}{은/는} 병실 복도에 남아 있었습니다. 아무도 몰랐고, 마지막 회에 다 알게 됩니다.
- [makjang.poster.rival_direct] 《{name}, 유언장의 마지막 줄》
  - [makjang.poster.rival_direct.logline] 유언장 마지막 줄에 {name} 이름이 있었습니다. {name}{은/는} 일어나서 다시 읽어 달라고 합니다.
- [makjang.poster.rival_careful] 《{name}, 조용한 상속》
  - [makjang.poster.rival_careful.logline] {name}{은/는} 아무것도 요구하지 않습니다. 그런데 지분은 조금씩 {name} 쪽으로 옵니다.
- [makjang.poster.bestie_direct] 《{name}, 이 집의 소란》
  - [makjang.poster.bestie_direct.logline] {name}{이/가} 들어오면 조용하던 집이 시끄러워집니다. 그 소란이 없었으면 이 집은 벌써 무너졌습니다.
- [makjang.poster.bestie_careful] 《{name}, 누구의 편도 아닌》
  - [makjang.poster.bestie_careful.logline] {name}{은/는} 누구 편도 들지 않습니다. 그래서 다들 {name}한테만 진짜 얘기를 합니다.

## 하이틴  `highteen`

- [highteen.roll] 전학 첫날. 선생님이 출석을 부릅니다. “{name}, 어디 앉을래?”
  - [highteen.roll.window] 창가 자리로 간다. 거기 앉은 애랑 눈이 마주쳤다
  - [highteen.roll.front] 맨 앞자리에 앉는다. 다 보이게
  - [highteen.roll.empty] 혼자 앉아 있는 애 옆으로 간다
  - [highteen.roll.backrow] 제일 뒷자리로 가서 가방을 던져 놓는다

- [highteen.seat] 자리 바꾸기. 제비를 뽑았는데 하필 그 애 옆입니다.
  - [highteen.seat.keepit] 아무 말 없이 그냥 앉는다
  - [highteen.seat.swapask] 선생님한테 바꿔도 되냐고 묻는다
  - [highteen.seat.hello] 먼저 인사하고 이름을 묻는다
  - [highteen.seat.line] 책상 가운데에 선을 긋는다

- [highteen.lunch] 급식 줄. 뒤에서 누가 {name} 이름을 부릅니다.
  - [highteen.lunch.turn] 돌아본다. 생각보다 가까이 있다
  - [highteen.lunch.hold4] 줄은 안 놓고 고개만 돌린다
  - [highteen.lunch.share] 식판을 들고 그 애 옆자리로 간다
  - [highteen.lunch.pretend] 못 들은 척하고 국을 두 번 받는다

- [highteen.latenight] 야자 끝. 교문 앞에 {name} 혼자 남았는데, 그 애가 아직 안 갔습니다.
  - [highteen.latenight.walk2] 말없이 같이 걷는다. 버스 정류장까지
  - [highteen.latenight.first2] “같이 갈래?” 먼저 묻는다
  - [highteen.latenight.share2] 이어폰 한쪽을 건넨다
  - [highteen.latenight.race] “정류장까지 뛰기” 하고 먼저 뛴다

- [highteen.sports] 체육대회 계주. 마지막 주자는 {name}입니다.
  - [highteen.sports.lookfor] 출발선에서 관중석부터 찾는다
  - [highteen.sports.anchor] 손을 들어 반 애들한테 알린다
  - [highteen.sports.swap3] 더 잘 뛰는 애한테 넘기겠다고 한다
  - [highteen.sports.shoes] 신발을 벗는다. 맨발로 뛰겠다고

- [highteen.notes] 그 애가 일주일을 결석했습니다. 필기는 {name} 것뿐입니다.
  - [highteen.notes.deliver] 집까지 갖다준다. 벨은 누르고
  - [highteen.notes.copy3] 복사해서 사물함에 넣어 둔다
  - [highteen.notes.rewrite] 빠진 데까지 다시 정리해서 준다
  - [highteen.notes.doodle] 구석에 낙서를 그려 넣고 준다

- [highteen.caught] 매점에 몰래 갔다가 {name}{이랑/랑} 그 애만 걸렸습니다.
  - [highteen.caught.mine] “제가 가자고 했어요” 한다
  - [highteen.caught.stand2] 선생님 눈을 피하지 않는다
  - [highteen.caught.split] 벌은 반씩 받겠다고 한다
  - [highteen.caught.again3] 다음 주에 또 간다

- [highteen.rooftop3] 옥상. 그 애가 아무한테도 안 한 얘기를 꺼냅니다.
  - [highteen.rooftop3.quiet2] 끝까지 듣고 아무 말도 안 한다
  - [highteen.rooftop3.mine2] 당신 얘기도 하나 꺼낸다
  - [highteen.rooftop3.promise] 아무한테도 말 안 하겠다고 한다
  - [highteen.rooftop3.change] “근데 배 안 고파?” 하고 딴 얘기를 한다

- [highteen.transfer] 그 애가 유학 간다는 소문이 반에 돕니다.
  - [highteen.transfer.askthem] 직접 가서 사실이냐고 묻는다
  - [highteen.transfer.wait3] 본인이 말할 때까지 기다린다
  - [highteen.transfer.normal] 평소랑 똑같이 대한다
  - [highteen.transfer.bet] 소문 낸 애한테 가서 따진다

- [highteen.trip] 수학여행 밤. 다들 잠든 척하는데, 그 애가 {name}{을/를} 부릅니다.
  - [highteen.trip.outside] 복도로 나간다. 둘만
  - [highteen.trip.sitthere] 그냥 그 자리에 앉아서 듣는다
  - [highteen.trip.blanket2] 이불부터 덮어 준다. 새벽에 춥다고
  - [highteen.trip.wake] 다른 애들을 다 깨운다

- [highteen.classvote] 반장 선거. 칠판에 {name} 이름이 적혔습니다.
  - [highteen.classvote.decline] 그 애가 하는 게 낫다고 한다
  - [highteen.classvote.speech] 나가서 한마디 한다
  - [highteen.classvote.helper] 부반장만 하겠다고 한다
  - [highteen.classvote.campaign] 공약을 열 개쯤 만들어 온다

- [highteen.sick2] 보건실. {name}{이/가} 데려다준 뒤에도 그 애가 손을 안 놓습니다.
  - [highteen.sick2.stay3] 옆에 앉아 있는다. 수업은 째고
  - [highteen.sick2.teacher] 선생님을 부르러 간다
  - [highteen.sick2.water] 물이랑 담요를 가져다준다
  - [highteen.sick2.joke3] “이거 수업 빼먹으려는 거죠” 한다

- [highteen.letter3] 사물함에 편지가 들어 있습니다. 받는 사람은 {name}, 보낸 사람은 없습니다.
  - [highteen.letter3.keepit2] 아무한테도 말 안 하고 가방에 넣는다
  - [highteen.letter3.findout] 필체로 누군지 찾아본다
  - [highteen.letter3.answer] 답장을 써서 도로 넣어 둔다
  - [highteen.letter3.readout] 쉬는 시간에 소리 내서 읽는다

- [highteen.exam] 수능 D-30. 독서실 옆자리가 비었습니다.
  - [highteen.exam.keepseat] 그 자리는 그대로 비워 둔다
  - [highteen.exam.move2] 자리를 앞으로 옮긴다
  - [highteen.exam.message] “어디야” 한 줄 보낸다
  - [highteen.exam.snack] 책상에 초코바를 하나 올려 둔다

- [highteen.fight] 오해가 쌓였습니다. 그 애도, {name}도 먼저 사과를 안 했습니다.
  - [highteen.fight.text4] 새벽에 썼다가 안 보낸 메시지가 있다
  - [highteen.fight.face2] 복도에서 붙잡고 얘기하자고 한다
  - [highteen.fight.waitit] 먼저 말 걸 때까지 기다린다
  - [highteen.fight.prank2] 필통에 쪽지를 넣어 둔다

- [highteen.snow2] 첫눈. 운동장에 아무도 없습니다.
  - [highteen.snow2.alone3] 혼자 한 바퀴 돈다
  - [highteen.snow2.callout] 창문에 대고 이름을 부른다
  - [highteen.snow2.wait4] 그 애가 나올 때까지 서 있는다
  - [highteen.snow2.snowball] 눈을 뭉쳐서 창문에 던진다

- [highteen.result] 성적표가 나왔습니다. 그 애가 먼저 보여 줍니다.
  - [highteen.result.hide] 당신 것은 안 보여 준다
  - [highteen.result.both] 둘 다 펴 놓고 같이 본다
  - [highteen.result.lift] 그 애 것부터 칭찬한다
  - [highteen.result.swap4] 바꿔 들고 서로 읽어 준다

- [highteen.bench] 운동장 벤치. 3년이 오늘로 끝납니다.
  - [highteen.bench.nothing4] 아무 말도 안 하고 앉아 있는다
  - [highteen.bench.say] 하고 싶었던 말을 한다
  - [highteen.bench.thanks2] 고맙다고 먼저 말한다
  - [highteen.bench.carve] 벤치에 이름을 새긴다

- [highteen.prank] 마지막 장난. 칠판에 뭘 쓸지만 남았습니다.
  - [highteen.prank.initials] 이니셜 두 개를 쓴다
  - [highteen.prank.name3] 반 전체 이름을 다 쓴다
  - [highteen.prank.thanks3] 선생님한테 하는 인사를 쓴다
  - [highteen.prank.nonsense] 아무도 모를 말을 쓴다

- [highteen.graduation] 졸업식. 교복에 이름을 적어 달라고 합니다.
  - [highteen.graduation.sleeve] 소매 안쪽에 적는다. 안 보이게
  - [highteen.graduation.backside] 등판에 크게 적는다
  - [highteen.graduation.message2] 이름 말고 한 줄을 적는다
  - [highteen.graduation.upside] 거꾸로 적는다

- [highteen.after] 교문 밖. 여기서 헤어지면 다음은 없습니다. “{name}, 어디로 가?”
  - [highteen.after.same] “같은 쪽” 하고 따라 걷는다
  - [highteen.after.number] 번호부터 다시 저장한다
  - [highteen.after.later2] “다음 주에 보자” 하고 약속을 잡는다
  - [highteen.after.run2] “먼저 간다” 하고 뛰어간다

### 포스터 (결과 카드)

- [highteen.poster.lead_direct] 《{name}, 3학년 1반》
  - [highteen.poster.lead_direct.logline] {name}{이/가} 전학 온 날부터 반 분위기가 바뀝니다. 남들이 졸업식에나 할 말을 {name}{은/는} 3월에 해버립니다.
- [highteen.poster.lead_careful] 《{name}의 마지막 학기》
  - [highteen.poster.lead_careful.logline] {name}{은/는} 한 번도 목소리를 높이지 않습니다. 그런데 3학년 1반은 {name}{을/를} 중심으로 돌아갑니다.
- [highteen.poster.firstLove_direct] 《{name}, 그해 첫눈》
  - [highteen.poster.firstLove_direct.logline] 첫눈 오던 날 운동장에서 {name}{은/는} 하고 싶었던 말을 합니다. 그 장면 하나로 이 드라마가 기억됩니다.
- [highteen.poster.firstLove_careful] 《{name}, 사물함의 편지》
  - [highteen.poster.firstLove_careful.logline] {name}{은/는} 끝내 답장을 안 썼습니다. 그 편지는 아직 누군가의 가방 안쪽에 있습니다.
- [highteen.poster.spark_direct] 《{name}, 야자 끝나고》
  - [highteen.poster.spark_direct.logline] {name}{은/는} 두 정거장쯤 돌아가면서 결국 물어봅니다. 보는 사람이 더 긴장합니다.
- [highteen.poster.spark_careful] 《{name}{과/와} 복도 1분》
  - [highteen.poster.spark_careful.logline] {name}{과/와} 그 애는 늘 1분 차이로 복도를 지나갑니다. 아무 말도 안 했는데 반 전체가 압니다.
- [highteen.poster.second_direct] 《{name}, 계주 마지막 주자》
  - [highteen.poster.second_direct.logline] {name}{은/는} 마지막 바퀴에서 할 말을 다 합니다. 지든 이기든 그날 밤 반 단톡방은 {name} 얘기뿐입니다.
- [highteen.poster.second_careful] 《{name}, 필기를 빌려주는 사람》
  - [highteen.poster.second_careful.logline] {name}{은/는} 빠진 데까지 다시 정리해서 줍니다. 끝까지 아무 말 안 하고, 졸업식에 다들 그걸 압니다.
- [highteen.poster.rival_direct] 《{name}, 전교 1등의 옆자리》
  - [highteen.poster.rival_direct.logline] {name}{은/는} 다들 피하는 말을 교실 한가운데서 합니다. 맞는 말이라 더 미움받습니다.
- [highteen.poster.rival_careful] 《{name}{은/는} 이미 알고 있었다》
  - [highteen.poster.rival_careful.logline] {name}{은/는} 아무하고도 싸우지 않습니다. 성적표가 나오면 {name} 말이 맞았던 걸로 밝혀집니다.
- [highteen.poster.bestie_direct] 《{name}, 우리 반 소란》
  - [highteen.poster.bestie_direct.logline] {name}{이/가} 교실에 들어오면 조용하던 반이 시끄러워집니다. 졸업앨범 절반이 {name} 사진입니다.
- [highteen.poster.bestie_careful] 《{name}{이/가} 챙겨 온 초코바》
  - [highteen.poster.bestie_careful.logline] {name}{은/는} 데려다주고, 3월에 한 말을 기억하고, 생색은 안 냅니다. 없으면 이 반이 안 굴러갑니다.

## 아이돌  `idol`

- [idol.trainee] 연습실 거울 앞. 오늘부터 같은 팀입니다. “{name}{이/가} 막내예요.”
  - [idol.trainee.eyes] 거울로 한 사람만 계속 보게 된다
  - [idol.trainee.center2] 가운데 자리로 가서 선다
  - [idol.trainee.names] 한 명씩 이름을 물어서 외운다
  - [idol.trainee.mirror2] 거울에 대고 이상한 표정을 지어 본다

- [idol.monthly] 월말 평가. 순위가 벽에 붙었습니다.
  - [idol.monthly.theirs2] 내 등수보다 그 애 등수를 먼저 본다
  - [idol.monthly.topline] 1등 줄에 이름을 올리겠다고 말한다
  - [idol.monthly.bottom] 꼴찌 한 애 옆에 가서 앉는다
  - [idol.monthly.photo3] 순위표를 찍어서 배경화면으로 해 둔다

- [idol.bunk] 숙소 2층 침대. 새벽 3시인데 {name}{도/도} 그 애도 안 잡니다.
  - [idol.bunk.ceiling] 천장만 보고 아무 말도 안 한다
  - [idol.bunk.plan] 먼저 말을 꺼낸다. 데뷔하면 뭐 할 건지
  - [idol.bunk.tea] 부엌에 내려가 따뜻한 걸 두 잔 타 온다
  - [idol.bunk.light] 휴대폰 불빛으로 그림자놀이를 한다

- [idol.practice] 새벽 두 시 연습실. {name}{과/와} 그 애만 남았습니다.
  - [idol.practice.again4] 한 번만 더 하자고 한다
  - [idol.practice.count] 거울 앞에 서서 박자를 센다
  - [idol.practice.stretch] 그 애 발목부터 봐 준다
  - [idol.practice.music] 노래를 바꿔 틀고 막춤을 춘다

- [idol.center] 센터 자리가 비었습니다. 팀장이 {name}{을/를} 봅니다.
  - [idol.center.step] 한 발 앞으로 나간다
  - [idol.center.claim2] “제가 할게요” 하고 손을 든다
  - [idol.center.give] 제일 오래 준비한 애한테 넘긴다
  - [idol.center.coin] 동전을 꺼내서 던지자고 한다

- [idol.cover2] 그 애가 안무를 틀렸는데, 선생님이 {name}{을/를} 부릅니다.
  - [idol.cover2.mine3] 제가 틀렸다고 한다
  - [idol.cover2.facts] 누가 틀렸는지 정확히 말한다
  - [idol.cover2.together] 둘 다 다시 하겠다고 한다
  - [idol.cover2.blame] “거울이 휘었나 봐요” 한다

- [idol.vlive] 라이브가 켜져 있는 줄 몰랐습니다. {name}{이/가} 방금 한 말이 다 나갔습니다.
  - [idol.vlive.own4] 카메라를 보고 그대로 인정한다
  - [idol.vlive.shut] 바로 끄고 회사에 먼저 알린다
  - [idol.vlive.cover3] 그 애 얘기가 아니었다고 돌린다
  - [idol.vlive.encore2] 이왕 이렇게 된 거 한 시간 더 켠다

- [idol.debut] 데뷔조 명단이 나왔습니다. 벽에 붙어 있습니다.
  - [idol.debut.search] 이름을 위에서부터 훑는다. 하나만 찾으면서
  - [idol.debut.front2] 제일 앞에 서서 소리 내서 읽는다
  - [idol.debut.hug] 떨어진 애부터 안아 준다
  - [idol.debut.tear] 명단을 떼서 접어 주머니에 넣는다

- [idol.sunbae] 선배 그룹이 당신을 눈여겨봤다는 말이 돌았습니다.
  - [idol.sunbae.keepon] 아무 말 안 하고 연습만 더 한다
  - [idol.sunbae.meet] 직접 찾아가서 인사한다
  - [idol.sunbae.share3] 팀한테 먼저 말한다
  - [idol.sunbae.post] SNS에 선배 노래를 올린다

- [idol.dating] 열애설이 터졌습니다. 사진 속 뒷모습이 {name}{과/와} 그 애입니다.
  - [idol.dating.truth] 사실이라고 말하겠다고 한다
  - [idol.dating.company] 회사 입장부터 정리한다
  - [idol.dating.protect2] 그 애 이름은 절대 안 나오게 한다
  - [idol.dating.meme] 사진을 프로필로 바꾼다

- [idol.first] 음악방송 1위. 앙코르 마이크가 {name} 손에 있습니다.
  - [idol.first.onlyone] 한 사람 쪽만 보고 부른다
  - [idol.first.speech2] 팬들한테 할 말을 다 한다
  - [idol.first.credit2] 스태프 이름을 하나씩 부른다
  - [idol.first.drop] 노래 대신 춤을 춘다

- [idol.injury] 그 애가 발목을 다쳤습니다. 컴백까지 3주인데, 그 파트가 {name} 쪽으로 넘어옵니다.
  - [idol.injury.wait5] 낫고 나서 같이 하겠다고 한다
  - [idol.injury.rework] 안무를 다시 짜서 회사에 낸다
  - [idol.injury.carry] 숙소 계단을 업고 오르내린다
  - [idol.injury.cast] 깁스에 팀 이름을 다 써 준다

- [idol.edit] 잘린 영상이 돕니다. {name}{이/가} 뒤에서 딴짓하는 3초짜리입니다.
  - [idol.edit.quiet3] 아무 반응도 안 한다
  - [idol.edit.context] 전체 영상을 직접 올린다
  - [idol.edit.sorry] 그 장면 때문에 곤란해진 애한테 사과한다
  - [idol.edit.more3] 더 웃긴 걸 찍어서 올린다

- [idol.hiatus] 활동 중단 공지가 올라갔습니다. 이유는 안 적혀 있습니다.
  - [idol.hiatus.letter5] 팬카페에 긴 글을 쓴다
  - [idol.hiatus.ask3] 회사에 이유를 묻는다. 서면으로
  - [idol.hiatus.call2] 멤버들한테 한 명씩 전화한다
  - [idol.hiatus.vlog] 혼자 영상을 찍어 둔다

- [idol.renew] 재계약 서류가 {name} 책상에 올라와 있습니다. 7년 더입니다.
  - [idol.renew.sign] 읽기 전에 그 애한테 먼저 묻는다
  - [idol.renew.terms2] 조항을 하나씩 짚는다
  - [idol.renew.team] 멤버 전원이 같이 아니면 안 한다고 한다
  - [idol.renew.pen] 펜을 빌려 달라고 한다. 자기 걸로 안 쓰겠다고

- [idol.fansign] 팬사인회. 앞에 앉은 사람이 울기 시작합니다.
  - [idol.fansign.hold5] 손을 잡고 아무 말도 안 한다
  - [idol.fansign.mic2] 일어나서 그 사람 얘기를 마이크에 대고 한다
  - [idol.fansign.tissue2] 휴지를 건네고 다음 사람을 기다리게 한다
  - [idol.fansign.selfie] 같이 이상한 표정으로 사진을 찍는다

- [idol.award] 연말 시상식. 수상 소감 차례가 왔습니다.
  - [idol.award.onename] 이름 하나만 부르고 내려온다
  - [idol.award.long] 준비한 걸 끝까지 다 말한다
  - [idol.award.thankall] 이름을 스무 개쯤 부른다
  - [idol.award.song] 소감 대신 한 소절 부른다

- [idol.letter4] 팬레터 한 통이 유난히 오래 걸려 도착했습니다. 3년 전 날짜입니다.
  - [idol.letter4.read2] 혼자 다 읽고 다시 접어 둔다
  - [idol.letter4.reply] 답장을 써서 회사에 맡긴다
  - [idol.letter4.keep3] 지갑에 넣고 다닌다
  - [idol.letter4.read3] 라이브에서 소리 내서 읽는다

- [idol.leak2] 미공개 음원이 유출됐습니다. 아직 아무한테도 안 들려준 곡입니다.
  - [idol.leak2.nothing5] 아무 말도 안 한다. 팬들이 알아서 지운다
  - [idol.leak2.official] 회사에 정식으로 내자고 한다
  - [idol.leak2.sorryteam] 작곡가한테 먼저 사과한다
  - [idol.leak2.live2] 라이브에서 그 곡을 그냥 불러 버린다

- [idol.comeback] 컴백 쇼케이스. 첫 소절이 당신 파트입니다.
  - [idol.comeback.breathe] 숨을 고르고, 한 사람 쪽을 본다
  - [idol.comeback.louder] 처음부터 제일 크게 부른다
  - [idol.comeback.handoff] 첫 소절을 그 애한테 넘긴다
  - [idol.comeback.adlib] 없던 애드리브를 넣는다

- [idol.encore] 앵콜 무대. 마지막일 수도 있습니다. “{name}, 마이크 잡아.”
  - [idol.encore.nosing] 노래는 안 하고 팬들만 본다
  - [idol.encore.lead2] 제일 앞에 서서 시작한다
  - [idol.encore.sideby] 멤버들 손을 하나씩 잡는다
  - [idol.encore.throw] 마이크를 객석 쪽으로 넘긴다

### 포스터 (결과 카드)

- [idol.poster.lead_direct] 《{name}, 데뷔조》
  - [idol.poster.lead_direct.logline] {name}{은/는} 남들이 데뷔 3년 차에 할 말을 연습생 때 해버립니다. 회사가 제일 곤란해하는 멤버입니다.
- [idol.poster.lead_careful] 《{name}의 7년》
  - [idol.poster.lead_careful.logline] {name}{은/는} 한 번도 목소리를 높이지 않습니다. 그런데 이 팀은 {name} 속도에 맞춰 갑니다.
- [idol.poster.firstLove_direct] 《{name}, 새벽 두 시 연습실》
  - [idol.poster.firstLove_direct.logline] 불 꺼진 연습실에서 {name}{은/는} 결국 말합니다. 그 장면이 다큐로 나가서 팬들이 아직도 돌려 봅니다.
- [idol.poster.firstLove_careful] 《{name}, 3년 늦은 편지》
  - [idol.poster.firstLove_careful.logline] {name}{은/는} 끝내 답장을 안 썼습니다. 그 편지는 아직 {name} 지갑에 들어 있습니다.
- [idol.poster.spark_direct] 《{name}, 열애설》
  - [idol.poster.spark_direct.logline] {name}{은/는} 기사가 난 날 그냥 사실이라고 말합니다. 회사는 막지 못했고 팬들은 더 좋아합니다.
- [idol.poster.spark_careful] 《{name}{과/와} 그 애의 숙소》
  - [idol.poster.spark_careful.logline] {name}{과/와} 그 애는 3년을 2층 침대 위아래로 지냅니다. 아무 말도 안 했는데 팬들이 먼저 압니다.
- [idol.poster.second_direct] 《{name}, 앙코르 마이크》
  - [idol.poster.second_direct.logline] 1위 앙코르에서 {name}{은/는} 할 말을 다 합니다. 그날 밤 실시간 검색어가 {name} 이름으로 채워집니다.
- [idol.poster.second_careful] 《{name}, 계단을 업고 오르는 사람》
  - [idol.poster.second_careful.logline] {name}{은/는} 다친 멤버를 업고 숙소 계단을 오르내립니다. 말한 적은 없고, 마지막 회에 다 나옵니다.
- [idol.poster.rival_direct] 《{name}, 센터 자리》
  - [idol.poster.rival_direct.logline] {name}{은/는} 비어 있는 센터로 한 발 나갑니다. 맞는 선택이라 팀이 더 불편해집니다.
- [idol.poster.rival_careful] 《{name}, 조용한 1위》
  - [idol.poster.rival_careful.logline] {name}{은/는} 아무것도 요구하지 않습니다. 그런데 무대 중앙은 점점 {name} 쪽으로 옮겨 갑니다.
- [idol.poster.bestie_direct] 《{name}, 이 팀의 소란》
  - [idol.poster.bestie_direct.logline] {name}{이/가} 연습실에 들어오면 분위기가 뒤집힙니다. 자컨 조회수 절반이 {name} 분량입니다.
- [idol.poster.bestie_careful] 《{name}{이/가} 타 온 두 잔》
  - [idol.poster.bestie_careful.logline] {name}{은/는} 새벽에 따뜻한 걸 타 오고, 연습생 때 한 말을 기억하고, 생색은 안 냅니다.

