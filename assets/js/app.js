/* LEE JEONG IN — Portfolio app (no build, no dependencies) */
(function () {
  "use strict";

  var S = window.SITE, P = window.PROJECTS, C = window.CATEGORIES;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mqFine = window.matchMedia("(hover: hover) and (pointer: fine)");
  var motionOK = !mqReduce.matches;
  if (motionOK) document.documentElement.classList.add("motion");

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- 이미지 ---------- */
  var COVER = { rock: [1038, 780], tudari: [1536, 1024], booth: [1529, 1029], carson: [5184, 3456], leaflet: [1400, 788], pepsi: [1528, 1029], caret: [1867, 986], jacket: [1656, 1270], sns: [1147, 1270], mondo: [1387, 1296], himalaya: [1476, 1296], spot: [2400, 1350], vans: [1038, 780], panorama: [1038, 780], vivienne: [1038, 780], cyberpunk: [1038, 780] };
  function shotSrc(id) {
    // "g-…" → 새로 넣은 이미지(원본 비율), "p04" → 1920×1080 페이지, "p05a" → 1200×1350 반쪽
    var G = window.GALLERY && window.GALLERY[id];
    if (G) {
      var gb = "assets/img/" + id, ext = G.ext || "webp", gw = Math.min(1920, G.w);
      var set = gb + "-960.webp 960w" + (G.mid ? ", " + gb + "-1280.webp 1280w" : "") + ", " + gb + "-1920." + ext + " " + gw + "w";
      return { src: gb + "-1920." + ext, srcset: set, w: G.w, h: G.h, big: gb + "-1920." + ext };
    }
    var half = /[ab]$/.test(id), base = "assets/img/" + id;
    return half
      ? { src: base + "-1200.webp", srcset: base + "-720.webp 720w, " + base + "-1200.webp 1200w", w: 1200, h: 1350, big: base + "-1200.webp" }
      : { src: base + "-1920.webp", srcset: base + "-1080.webp 1080w, " + base + "-1920.webp 1920w", w: 1920, h: 1080, big: base + "-1920.webp" };
  }
  function imgHTML(o, sizes, alt, eager) {
    return '<img src="' + o.src + '" srcset="' + o.srcset + '" sizes="' + sizes + '" width="' + o.w + '" height="' + o.h + '" alt="' + esc(alt) + '"' + (eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async">';
  }
  function coverObj(k) {
    var d = COVER[k], b = "assets/img/cover-" + k;
    return { src: b + "-800.webp", srcset: b + "-800.webp 800w, " + b + "-1400.webp " + Math.min(1400, d[0]) + "w", w: d[0], h: d[1] };
  }
  function bySlug(s) { for (var i = 0; i < P.length; i++) if (P[i].slug === s) return i; return -1; }
  function colorVars(p) { return "--pc:" + p.color + ";--pi:" + p.ink + ";"; }

  /* ---------- 픽셀 글자 (5×7) ---------- */
  var GLYPH = {
    L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
    O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    N: ["10001", "11001", "11001", "10101", "10011", "10011", "10001"],
    G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
    I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"]
  };
  function glyphSVG(ch) {
    var g = GLYPH[ch], r = "";
    g.forEach(function (row, y) { for (var x = 0; x < 5; x++) if (row[x] === "1") r += '<rect x="' + x + '" y="' + y + '" width="1.02" height="1.02"/>'; });
    return '<svg viewBox="0 0 5 7" aria-hidden="true" focusable="false">' + r + "</svg>";
  }

  /* ---------- Ticker ---------- */
  function buildTicker() {
    var words = C.slice(1).map(function (c) { return c.label + (c.id === "ui" || c.id === "video" ? " Design" : ""); });
    var chunk = words.map(function (w) { return "<span>" + w.toUpperCase() + "</span><b>+</b>"; }).join("") + "<span>ENDLESS IDEAS, CONSTANT GROWTH</span><b>+</b>";
    $(".ticker__track").innerHTML = chunk + chunk + chunk + chunk;
  }

  /* ---------- Selected ---------- */
  /* 대표 작업: 모든 작업이 부산 락 페스티벌 프레임(오프셋 테두리 · 16:9 · 흰 여백)을 공유.
     이미지 한 장만 쓰고, 원본 비율이 달라도 잘리지 않도록 프레임 안에서 contain, 남는 면은 프로젝트 색 */
  var FEAT = {  // pos = object-position: 프레임을 꽉 채우며 잘릴 때 핵심(로고·인물·제목)이 남는 위치
    "busan-rock-festival": { cover: "rock", pos: "50% 38%" },
    "vivienne-westwood": { cover: "vivienne", pos: "50% 92%" },
    "david-carson": { cover: "carson", pos: "50% 45%" },
    "vans-bape": { cover: "vans", pos: "50% 100%" }
  };  function buildSelected() {
    var feats = P.filter(function (p) { return p.featured; }).sort(function (x, y) { return x.featured - y.featured; });   // featured 숫자 = 대표 작업 순서
    $(".selected__list").innerHTML = feats.map(function (p, n) {
      var href = "#/work/" + p.slug, f = FEAT[p.slug] || { cover: p.cover };
      var o = f.img ? shotSrc(f.img) : coverObj(f.cover);
      return '<article class="feat" data-slug="' + p.slug + '" aria-labelledby="ft-' + n + '" style="' + colorVars(p) + '">' +
        '<div class="feat__text" data-reveal>' +
          '<p class="feat__no">' + pad(n + 1) + " / " + pad(feats.length) + "</p>" +
          '<h3 class="feat__title" id="ft-' + n + '"><a href="' + href + '">' + esc(p.title) + "</a></h3>" +
          '<ul class="feat__meta"><li>' + esc(p.catLabel) + "</li><li>" + esc(p.date) + "</li></ul>" +
          '<p class="feat__desc">' + esc(p.desc) + "</p>" +
          '<a class="btn" href="' + href + '">프로젝트 보기 <span aria-hidden="true">→</span></a>' +
        "</div>" +
        '<figure class="feat__media" data-reveal>' +
          '<a class="feat__frame" href="' + href + '" tabindex="-1" aria-hidden="true">' +
            '<span class="feat__pic">' + imgHTML(o, "(max-width: 860px) 92vw, 54vw", "").replace("<img ", '<img style="object-position:' + (f.pos || "50% 50%") + '" ') + "</span>" +
          "</a>" +
          '<figcaption class="feat__cap px"><span>' + esc(p.kind) + "</span><span>" + esc(p.year) + "</span></figcaption>" +
        "</figure></article>";
    }).join("");

    // 스크롤 위치에 따라 섹션 배경이 프로젝트 키 컬러로 바뀜
    var sec = $(".selected");
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (!e.isIntersecting) return;
        var p = P[bySlug(e.target.getAttribute("data-slug"))];
        sec.style.setProperty("--bg", p.color);
        sec.style.setProperty("--fg", p.ink);
      });
    }, { rootMargin: "-48% 0px -48% 0px" });
    $$(".feat").forEach(function (f) { io.observe(f); });
    var io2 = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (e.isIntersecting) { sec.style.removeProperty("--bg"); sec.style.removeProperty("--fg"); }
      });
    }, { rootMargin: "-48% 0px -48% 0px" });
    io2.observe($(".sec-head--selected"));
  }

  /* ---------- Works index ---------- */
  var state = { cat: "all", mode: store("jl-mode") === "list" ? "list" : "grid" };
  var SPANS = [[7, "16 / 10"], [5, "8 / 7"], [5, "8 / 7"], [7, "16 / 10"], [4, "4 / 5"], [4, "4 / 5"], [4, "4 / 5"], [6, "3 / 2"], [6, "3 / 2"]];

  /* 메인 블록과 같은 분야 색 (각 분야 대표 프로젝트의 PDF 키 컬러) */
  var CAT_COLOR = { branding: ["#e9569a", "#111111"], editorial: ["#d6ed61", "#111111"], graphic: ["#2c00d1", "#ffffff"], contents: ["#fe0058", "#111111"], ui: ["#162336", "#f2e52a"], video: ["#ff7a1a", "#111111"] };
  function buildFilters() {
    $("[data-total]").textContent = "(" + P.length + ")";
    $$("[data-works-count]").forEach(function (e) { e.textContent = P.length; });
    $(".filters").innerHTML = C.map(function (c) {
      var n = c.id === "all" ? P.length : P.filter(function (p) { return p.cat === c.id; }).length;
      var col = CAT_COLOR[c.id], st = col ? ' style="--c:' + col[0] + ";--t:" + col[1] + '"' : "";
      return '<button type="button" data-cat="' + c.id + '" aria-pressed="' + (c.id === state.cat) + '"' + st + ">" + c.label + "<sup>" + n + "</sup></button>";
    }).join("");
    $(".filters").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var cat = b.getAttribute("data-cat");
      // 선택한 분야를 URL에 기록 → 새로고침·뒤로 가기에서도 유지
      skipScroll = true;
      var h = cat === "all" ? "#/works" : "#/works/" + cat;
      if (location.hash !== h) location.hash = h; else { skipScroll = false; setCat(cat); }
    });
    $$(".viewtoggle button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-view") === state.mode);
      b.addEventListener("click", function () {
        state.mode = b.getAttribute("data-view"); store("jl-mode", state.mode);
        $$(".viewtoggle button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        renderWorks(true);
      });
    });
  }

  function renderWorks(animate) {
    var list = P.filter(function (p) { return state.cat === "all" || p.cat === state.cat; });
    var ul = $(".works__grid");
    ul.setAttribute("data-mode", state.mode);
    ul.innerHTML = !list.length ? '<li class="works__empty" data-empty><p class="px">EMPTY</p><p>이 분야에는 아직 공개된 작업이 없습니다.</p></li>' : list.map(function (p, i) {
      var sp = SPANS[i % SPANS.length], no = pad(bySlug(p.slug) + 1);
      return '<li class="w' + (i % 3 ? " is-half" : "") + (animate && motionOK ? " is-in" : "") + '" style="' + colorVars(p) + "--span:" + sp[0] + ";--ar-d:" + sp[1] + ";--i:" + i + '" data-slug="' + p.slug + '">' +
        '<a href="#/work/' + p.slug + '">' +
          '<div class="w__fig' + (p.thumbFull ? " w__fig--full" : "") + '"' + ">" + imgHTML(coverObj(p.cover), "(max-width: 600px) 92vw, (max-width: 1024px) 46vw, " + Math.round(sp[0] / 12 * 92) + "vw", p.title + " 대표 이미지").replace("<img ", '<img style="object-position:' + (p.thumbPos || "50% 50%") + '" ') + "</div>" +
          '<div class="w__info">' +
            '<span class="w__no">' + no + "</span>" +
            '<h3 class="w__title">' + esc(p.title) + "</h3>" +
            '<span class="w__year">' + p.year + "</span>" +
            '<span class="w__cat"><i class="w__dot" aria-hidden="true"></i>' + esc(p.catLabel) + "</span>" +
            '<span class="w__arrow" aria-hidden="true">→</span>' +
          "</div></a></li>";
    }).join("");
  }

  function setCat(cat, quiet) {
    if (!C.some(function (c) { return c.id === cat; })) cat = "all";
    var changed = cat !== state.cat;
    state.cat = cat;
    $$(".filters button").forEach(function (x) { x.setAttribute("aria-pressed", x.getAttribute("data-cat") === cat); });
    if (changed) renderWorks(true);
    if (!quiet) {
      var c = C.filter(function (x) { return x.id === cat; })[0];
      $("[data-live]").textContent = c.ko + " 작업 " + $$(".works__grid .w").length + "개";
    }
  }

  function peekInit() {
    if (!mqFine.matches || !motionOK) return;
    var peek = $(".peek"), img = $("img", peek), ul = $(".works__grid"), cur = null;
    ul.addEventListener("pointermove", function (e) {
      if (state.mode !== "list") return;
      var li = e.target.closest(".w");
      if (!li) { peek.classList.remove("is-on"); cur = null; return; }
      var slug = li.getAttribute("data-slug");
      if (slug !== cur) { cur = slug; img.src = coverObj(P[bySlug(slug)].cover).src; }
      peek.classList.add("is-on");
      peek.style.transform = "translate(" + (e.clientX + 24) + "px," + (e.clientY - 120) + "px)";
    });
    ul.addEventListener("pointerleave", function () { peek.classList.remove("is-on"); cur = null; });
  }

  /* ---------- About / Contact ---------- */
  /* 툴 아이템: 3×5 픽셀 글자로 만든 13×13 픽셀 아이콘 (두 글자 약어) */
  var PX35 = {
    P: ["111", "101", "111", "100", "100"], S: ["111", "100", "111", "001", "111"], A: ["010", "101", "111", "101", "101"],
    I: ["111", "010", "010", "010", "111"], D: ["110", "101", "101", "101", "110"], E: ["111", "100", "111", "100", "111"],
    R: ["110", "101", "110", "101", "101"], F: ["111", "100", "110", "100", "100"], G: ["111", "100", "101", "101", "111"],
    M: ["101", "111", "111", "101", "101"], J: ["001", "001", "001", "101", "111"]
  };
  var TOOL_ICON = {
    "Adobe Photoshop": ["PS", "#31a8ff", "#111111"], "Adobe Illustrator": ["AI", "#ff9a00", "#111111"], "Adobe InDesign": ["ID", "#ff3d78", "#111111"],
    "Adobe After Effects": ["AE", "#9d7bff", "#111111"], "Adobe Premiere Pro": ["PR", "#c58bff", "#111111"], "Figma": ["FG", "#ff7262", "#111111"], "Midjourney": ["MJ", "#111111", "#ffffff"]
  };
  function toolIcon(name) {
    var d = TOOL_ICON[name] || [name.slice(0, 2).toUpperCase(), "#e7e6e0", "#111111"], r = "";
    r += '<rect width="13" height="13" fill="#111"/><rect x="1" y="1" width="11" height="11" fill="' + d[1] + '"/>';
    r += '<rect x="1" y="1" width="11" height="1" fill="#fff" opacity=".35"/><rect x="1" y="1" width="1" height="11" fill="#fff" opacity=".35"/>';
    r += '<rect x="1" y="11" width="11" height="1" fill="#000" opacity=".22"/><rect x="11" y="1" width="1" height="11" fill="#000" opacity=".22"/>';
    [d[0].charAt(0), d[0].charAt(1)].forEach(function (ch, i) {
      var g = PX35[ch]; if (!g) return;
      g.forEach(function (row, y) { for (var x = 0; x < 3; x++) if (row[x] === "1") r += '<rect x="' + (3 + i * 4 + x) + '" y="' + (4 + y) + '" width="1" height="1" fill="' + d[2] + '"/>'; });
    });
    return '<svg viewBox="0 0 13 13" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' + r + "</svg>";
  }
  function worksUsing(tool) { return P.filter(function (p) { return p.tool.split(/\s*,\s*/).indexOf(tool) >= 0; }); }
  /* Skills 탭: 기존 스킬 아이콘 + 설명을 공통 정보 패널 안에 그림. 선택한 툴은 탭을 오가도 기억 */
  var curTool = 0;
  function toolInfoHTML(i) {
    var t = S.tools[i], used = worksUsing(t);
    return '<div class="item__head"><span class="item__ico">' + toolIcon(t) + '</span><div><b>' + esc(t) + '</b><span class="px">ITEM ' + pad(i + 1) + " / " + pad(S.tools.length) + "</span></div></div>" +
      (used.length
        ? '<p class="item__desc">포트폴리오에 이 툴로 작업했다고 기재된 프로젝트 ' + used.length + "개</p>" +
          '<ul class="item__works">' + used.map(function (p) { return '<li><a href="#/work/' + p.slug + '"><i style="background:' + p.color + '" aria-hidden="true"></i>' + esc(p.title) + "</a></li>"; }).join("") + "</ul>"
        : '<p class="item__desc">포트폴리오 자료에는 이 툴을 사용한 프로젝트가 따로 기재되어 있지 않습니다.</p>');
  }
  function skillsHTML() {
    return '<p class="panel__note">아이콘을 선택하면 툴 이름과, 포트폴리오에 그 툴로 작업했다고 기재된 프로젝트가 표시됩니다.</p>' +
      '<div class="inv" role="group" aria-label="스킬 아이콘">' + S.tools.map(function (t, i) {
        return '<button type="button" class="slot" aria-pressed="' + (i === curTool) + '" tabindex="' + (i === curTool ? 0 : -1) + '" aria-label="' + esc(t) + '"><span class="slot__ico">' + toolIcon(t) + '</span><span class="slot__name px">' + esc(t.replace("Adobe ", "")) + "</span></button>";
      }).join("") + "</div>" +
      '<div class="item" data-tool-info aria-live="polite">' + toolInfoHTML(curTool) + "</div>";
  }
  function skillsInit(panel) {
    var wrap = $(".inv", panel), info = $("[data-tool-info]", panel), btns = $$(".slot", wrap);
    function pick(i, focus) {
      curTool = (i + btns.length) % btns.length;
      btns.forEach(function (b, k) { b.setAttribute("aria-pressed", k === curTool); b.tabIndex = k === curTool ? 0 : -1; });
      if (focus) btns[curTool].focus();
      info.innerHTML = toolInfoHTML(curTool);
    }
    wrap.addEventListener("click", function (e) { var b = e.target.closest(".slot"); if (b) pick(btns.indexOf(b), false); });
    wrap.addEventListener("keydown", function (e) {
      var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (e.key === "Home") { e.preventDefault(); pick(0, true); }
      else if (e.key === "End") { e.preventDefault(); pick(btns.length - 1, true); }
      else if (d) { e.preventDefault(); pick(curTool + d, true); }
    });
  }
  function buildAbout() {
    var rows = function (a) { return '<ul class="rows">' + a.map(function (r) { return '<li><span class="px">' + r[0] + "</span><span>" + esc(r[1]) + "</span></li>"; }).join("") + "</ul>"; };
    var ed = S.educationDetail;
    /* 정보 탭: 선택한 탭의 내용이 하나의 넓은 패널에 표시됨 */
    var TABS = [
      { id: "profile", label: "Profile", title: "소개",
        html: function () {
          return '<h3 class="panel__headline">무한히 배우고 <mark>성장하는</mark> 디자이너 이정인입니다.</h3>' +
            '<div class="prose">' + S.intro.map(function (t, i) { return '<p class="' + (i === 0 ? "is-lead" : "") + '">' + esc(t) + "</p>"; }).join("") + "</div>";
        } },
      { id: "education", label: "Education", title: "학력",
        html: function () {
          return '<dl class="facts">' +
            '<div><dt>학교</dt><dd>' + esc(ed.school) + "</dd></div>" +
            '<div><dt>전공</dt><dd>' + esc(ed.major) + "</dd></div>" +
            '<div><dt>상태</dt><dd>' + esc(ed.status) + "</dd></div></dl>";
        } },
      { id: "skills", label: "Skills", title: "스킬", html: skillsHTML, init: skillsInit },
      { id: "fields", label: "Fields", title: "작업 분야",
        html: function () {
          return '<p class="panel__note">분야를 누르면 해당 작업 목록으로 이동합니다.</p><ul class="chips">' + C.slice(1).map(function (c) {
            return '<li><a href="#/works/' + c.id + '"><span>' + c.label + "</span><span class=\"chips__ko\">" + esc(c.ko) + "</span><sup>" + P.filter(function (p) { return p.cat === c.id; }).length + "</sup></a></li>";
          }).join("") + "</ul>";
        } },
      { id: "awards", label: "Awards", title: "수상", html: function () { return rows(S.awards); } },
      { id: "certs", label: "Certificate", title: "자격", html: function () { return rows(S.certificates); } }
    ];
    var tabsEl = $("[data-tabs]"), panel = $("[data-panel]"), curTab = 0;
    tabsEl.innerHTML = TABS.map(function (t, i) {
      return '<button type="button" role="tab" class="tab px" id="tab-' + t.id + '" aria-controls="info-panel" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '">' + t.label + "</button>";
    }).join("");
    var tabBtns = $$(".tab", tabsEl);
    function showTab(i, focus) {
      curTab = (i + TABS.length) % TABS.length;
      tabBtns.forEach(function (b, k) { b.setAttribute("aria-selected", k === curTab); b.tabIndex = k === curTab ? 0 : -1; });
      panel.setAttribute("aria-labelledby", "tab-" + TABS[curTab].id);
      panel.setAttribute("data-tab", TABS[curTab].id);
      panel.innerHTML = '<p class="panel__label px">' + TABS[curTab].label + " · " + TABS[curTab].title + "</p>" + TABS[curTab].html();
      if (TABS[curTab].init) TABS[curTab].init(panel);
      if (focus) tabBtns[curTab].focus();
    }
    tabsEl.addEventListener("click", function (e) { var b = e.target.closest(".tab"); if (b) showTab(tabBtns.indexOf(b), false); });
    tabsEl.addEventListener("keydown", function (e) {
      var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (e.key === "Home") { e.preventDefault(); showTab(0, true); }
      else if (e.key === "End") { e.preventDefault(); showTab(TABS.length - 1, true); }
      else if (d) { e.preventDefault(); showTab(curTab + d, true); }
    });
    showTab(0, false);
    $("[data-year]").textContent = new Date().getFullYear();
    if (S.showPhone && S.phone) {
      var li = $("[data-phone]");
      li.innerHTML = '<a href="tel:' + S.phone.replace(/\s/g, "") + '"><span class="px">TEL</span>' + esc(S.phone) + "</a>";
      li.hidden = false;
    }
  }

  /* ---------- Project detail ---------- */
  var lb = { items: [], i: 0 };
  function renderProject(idx) {
    var p = P[idx], view = $("#project");
    var prev = P[(idx - 1 + P.length) % P.length], next = P[(idx + 1) % P.length];
    var shots = [], n = 0, total = 0;
    p.gallery.forEach(function (g) { total += Array.isArray(g) ? g.length : 1; });
    function fig(id, sizes, pair) {
      n++;
      var o = shotSrc(id), alt = p.title + " — " + (n === 1 ? "프로젝트 소개 페이지" : "작업 이미지 " + n);
      var ratio = o.w / o.h, tall = !pair && ratio < 0.6;     // 세로로 긴 이미지: 자르지 않고 끝까지 보여 줌
      lb.items.push({ src: o.big, alt: alt, cap: pad(n) + " / " + pad(total), tall: ratio < 0.7 });
      if (tall) sizes = "(max-width: 1100px) 94vw, 1100px";
      return '<figure class="shot' + (tall ? ' shot--tall' : '') + '" data-reveal' + (pair || !/^g-/.test(id) ? '' : (tall ? ' style="max-width:min(100%,1100px);margin-inline:auto"' : ' style="max-width:calc(92vh * ' + ratio.toFixed(3) + ');margin-inline:auto"')) + '><button type="button" data-lb="' + (n - 1) + '" aria-label="' + esc(alt) + ' 크게 보기">' +
        imgHTML(o, sizes, alt, n === 1) + '</button><figcaption><span>' + pad(n) + " / " + pad(total) + "</span><span>" + esc(p.title) + "</span></figcaption></figure>";
    }
    lb.items = [];
    p.gallery.forEach(function (g) {
      if (Array.isArray(g)) shots.push('<div class="pj-pair">' + g.map(function (id) { return fig(id, "(max-width: 600px) 92vw, 46vw", true); }).join("") + "</div>");
      else shots.push(fig(g, "(max-width: 1760px) 94vw, 1680px"));
    });

    view.setAttribute("style", colorVars(p));
    view.innerHTML =
      '<header class="pj-top">' +
        '<div class="pj-crumbs">' +
          '<a class="pj-back" href="#/works" data-back><span aria-hidden="true">←</span> 전체 작업</a>' +
          '<span class="pj-tag">' + esc(p.catLabel) + "</span>" +
          '<span class="px">' + pad(idx + 1) + " / " + pad(P.length) + "</span>" +
        "</div>" +
        '<h1 class="pj-title" id="pj-title" tabindex="-1">' + esc(p.title) + "</h1>" +
        '<div class="pj-desc"><p>' + esc(p.desc) + "</p></div>" +
        '<dl class="pj-meta">' +
          "<div><dt>FIELD</dt><dd>" + esc(p.catLabel) + "</dd></div>" +
          "<div><dt>DATE</dt><dd>" + esc(p.date) + "</dd></div>" +
          "<div><dt>TOOL</dt><dd>" + esc(p.tool) + "</dd></div>" +
          "<div><dt>WORK</dt><dd>개인 작업 · 기여도 100%</dd></div>" +
        "</dl>" +
      "</header>" +
      '<section class="pj-gallery" aria-label="작업 이미지">' + shots.join("") + "</section>" + videoHTML(p) +
      '<nav class="pj-next" aria-label="다른 프로젝트">' +
        '<a href="#/work/' + prev.slug + '" style="' + colorVars(prev) + '"><span class="px">← PREV</span><strong>' + esc(prev.title) + "</strong></a>" +
        '<a href="#/work/' + next.slug + '" style="' + colorVars(next) + '"><span class="px">NEXT →</span><strong>' + esc(next.title) + "</strong></a>" +
      "</nav>";
    document.title = p.title + " — 이정인 Portfolio";
    observeReveal(view);
  }

  /* 영상: 자동 재생 없음 · 전체를 미리 받지 않음(preload="none") · 원본 비율 · 기본 컨트롤(재생/일시정지·음량·탐색·전체화면) */
  function videoHTML(p) {
    if (!p.video) return "";
    var v = p.video;
    return '<section class="pj-video" aria-label="' + esc(v.title) + '">' +
      '<figure class="vid"><div class="vid__frame" style="aspect-ratio:' + v.w + " / " + v.h + '">' +
        '<video controls playsinline preload="none" poster="' + v.poster + '" width="' + v.w + '" height="' + v.h + '" aria-label="' + esc(v.title) + '"><source src="' + v.src + '" type="video/mp4">이 브라우저는 영상 재생을 지원하지 않습니다.</video>' +
      '</div><figcaption class="vid__cap"><span>VIDEO</span><span>' + esc(v.title) + "</span></figcaption></figure></section>";
  }

  function openLB(i) {
    var d = $(".lightbox"); if (!d.showModal) return;
    lb.i = (i + lb.items.length) % lb.items.length;
    var it = lb.items[lb.i], img = $("img", d);
    d.classList.toggle("is-tall", !!it.tall);
    var fg = $("figure", d); fg.scrollTop = 0;
    img.src = it.src; img.alt = it.alt;
    $("figcaption", d).textContent = it.cap;
    var many = lb.items.length > 1;
    $(".lb-prev", d).hidden = !many; $(".lb-next", d).hidden = !many;
    if (!d.open) d.showModal();
    if (it.tall) fg.focus({ preventScroll: true });   // 방향키·스페이스로도 전체를 스크롤
  }
  function lightboxInit() {
    var d = $(".lightbox"), opener = null;
    document.addEventListener("click", function (e) {
      var b = e.target.closest("[data-lb]"); if (!b) return;
      opener = b; openLB(+b.getAttribute("data-lb"));
    });
    $(".lb-close", d).addEventListener("click", function () { d.close(); });
    $(".lb-prev", d).addEventListener("click", function () { openLB(lb.i - 1); });
    $(".lb-next", d).addEventListener("click", function () { openLB(lb.i + 1); });
    d.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") openLB(lb.i - 1);
      if (e.key === "ArrowRight") openLB(lb.i + 1);
    });
    d.addEventListener("click", function (e) { if (e.target === d || e.target.tagName === "FIGURE") d.close(); });
    d.addEventListener("close", function () { if (opener) opener.focus(); });
    // 스와이프
    var x0 = null, y0 = 0;
    d.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    d.addEventListener("touchend", function (e) {
      if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
      if (lb.items.length > 1 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 2) openLB(lb.i + (dx < 0 ? 1 : -1));   // 세로 스크롤은 넘김으로 보지 않음
    });
  }

  /* ---------- Router (hash) ---------- */
  var lastSlug = null, homeY = 0, inProject = false, cameFromHome = false, homeHash = location.hash, skipScroll = false, booted = false;
  function scrollToWorks(smooth) {
    var w = document.getElementById("works");
    window.scrollTo({ top: w.getBoundingClientRect().top + window.scrollY - 8, behavior: smooth && motionOK ? "smooth" : "instant" });
    var t = $(".works__title"); t.setAttribute("tabindex", "-1"); t.focus({ preventScroll: true });
  }
  function route() {
    var h = location.hash, m = h.match(/^#\/work\/([\w-]+)/), home = $("#home"), pj = $("#project");
    if (m) {
      var idx = bySlug(m[1]);
      if (idx < 0) { location.replace("#/works"); return; }
      if (!inProject) { homeY = window.scrollY; cameFromHome = booted; }
      lastSlug = m[1];
      renderProject(idx);
      home.hidden = true; pj.hidden = false; inProject = true;
      window.scrollTo(0, 0);
      var t = $("#pj-title"); if (t) t.focus({ preventScroll: true });
      setCurrent(null);
      document.dispatchEvent(new CustomEvent("jl:view", { detail: "project" }));
      booted = true;
      return;
    }
    // #/works 또는 #/works/<분야>
    var wm = h.match(/^#\/works(?:\/([\w-]+))?\/?$/);
    if (wm) setCat(wm[1] || "all", !booted);
    else if ((h === "" || h === "#/") && booted) setCat("all", true);
    document.title = "이정인 — Graphic & Branding Designer Portfolio";
    if (inProject) {
      pj.hidden = true; home.hidden = false; inProject = false;
      pj.innerHTML = "";
      document.dispatchEvent(new CustomEvent("jl:view", { detail: "home" }));
      var id = h.replace(/^#\/?/, "");
      var target = !wm && id && document.getElementById(id);
      if (cameFromHome && h === homeHash) {
        // 뒤로 가기: 보던 위치와 카드로 복귀
        window.scrollTo(0, homeY);
        var card = $('[data-slug="' + lastSlug + '"] a'); if (card) card.focus({ preventScroll: true });
      } else if (wm) scrollToWorks(false);
      else if (target) {
        target.scrollIntoView();
        target.setAttribute("tabindex", "-1"); target.focus({ preventScroll: true });
      } else window.scrollTo(0, 0);
      cameFromHome = false;
    } else if (wm) {
      if (!skipScroll) scrollToWorks(booted);
    } else if (h === "#/") {
      window.scrollTo({ top: 0, behavior: motionOK ? "smooth" : "auto" });
    } else if (h === "" && /^#\/works/.test(homeHash)) {
      window.scrollTo({ top: 0, behavior: "instant" }); // 분야 목록에서 뒤로 가기 → 메인 무대로
    }
    skipScroll = false; homeHash = h; booted = true;
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-back]");
    if (b && cameFromHome) { e.preventDefault(); history.back(); }
  });

  /* ---------- Nav state ---------- */
  function setCurrent(id) {
    $$("[data-nav]").forEach(function (a) {
      if (a.getAttribute("data-nav") === id) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
  }
  function navObserve() {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting && !inProject) setCurrent(e.target.id); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["selected", "works", "about", "contact"].forEach(function (id) { io.observe(document.getElementById(id)); });
  }

  /* ---------- Mobile menu ---------- */
  function menuInit() {
    var btn = $(".menu-btn"), menu = $("#menu"), label = $(".menu-btn__label");
    function set(open) {
      btn.setAttribute("aria-expanded", open); menu.hidden = !open; label.textContent = open ? "Close" : "Menu";
      document.body.style.overflow = open ? "hidden" : "";
      if (open) $("a", menu).focus();
    }
    btn.addEventListener("click", function () { set(btn.getAttribute("aria-expanded") !== "true"); });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
    document.addEventListener("keydown", function (e) {
      if (menu.hidden) return;
      if (e.key === "Escape") { set(false); btn.focus(); }
      if (e.key === "Tab") {
        var f = [btn].concat($$("a", menu)), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.matchMedia("(min-width: 861px)").addEventListener("change", function (e) { if (e.matches) set(false); });
  }

  /* ---------- Reveal ---------- */
  var revealIO = motionOK && "IntersectionObserver" in window ? new IntersectionObserver(function (ents) {
    ents.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); revealIO.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" }) : null;
  function observeReveal(root) {
    $$("[data-reveal]", root).forEach(function (el) { if (revealIO) revealIO.observe(el); else el.classList.add("is-in"); });
  }

  /* drop.js(메인 블록 무대)에서 쓰는 도우미 */
  window.JL = { glyphSVG: glyphSVG, coverObj: coverObj, motionOK: motionOK, esc: esc };

  /* 화면 밖 티커는 멈춤 */
  if ("IntersectionObserver" in window) {
    var tk = $(".ticker");
    new IntersectionObserver(function (e) { tk.classList.toggle("is-off", !e[0].isIntersecting); }).observe(tk);
  }

  /* ---------- Boot ---------- */
  buildTicker(); buildSelected();
  buildFilters(); renderWorks(false); peekInit(); buildAbout();
  lightboxInit(); menuInit(); navObserve(); observeReveal(document);
  $$("[data-totop]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: motionOK ? "smooth" : "auto" }); $(".brand").focus({ preventScroll: true }); }); });
  window.addEventListener("hashchange", route);
  route();
  mqReduce.addEventListener && mqReduce.addEventListener("change", function () { location.reload(); });
})();
