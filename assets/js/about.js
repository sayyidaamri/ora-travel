/* ORA Travel — Our Story: loader, hero intro, scroll reveals, incentive step slider, #incentive anchor */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var touch = window.matchMedia("(hover: none)").matches;
  var wrap = $("#wrapper"), loading = $("#loading"), banner = $(".about-box .banner");

  /* ------------------------------------------------------------ hero height = window height */
  var lastW = window.innerWidth;
  function setBanner() { if (banner) banner.style.height = window.innerHeight + "px"; }
  setBanner();
  window.addEventListener("resize", function () {
    // on touch devices ignore the URL-bar height jitter; only react to real width/orientation changes
    if (touch && window.innerWidth === lastW) return;
    lastW = window.innerWidth; setBanner();
  });

  /* ------------------------------------------------------------ smooth scroll (jQuery "swing"-like) */
  function scrollToY(y, ms) {
    if (reduce) { window.scrollTo(0, y); return; }
    var from = window.scrollY, d = y - from, t0 = null;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / ms);
      window.scrollTo(0, from + d * (0.5 - Math.cos(p * Math.PI) / 2));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var down = $(".scroll-down");
  if (down) down.addEventListener("click", function () {
    var f = $(".feature1"); if (f) scrollToY(f.getBoundingClientRect().top + window.scrollY, 800);
  });

  /* ------------------------------------------------------------ boot: loader out → blue curtain → logo + Discovery */
  function boot() {
    if (loading) {
      loading.classList.add("ring-out");
      setTimeout(function () { loading.classList.add("fade"); wrap.classList.remove("home-anim"); }, 500);
      setTimeout(function () { loading.remove(); }, 1200);
    } else if (wrap) wrap.classList.remove("home-anim");
    setTimeout(function () {
      $$(".about-box .seq-start-bg, .about-box .banner-logo").forEach(function (el) { el.classList.add("open"); });
      var t = $(".about-box .seq-title"); if (t) t.classList.add("start");
    }, reduce ? 0 : 1500);
    var hash = location.hash;
    if (hash && hash.length > 1 && hash !== "#explore") {
      var target = document.getElementById(hash.slice(1));
      if (target) setTimeout(function () { scrollToY(target.getBoundingClientRect().top + window.scrollY, 800); }, reduce ? 0 : 600);
    }
    onScroll();
  }
  if (document.readyState === "complete") boot(); else window.addEventListener("load", boot);

  /* ------------------------------------------------------------ scroll-triggered reveals (same thresholds as reference) */
  var features = $$(".about-box .feature"), nowBox = $(".now-box"), nowText = $(".now-box .content-text");
  function top(el) { return el.getBoundingClientRect().top + window.scrollY; }
  function onScroll() {
    var y = window.scrollY, wh = window.innerHeight;
    features.forEach(function (f) { if (y > top(f) - wh / 2) f.classList.add("element"); });
    if (nowBox && y > top(nowBox) - 200) nowBox.classList.add("element");
    if (nowText && y > top(nowText) - wh / 2 - 100) nowText.classList.add("element");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  /* ------------------------------------------------------------ incentive steps slider
     reference: slick centerMode, slidesToShow 2 (1 below 960px), infinite false, 800ms easeInCubic */
  var slider = $(".inc-slider");
  if (slider) {
    var view = $(".inc-view", slider), track = $(".inc-track", slider), slides = $$(".inc-slide", slider);
    var prev = $(".inc-prev", slider), next = $(".inc-next", slider);
    var idx = 0, slideW = 520, perView = 2;
    var layout = function (instant) {
      perView = window.innerWidth <= 960 ? 1 : 2;
      var inner = view.clientWidth - 40; // padding 0 20px
      slideW = inner / perView;
      slides.forEach(function (s) { s.style.width = (slideW - 40) + "px"; });
      if (instant) track.classList.add("instant");
      go(idx, true);
      if (instant) { void track.offsetWidth; track.classList.remove("instant"); }
    };
    var go = function (i, silent) {
      idx = Math.max(0, Math.min(slides.length - 1, i));
      var center = Math.floor(perView / 2) * slideW;
      track.style.transform = "translate3d(" + (center - idx * slideW) + "px,0,0)";
      slides.forEach(function (s, k) {
        var vis = perView === 2 ? (k === idx || k === idx - 1) : k === idx;
        s.classList.toggle("is-current", k === idx);
        s.setAttribute("aria-hidden", vis ? "false" : "true");
        $$("a", s).forEach(function (a) { a.tabIndex = vis ? 0 : -1; });
      });
      prev.disabled = idx === 0; next.disabled = idx === slides.length - 1;
      if (!silent && document.activeElement && document.activeElement.disabled) view.focus();
    };
    prev.addEventListener("click", function () { go(idx - 1); });
    next.addEventListener("click", function () { go(idx + 1); });
    view.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); go(idx - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); go(idx + 1); }
    });
    // swipe / drag
    var sx = null, sy = 0, dx = 0, base = 0, dragging = false;
    view.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      sx = e.clientX; sy = e.clientY; dx = 0; dragging = false;
      base = Math.floor(perView / 2) * slideW - idx * slideW;
    });
    window.addEventListener("pointermove", function (e) {
      if (sx === null) return;
      dx = e.clientX - sx;
      if (!dragging && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - sy)) { dragging = true; view.classList.add("drag"); track.classList.add("instant"); }
      if (dragging) track.style.transform = "translate3d(" + (base + dx * 0.6) + "px,0,0)";
    });
    var end = function () {
      if (sx === null) return;
      sx = null; view.classList.remove("drag"); track.classList.remove("instant");
      if (dragging) { go(Math.abs(dx) > slideW / 5 ? idx + (dx < 0 ? 1 : -1) : idx); }
    };
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    view.addEventListener("click", function (e) { if (dragging) { e.preventDefault(); e.stopPropagation(); dragging = false; } }, true);
    view.addEventListener("dragstart", function (e) { e.preventDefault(); });
    layout(true);
    window.addEventListener("resize", function () { layout(true); });
  }
})();
