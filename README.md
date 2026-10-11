# 이정인 포트폴리오 웹사이트

빌드 과정이 없는 정적 사이트입니다(HTML · CSS · JavaScript). 외부 라이브러리 없이 동작합니다.

## 실행 방법
- **가장 간단한 방법:** `index.html`을 더블클릭해 브라우저로 엽니다.
- **로컬 서버로 열기(권장):** 이 폴더에서 아래 중 하나를 실행한 뒤 http://localhost:8000 에 접속합니다.
  - `python -m http.server 8000`
  - `npx serve -l 8000 .`

## 구조
```
index.html                 페이지 뼈대 (홈 + 프로젝트 상세 뷰, 블록 입체 효과용 SVG 필터)
assets/css/style.css       디자인 토큰 · 타이포그래피 체계 · 레이아웃 · 모션
assets/js/data.js          프로필 · 연락처 · 프로젝트 13개 (텍스트는 여기서 수정)
assets/js/app.js           대표 작업, 필터, 해시 라우팅, 라이트박스, 메뉴, About(툴 인벤토리)
assets/js/drop.js          메인 무대: 물리 블록(낙하 · 드래그로 던지기 · 충돌 · DROP AGAIN)
assets/img/                PDF에서 추출한 작업 이미지(webp) + about-portrait.jpg(프로필 원본 사진, 크기만 줄임)
assets/pdf/                웹용 경량 포트폴리오 PDF
assets/fonts/              Pretendard 400/600/800 · Galmuri11 (전체 글자 포함 버전)
assets/vendor/             Matter.js (물리 엔진, MIT)
```

## 메인 무대 (v6: 물리 블록)
- 분야 블록 5개 · 이름 블록 1개 · 작은 정사각형 작품 블록 3개(부산 락 페스티벌 · David Carson · Cyberpunk)가 위에서 떨어져 쌓입니다(Matter.js 0.20, MIT, `assets/vendor/`). 이미지 블록은 칸 크기의 약 1.05배(`IMG_SCALE`)로 카테고리·이름 블록보다 작게 두었고, 분야 블록 디자인은 그대로입니다.
- **낙하 후 자동 정렬 없음.** 화면 크기마다 블록 면적이 무대 면적의 약 43%(데스크톱 `FILL_TARGET`, 모바일 `FILL_MOBILE`)가 되도록 칸 크기를 정하고, 벽·바닥·천장을 무대 경계에 맞춥니다. 블록은 서로 겹치지 않는 위치(쌓일 높이를 어림해 낮은 곳)에서 큰 것부터 한 개씩 생성되어 중력과 충돌만으로 쌓이고, 멈춘 자리가 최종 위치입니다(스냅·기울기 제한·순간이동 없음).
- 마우스로 끌어 던지면 속도만큼 튕기고, 부딪히고, 회전합니다. 잡은 블록은 한 스텝에 움직일 수 있는 거리가 제한되어 다른 블록을 뚫지 않습니다. 오래 움직이면 서서히 감속해 멈춥니다.
- 터치: 탭하면 이동, 블록을 0.28초 길게 누르면 잡혀서 끌 수 있고 그 전에 움직이면 스크롤됩니다.
- 클릭(또는 7px 미만의 움직임)은 해당 분야/프로젝트로 이동, 드래그 후에는 이동하지 않습니다.
- DROP AGAIN은 실행 번호(gen)를 올려 이전 실행의 타이머·콜백·물리 객체·DOM을 모두 폐기하고 새로 시작합니다.
- 모션 감소 설정과 창 크기 변경 시에는 같은 물리 규칙으로 미리 쌓은 상태를 한 번만 그립니다.
- 읽기 전용 검증 함수 `window.__dropDebug()`가 상태(블록·물리 객체 수, 경계, 겹침, 안전장치 작동 횟수)를 돌려줍니다.
- 이전 버전: 상위 폴더의 `portfolio-website_v1_backup.zip` ~ `v5_backup.zip`.
## 타이포그래피 체계
`style.css` 맨 위 `:root`의 역할별 토큰(크기 `--fs-*` · 굵기 `--fw-*` · 행간 `--lh-*` · 자간 `--ls-*`)과, 파일 끝의 **Typography roles** 블록에서 관리합니다. 컴포넌트 규칙에는 글자 크기·굵기·행간·자간을 따로 쓰지 않습니다.
역할: `page`(Works · Contact · 모바일 메뉴) · `section` · `project`(프로젝트 제목) · `sub`(소제목) · `lead` · `body` · `ui`(탭·버튼·메뉴) · `meta`(캡션·라벨). 학력·프로필·자격·수상·Skills 설명은 모두 `body`입니다.
메인 블록 글자(`.blk*`, `.drop__list`)와 티커는 칸 크기(`--C`)에 비례하는 별도 기준입니다.
## About (캐릭터 화면)
- 구조: 캐릭터(프로필 카드 + 이름판) | 정보 탭(Profile · Education · **Skills** · Fields · Awards · Certificate) + 하나의 넓은 정보 패널. 따로 보이던 Inventory 영역은 Skills 탭 안으로 통합했습니다(스킬 아이콘 디자인 유지).
- 탭은 클릭·터치·키보드(←→ · Home · End)로 전환되고 ARIA tablist/tabpanel로 연결됩니다. Skills 안의 아이콘도 방향키로 이동하며, 선택한 툴은 탭을 오가도 기억됩니다.
- 패널은 밝은 중립 배경 + 어두운 본문(대비 약 18:1)이고 포인트 컬러는 선택 표시·아이콘·테두리에만 씁니다.
- 스킬 아이콘을 선택하면 `data.js`의 프로젝트별 `tool` 정보로 "이 툴로 작업했다고 기재된 프로젝트"를 보여줍니다. 기재가 없는 툴은 그렇게 표시합니다. 능력치·레벨·숙련도는 두지 않았습니다.
- 학력은 `data.js`의 `educationDetail`(서일대학교 / 커뮤니케이션디자인학과 / 졸업). 졸업 연도는 자료에서 확인되지 않아 적지 않았습니다.
- 사진: 원본(`D:/이정인 사진/202302965 이정인.jpg`)은 그대로 두고, 배경을 포함한 원본 비율(2331:3264) 그대로 크기만 줄인 웹용 사본 `assets/img/about-portrait.jpg`(1000×1400)를 프로필 카드 프레임에 담았습니다. 배경 제거본은 사용하지 않습니다.
## 수정 가이드
- **전화번호 공개:** `assets/js/data.js`의 `showPhone`을 `true`로 바꾸면 Contact에 표시됩니다.
- **문구·프로젝트 추가:** `data.js`의 `PROJECTS` 배열을 수정합니다. `gallery`의 `"p04"`는 `assets/img/p04-*.webp`를 뜻합니다.
- **메인에 떨어지는 대표 이미지:** `drop.js`의 `IMG_SLUGS`.
- **폰트:** 전체 글자가 들어 있는 버전입니다(Pretendard 3종 약 2.3MB, Galmuri11 약 0.7MB). 용량을 줄이려면 사용한 글자만 담은 서브셋으로 다시 만드세요.
- **공개 배포:** 폴더를 그대로 Netlify Drop, GitHub Pages, Vercel 같은 정적 호스팅에 올리면 됩니다. (아직 배포하지 않았습니다.)

