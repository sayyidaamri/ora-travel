/* Home: loader, intro curtain, sequence slider, hot-news panel */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var wrap = $("#wrapper"), loading = $("#loading"), start = $(".seq-start");
  var slides = $$(".seq-canvas > li"), cur = -1, lock = true, newsOpen = false;

  function setHeight() { $("#seqWrap").style.height = window.innerHeight + "px"; }
  setHeight(); window.addEventListener("resize", setHeight);
  slides.forEach(function (li, k) { li.inert = k !== 0; });
  // desktop home never scrolls (focus/scrollIntoView must not shift the full-screen slider)
  window.addEventListener("scroll", function () { if (window.innerWidth > 767 && window.scrollY) window.scrollTo(0, 0); });
  $("#sequence").addEventListener("scroll", function () { this.scrollTop = 0; });

  function show(i, dir) {
    i = (i + slides.length) % slides.length;
    if (i === cur) return;
    slides.forEach(function (li, k) {
      li.classList.remove("seq-in", "seq-out");
      if (k === cur) li.classList.add("seq-out");
      if (k === i) li.classList.add("seq-in");
      li.inert = k !== i;
      var v = $("video", li);
      if (v) { if (k === i) { setTimeout(function () { v.play().catch(function () {}); }, 1000); } else { v.pause(); } }
    });
    cur = i;
    lock = true;
    setTimeout(function () { lock = false; }, reduce ? 300 : 3500); // whole step animates ~2.3s + 1.2s grace
  }
  function next() { if (!lock && !newsOpen) show(cur + 1, 1); }
  function prev() { if (!lock && !newsOpen) show(cur - 1, -1); }

  // intro timeline (mirrors reference: loader out → curtain open @2.5s → chrome in @3.9s → slider @1.5s)
  function boot() {
    if (loading) {
      loading.classList.add("ring-out");
      setTimeout(function () { loading.classList.add("fade"); }, 600);
      setTimeout(function () { loading.remove(); }, 1300);
    }
    setTimeout(function () { show(0); }, 1500);
    setTimeout(function () { start.classList.add("open"); }, 2500);
    setTimeout(function () { wrap.classList.remove("home-anim"); }, 3900);
  }
  var minShow = 1200, t0 = performance.now();
  function onLoad() { setTimeout(boot, Math.max(0, minShow - (performance.now() - t0))); }
  if (document.readyState === "complete") onLoad(); else window.addEventListener("load", onLoad);

  // controls
  document.addEventListener("click", function (e) {
    if (e.target.closest(".seq-next")) { e.preventDefault(); next(); }
    else if (e.target.closest(".seq-prev")) { e.preventDefault(); prev(); }
  });
  window.addEventListener("wheel", function (e) {
    if (newsOpen || $(".wiz.show") || window.innerWidth <= 767) return;
    if (Math.abs(e.deltaY) < 4) return;
    if (e.deltaY > 0) next(); else prev();
  }, { passive: true });
  document.addEventListener("keydown", function (e) {
    if ($(".wiz.show") || newsOpen) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next();
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") prev();
  });
  var sx = null, sy = 0, box = $("#sequence");
  box.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  box.addEventListener("touchend", function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { if (dx < 0) next(); else prev(); }
  }, { passive: true });

  // hot-news panel
  var panel = $("#hnews"), menu = $(".hdr-menu");
  function openNews(e) {
    e && e.preventDefault();
    newsOpen = true;
    panel.classList.remove("closing"); panel.classList.add("open"); panel.setAttribute("aria-hidden", "false");
    menu && menu.classList.add("black");
    setTimeout(function () { $(".hnews-x").focus({ preventScroll: true }); }, 300);
  }
  function closeNews() {
    panel.classList.add("closing");
    setTimeout(function () { panel.classList.remove("open", "closing"); panel.setAttribute("aria-hidden", "true"); }, 600);
    menu && menu.classList.remove("black");
    newsOpen = false;
  }
  $("#openNews").addEventListener("click", openNews);
  $(".hnews-x").addEventListener("click", closeNews);
  $(".hnews-mask").addEventListener("click", closeNews);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && newsOpen) closeNews(); });
})();
