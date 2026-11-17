/* ============================================================
   FLORA VILLE — main.js
   arrival · reveals · header · sheet · i18n · THE ROUND
   hole viewer (phones) · tee-time sheet · map · gallery · QA
   ============================================================ */
(function () {
  "use strict";
  var docEl = document.documentElement;
  var Q = new URLSearchParams(window.location.search);
  var SHOT = Q.has("shot") || Q.has("p");
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SMALL = window.matchMedia("(max-width: 820px)");

  /* ============================================================
     COURSE DATA — card as published by the club (floravillegolf.com,
     checked Nov 2026); hole 7 par corrected 5→4 per the club's own
     per-tee totals (par 72 all tees) and every independent source.
     ============================================================ */
  var HOLES = [
    { n: 1,  par: 4, y: [398, 371, 339, 315], img: "img/hole-out-1.webp" },
    { n: 2,  par: 4, y: [343, 321, 292, 261], img: "img/hole-out-2.webp", wet: 1, cross: 1 },
    { n: 3,  par: 5, y: [503, 478, 428, 391], img: "img/hole-out-3.webp", wet: 1 },
    { n: 4,  par: 3, y: [203, 168, 167, 121], img: "img/hole-out-4.webp" },
    { n: 5,  par: 4, y: [384, 355, 322, 288], img: "img/hole-out-5.webp", wet: 1 },
    { n: 6,  par: 3, y: [173, 142, 110, 110], img: "img/hole-out-6.webp", wet: 1, feat: 1 },
    { n: 7,  par: 4, y: [401, 372, 338, 300], img: "img/hole-out-7.webp", wet: 1, cross: 1 },
    { n: 8,  par: 4, y: [457, 402, 382, 349], img: "img/hole-out-8.webp", feat: 1 },
    { n: 9,  par: 5, y: [504, 478, 426, 402], img: "img/hole-out-9.webp", wet: 1 },
    { n: 10, par: 4, y: [422, 390, 350, 320], img: "img/hole-in-1.webp" },
    { n: 11, par: 4, y: [314, 293, 270, 239], img: "img/hole-in-2.webp" },
    { n: 12, par: 5, y: [528, 496, 449, 424], img: "img/hole-in-3.webp", wet: 1, cross: 1, feat: 1 },
    { n: 13, par: 4, y: [376, 348, 326, 285], img: "img/hole-in-4.webp", wet: 1 },
    { n: 14, par: 3, y: [176, 157, 144, 131], img: "img/hole-in-5.webp", wet: 1 },
    { n: 15, par: 4, y: [394, 366, 337, 295], img: "img/hole-in-6.webp", wet: 1, cross: 1 },
    { n: 16, par: 4, y: [419, 397, 361, 324], img: "img/hole-in-7.webp", wet: 1 },
    { n: 17, par: 3, y: [183, 160, 144, 128], img: "img/hole-in-8.webp" },
    { n: 18, par: 5, y: [550, 515, 475, 423], img: "img/hole-in-9.webp", wet: 1, cross: 1, feat: 1 }
  ];
  var ALT = {
    en: function (h) { return "Aerial plan of hole " + h.n + ", par " + h.par + ", " + h.y[0] + " yards from the blue tees"; },
    th: function (h) { return "แปลนมุมสูงของหลุม " + h.n + " พาร์ " + h.par + " ระยะ " + h.y[0] + " หลาจากแท่นทีสีน้ำเงิน"; }
  };

  /* ---------- shot / QA mode ---------- */
  if (SHOT) {
    document.body.classList.add("shot");
    if (Q.get("shot") === "full") document.body.classList.add("shot-full");
  }

  /* ============================================================
     ARRIVAL — the mark draws itself, then lifts away
     ============================================================ */
  var loaderEl = document.getElementById("loader");
  if (SHOT || REDUCED || !loaderEl) {
    document.body.classList.add("is-arrived");
  } else {
    document.body.classList.add("is-arrive");
    setTimeout(function () {
      loaderEl.classList.add("is-lift");
      setTimeout(function () { document.body.classList.add("is-arrived"); }, 720);
    }, 1700);
  }

  /* ---------- boot ---------- */
  window.addEventListener("load", function () { document.body.classList.add("is-ready"); });
  setTimeout(function () { document.body.classList.add("is-ready"); }, 900);

  /* ============================================================
     REVEALS
     ============================================================ */
  var revealTargets = [];
  document.querySelectorAll(".hero-title,.disp").forEach(function (el) { revealTargets.push(el); });
  [".hero-copy", ".hero-fig", ".hero-meta", ".stats-row", ".course-text", ".course-fig-a", ".course-fig-b",
   ".round-sub", ".round-hint", ".round-hint-m", ".water-rule", ".water-fig", ".flora-a", ".flora-b", ".flora-p",
   ".night-copy", ".night-fig", ".club-lede", ".ccard", ".plan-col", ".heard-card",
   ".dayrail", ".plan-chips", ".gal-cap", ".map",
   ".visit-lede", ".visit-actions", ".visit-facts", ".strip-cap", ".hero-kicker", ".label"]
    .forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) { el.classList.add("rise"); revealTargets.push(el); });
    });

  if (SHOT || REDUCED || !("IntersectionObserver" in window)) {
    revealTargets.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    revealTargets.forEach(function (el) { io.observe(el); });
  }

  /* ============================================================
     HEADER + FLOATING ACTIONS + DAY TINT — one scroll loop
     ============================================================ */
  var hdr = document.getElementById("hdr");
  var fabTop = document.getElementById("fabTop");
  var fabBook = document.getElementById("fabBook");
  var lastY = window.scrollY, ticking = false;
  function onScroll() {
    var y = window.scrollY;
    var vh = window.innerHeight;
    hdr.classList.toggle("is-scrolled", y > 24);
    if (!document.body.classList.contains("sheet-open")) {
      if (y > lastY && y > 160) hdr.classList.add("is-hidden");
      else hdr.classList.remove("is-hidden");
    }
    var fabOn = y > vh * 1.1;
    if (fabTop) fabTop.classList.toggle("is-on", fabOn);
    if (fabBook) fabBook.classList.toggle("is-on", fabOn);
    var span = Math.max(1, docEl.scrollHeight - vh);
    docEl.style.setProperty("--daymix", (Math.min(1, Math.max(0, y / span))).toFixed(3));
    maybeInitMap(y, vh);
    lastY = y;
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener("load", onScroll);

  /* ============================================================
     MOBILE NAV SHEET
     ============================================================ */
  var burger = document.getElementById("burger");
  var sheet = document.getElementById("sheet");
  function setSheet(open) {
    document.body.classList.toggle("sheet-open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    sheet.setAttribute("aria-hidden", open ? "false" : "true");
    if (open) hdr.classList.remove("is-hidden");
  }
  burger.addEventListener("click", function () { setSheet(!document.body.classList.contains("sheet-open")); });
  if (Q.get("menu") === "1") { window.addEventListener("load", function () { setSheet(true); }); }
  sheet.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setSheet(false); }); });

  /* ============================================================
     FULL SCORECARD TABLE
     ============================================================ */
  var TH_LBL = { out: { en: "Out", th: "เอาต์" }, inn: { en: "In", th: "อิน" }, tot: { en: "Total", th: "รวม" } };
  function buildScore() {
    var tb = document.getElementById("scoreBody");
    if (!tb) return;
    var lang = document.body.getAttribute("data-lang") || "en";
    var html = "";
    var sums = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
    HOLES.forEach(function (h, i) {
      var s = sums[i < 9 ? 0 : 1];
      s[0] += h.par; for (var k = 0; k < 4; k++) s[k + 1] += h.y[k];
      html += "<tr><td>" + h.n + "</td><td>" + h.par + "</td><td>" + h.y[0] + "</td><td>" + h.y[1] + "</td><td>" + h.y[2] + "</td><td>" + h.y[3] + "</td><td>" + (h.wet ? '<span class="sc-wdot" role="img" aria-label="water in play"></span>' : "") + "</td></tr>";
      if (i === 8) html += subRow(TH_LBL.out[lang], sums[0]);
      if (i === 17) {
        html += subRow(TH_LBL.inn[lang], sums[1]);
        var t = sums[0].map(function (v, j) { return v + sums[1][j]; });
        html += subRow(TH_LBL.tot[lang], t);
      }
    });
    tb.innerHTML = html;
  }
  function subRow(name, s) {
    return '<tr class="is-sub"><td>' + name + "</td><td>" + s[0] + "</td><td>" + s[1] + "</td><td>" + s[2] + "</td><td>" + s[3] + "</td><td>" + s[4] + "</td><td></td></tr>";
  }
  buildScore();

  /* ============================================================
     THE ROUND — scrub on desktop, hole viewer in mode-cards
     ============================================================ */
  var stage = document.getElementById("roundStage");
  var imgBox = document.getElementById("rImgBox");
  var rcHoles = document.getElementById("rcHoles");
  var rNum = document.querySelector("#rNum .rn-cur");
  var rPar = document.getElementById("rPar");
  var rWet = document.getElementById("rWet");
  var tCells = [document.getElementById("tB"), document.getElementById("tW"), document.getElementById("tY"), document.getElementById("tR")];
  var rcOut = document.getElementById("rcOut");
  var rcIn = document.getElementById("rcIn");
  var rmPrev = document.getElementById("rmPrev");
  var rmNext = document.getElementById("rmNext");
  var notes = Array.prototype.slice.call(document.querySelectorAll(".round-note"));

  var W = HOLES.map(function (h) { return h.feat ? 2.7 : 1; });
  var WTOT = W.reduce(function (a, b) { return a + b; }, 0);
  var CUM = []; W.reduce(function (a, b, i) { CUM[i] = a + b; return a + b; }, 0);

  var rimgs = [];
  var rimgImgs = [];
  var chipBtns = [];
  function buildRound() {
    var lang = document.body.getAttribute("data-lang") || "en";
    HOLES.forEach(function (h, i) {
      var d = document.createElement("div");
      d.className = "rimg";
      var im = document.createElement("img");
      im.src = h.img;
      im.alt = ALT[lang](h);
      im.loading = i < 3 ? "eager" : "lazy";
      im.decoding = "async";
      d.appendChild(im);
      imgBox.appendChild(d);
      rimgs.push(d);
      rimgImgs.push(im);

      var li = document.createElement("li");
      li.className = "rc-h" + (h.wet ? " is-wet" : "");
      var b = document.createElement("button");
      b.type = "button";
      b.className = "rc-b";
      b.innerHTML = '<span class="rc-n">' + h.n + '</span><span class="rc-p">' + h.par + '</span><span class="rc-w"></span>';
      b.addEventListener("click", function () { goToHole(i); });
      li.appendChild(b);
      rcHoles.appendChild(li);
      chipBtns.push(b);
    });
    labelChips(lang);
  }
  function labelChips(lang) {
    chipBtns.forEach(function (b, i) {
      var h = HOLES[i];
      b.setAttribute("aria-label", lang === "th"
        ? "ไปที่หลุม " + h.n + " พาร์ " + h.par
        : "Go to hole " + h.n + ", par " + h.par);
    });
  }
  /* arrow keys walk the card while a chip is focused */
  rcHoles.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var cur = e.target && e.target.closest ? e.target.closest(".rc-b") : null;
    var idx = chipBtns.indexOf(cur);
    if (idx < 0) return;
    var next = idx + (e.key === "ArrowRight" ? 1 : -1);
    if (next < 0 || next >= chipBtns.length) return;
    e.preventDefault();
    chipBtns[next].focus();
    chipBtns[next].click();
  });
  buildRound();
  var chips = Array.prototype.slice.call(rcHoles.children);

  function centerChip(i) {
    var li = chips[i];
    if (!li || !rcHoles.scrollTo) return;
    if (rcHoles.scrollWidth <= rcHoles.clientWidth + 4) return;
    rcHoles.scrollTo({ left: li.offsetLeft - rcHoles.clientWidth / 2 + li.offsetWidth / 2, behavior: SHOT ? "auto" : "smooth" });
  }

  var curHole = -1;
  function applyRound(p) {
    p = Math.min(1, Math.max(0, p));
    var u = p * WTOT;
    var i = 0;
    while (i < 17 && u > CUM[i]) i++;
    var h = HOLES[i];

    if (i !== curHole) {
      curHole = i;
      rNum.textContent = h.n;
      rPar.textContent = h.par;
      for (var k = 0; k < 4; k++) tCells[k].textContent = h.y[k];
      rWet.classList.toggle("is-on", !!h.wet);
      notes.forEach(function (nEl) { nEl.classList.toggle("is-on", +nEl.getAttribute("data-hole") === h.n); });
      chips.forEach(function (c, j) {
        c.classList.toggle("is-done", j < i);
        c.classList.toggle("is-cur", j === i);
        chipBtns[j].setAttribute("aria-current", j === i ? "true" : "false");
      });
      rcOut.classList.toggle("is-done", i >= 9);
      rimgImgs.forEach(function (im, j) {
        if (Math.abs(j - i) <= 1 && im.loading === "lazy") im.loading = "eager";
      });
      if (rmPrev) rmPrev.disabled = i === 0;
      if (rmNext) rmNext.disabled = i === 17;
      if (document.body.classList.contains("mode-cards")) centerChip(i);
    }
    rcIn.classList.toggle("is-done", p > 0.985 || (!scrubActive && i === 17));

    /* crossfade around hole boundaries */
    var start = i === 0 ? 0 : CUM[i - 1];
    var local = (u - start) / W[i];
    var FADE = 0.3;
    rimgs.forEach(function (d, j) {
      var o = 0, ty = 0, sc = 1;
      if (j === i) {
        o = i === 0 ? 1 : Math.min(1, local / FADE);
        ty = (1 - o) * 40;
        sc = h.feat ? 0.94 + 0.06 * Math.min(1, local * 1.6) : 0.97 + 0.03 * o;
      } else if (j === i - 1) {
        o = Math.max(0, 1 - local / FADE);
        ty = -(1 - o) * 30;
      }
      d.style.opacity = o;
      d.style.transform = "translateY(" + ty + "px) scale(" + sc + ")";
    });
  }
  window.__fvSet = function (p) { applyRound(p); };

  /* ---------- click-to-hole navigation ---------- */
  var scrubActive = false;
  var scrollAnim = 0;
  function instantScroll(y) {
    try { window.scrollTo({ top: y, behavior: "instant" }); }
    catch (err) { window.scrollTo(0, y); }
  }
  function animateScroll(toY) {
    var id = ++scrollAnim;
    var fromY = window.scrollY, d = toY - fromY;
    if (Math.abs(d) < 2) return;
    var T = Math.min(1100, 420 + Math.abs(d) * 0.1), t0 = null;
    function step(ts) {
      if (scrollAnim !== id) return;
      if (t0 === null) t0 = ts;
      var t = Math.min(1, (ts - t0) / T);
      var e = 1 - Math.pow(1 - t, 4);
      instantScroll(Math.round(fromY + d * e));
      if (t < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }
  window.addEventListener("wheel", function () { scrollAnim++; }, { passive: true });
  window.addEventListener("touchstart", function () { scrollAnim++; }, { passive: true });
  function holeTargetP(i) {
    var start = i === 0 ? 0 : CUM[i - 1];
    return (start + 0.5 * W[i]) / WTOT;
  }
  function goToHole(i) {
    i = Math.min(17, Math.max(0, i));
    var p = holeTargetP(i);
    if (scrubActive) {
      var top = stage.getBoundingClientRect().top + window.scrollY;
      var dist = stage.offsetHeight - window.innerHeight;
      animateScroll(Math.round(top + p * dist));
    } else {
      applyRound(p);
    }
  }
  if (rmPrev) rmPrev.addEventListener("click", function () { goToHole(curHole - 1); });
  if (rmNext) rmNext.addEventListener("click", function () { goToHole(curHole + 1); });

  /* swipe the plan (hole viewer) */
  (function () {
    var sx = 0, sy = 0, live = false;
    imgBox.addEventListener("touchstart", function (e) {
      if (!document.body.classList.contains("mode-cards")) return;
      var t = e.changedTouches[0]; sx = t.clientX; sy = t.clientY; live = true;
    }, { passive: true });
    imgBox.addEventListener("touchend", function (e) {
      if (!live) return;
      live = false;
      var t = e.changedTouches[0];
      var dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
      goToHole(curHole + (dx < 0 ? 1 : -1));
    }, { passive: true });
  })();

  if (Q.has("clickhole")) {
    window.addEventListener("load", function () {
      var n = Math.min(18, Math.max(1, parseInt(Q.get("clickhole"), 10) || 1));
      setTimeout(function () { goToHole(n - 1); }, 600);
      setTimeout(function () {
        var d = document.createElement("div");
        d.id = "qaclick";
        d.setAttribute("hidden", "");
        d.textContent = JSON.stringify({ scrollY: Math.round(window.scrollY), hole: rNum.textContent, scrub: scrubActive, anim: scrollAnim });
        document.body.appendChild(d);
      }, 2800);
    });
  }

  if (Q.has("probe")) {
    setTimeout(function () {
      var r = function (el) { if (!el) return null; var b = el.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; };
      var cur = Math.max(0, curHole);
      var im = rimgImgs[cur];
      var d = document.createElement("div");
      d.id = "qaprobe";
      d.setAttribute("hidden", "");
      d.textContent = JSON.stringify({
        hole: cur + 1,
        right: r(document.querySelector(".round-right")),
        box: r(imgBox),
        rimg: r(rimgs[cur]),
        img: r(im),
        complete: im ? im.complete : null,
        loading: im ? im.loading : null,
        nat: im ? [im.naturalWidth, im.naturalHeight] : null,
        opacity: rimgs[cur] ? rimgs[cur].style.opacity : null
      });
      document.body.appendChild(d);
    }, 700);
  }

  function modeCards(on) {
    document.body.classList.toggle("mode-cards", on);
  }

  function initRound() {
    if (REDUCED || SMALL.matches) {
      modeCards(true);
      applyRound(SHOT ? parseFloat(Q.get("p") || "0") : 0);
      return;
    }
    modeCards(false);
    if (SHOT) { applyRound(parseFloat(Q.get("p") || "0")); return; }
    if (!window.gsap || !window.ScrollTrigger) { applyRound(0); return; }
    if (scrubActive) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({
      trigger: stage,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
      onUpdate: function (self) { applyRound(self.progress); }
    });
    scrubActive = true;
    applyRound(0);
  }

  /* ============================================================
     PARALLAX (strip + night bg) — gsap only
     ============================================================ */
  function initParallax() {
    if (SHOT || REDUCED || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll(".strip-imgwrap img, .night-bg img").forEach(function (im) {
      gsap.fromTo(im, { yPercent: -12 }, {
        yPercent: 0, ease: "none",
        scrollTrigger: { trigger: im.parentElement, start: "top bottom", end: "bottom top", scrub: true }
      });
    });
  }

  function whenGsap(fn) {
    if (window.gsap && window.ScrollTrigger) { fn(); return; }
    var tries = 0;
    var t = setInterval(function () {
      tries++;
      if ((window.gsap && window.ScrollTrigger) || tries > 40) { clearInterval(t); fn(); }
    }, 100);
  }
  whenGsap(function () { initRound(); initParallax(); });
  SMALL.addEventListener ? SMALL.addEventListener("change", function () { initRound(); }) : SMALL.addListener(function () { initRound(); });

  /* ============================================================
     DRIFTING GALLERY
     ============================================================ */
  (function () {
    var gal = document.querySelector(".gal");
    var track = document.getElementById("galTrack");
    if (!gal || !track) return;
    if (REDUCED || SHOT) { gal.classList.add("is-static"); return; }
    var kids = Array.prototype.slice.call(track.children);
    kids.forEach(function (k) { track.appendChild(k.cloneNode(true)); });
    var x = 0, half = 0, paused = false, last = null;
    function measure() { half = track.scrollWidth / 2; }
    window.addEventListener("load", measure);
    window.addEventListener("resize", measure);
    measure();
    track.addEventListener("pointerenter", function () { paused = true; });
    track.addEventListener("pointerleave", function () { paused = false; });
    track.addEventListener("touchstart", function () { paused = true; }, { passive: true });
    track.addEventListener("touchend", function () { setTimeout(function () { paused = false; }, 1400); }, { passive: true });
    function tick(ts) {
      if (last === null) last = ts;
      var dt = Math.min(64, ts - last);
      last = ts;
      if (!paused && half > 10) {
        x -= dt * 0.022;
        if (-x >= half) x += half;
        track.style.transform = "translateX(" + x.toFixed(1) + "px)";
      }
      window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);
  })();

  /* ============================================================
     TEE TIME SHEET — composes a real booking message
     ============================================================ */
  var bsheet = document.getElementById("bsheet");
  var bsDate = document.getElementById("bsDate");
  var bsWin = document.getElementById("bsWin");
  var bsPlayers = document.getElementById("bsPlayers");
  var bsName = document.getElementById("bsName");
  var bsMsg = document.getElementById("bsMsg");
  var bsMail = document.getElementById("bsMail");
  var bsLine = document.getElementById("bsLine");
  var bsNote = document.getElementById("bsNote");
  var bsOpener = null;
  var bsNoteBase = "";

  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  (function () {
    if (!bsDate) return;
    var t = new Date(Date.now() + 86400000);
    var iso = t.getFullYear() + "-" + pad2(t.getMonth() + 1) + "-" + pad2(t.getDate());
    bsDate.value = iso;
    bsDate.min = iso;
  })();

  function composeMsg() {
    if (!bsMsg) return "";
    var lang = document.body.getAttribute("data-lang") || "en";
    var d = bsDate && bsDate.value ? new Date(bsDate.value + "T12:00:00") : new Date(Date.now() + 86400000);
    var dateTxt = d.toLocaleDateString(lang === "th" ? "th-TH" : "en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    var winTxt = bsWin ? bsWin.options[bsWin.selectedIndex].textContent : "";
    var n = bsPlayers ? bsPlayers.value : "4";
    var name = bsName && bsName.value.trim() ? bsName.value.trim() : "";
    var msg = lang === "th"
      ? "สวัสดีค่ะ/ครับ ฟลอร่าวิลล์ ขอจองทีไทม์วัน" + dateTxt + " ช่วง" + winTxt + " ผู้เล่น " + n + " ท่าน" + (name ? " ในนาม " + name : "") + " รบกวนยืนยันเวลาด้วยนะคะ/ครับ"
      : "Hello Flora Ville, I would like to book a tee time on " + dateTxt + ", " + winTxt.toLowerCase() + ", for " + n + " players" + (name ? ". Name: " + name : "") + ". Please confirm a time. Thank you.";
    bsMsg.textContent = msg;
    if (bsMail) {
      var sub = lang === "th" ? "ขอจองทีไทม์ " + dateTxt : "Tee time request, " + dateTxt;
      bsMail.href = "mailto:sale.1@floravillegolf.com?subject=" + encodeURIComponent(sub) + "&body=" + encodeURIComponent(msg);
    }
    return msg;
  }
  ["change", "input"].forEach(function (ev) {
    [bsDate, bsWin, bsPlayers, bsName].forEach(function (el) {
      if (el) el.addEventListener(ev, composeMsg);
    });
  });

  function openSheet(opener) {
    if (!bsheet) return;
    bsOpener = opener || null;
    bsheet.hidden = false;
    composeMsg();
    requestAnimationFrame(function () {
      bsheet.classList.add("is-open");
      document.body.classList.add("bs-open");
      if (bsDate) bsDate.focus();
    });
  }
  function closeSheet() {
    if (!bsheet || bsheet.hidden) return;
    bsheet.classList.remove("is-open");
    document.body.classList.remove("bs-open");
    setTimeout(function () { bsheet.hidden = true; }, 500);
    if (bsOpener && bsOpener.focus) bsOpener.focus();
  }
  document.addEventListener("click", function (e) {
    var b = e.target && e.target.closest ? e.target.closest("[data-book]") : null;
    if (b) {
      e.preventDefault();
      if (document.body.classList.contains("sheet-open")) setSheet(false);
      openSheet(b);
    }
  });
  var bsClose = document.getElementById("bsClose");
  var bsBackdrop = document.getElementById("bsBackdrop");
  if (bsClose) bsClose.addEventListener("click", closeSheet);
  if (bsBackdrop) bsBackdrop.addEventListener("click", closeSheet);
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (bsheet && !bsheet.hidden) { closeSheet(); return; }
    setSheet(false);
  });
  if (bsNote) bsNoteBase = bsNote.textContent;
  function flashNote(txt) {
    if (!bsNote) return;
    bsNote.textContent = txt;
    bsNote.classList.add("is-flash");
    setTimeout(function () {
      bsNote.classList.remove("is-flash");
      var lang = document.body.getAttribute("data-lang") || "en";
      var dict = (lang === "th" && window.FV_TH) ? window.FV_TH : null;
      bsNote.textContent = dict && dict["bs.note"] ? dict["bs.note"] : bsNoteBase;
    }, 2600);
  }
  function copyText(txt, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(done, function () { legacyCopy(txt); done(); });
    } else { legacyCopy(txt); done(); }
  }
  function legacyCopy(txt) {
    var ta = document.createElement("textarea");
    ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (err) {}
    document.body.removeChild(ta);
  }
  if (bsLine) bsLine.addEventListener("click", function () {
    var msg = composeMsg();
    copyText(msg, function () {
      var lang = document.body.getAttribute("data-lang") || "en";
      flashNote(lang === "th" ? "คัดลอกแล้ว นำไปวางในไลน์ได้เลย" : "Copied. Paste it in LINE.");
      setTimeout(function () { window.open("https://line.me/R/ti/p/@floravillegolf", "_blank", "noopener"); }, 350);
    });
  });

  if (fabTop) fabTop.addEventListener("click", function () { scrollAnim++; animateScroll(0); });

  /* ============================================================
     MAP — free movement, satellite, the whole province if you like
     Esri World Imagery tiles; graceful card when tiles can't load
     (artifact pages block outside hosts).
     ============================================================ */
  var MAPC = { lat: 13.9725, lon: 100.5038 };
  var mapInited = false;
  var mapEl = document.getElementById("fvMap");
  function maybeInitMap(y, vh) {
    if (mapInited || !mapEl) return;
    var top = mapEl.getBoundingClientRect().top;
    if (top < vh * 1.6) initMap();
  }
  if (SHOT) { window.addEventListener("load", function () { initMap(); }); }
  window.addEventListener("load", function () { maybeInitMap(window.scrollY, window.innerHeight); });

  function initMap() {
    if (mapInited || !mapEl) return;
    mapInited = true;
    var stageEl = document.getElementById("mapStage");
    var canvas = document.getElementById("mapCanvas");
    var pin = document.getElementById("mapPin");
    var hint = document.getElementById("mapHint");
    var fb = document.getElementById("mapFallback");
    if (!stageEl || !canvas) return;
    var ctx = canvas.getContext("2d");
    var view = { lat: MAPC.lat, lon: MAPC.lon, z: 14.6 };
    var ZMIN = 3, ZMAX = 18.4;
    var TS = 256;
    var cache = {};
    var okTiles = 0, badTiles = 0, dead = false;
    var needsDraw = true;

    function url(z, x, yy) {
      return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/" + z + "/" + yy + "/" + x;
    }
    function lon2x(lon, z) { return (lon + 180) / 360 * Math.pow(2, z) * TS; }
    function lat2y(lat, z) {
      var s = Math.sin(lat * Math.PI / 180);
      s = Math.min(.9999, Math.max(-.9999, s));
      return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * Math.pow(2, z) * TS;
    }
    function x2lon(x, z) { return x / (Math.pow(2, z) * TS) * 360 - 180; }
    function y2lat(y, z) {
      var n = Math.PI - 2 * Math.PI * y / (Math.pow(2, z) * TS);
      return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
    }
    function tile(z, x, yy) {
      var max = Math.pow(2, z);
      x = ((x % max) + max) % max;
      if (yy < 0 || yy >= max) return null;
      var k = z + "/" + x + "/" + yy;
      var t = cache[k];
      if (t) return t;
      t = { img: new Image(), ok: false };
      t.img.crossOrigin = "anonymous";
      t.img.onload = function () { t.ok = true; okTiles++; needsDraw = true; };
      t.img.onerror = function () {
        badTiles++;
        if (!okTiles && badTiles >= 4 && !dead) { dead = true; fallback(); }
      };
      t.img.src = url(z, x, yy);
      cache[k] = t;
      return t;
    }
    function fallback() {
      if (fb) { fb.hidden = false; }
      stageEl.hidden = true;
    }
    function size() {
      var r = stageEl.getBoundingClientRect();
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      canvas._w = r.width; canvas._h = r.height; canvas._dpr = dpr;
      needsDraw = true;
    }
    window.addEventListener("resize", size);
    size();

    function draw() {
      if (!needsDraw || dead) return;
      needsDraw = false;
      var w = canvas._w, h = canvas._h, dpr = canvas._dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#15241c";
      ctx.fillRect(0, 0, w, h);
      var fz = Math.max(ZMIN, Math.min(18, Math.floor(view.z)));
      var scale = Math.pow(2, view.z - fz);
      var cx = lon2x(view.lon, fz), cy = lat2y(view.lat, fz);
      var tsz = TS * scale;
      var x0 = Math.floor((cx - (w / 2) / scale) / TS);
      var x1 = Math.floor((cx + (w / 2) / scale) / TS);
      var y0 = Math.floor((cy - (h / 2) / scale) / TS);
      var y1 = Math.floor((cy + (h / 2) / scale) / TS);
      for (var tx = x0; tx <= x1; tx++) {
        for (var ty = y0; ty <= y1; ty++) {
          var t = tile(fz, tx, ty);
          if (!t || !t.ok) continue;
          var sx = (tx * TS - cx) * scale + w / 2;
          var sy = (ty * TS - cy) * scale + h / 2;
          ctx.drawImage(t.img, sx, sy, tsz + 0.6, tsz + 0.6);
        }
      }
      if (pin) {
        var px = (lon2x(MAPC.lon, fz) - cx) * scale + w / 2;
        var py = (lat2y(MAPC.lat, fz) - cy) * scale + h / 2;
        pin.style.left = px + "px";
        pin.style.top = py + "px";
        pin.style.display = (px < -80 || px > w + 80 || py < -80 || py > h + 80) ? "none" : "flex";
      }
    }
    (function loop() { draw(); window.requestAnimationFrame(loop); })();

    function panPx(dx, dy) {
      var fz = Math.max(ZMIN, Math.min(18, Math.floor(view.z)));
      var scale = Math.pow(2, view.z - fz);
      var cx = lon2x(view.lon, fz) - dx / scale;
      var cy = lat2y(view.lat, fz) - dy / scale;
      view.lon = x2lon(cx, fz);
      view.lat = y2lat(cy, fz);
      needsDraw = true;
      offHint();
    }
    function zoomAt(dz, px, py) {
      var w = canvas._w, h = canvas._h;
      var nz = Math.max(ZMIN, Math.min(ZMAX, view.z + dz));
      if (nz === view.z) return;
      var fz = Math.max(ZMIN, Math.min(18, Math.floor(view.z)));
      var scale = Math.pow(2, view.z - fz);
      var cx = lon2x(view.lon, fz), cy = lat2y(view.lat, fz);
      var wx = cx + (px - w / 2) / scale;
      var wy = cy + (py - h / 2) / scale;
      var lat = y2lat(wy, fz), lon = x2lon(wx, fz);
      view.z = nz;
      var fz2 = Math.max(ZMIN, Math.min(18, Math.floor(view.z)));
      var s2 = Math.pow(2, view.z - fz2);
      var cx2 = lon2x(lon, fz2) - (px - w / 2) / s2;
      var cy2 = lat2y(lat, fz2) - (py - h / 2) / s2;
      view.lon = x2lon(cx2, fz2);
      view.lat = y2lat(cy2, fz2);
      needsDraw = true;
      offHint();
    }
    var hinted = false;
    function offHint() {
      if (hinted || !hint) return;
      hinted = true;
      hint.classList.add("is-off");
    }

    var pts = {};
    var lastPinch = 0;
    stageEl.addEventListener("pointerdown", function (e) {
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      stageEl.setPointerCapture(e.pointerId);
    });
    stageEl.addEventListener("pointermove", function (e) {
      var p = pts[e.pointerId];
      if (!p) return;
      var ids = Object.keys(pts);
      if (ids.length === 1) {
        panPx(e.clientX - p.x, e.clientY - p.y);
        p.x = e.clientX; p.y = e.clientY;
      } else if (ids.length === 2) {
        var o = pts[ids[0] === String(e.pointerId) ? ids[1] : ids[0]];
        var d0 = Math.hypot(p.x - o.x, p.y - o.y);
        p.x = e.clientX; p.y = e.clientY;
        var d1 = Math.hypot(p.x - o.x, p.y - o.y);
        if (d0 > 0) {
          var r = stageEl.getBoundingClientRect();
          zoomAt(Math.log2(d1 / d0), (p.x + o.x) / 2 - r.left, (p.y + o.y) / 2 - r.top);
        }
        lastPinch = Date.now();
      }
    });
    function lift(e) { delete pts[e.pointerId]; }
    stageEl.addEventListener("pointerup", lift);
    stageEl.addEventListener("pointercancel", lift);
    stageEl.addEventListener("wheel", function (e) {
      e.preventDefault();
      if (Date.now() - lastPinch < 180) return;
      var r = stageEl.getBoundingClientRect();
      zoomAt(e.deltaY < 0 ? 0.42 : -0.42, e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });
    stageEl.addEventListener("keydown", function (e) {
      var step = 60;
      if (e.key === "ArrowLeft") { panPx(step, 0); e.preventDefault(); }
      else if (e.key === "ArrowRight") { panPx(-step, 0); e.preventDefault(); }
      else if (e.key === "ArrowUp") { panPx(0, step); e.preventDefault(); }
      else if (e.key === "ArrowDown") { panPx(0, -step); e.preventDefault(); }
      else if (e.key === "+" || e.key === "=") { zoomAt(0.5, canvas._w / 2, canvas._h / 2); e.preventDefault(); }
      else if (e.key === "-") { zoomAt(-0.5, canvas._w / 2, canvas._h / 2); e.preventDefault(); }
    });
    var zin = document.getElementById("mapZin");
    var zout = document.getElementById("mapZout");
    if (zin) zin.addEventListener("click", function () { zoomAt(0.75, canvas._w / 2, canvas._h / 2); });
    if (zout) zout.addEventListener("click", function () { zoomAt(-0.75, canvas._w / 2, canvas._h / 2); });
  }

  /* ============================================================
     I18N — EN captured from DOM, TH from window.FV_TH
     ============================================================ */
  var EN = {};
  var nodes = document.querySelectorAll("[data-i18n]");
  var altNodes = document.querySelectorAll("[data-i18n-alt]");
  nodes.forEach(function (el) { EN[el.getAttribute("data-i18n")] = el.innerHTML; });
  altNodes.forEach(function (el) { EN["@alt:" + el.getAttribute("data-i18n-alt")] = el.getAttribute("alt"); });

  var langBtn = document.getElementById("langBtn");
  function setLang(lang, persist) {
    var dict = (lang === "th" && window.FV_TH) ? window.FV_TH : null;
    nodes.forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var val = dict ? dict[key] : EN[key];
      if (val != null && el.innerHTML !== val) el.innerHTML = val;
    });
    altNodes.forEach(function (el) {
      var key = el.getAttribute("data-i18n-alt");
      var val = dict ? dict["@alt:" + key] : EN["@alt:" + key];
      if (val != null) el.setAttribute("alt", val);
    });
    document.body.setAttribute("data-lang", lang);
    docEl.setAttribute("lang", lang === "th" ? "th" : "en");
    if (langBtn) {
      langBtn.querySelectorAll(".lang-opt").forEach(function (o) {
        o.classList.toggle("is-on", o.getAttribute("data-l") === lang);
      });
      langBtn.setAttribute("aria-label", lang === "th" ? "Switch to English" : "เปลี่ยนเป็นภาษาไทย");
    }
    rimgImgs.forEach(function (im, i) { im.alt = ALT[lang](HOLES[i]); });
    labelChips(lang);
    buildScore();
    composeMsg();
    if (persist !== false) {
      try { window.localStorage.setItem("fv-lang", lang); } catch (err) {}
    }
  }
  if (langBtn) {
    langBtn.addEventListener("click", function () {
      setLang(document.body.getAttribute("data-lang") === "en" ? "th" : "en");
    });
  }
  if (Q.get("lang") === "th") {
    setLang("th", false);
  } else {
    try {
      var saved = window.localStorage.getItem("fv-lang");
      if (saved === "th") setLang("th");
    } catch (err) {}
  }
  composeMsg();

  /* ============================================================
     SHOT positioning — ?shot=<selector>&off=<px>
     ============================================================ */
  if (SHOT) {
    var sel = Q.get("shot");
    if (sel && sel !== "1" && sel !== "full") {
      window.addEventListener("load", function () {
        var place = function () {
          var target = null;
          try { target = document.querySelector(sel.charAt(0) === "." || sel.charAt(0) === "#" ? sel : "#" + sel); } catch (e) {}
          var off = parseInt(Q.get("off") || "0", 10);
          if (target) {
            document.body.style.marginTop = "0px";
            var y = target.getBoundingClientRect().top + window.scrollY - off;
            document.body.style.marginTop = (-y) + "px";
          }
        };
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(function () { requestAnimationFrame(place); });
        } else { place(); }
        setTimeout(place, 600);
      });
    }
    if (Q.get("bs") === "1") { window.addEventListener("load", function () { openSheet(null); }); }
  }
})();
