/* 포트폴리오 콘텐츠 데이터 — 모든 문구는 「이정인 포트폴리오.pdf」(2025)에서 옮겨 왔습니다. */
window.SITE = {
  name: "이정인",
  nameEn: "LEE JEONG IN",
  slogan: "Endless Ideas, Constant Growth",
  email: "li020810@naver.com",
  instagram: "l0w.p0ly",
  /* 전화번호는 공개 여부를 확인한 뒤 노출하세요. showPhone을 true로 바꾸면 Contact에 표시됩니다. */
  phone: "+82 10 8642 1493",
  showPhone: false,
  pdf: "assets/pdf/LeeJeongIn_Portfolio_2025.pdf",
  /* 학교는 졸업. 졸업 연도는 자료에서 확인되지 않아 적지 않았습니다. */
  education: "서일대학교 커뮤니케이션디자인학과 졸업",
  educationDetail: { school: "서일대학교", major: "커뮤니케이션디자인학과", status: "졸업" },
  intro: [
    "저는 멈추지 않는 디자이너입니다.",
    "낯선 길을 선택하는 데 주저하지 않고, 넘어져도 다시 일어서며 배움과 도전을 통해 어제보다 나은 디자이너가 되기 위해 노력합니다.",
    "그래서 디자인을 단순한 결과물로 보지 않습니다. 완성된 한 점보다, 그 과정에서 쌓이는 경험과 변화에 더 집중합니다. 매 순간 새롭게 배우고, 그 안에서 얻은 인사이트를 작업에 녹여냅니다.",
    "앞으로도 저는 무한히 배우며 한계를 넓혀가고, 사람들의 마음에 오래 남을 디자인을 만들어갈 것입니다."
  ],
  tools: ["Adobe Photoshop", "Adobe Illustrator", "Adobe InDesign", "Adobe After Effects", "Adobe Premiere Pro", "Figma", "Midjourney"],
  awards: [
    ["2024", "한국일러스트레이션학회 제39회 디자인 국제공모전 특별상"],
    ["2022", "제2회 서울런 학습 수기·이미지 공모전 장려상"]
  ],
  certificates: [
    ["2020", "운전면허 2종 보통"],
    ["2018", "ITQ 한글 A"]
  ]
};

window.CATEGORIES = [
  { id: "all", label: "All", ko: "전체" },
  { id: "branding", label: "Branding", ko: "브랜딩" },
  { id: "editorial", label: "Editorial", ko: "에디토리얼" },
  { id: "graphic", label: "Graphic", ko: "그래픽" },
  { id: "contents", label: "Contents", ko: "콘텐츠" },
  { id: "ui", label: "UI", ko: "UI" },
  { id: "video", label: "Video", ko: "영상" }
];

/* 새로 넣은 갤러리 이미지: assets/img/<id>-1920.webp · <id>-960.webp (w·h = 원본 비율 기준 크기) */
window.GALLERY = {
  "g-tudari-1": { w: 8001, h: 4501 },
  "g-tudari-2": { w: 8001, h: 4501 },
  "g-tudari-3": { w: 8001, h: 4501 },
  "g-booth-1": { w: 8001, h: 4501 },
  "g-booth-2": { w: 8001, h: 4501 },
  "g-booth-3": { w: 8000, h: 4501 },
  "g-rock-long": { w: 1920, h: 14685, ext: "webp", mid: true },
  "g-vans-1": { w: 1920, h: 6480, ext: "webp", mid: true },
  "g-panorama-1": { w: 1920, h: 9980, ext: "webp", mid: true },
  "g-vivienne-1": { w: 1920, h: 12208, ext: "webp", mid: true },
  "g-cyberpunk-1": { w: 1920, h: 16496, ext: "jpg", mid: true },
  "g-leaflet-1": { w: 8001, h: 4501 },
  "g-leaflet-2": { w: 8000, h: 4501 },
  "g-carson-1": { w: 8001, h: 4501 },
  "g-carson-3": { w: 8001, h: 4501 },
  "g-leaflet-3": { w: 5303, h: 3663 },
  "g-carson-2": { w: 8000, h: 4501 },
};

