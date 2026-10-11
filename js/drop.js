/* =========================================================
   메인 무대 v6 — "떨어지고, 던지고, 부딪히는 디자인 블록"
   · 분야 블록 5 + 이름 블록 1(테트로미노 L·J·T·S·Z·I) + 작은 정사각형 작품 블록 3
   · 블록 크기·개수·생성 위치와 벽·바닥·천장을 처음부터 메인 영역에 맞춰 두고, 중력과 충돌만으로 쌓임
     (낙하 후 위치를 바꾸는 정렬·스냅·순간이동 없음 — 멈춘 자리가 그대로 최종 위치)
   · 블록을 끌어 던지면 속도만큼 튕기고, 부딪히고, 회전함 (Matter.js, MIT)
   · 실행(run)마다 gen 번호를 올려 이전 실행의 타이머·콜백·물리 객체를 모두 무효화 (DROP AGAIN 안전)
   · 모든 블록은 실제 <a> 링크 → 키보드·스크린리더·물리 엔진 실패 시에도 동작
   ========================================================= */
(function () {
  "use strict";

  var sec = document.getElementById("drop");
  if (!sec) return;
  var stage = sec.querySelector(".drop__stage");
  var listEl = sec.querySelector(".drop__list");
  var peek = sec.querySelector(".drop__peek");
  var ctrl = sec.querySelector(".drop__ctrl");
  var againBtn = sec.querySelector("[data-drop-again]");
  var board = sec.querySelector(".drop__board");
  var JL = window.JL, P = window.PROJECTS || [], M = window.Matter;

  var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mqFine = window.matchMedia("(hover: hover) and (pointer: fine)");
  var mqMobile = window.matchMedia("(max-width: 760px)");

  var CAT_LABEL = { branding: "Branding", editorial: "Editorial", graphic: "Graphic", contents: "Contents", ui: "UI Design", video: "Video" };
  var IMG_SLUGS = ["busan-rock-festival", "david-carson", "panorama", "tudari", "vans-bape"]; // 메인에 떨어지는 대표 이미지 3개
  var FILL_MOBILE = 0.46;  // 모바일: 같은 의미 (좁은 화면은 블록이 상대적으로 작아 더 높게 잡음)
  var IMG_SCALE = 1.05;    // 이미지 블록 한 변 = 칸 크기(C)의 1.05배 — 카테고리·이름 블록보다 상대적으로 작게
  var FILL_TARGET = 0.38;  // 데스크톱: 무대 면적 대비 블록 면적 — 높을수록 화면이 꽉 차고, 낮을수록 여유롭게 쌓임
  function projectsOf(cat) { return P.filter(function (p) { return p.cat === cat; }); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function darken(hex, f) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex.trim()); if (!m) return "#111111";
    var n = parseInt(m[1], 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    function d(v) { return Math.round(v * f); }
    return "rgb(" + d(r) + "," + d(g) + "," + d(b) + ")";
  }

  /* ---------- 정적 템플릿(JS 없을 때의 링크 목록)을 읽어 둠 ---------- */
  var tpl = Array.prototype.map.call(listEl.querySelectorAll(".blk"), function (a) {
    var word = a.querySelector(".blk__word"), sup = word.querySelector("sup");
    var isName = a.classList.contains("blk--name");
    return {
      cat: a.getAttribute("data-cat"), href: a.getAttribute("href"), isName: isName,
      c: a.style.getPropertyValue("--c"), t: a.style.getPropertyValue("--t"),
      text: isName ? "LEE JEONG IN" : word.firstChild.textContent, count: (!isName && a.getAttribute("data-cat")) ? ("0" + projectsOf(a.getAttribute("data-cat")).length).slice(-2) : (sup ? sup.textContent : "")
    };
  });

  /* ---------- 호버·포커스 미리보기 (정밀 포인터) ---------- */
  var peekFor = null, topLimit = 0, dragging = false;
  function allEls() { return S ? S.pieces.map(function (p) { return p.el; }) : []; }
  function showPeek(a) {
    if (!JL || !mqFine.matches || dragging) return;
    var cat = a.getAttribute("data-cat"), slug = a.getAttribute("data-slug");
    if (!cat && !slug) return;
    if (peekFor !== a) {
      peekFor = a;
      if (cat) {
        var ps = projectsOf(cat);
        if (!ps.length) {
          peek.className = "drop__peek drop__peek--tag";
          peek.innerHTML = '<div class="peek-tag" style="--c:' + a.style.getPropertyValue("--c") + '"><b>' + CAT_LABEL[cat] + '</b><span class="px">공개된 작업 없음</span></div>';
        } else {
        peek.className = "drop__peek";
        peek.innerHTML =
          '<div class="peek-card" style="--c:' + a.style.getPropertyValue("--c") + ";--t:" + a.style.getPropertyValue("--t") + '">' +
            '<div class="peek-imgs">' + ps.slice(0, 3).map(function (p, i) {
              var o = JL.coverObj(p.cover);
              return '<img src="' + o.src + '" width="' + o.w + '" height="' + o.h + '" alt="" style="--i:' + i + '" decoding="async">';
            }).join("") + "</div>" +
            '<div class="peek-cap"><b>' + CAT_LABEL[cat] + '</b><span class="px">' + ps.length + " WORKS</span></div>" +
            '<ul class="peek-list">' + ps.map(function (p) { return "<li>" + JL.esc(p.title) + "</li>"; }).join("") + "</ul>" +
          "</div>";
        }
      } else {
        var p = P.filter(function (x) { return x.slug === slug; })[0];
        peek.className = "drop__peek drop__peek--tag";
        peek.innerHTML = '<div class="peek-tag" style="--c:' + p.color + ";--t:" + p.ink + '"><b>' + JL.esc(p.title) + '</b><span class="px">' + JL.esc(p.catLabel) + " · " + p.year + ' →</span></div>';
      }
    }
    placePeek();
    peek.classList.add("is-on");
    sec.classList.add("is-peeking");
    allEls().forEach(function (b) { b.classList.toggle("is-hot", b === a); });
  }
  function hidePeek() {
    peekFor = null; peek.classList.remove("is-on"); sec.classList.remove("is-peeking");
    allEls().forEach(function (b) { b.classList.remove("is-hot"); });
  }
  function placePeek() {
    if (!peekFor) return;
    var shape = peekFor.querySelector(".blk__shape") || peekFor;
    var w = shape.getBoundingClientRect(), s = sec.getBoundingClientRect();
    var pw = peek.offsetWidth || 320, ph = peek.offsetHeight || 260, gap = 14;
    var bx = w.left - s.left, by = w.top - s.top;
    var x = bx + w.width / 2 - pw / 2, y = by - ph - gap;
    if (y < topLimit) {
      y = clamp(by + w.height / 2 - ph / 2, topLimit, s.height - ph - 8);
      x = (bx + w.width + gap + pw < s.width - 12) ? bx + w.width + gap : bx - pw - gap;
    }
    x = clamp(x, 12, s.width - pw - 12);
    peek.style.transform = "translate(" + Math.round(x) + "px," + Math.round(y) + "px)";
  }
  function bindPeek(a) {
    a.addEventListener("pointerenter", function (e) { if (e.pointerType !== "touch") showPeek(a); });
    a.addEventListener("pointerleave", function () { if (peekFor === a) hidePeek(); });
    a.addEventListener("focus", function () { showPeek(a); });
    a.addEventListener("blur", function () { if (peekFor === a) hidePeek(); });
  }

  /* ---------- 물리 엔진이 없으면 정적 블록 링크로 끝 ---------- */
  if (!M || !JL) { sec.classList.add("is-static"); return; }
  var Engine = M.Engine, Bodies = M.Bodies, Body = M.Body, Composite = M.Composite;

  /* ---------- 상태 ---------- */
  var gen = 0;               // 실행 번호. 바뀌면 이전 실행의 모든 콜백이 무효
  var S = null;              // 현재 실행 상태
  var timers = [], raf = 0, running = false, visible = true;
  var drag = null, suppressClick = false, hold = 0;
  var W = 0, H = 0, C = 100, G = 8, mobile = false, txtW100 = {};
  var engine = Engine.create({ enableSleeping: false, positionIterations: 10, velocityIterations: 8 });
  engine.gravity.y = 1; engine.gravity.scale = 0.0021;

  /* ---------- 글자 폭 측정 ---------- */
  function measureWords() {
    tpl.forEach(function (t) {
      if (t.isName || txtW100[t.cat]) return;
      var probe = document.createElement("span");
      probe.className = "blk__word blk__probe"; probe.setAttribute("aria-hidden", "true");
      probe.style.cssText = "position:absolute;left:-9999px;top:0;visibility:hidden;font-size:100px;padding:0;width:auto;height:auto;";
      probe.innerHTML = '<span class="blk__txt">' + t.text + "</span>";
      sec.appendChild(probe);
      txtW100[t.cat] = probe.firstChild.getBoundingClientRect().width;
      probe.remove();
    });
  }
  function wordLen(t, cols) {
    var padX = C * 0.2;
    if (t.isName) {
      var need = function (f) { var gh = C * f; return 10 * gh * 5 / 7 + 11 * C * 0.08 + 2 * C * 0.18 + padX * 2; };
      var f = 0.5;
      if (need(f) > cols * C) f = Math.max(0.28, f * (cols * C) / need(f));
      t.ng = f;
      return Math.min(Math.ceil(need(f) / C), cols);
    }
    var tw = (txtW100[t.cat] || 300) * C * 0.56 / 100;
    return Math.max(2, Math.ceil((tw + C * 0.26 + padX * 2) / C));
  }

  /* ---------- 블록 모양 ---------- */
  // 단어 블록: 막대(len칸) + 덧붙는 칸 → 테트로미노 L·J·T·S·Z·I
  function wordShape(kind, len) {
    var extra = [], c0 = 0, rows = 2, cols = len;
    if (kind === "I") { rows = 1; }
    else if (kind === "L") extra = [[len - 1, 0]];
    else if (kind === "J") extra = [[0, 0]];
    else if (kind === "T") extra = [[Math.floor((len - 1) / 2), 0]];
    else if (kind === "S") { extra = [[len - 1, 0], [len, 0]]; cols = len + 1; }
    else if (kind === "Z") { extra = [[0, 0], [1, 0]]; c0 = 1; cols = len + 1; }
    var cells = extra.slice();
    for (var i = 0; i < len; i++) cells.push([c0 + i, rows - 1]);
    return { kind: kind, cols: cols, rows: rows, cells: cells, bar: { c: c0, r: rows - 1, len: len }, extra: extra };
  }

  /* ---------- 블록 구성 ---------- */
  function makePieces(maxCols) {
    var wk = shuffle(["L", "J", "T", "S", "Z", "I", "L", "J", "T"]), ki = 0, out = [];
    tpl.forEach(function (t) {
      var len = wordLen(t, maxCols), kind = wk[ki++ % wk.length];
      if (len + 1 > maxCols && (kind === "S" || kind === "Z")) kind = "L";
      if (len >= maxCols - 1) kind = "I";
      var sh = wordShape(kind, len);
      out.push({ id: t.isName ? "name" : t.cat, type: t.isName ? "name" : "word", t: t, shape: sh, cols: sh.cols, rows: sh.rows, cells: sh.cells });
    });
    IMG_SLUGS.forEach(function (slug, i) {
      var pr = P.filter(function (x) { return x.slug === slug; })[0]; if (!pr) return;
      out.push({ id: "img" + i, type: "img", pr: pr, cols: 1, rows: 1, cells: [[0, 0]], side: 0 });
    });
    return out;
  }
  function areaOf(pieces) { // px² (현재 C 기준)
    var a = 0;
    pieces.forEach(function (p) { a += p.type === "img" ? Math.pow(IMG_SCALE * C, 2) : p.cells.length * C * C; });
    return a;
  }
  /* 무대 안에 들어가는 크기 계산: 블록 면적이 무대 면적의 FILL_TARGET이 되도록 칸 크기(C)를 정하고,
     가장 넓은 블록이 무대 폭보다 넓어지지 않게 한다. 이렇게 정한 뒤에는 위치를 바꾸는 일이 없다. */
  function chooseLayout() {
    W = stage.clientWidth; H = stage.clientHeight; mobile = mqMobile.matches;
    var sRect = sec.getBoundingClientRect();
    topLimit = (ctrl ? ctrl.getBoundingClientRect().bottom - sRect.top : 0) + 10;
    var side = mobile ? 12 : Math.max(16, W * 0.02), floorPad = mobile ? 8 : 12;
    G = mobile ? 7 : 9;
    var L = side, R = W - side, F = H - floorPad;
    var Wp = R - L, Hp = F - topLimit;
    measureWords();
    var FT = mobile ? FILL_MOBILE : FILL_TARGET;
    var c = Math.sqrt(FT * Wp * Hp / 37), pieces = null;
    for (var iter = 0; iter < 8; iter++) {
      C = c;
      var maxCols = Math.max(3, Math.floor(Wp / c));
      pieces = makePieces(maxCols);
      var widest = 0, tallest = 0;
      pieces.forEach(function (p) { var w = p.type === "img" ? IMG_SCALE * c : p.cols * c, h = p.type === "img" ? IMG_SCALE * c : p.rows * c; widest = Math.max(widest, w); tallest = Math.max(tallest, h); });
      var byArea = Math.sqrt(FT * Wp * Hp / (areaOf(pieces) / (c * c)));
      var byWidth = c * (Wp - 4) / widest;
      var next = Math.min(byArea, byWidth, c * (Hp * 0.45) / tallest);
      if (Math.abs(next - c) < 0.5) { c = next; break; }
      c = next;
    }
    C = Math.floor(c);
    var maxCols2 = Math.max(3, Math.floor(Wp / C));
    pieces = makePieces(maxCols2);
    pieces.forEach(function (p) { if (p.type === "img") p.side = Math.round(IMG_SCALE * C); });
    tpl.forEach(function (t) { if (t.isName) wordLen(t, maxCols2); });   // 이름 글자 크기 확정
    return { pieces: pieces, L: L, R: R, F: F, C: C, fill: areaOf(pieces) / (Wp * Hp) };
  }

  /* ---------- 블록 DOM ---------- */
  function cellRects(cells) {
    var set = {}; cells.forEach(function (c) { set[c[0] + "," + c[1]] = 1; });
    var g2 = G / 2;
    return cells.map(function (c) {
      var x = c[0], y = c[1];
      var l = set[(x - 1) + "," + y] ? 0 : g2, r = set[(x + 1) + "," + y] ? 0 : g2;
      var t = set[x + "," + (y - 1)] ? 0 : g2, b = set[x + "," + (y + 1)] ? 0 : g2;
      return { x: x * C + l, y: y * C + t, w: C - l - r, h: C - t - b };
    });
  }
  function unionPath(rects) {
    return rects.map(function (r) { return "M" + r.x.toFixed(1) + " " + r.y.toFixed(1) + "h" + r.w.toFixed(1) + "v" + r.h.toFixed(1) + "h" + (-r.w).toFixed(1) + "Z"; }).join("");
  }
  function buildEl(p) {
    var a = document.createElement("a");
    a.className = "blk blk--" + p.type;
    var col, ink, href, aria;
    if (p.type === "img") {
      col = p.pr.color; ink = p.pr.ink; href = "#/work/" + p.pr.slug;
      a.setAttribute("data-slug", p.pr.slug); aria = p.pr.title + " — 작품 상세 보기";
    } else {
      col = p.t.c; ink = p.t.t; href = p.t.href;
      if (p.t.cat) a.setAttribute("data-cat", p.t.cat);
      aria = p.t.isName ? "LEE JEONG IN — 소개 보기" : CAT_LABEL[p.t.cat] + " — 작업 " + projectsOf(p.t.cat).length + "개 보기";
    }
    a.href = href; a.setAttribute("aria-label", aria); p.aria = aria;
    a.style.setProperty("--c", col); a.style.setProperty("--t", ink); a.style.setProperty("--side", darken(col, 0.62));
    var w, h;
    if (p.type === "img") { // 정사각형 한 장: 한 변 = side
      w = h = p.side; var g2 = G / 2;
      p.rects = [{ x: g2, y: g2, w: w - G, h: h - G }];
    } else {
      w = p.cols * C; h = p.rows * C; p.rects = cellRects(p.cells);
    }
    a.style.width = w + "px"; a.style.height = h + "px";
    var shape = document.createElement("span"); shape.className = "blk__shape"; shape.style.width = w + "px"; shape.style.height = h + "px";
    var fill = document.createElement("span"); fill.className = "blk__fill"; fill.style.width = w + "px"; fill.style.height = h + "px";
    fill.style.clipPath = "path('" + unionPath(p.rects) + "')";
    var slab = document.createElement("span"); slab.className = "blk__slab"; slab.style.width = w + "px"; slab.style.height = h + "px";
    slab.appendChild(fill); shape.appendChild(slab);
    if (p.type === "img") {
      var o = JL.coverObj(p.pr.cover);
      fill.style.backgroundImage = "url(" + o.src + ")";
    } else {
      var sh = p.shape, word = document.createElement("span"); word.className = "blk__word";
      word.style.left = sh.bar.c * C + "px"; word.style.top = sh.bar.r * C + "px"; word.style.width = sh.bar.len * C + "px"; word.style.height = C + "px";
      if (p.t.isName) {
        var nm = document.createElement("span"); nm.className = "blk__name"; nm.setAttribute("aria-hidden", "true");
        nm.innerHTML = "LEE JEONG IN".split("").map(function (ch) { return ch === " " ? '<i class="blk__sp"></i>' : JL.glyphSVG(ch); }).join("");
        word.style.setProperty("--ng", p.t.ng || 0.5); word.appendChild(nm);
      } else {
        word.innerHTML = '<span class="blk__txt">' + p.t.text + '</span><sup class="px">' + p.t.count + "</sup>";
      }
      shape.appendChild(word);
      sh.extra.slice(0, 1).forEach(function (c) {
        var d = document.createElement("span"); d.className = "blk__dot";
        d.style.left = c[0] * C + C / 2 + "px"; d.style.top = c[1] * C + C / 2 + "px"; shape.appendChild(d);
      });
    }
    a.appendChild(shape);
    p.el = a; p.w = w; p.h = h;
    bindPeek(a);
    return a;
  }

  /* ---------- 물리 월드 ---------- */
  var OPTS = { friction: 0.7, frictionStatic: 1.2, frictionAir: 0.012, restitution: 0.32, density: 0.002 };
  function makeBody(p, ox, oy) {
    var parts = p.rects.map(function (r) { return Bodies.rectangle(ox + r.x + r.w / 2, oy + r.y + r.h / 2, r.w, r.h, OPTS); });
    var b = parts.length > 1 ? Body.create(Object.assign({ parts: parts }, OPTS)) : parts[0];
    p.offX = b.position.x - ox; p.offY = b.position.y - oy;
    Body.setInertia(b, b.inertia * 5);
    p.el.style.transformOrigin = p.offX + "px " + p.offY + "px";
    return b;
  }
  function wallSet() { // [바닥, 왼쪽, 오른쪽, 천장] — 모두 메인 영역의 경계
    var t = 600, o = { isStatic: true, friction: 0.9, restitution: 0.3 }, L = S.L, R = S.R, F = S.F;
    return [
      Bodies.rectangle((L + R) / 2, F + t / 2, (R - L) + t * 2, t, o),
      Bodies.rectangle(L - t / 2, F - H * 2, t, H * 6, o),
      Bodies.rectangle(R + t / 2, F - H * 2, t, H * 6, o),
      Bodies.rectangle((L + R) / 2, topLimit - t / 2, (R - L) + t * 2, t, o)
    ];
  }
  function render() {
    if (!S) return;
    S.pieces.forEach(function (p) {
      var b = p.body;
      if (!b) { p.el.style.visibility = "hidden"; return; }
      p.el.style.visibility = "";
      p.el.style.transform = "translate(" + (b.position.x - p.offX).toFixed(2) + "px," + (b.position.y - p.offY).toFixed(2) + "px) rotate(" + b.angle.toFixed(4) + "rad)";
    });
    if (peekFor) placePeek();
  }
  function maxSpeed() {
    var v = 0, a = 0;
    S.pieces.forEach(function (p) { if (p.body) { v = Math.max(v, p.body.speed); a = Math.max(a, Math.abs(p.body.angularVelocity)); } });
    return { v: v, a: a };
  }
  function depthOf(a, b) { // 두 블록이 서로 파고든 최대 깊이(px). 합성 블록은 조각 단위로 계산
    var d = 0;
    for (var i = a.parts.length > 1 ? 1 : 0; i < a.parts.length; i++) for (var j = b.parts.length > 1 ? 1 : 0; j < b.parts.length; j++) {
      var c = M.Collision.collides(a.parts[i], b.parts[j]); if (c && c.depth > d) d = c.depth;
    }
    return d;
  }
  window.__dropDebug = function () {
    if (!S) return null;
    var ms = S.pieces.some(function (p) { return p.body; }) ? maxSpeed() : { v: 0, a: 0 };
    var pairs = 0, deep = 0;
    for (var i = 0; i < S.pieces.length; i++) for (var j = i + 1; j < S.pieces.length; j++) {
      var a = S.pieces[i].body, b = S.pieces[j].body; if (!a || !b) continue;
      var d = depthOf(a, b); if (d > 0.5) { pairs++; if (d > 6) deep++; }
    }
    return {
      gen: gen, running: running, settled: sec.classList.contains("is-settled"), simTime: Math.round(S.simTime), C: C, fill: Math.round(S.fill * 100) / 100,
      overlapPairs: pairs, deepOverlaps: deep, timers: timers.length, dragging: !!drag, teleports: S.teleports,
      bodies: Composite.allBodies(engine.world).length, blocks: board.querySelectorAll(".blk").length, speed: +ms.v.toFixed(3), ang: +ms.a.toFixed(4),
      stageW: W, stageH: H, topLimit: topLimit, area: { L: S.L, R: S.R, T: topLimit, F: S.F },
      pieces: S.pieces.map(function (p) {
        var b = p.body;
        return { id: p.id, type: p.type, w: p.w, h: p.h, cells: p.cells, offX: p.offX, offY: p.offY, spawned: !!b,
          x: b ? b.position.x : null, y: b ? b.position.y : null, angle: b ? b.angle : null,
          x0: b ? b.bounds.min.x : null, x1: b ? b.bounds.max.x : null, y0: b ? b.bounds.min.y : null, y1: b ? b.bounds.max.y : null };
      })
    };
  };

  /* ---------- 생성(spawn): 서로 겹치지 않는 위치에서 무대 위로부터 떨어뜨림 ---------- */
  function spawn(p, slotX) {
    var half = Math.hypot(p.w, p.h) / 2 + 4;                  // 어떻게 회전해도 벽 안쪽에 들어오는 여유
    var cx = clamp(slotX, S.L + half, S.R - half);
    // 이미 떨어지는 중이거나 쌓인 블록과 가로로 겹치면, 그 블록들보다 위에서 시작 → 생성 순간 겹침 없음
    var cy = -p.h / 2 - 8;
    S.pieces.forEach(function (q) {
      if (q === p || !q.body) return;
      var bb = q.body.bounds;
      if (bb.max.x > cx - half && bb.min.x < cx + half) cy = Math.min(cy, bb.min.y - p.h / 2 - half * 0.5 - 6);
    });
    var b = makeBody(p, cx - p.w / 2, cy - p.h / 2);
    Body.setAngle(b, (Math.random() - 0.5) * 0.7);
    Body.setVelocity(b, { x: (Math.random() - 0.5) * 1.4, y: 2 });
    Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.04);
    p.body = b; Composite.add(engine.world, b);
  }
  /* 생성 위치 계획: 폭을 잘게 나눈 칸마다 '쌓일 높이'를 어림해 가장 낮은 곳에 떨어뜨림.
     위치만 정할 뿐 낙하 후에는 아무것도 옮기지 않는다(중력과 충돌이 결과를 정함). */
  function planX(pieces) {
    var nb = 48, bw = (S.R - S.L) / nb, bins = []; for (var i = 0; i < nb; i++) bins.push(0);
    return pieces.map(function (p) {
      var half = Math.hypot(p.w, p.h) / 2 + 4, span = Math.max(1, Math.min(nb, Math.round(p.w / bw)));
      var best = null;
      for (var s = 0; s + span <= nb; s++) {
        var cx = S.L + (s + span / 2) * bw; if (cx < S.L + half || cx > S.R - half) continue;
        var m = 0; for (var k = s; k < s + span; k++) m = Math.max(m, bins[k]);
        var score = m + Math.random() * bw * 0.5;
        if (!best || score < best.score) best = { score: score, s: s, cx: cx, m: m };
      }
      if (!best) return (S.L + S.R) / 2;
      var area = p.type === "img" ? p.side * p.side : p.cells.length * C * C;
      var add = area / (span * bw) / 0.72;                    // 빈틈을 감안한 예상 높이
      for (var q = best.s; q < best.s + span; q++) bins[q] = best.m + add;
      return best.cx;
    });
  }
  /* ---------- 시뮬레이션 루프 ---------- */
  function tick() {
    raf = 0;
    if (!running || !visible || !S) return;
    var vr = sec.getBoundingClientRect();
    if (vr.bottom < 0 || vr.top > window.innerHeight || sec.offsetParent === null) { visible = false; return; } // 화면 밖 → 정지
    var dt = 1000 / 60;
    S.simTime += dt;
    while (S.queue.length && S.queue[0].at <= S.simTime) { var q = S.queue.shift(); spawn(q.p, q.x); }
    // 3등분한 짧은 스텝으로 진행 → 빠르게 끌거나 던져도 블록끼리 파고들지 않음
    for (var sub = 0; sub < 3; sub++) { dragStep(); Engine.update(engine, dt / 3); }
    guard();
    // 오래 움직이면 서서히 감속시켜 끝없이 흔들리지 않게 함 (위치를 바꾸지 않고 속도만 줄임)
    var idle = S.simTime - S.lastAct;
    if (!drag && !S.queue.length && idle > 3500) {
      var k = idle > 6000 ? 0.86 : 0.95;
      S.pieces.forEach(function (p) { var b = p.body; if (!b) return; Body.setVelocity(b, { x: b.velocity.x * k, y: b.velocity.y }); Body.setAngularVelocity(b, b.angularVelocity * k); });
    }
    // 모든 블록이 무대 안으로 들어온 뒤에 천장을 닫음
    if (!S.ceiling && !S.queue.length && S.pieces.every(function (p) { return p.body && p.body.bounds.min.y > topLimit + 2; })) addCeiling();
    render();
    if (!S.queue.length && !drag && S.simTime > S.lastSpawn + 600) {
      var ms = maxSpeed();
      S.quiet = (ms.v < 0.15 && ms.a < 0.004) ? S.quiet + 1 : 0;
      var since = S.simTime - Math.max(S.lastSpawn, S.lastAct);
      if (S.quiet > 14 || (since > 1500 && ms.v < 0.5 && ms.a < 0.012) || (since > 2800 && ms.v < 1.2) || since > 9000) { settle(); return; }
    }
    raf = requestAnimationFrame(tick);
  }
  function addCeiling() {   // 닫히는 순간 겹쳐 있는 블록이 튕겨 나가지 않도록, 모두 천장 아래에 있을 때만 닫음
    if (S.ceiling || !S.pieces.every(function (p) { return p.body && p.body.bounds.min.y > topLimit + 1; })) return;
    S.ceiling = true; Composite.add(engine.world, wallSet()[3]);
  }
  // 벽·바닥이 막아 주므로 평소에는 작동하지 않는 안전장치(작동하면 teleports가 올라감)
  function guard() {
    S.pieces.forEach(function (p) {
      var b = p.body; if (!b) return;
      if (b.position.y > S.F + 80 || b.position.x < S.L - 80 || b.position.x > S.R + 80 || (S.ceiling && b.position.y < topLimit - 80)) {
        S.teleports++;
        Body.setPosition(b, { x: clamp((S.L + S.R) / 2, S.L + p.w / 2, S.R - p.w / 2), y: topLimit + p.h });
        Body.setVelocity(b, { x: 0, y: 1 }); Body.setAngularVelocity(b, 0);
        S.lastAct = S.simTime;
      }
    });
  }
  // 깊이 겹친 채 멈추려는 블록은 순간이동 대신 서로 멀어지는 속도를 줘서 자연스럽게 밀어냄
  function nudgeOverlaps() {
    var n = 0;
    for (var i = 0; i < S.pieces.length; i++) for (var j = i + 1; j < S.pieces.length; j++) {
      var a = S.pieces[i].body, b = S.pieces[j].body; if (!a || !b) continue;
      if (depthOf(a, b) > 5) {
        var dx = a.position.x - b.position.x, dy = a.position.y - b.position.y, len = Math.hypot(dx, dy) || 1;
        Body.setVelocity(a, { x: a.velocity.x + dx / len * 3, y: a.velocity.y + dy / len * 3 });
        Body.setVelocity(b, { x: b.velocity.x - dx / len * 3, y: b.velocity.y - dy / len * 3 });
        n++;
      }
    }
    return n;
  }
  /* 멈춤: 속도만 0으로 두고 엔진 루프를 쉰다. 위치·각도는 절대 건드리지 않는다. */
  function settle() {
    if ((S.nudges || 0) < 6 && nudgeOverlaps()) { S.nudges = (S.nudges || 0) + 1; S.quiet = 0; S.lastAct = S.simTime; raf = requestAnimationFrame(tick); return; }
    addCeiling();
    S.pieces.forEach(function (p) { if (p.body) { Body.setVelocity(p.body, { x: 0, y: 0 }); Body.setAngularVelocity(p.body, 0); } });
    running = false;
    render(); sec.classList.add("is-settled");
  }
  function start() { running = true; if (!raf && visible) raf = requestAnimationFrame(tick); }
  function stopLoop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

  /* ---------- 드래그와 던지기 (마우스·펜 즉시, 터치는 길게 눌러 잡기) ---------- */
  function stagePoint(e) {
    var r = sec.getBoundingClientRect();
    return { x: clamp(e.clientX - r.left, S.L + 8, S.R - 8), y: clamp(e.clientY - r.top, topLimit + 8, S.F - 8) };
  }
  function pieceOf(el) { if (!S) return null; for (var i = 0; i < S.pieces.length; i++) if (S.pieces[i].el === el) return S.pieces[i]; return null; }
  /* 잡은 블록은 스프링이 아니라 '속도 제한 추적'으로 끈다: 한 스텝에 움직일 수 있는 거리가 제한되어
     다른 블록을 뚫고 지나가지 못하고, 부딪히면 밀려난다 */
  function dragStep() {
    if (!drag || !drag.on || !drag.p.body) return;
    var b = drag.p.body, goal = { x: drag.target.x - drag.off.x, y: drag.target.y - drag.off.y };
    var dx = goal.x - b.position.x, dy = goal.y - b.position.y, dist = Math.hypot(dx, dy);
    var step = Math.min(dist * 0.5, C * 0.1);              // 스텝당 최대 이동 = 칸 크기의 10%
    var k = dist > 0.01 ? step / dist : 0;
    Body.setVelocity(b, { x: dx * k * 3, y: dy * k * 3 }); // 한 프레임 3스텝 → 속도 단위로 환산
    Body.setAngularVelocity(b, b.angularVelocity * 0.85);
  }
  function beginGrab(e) {
    var p = drag.p, b = p.body, p0 = stagePoint(e);
    drag.on = true; drag.target = p0; drag.off = { x: p0.x - b.position.x, y: p0.y - b.position.y };
    drag.samples = [{ t: performance.now(), x: e.clientX, y: e.clientY }];
    dragging = true; hidePeek();
    sec.classList.add("is-dragging"); sec.classList.remove("is-settled"); p.el.classList.remove("is-down"); p.el.classList.add("is-drag");
    try { p.el.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
    S.quiet = 0; S.lastAct = S.simTime; S.nudges = 0; start();
  }
  stage.addEventListener("pointerdown", function (e) {
    if (!S || mqReduce.matches || (e.pointerType === "mouse" && e.button !== 0)) return;
    var el = e.target.closest(".blk"); if (!el) return;
    var p = pieceOf(el); if (!p || !p.body) return;
    drag = { p: p, id: e.pointerId, sx: e.clientX, sy: e.clientY, on: false, g: gen, touch: e.pointerType === "touch", lastEv: e };
    if (!drag.touch) el.classList.add("is-down");
    else { // 터치: 0.28초 길게 누르면 잡힘 (그전에 움직이면 스크롤)
      var d0 = drag;
      hold = setTimeout(function () { hold = 0; if (drag === d0 && !d0.on && d0.g === gen && S && p.body) beginGrab(d0.lastEv); }, 280);
    }
  });
  window.addEventListener("pointermove", function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    if (drag.g !== gen || !S) { cancelDrag(); return; }
    drag.lastEv = e;
    if (!drag.on) {
      var moved = Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy);
      if (drag.touch) { if (moved > 10) { clearTimeout(hold); hold = 0; drag = null; } return; }
      if (moved < 7) return;
      beginGrab(e);
    }
    drag.target = stagePoint(e);
    var s = drag.samples; s.push({ t: performance.now(), x: e.clientX, y: e.clientY }); if (s.length > 8) s.shift();
    S.lastAct = S.simTime;
  });
  function pointerVelocity(d) { // 최근 90ms 안의 포인터 속도(px/ms)
    var s = d.samples, now = performance.now(), i = s.length - 1;
    if (i < 1) return { x: 0, y: 0 };
    var j = i; while (j > 0 && now - s[j - 1].t < 90) j--;
    var dt = Math.max(16, s[i].t - s[j].t);
    return { x: (s[i].x - s[j].x) / dt, y: (s[i].y - s[j].y) / dt };
  }
  function endDrag(e) {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    var d = drag; drag = null; clearTimeout(hold); hold = 0;
    d.p.el.classList.remove("is-down");
    if (!d.on) return;
    d.p.el.classList.remove("is-drag");
    dragging = false; sec.classList.remove("is-dragging");
    suppressClick = true; setTimeout(function () { suppressClick = false; }, 0);
    if (S && d.g === gen && d.p.body) {
      var b = d.p.body, v = pointerVelocity(d), k = 16.7 * 0.8;  // 마우스 속도(px/ms) → 한 스텝당 속도
      var vx = v.x * k, vy = v.y * k, sp = Math.hypot(vx, vy), max = 18;
      if (sp > max) { vx = vx / sp * max; vy = vy / sp * max; }
      Body.setVelocity(b, { x: vx, y: vy });
      // 잡은 지점이 무게중심에서 벗어나 있으면 던진 방향으로 빙글 돎
      var r2 = d.off.x * d.off.x + d.off.y * d.off.y + 1;
      Body.setAngularVelocity(b, clamp((d.off.x * vy - d.off.y * vx) / r2 * 0.9, -0.28, 0.28));
      S.quiet = 0; S.lastAct = S.simTime; start();
    }
  }
  function cancelDrag() {
    if (!drag) return;
    clearTimeout(hold); hold = 0;
    if (drag.on) drag.p.el.classList.remove("is-drag");
    drag.p.el.classList.remove("is-down");
    drag = null; dragging = false; sec.classList.remove("is-dragging");
  }
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", function (e) { if (drag && drag.on) endDrag(e); else cancelDrag(); });
  // 잡은 뒤에는 터치 스크롤 방지
  window.addEventListener("touchmove", function (e) { if (drag && drag.on && e.cancelable) e.preventDefault(); }, { passive: false });
  stage.addEventListener("contextmenu", function (e) { if (e.target.closest(".blk") && drag) e.preventDefault(); });
  stage.addEventListener("dragstart", function (e) { e.preventDefault(); });
  // 드래그 직후의 click은 이동하지 않음
  stage.addEventListener("click", function (e) { if (suppressClick) { e.preventDefault(); e.stopPropagation(); suppressClick = false; } }, true);

  /* ---------- 화면 밖에서는 정지 ---------- */
  function wake() { if (running && !raf) { var r = sec.getBoundingClientRect(); if (r.bottom > 0 && r.top < window.innerHeight && !document.hidden) { visible = true; raf = requestAnimationFrame(tick); } } }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (ents) { visible = ents[0].isIntersecting; if (visible) wake(); }, { threshold: 0.01 }).observe(sec);
  }
  window.addEventListener("scroll", wake, { passive: true });
  document.addEventListener("jl:view", wake);
  document.addEventListener("visibilitychange", function () { visible = !document.hidden; if (visible) wake(); });

  /* ---------- 실행 정리: 모든 것을 처음 상태로 ---------- */
  function teardown() {
    gen++;
    stopLoop();
    timers.forEach(clearTimeout); timers = [];
    cancelDrag(); suppressClick = false;
    hidePeek();
    Composite.clear(engine.world, false);
    board.replaceChildren();
    sec.classList.remove("is-settled", "is-dragging");
    S = null;
  }
  function newRun(animate) {
    teardown();
    var plan = null;
    for (var attempt = 0; attempt < 3 && !plan; attempt++) plan = chooseLayout();
    if (!plan || !plan.pieces.length) throw new Error("layout failed");
    C = plan.C;
    S = { gen: gen, fill: plan.fill, L: plan.L, R: plan.R, F: plan.F, pieces: plan.pieces, queue: [], simTime: 0, lastSpawn: 0, lastAct: 0, quiet: 0, ceiling: false, teleports: 0, nudges: 0 };
    sec.style.setProperty("--C", C + "px"); sec.style.setProperty("--G", G + "px");
    S.pieces.forEach(function (p) { p.body = null; board.appendChild(buildEl(p)); });
    var ws = wallSet(); Composite.add(engine.world, ws.slice(0, 3));       // 바닥 · 좌 · 우 벽은 처음부터
    againBtn.hidden = false;
    var order = S.pieces.slice().sort(function (a, b) { return (b.w * b.h) - (a.w * a.h) + (Math.random() - 0.5) * 20000; }), xs = planX(order);   // 큰 블록부터
    if (animate && !mqReduce.matches) {
      // 블록을 약 0.25초 간격으로 한 개씩 생성 → 중력과 충돌만으로 쌓임
      var gap = 250;
      S.queue = order.map(function (p, i) { return { at: 120 + i * gap, p: p, x: xs[i] }; });
      S.lastSpawn = S.queue[S.queue.length - 1].at;
      render(); start();
    } else {
      // 모션 감소·창 크기 변경: 연출 없이 같은 물리 규칙으로 미리 감아서 쌓인 상태를 만든 뒤 한 번만 그림
      order.forEach(function (p, i) {
        spawn(p, xs[i]);
        for (var k = 0; k < 90; k++) Engine.update(engine, 1000 / 60);   // 다음 블록이 생기기 전에 충분히 떨어지게
      });
      for (var n = 0; n < 700; n++) Engine.update(engine, 1000 / 60);
      S.pieces.forEach(function (p) { Body.setVelocity(p.body, { x: 0, y: 0 }); Body.setAngularVelocity(p.body, 0); });
      addCeiling(); render(); sec.classList.add("is-settled");
    }
  }

  /* ---------- DROP AGAIN: 언제 눌러도 처음부터 ---------- */
  againBtn.addEventListener("click", function () { try { newRun(true); } catch (err) { fallback(err); } });

  /* ---------- 리사이즈: 연출 없이 다시 구성 ---------- */
  var lastW = 0, lastH = 0, rt = 0;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      if (Math.abs(stage.clientWidth - lastW) < 30 && Math.abs(stage.clientHeight - lastH) < 120) return;
      lastW = stage.clientWidth; lastH = stage.clientHeight;
      try { newRun(false); } catch (err) { fallback(err); }
    }, 240);
  });

  /* ---------- 시작 / 실패 시 정적 블록 ---------- */
  function fallback(err) {
    teardown();
    sec.classList.remove("is-live"); sec.classList.add("is-static");
    listEl.hidden = false; againBtn.hidden = true;
    if (window.console) console.warn("drop stage fallback:", err);
  }
  function boot() {
    sec.classList.add("is-live");
    listEl.hidden = true;
    lastW = stage.clientWidth; lastH = stage.clientHeight;
    newRun(true);
  }
  var booted = false;
  function go() { if (booted) return; booted = true; try { boot(); } catch (err) { fallback(err); } }
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(go); setTimeout(go, 1500); } else go();
})();