## 라이선스
Pretendard, Galmuri는 SIL Open Font License 1.1을 따릅니다(`assets/fonts/`의 라이선스 파일 참고). Matter.js는 MIT 라이선스입니다(`assets/vendor/matter-js-LICENSE.txt`).
작업 이미지와 문구, 프로필 사진의 저작권은 이정인에게 있습니다.

## 프로젝트 이미지
- 썸네일: `assets/img/cover-<이름>-800/1400.webp`(부산 락 페스티벌 rock · David Carson carson · 이 땅의 숨 쉬는… leaflet · 투다리 tudari · 학과 축제 부스 booth). 대표 작업·Works Grid/List·메인 이미지 블록·호버 미리보기가 모두 같은 파일을 씁니다. 비율이 바뀌면 pp.js의 COVER에 크기를 적습니다.
- 상세 갤러리: `assets/img/g-<이름>-<번호>-960/1920.webp`. 크기는 data.js의 GALLERY에 적고, 프로젝트의 gallery 배열에 id를 순서대로 넣으면 상세 페이지와 확대 보기가 같은 순서로 나옵니다. 세로로 긴 이미지는 화면 높이의 92%를 넘지 않게 폭을 줄입니다.
- 원본(D:/이정인/작업물/포폴/ 등)은 그대로 두고, WebP로 줄인 사본만 assets에 둡니다. 모든 경로는 상대 경로입니다.

- 프로젝트는 16개(분야 6개: Branding 3 · Editorial 2 · Graphic 6 · Contents 3 · UI 1 · Video 1). 대표 작업 순서는 data.js 프로젝트의 eatured 숫자(1~4)로 정합니다.
- 대표 작업 썸네일은 프레임을 꽉 채우고(object-fit: cover), 작품별 object-position은 pp.js의 FEAT에서 정합니다.
- 세로로 긴 상세 이미지(g-*-long 등)는 상세 페이지에서 전체가 끝까지 보이고, 확대 보기에서는 안에서 스크롤됩니다(휴대폰은 가로·세로로 밀어서 봄). 1920px 원본 폭을 유지해 작은 글자를 읽을 수 있습니다.

- **작품 숨기기:** data.js에서 프로젝트에 hidden: true를 두면 자료는 보존한 채 사이트(Works·대표 작업·이전/다음·메인 블록·작업 수)에서 빠집니다(window.HIDDEN_PROJECTS). 현재 숨김: 칼렛스토어·학과 대표 자켓·콘텐츠 3개·UI 1개. Contents·UI 분야는 비어 있는 채로 유지되며 Works에 안내 문구만 나옵니다. 숨긴 작품 주소로 들어오면 Works로 이동합니다.
- **Works 썸네일 전체 보기:** 프로젝트에 	humbBg(배경색)를 두면 Works 카드에서 contain으로 전체를 보여 줍니다(비비안·사이버펑크·VANS). 대표 작업은 cover 그대로입니다.
- **영상:** 프로젝트의 ideo(src·poster·w·h)가 있으면 상세 이미지 아래, 이전/다음 위에 플레이어가 나옵니다. 자동 재생 없음, preload="none", 원본 비율. 웹용 사본 ssets/video/vans-bape.mp4(1080p H.264/AAC, 약 5MB, 원본 4K 42MB는 보존).

- 메인 이미지 블록 5개(부산 락 페스티벌 · David Carson · PANORAMA · 투다리 · VANS × BAPE)는 drop.js의 IMG_SLUGS에서 정합니다. 블록이 늘어난 만큼 칸 크기를 자동으로 줄여 메인 영역 안에 맞춥니다.

- Works 그리드에서 	humbFull: true인 작품(비비안·파노라마·사이버펑크)은 프레임이 썸네일 원본 비율을 따릅니다(가로는 카드 폭, 높이 자동 — 잘림·여백 없음). 메인 정사각형 블록과 대표 작업에는 영향이 없습니다.
- About 프로필 카드는 이름·영문 이름·생년월일만 표시합니다(졸업 정보는 Education 탭에만).