/* gallery 항목: "p04" = PDF 4쪽 전체, ["p05a","p05b"] = 한 쪽을 좌우로 나눈 두 이미지 */
window.PROJECTS = [
  {
    slug: "busan-rock-festival", cat: "branding", catLabel: "Branding Design",
    title: "부산 국제 락 페스티벌", en: "Busan International Rock Festival", kind: "Rebranding",
    date: "2025.5 – 2025.6", year: "2025", tool: "Adobe Photoshop, Adobe Illustrator",
    desc: "락 음악의 폭발적인 에너지와 자유로운 정신을 시각적으로 재해석했습니다. 핫핑크와 블랙의 강렬한 대비는 젊음과 역동성을 상징하며, 락 페스티벌 특유의 열정과 자유로움을 담아내고자 하였습니다.",
    color: "#e9569a", ink: "#111111", cover: "rock", featured: 1,
    gallery: ["g-rock-long"]
  },
  {
    slug: "tudari", cat: "branding", catLabel: "Branding Design",
    title: "투다리", en: "Tudari", kind: "Rebranding",
    date: "2024.5 – 2024.8", year: "2024", tool: "Adobe Illustrator",
    desc: "귀여운 맥주 캐릭터로 브랜드 아이덴티티를 강화하고, 빈티지한 색감과 서체로 레트로 무드를 더했습니다. 단순한 시각 요소를 넘어, 따뜻하고 즐거운 주점의 분위기를 현대적으로 재해석한 리브랜딩입니다.",
    color: "#c64639", ink: "#ffffff", cover: "tudari",
    gallery: ["g-tudari-1", "g-tudari-2", "g-tudari-3"]
  },
  {
    slug: "festival-booth", cat: "branding", catLabel: "Branding Design",
    title: "학과 축제 부스", en: "Department Festival Booth", kind: "Branding",
    date: "2024.9", year: "2024", tool: "Adobe Photoshop, Adobe Illustrator",
    desc: "학과 축제 부스의 기획 및 디자인을 담당하였습니다. 학교 대표 캐릭터를 활용하여 친근하고 사랑스러운 분위기를 조성하였으며, 음료 부스라는 특성을 반영해 시각적으로 청량하고 시원한 이미지를 강조하였습니다.",
    color: "#18b9d5", ink: "#111111", cover: "booth",
    gallery: ["g-booth-1", "g-booth-2", "g-booth-3"]
  },
  {
    slug: "david-carson", cat: "editorial", catLabel: "Editorial Design",
    title: "David Carson", en: "David Carson", kind: "Brochure",
    date: "2024.10 – 2024.11", year: "2024", tool: "Adobe Photoshop, Adobe InDesign",
    desc: "현대 그래픽 디자인의 아이콘으로 알려진 데이비드 카슨을 조명하는 잡지를 제작하였습니다. 카슨의 독창적인 작업 스타일을 반영하여 자유롭고 대담한 구성, 그리고 실험적인 타이포그래피로 카슨의 미학을 재현하였습니다.",
    color: "#d6ed61", ink: "#111111", cover: "carson", featured: 3,
    gallery: ["g-carson-1", "g-carson-2", "g-carson-3"]
  },
  {
    slug: "for-all-that-breathes", cat: "editorial", catLabel: "Editorial Design",
    title: "이 땅에 숨 쉬는 모든 것을 위하여", en: "For All That Breathes on Earth", kind: "Exhibition Leaflet",
    date: "2024.5 – 2024.6", year: "2024", tool: "Adobe Photoshop, Adobe InDesign",
    desc: "정영선 「이 땅의 숨 쉬는 모든 것들을 위하여」 전시 리플렛을 리디자인하였습니다. 전시가 지닌 주제와 분위기를 시각적으로 반영하기 위해 자연의 이미지를 중심으로 구성하였습니다.",
    color: "#d6d6ca", ink: "#111111", cover: "leaflet",
    gallery: ["g-leaflet-1", "g-leaflet-2", "g-leaflet-3"]
  },
  {
    slug: "pepsi-robeats", cat: "graphic", catLabel: "Graphic Design",
    title: "Pepsi x Robeat", en: "Pepsi x Robeat", kind: "Poster",
    date: "2025.4", year: "2025", tool: "Adobe Photoshop, ImageFX",
    desc: "PEPSI와 3D 리듬 게임 ROBEATS!의 협업 포스터를 리디자인하였습니다. PEPSI와 ROBEATS!의 공통된 이미지인 젊음 · 트렌디함 · 역동성을 시각적으로 표현하였습니다.",
    color: "#2c00d1", ink: "#ffffff", cover: "pepsi",
    gallery: ["p22", "p23"]
  },
  {
    hidden: true, slug: "caret-store", cat: "graphic", catLabel: "Graphic Design",
    title: "Caret Store", en: "Caret Store", kind: "Poster",
    date: "2023.10", year: "2023", tool: "Adobe Photoshop",
    desc: "스마트 패키징 솔루션 플랫폼 칼렛스토어의 글로벌 사이트 홍보 포스터를 제작하였습니다. 플랫폼의 친환경적 특성을 강조하기 위해 자연적 이미지와 분위기를 반영하여 지속가능한 브랜드 아이덴티티를 전달하도록 디자인하였습니다.",
    color: "#89a771", ink: "#111111", cover: "caret",
    gallery: ["p24"]
  },
  {
    hidden: true, slug: "department-jacket", cat: "graphic", catLabel: "Graphic Design",
    title: "학과 대표 자켓 디자인", en: "Department Jacket", kind: "Apparel",
    date: "2024.4 – 2024.5", year: "2024", tool: "Adobe Photoshop",
    desc: "학과를 상징하는 대표 자켓을 디자인하고, 기획 단계부터 제작 발주까지 전 과정을 총괄했습니다. 디자인 실무뿐 아니라 생산 프로세스 관리까지 경험하며, 디자인이 실제 결과물로 구현되는 전 과정을 체계적으로 수행한 작업입니다.",
    color: "#000000", ink: "#ffffff", cover: "jacket",
    gallery: ["p25"]
  },
  {
    slug: "panorama", cat: "graphic", catLabel: "Graphic Design",
    title: "PANORAMA", kind: "Experimental Poster",
    date: "2025.9 – 2025.11", year: "2025", tool: "Adobe Photoshop",
    desc: "삶의 마지막 순간에 스쳐 지나가는 기억을 주제로 실험적 그래픽 포스터를 제작하였습니다. 모래시계와 서로 다른 시간의 조각들을 겹쳐 기억의 파노라마를 표현하고, 밝은 색채와 파티 테이블을 활용하여 죽음을 삶의 끝이 아닌 또 하나의 축제이자 완성으로 재해석하였습니다.",
    color: "#8fc25a", ink: "#111111", cover: "panorama", thumbFull: true,
    gallery: ["g-panorama-1"]
  },
  {
    slug: "vivienne-westwood", cat: "graphic", catLabel: "Graphic Design",
    title: "VIVIENNE WESTWOOD", kind: "Poster",
    date: "2025.9 – 2025.11", year: "2025", tool: "Adobe Photoshop, Midjourney",
    desc: "비비안 웨스트우드의 브랜드 정체성을 재해석한 그래픽 포스터를 제작하였습니다. 브랜드의 반항적이고 대담한 특성을 강조하기 위해 콜라주와 강렬한 색채를 활용하여 독창적인 패션 철학을 전달하도록 디자인하였습니다.",
    color: "#c8281e", ink: "#ffffff", cover: "vivienne", thumbFull: true, featured: 2,
    gallery: ["g-vivienne-1"]
  },
  {
    slug: "cyberpunk", cat: "graphic", catLabel: "Graphic Design",
    title: "CYBERPUNK", kind: "Information Design",
    date: "2025.9 – 2025.11", year: "2025", tool: "Figma, Adobe Photoshop, Midjourney, Adobe InDesign",
    desc: "사이버펑크의 역사와 시각적 특징을 소개하는 정보 디자인 포스터를 제작하였습니다. 시대별 흐름과 주요 작품을 정리하고, 네온 핑크와 옐로 컬러, 미래적인 이미지와 그래픽을 활용하여 사이버펑크의 세계관을 전달하도록 디자인하였습니다.",
    color: "#162336", ink: "#ffffff", accent: "#f2e52a", cover: "cyberpunk", thumbFull: true,
    gallery: ["g-cyberpunk-1"]
  },
  {
    hidden: true, slug: "department-sns", cat: "contents", catLabel: "Contents Design",
    title: "학과 SNS 콘텐츠 디자인", en: "Department SNS Contents", kind: "Instagram",
    date: "2024.3 – 2024.12", year: "2024", tool: "Adobe Photoshop, Adobe Illustrator",
    desc: "학과 공식 인스타그램 계정의 개설부터 운영, 콘텐츠 기획 및 디자인을 총괄하였습니다. 일관된 시각 콘셉트를 통해 브랜드 아이덴티티를 확립하고, 효과적인 소셜 미디어 운영으로 학과의 대외 커뮤니케이션을 강화하였습니다.",
    color: "#fe0058", ink: "#111111", cover: "sns",
    gallery: ["p26"]
  },
  {
    hidden: true, slug: "mondodelvino", cat: "contents", catLabel: "Contents Design",
    title: "Mondodelvino", en: "Mondodelvino", kind: "Cardnews",
    date: "2023.12", year: "2023", tool: "Adobe Photoshop",
    desc: "이탈리아 최대 와인 그룹 몬도델비노의 와인을 주제로 한 카드뉴스를 제작하였습니다. 브랜드가 지닌 깊이 있는 역사와 품격을 전달하기 위해 고풍스럽고 클래식한 무드로 설정하였으며, 와인의 정통성과 고급스러움을 시각적으로 표현했습니다.",
    color: "#a19064", ink: "#111111", cover: "mondo",
    gallery: ["p27"]
  },
  {
    hidden: true, slug: "himalaya-wellness", cat: "contents", catLabel: "Contents Design",
    title: "Himalaya Wellness", en: "Himalaya Wellness", kind: "Cardnews",
    date: "2023.11", year: "2023", tool: "Adobe Photoshop",
    desc: "히말라야 웰니스의 숙취해소제 파티스마트츄를 소개하는 카드뉴스를 제작하였습니다. 브랜드의 기능성과 이미지를 고려해 간결하면서도 세련된 비주얼로 표현했습니다.",
    color: "#a2b45e", ink: "#111111", cover: "himalaya",
    gallery: ["p28"]
  },
  {
    hidden: true, slug: "spot-tv", cat: "ui", catLabel: "UI Design",
    title: "SPOT TV", en: "SPOT TV", kind: "UI Design",
    date: "2025.6", year: "2025", tool: "Figma",
    desc: "가상의 스마트 TV 브랜드 Spot TV의 UI를 디자인하였습니다. 영화와 드라마 속 장면을 AI·AR 기술로 분석해 의류, 소품, 가구 정보를 실시간으로 제공하는 서비스를 기반으로, 클레이모피즘과 글래스모피즘을 적용해 현대적인 비주얼을 구현했습니다.",
    color: "#3e00a1", ink: "#ffffff", cover: "spot",
    gallery: ["p29", "p30"]
  },
  {
    slug: "vans-bape", cat: "video", catLabel: "Video Design",
    title: "VANS × BAPE", kind: "Promo Video",
    date: "2025.9 – 2025.11", year: "2025", tool: "Adobe After Effects",
    desc: "VANS × BAPE의 협업 콘셉트를 바탕으로 홍보 영상을 제작하였습니다. 두 브랜드의 스트리트 감성을 강조하기 위해 과감한 타이포그래피와 역동적인 모션을 활용하여 자유롭고 개성 있는 브랜드 이미지를 전달하도록 디자인하였습니다.",
    color: "#141414", ink: "#ffffff", cover: "vans", thumbFull: true, featured: 4,
    video: { src: "assets/video/vans-bape.mp4", poster: "assets/video/vans-bape-poster.webp", w: 3840, h: 2160, title: "VANS × BAPE 홍보 영상" },
    gallery: ["g-vans-1"]
  }
];

/* hidden: true 인 작품은 자료만 보존하고 사이트(Works·추천·이전/다음·메인 블록)에는 표시하지 않습니다. 다시 보이려면 hidden을 지우세요. */
window.HIDDEN_PROJECTS = window.PROJECTS.filter(function (p) { return p.hidden; });
window.PROJECTS = window.PROJECTS.filter(function (p) { return !p.hidden; });

