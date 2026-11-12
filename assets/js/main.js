/* ORA Travel — shared behaviour: menu, explore tab, trip wizard, footer, back-to-top */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var touch = window.matchMedia("(hover: none)").matches;
  var hdr = $("#hdr"), ftr = $("#ftr"), tab = $("#tripTab"), wrap = $("#wrapper");
  window.ORA = window.ORA || {};

  /* ------------------------------------------------------------ menu */
  var menuBtn = $(".hdr-menu > button");
  function closeMenu() { hdr.classList.remove("open"); menuBtn && menuBtn.setAttribute("aria-expanded", "false"); }
  if (menuBtn) menuBtn.addEventListener("click", function () {
    hdr.classList.add("open"); menuBtn.setAttribute("aria-expanded", "true");
    ftr && ftr.classList.remove("open");
  });
  var navEl = $(".hdr-nav");
  if (navEl) navEl.addEventListener("mouseleave", function () { if (!touch) closeMenu(); });
  document.addEventListener("pointerdown", function (e) {
    if (hdr.classList.contains("open") && !e.target.closest("#hdr")) closeMenu();
    if (ftr && ftr.classList.contains("open") && !e.target.closest("#ftr")) ftr.classList.remove("open");
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    closeMenu();
    if (wiz && wiz.classList.contains("show")) closeWizard();
  });

  /* ------------------------------------------------------------ explore tab */
  var tabTimer;
  if (tab) {
    tab.addEventListener("mouseenter", function () { tab.classList.add("open"); });
    tab.addEventListener("mouseleave", function () { tab.classList.remove("open"); });
    tab.addEventListener("click", function () {
      tab.classList.add("open"); clearTimeout(tabTimer);
      tabTimer = setTimeout(function () { tab.classList.remove("open"); }, 3000);
    });
  }

  /* ------------------------------------------------------------ trip wizard */
  var wiz = $("#wiz"), ft = wiz && $(".wiz-ft", wiz), current = null;
  function goStep(id, region) {
    if (!wiz) return;
    var box = $("#wz-" + id);
    if (!box) return;
    // country steps are filled from <template> by region
    var grid = $(".wz-grid[data-fill]", box);
    if (grid && grid.dataset.fill && region) {
      var tpl = $('template[data-for="' + grid.dataset.fill + '"][data-region="' + region + '"]', box);
      grid.innerHTML = tpl ? tpl.innerHTML : "";
    }
    $$(".wiz-step", wiz).forEach(function (s) {
      var on = s === box;
      s.classList.toggle("in", on);
      s.classList.toggle("out", !on);
      s.setAttribute("aria-hidden", on ? "false" : "true");
    });
    current = id;
    var incentive = /^(incentive|vipLogin|userArea|userCountry)$/.test(id);
    ft && ft.classList.toggle("open", incentive);
    if (id === "vipLogin") ORA.coPage(0);
  }
  function openWizard() {
    if (!wiz) return;
    closeMenu();
    wiz.classList.add("show"); wiz.setAttribute("aria-hidden", "false");
    requestAnimationFrame(function () { requestAnimationFrame(function () { wiz.classList.add("vis"); }); });
    $(".hdr-menu") && $(".hdr-menu").classList.add("hide");
    wrap.classList.add("wiz-open"); tab && tab.classList.add("off");
    document.documentElement.style.overflow = "hidden";
    goStep("start");
  }
  function closeWizard() {
    $$(".wiz-step", wiz).forEach(function (s) { s.classList.remove("in"); s.classList.add("out"); });
    ft && ft.classList.remove("open");
    wiz.classList.remove("vis");
    setTimeout(function () { wiz.classList.remove("show"); wiz.setAttribute("aria-hidden", "true"); }, 400);
    $(".hdr-menu") && $(".hdr-menu").classList.remove("hide");
    wrap.classList.remove("wiz-open"); tab && tab.classList.remove("off");
    document.documentElement.style.overflow = "";
  }
  ORA.openWizard = openWizard;
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-trip]");
    if (t) { e.preventDefault(); openWizard(); return; }
    if (!wiz || !wiz.contains(e.target)) return;
    if (e.target.closest(".wiz-x")) { closeWizard(); return; }
    var s = e.target.closest("[data-step]");
    if (s) { e.preventDefault(); goStep(s.dataset.step, s.dataset.region); return; }
    var dot = e.target.closest(".wb-pts li[data-go]");
    if (dot) {
      var path = dot.closest(".wiz-step").dataset.path.split(",");
      goStep(path[Number(dot.dataset.go)]);
      return;
    }
    var co = e.target.closest(".wz-co-logo");
    if (co) {
      $$(".wz-co-logo", wiz).forEach(function (b) { b.classList.toggle("on", b === co); });
      $$(".wz-form input, .wz-form button", wiz).forEach(function (i) { i.disabled = false; });
      $(".wz-msg", wiz).textContent = "Signing in as " + co.dataset.co + ".";
      $(".wz-form input", wiz).focus();
    }
  });
  if (wiz) {
    // corporate logo pager (6 per page; 2 per page on mobile handled by CSS width)
    var track = $(".wz-co-track", wiz), dots = $(".wz-dots", wiz), pages = $$(".wz-co-page", wiz);
    pages.forEach(function (p, i) {
      var b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-label", "Page " + (i + 1));
      b.addEventListener("click", function () { ORA.coPage(i); });
      dots.appendChild(b);
    });
    ORA.coPage = function (i) {
      var w = $(".wz-co-view", wiz).clientWidth || 375;
      track.style.transform = "translateX(" + (-i * w) + "px)";
      $$("button", dots).forEach(function (b, k) { b.classList.toggle("on", k === i); });
    };
    var sx = null, pageI = 0;
    track.addEventListener("pointerdown", function (e) { sx = e.clientX; });
    track.addEventListener("pointerup", function (e) {
      if (sx === null) return; var dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) < 40) return;
      pageI = Math.max(0, Math.min(pages.length - 1, pageI + (dx < 0 ? 1 : -1))); ORA.coPage(pageI);
    });
    $(".wz-form", wiz).addEventListener("submit", function (e) {
      e.preventDefault();
      var ins = $$(".wz-form input", wiz), msg = $(".wz-msg", wiz);
      if (!ins[0].value.trim() || !ins[1].value.trim()) { msg.textContent = "Please enter your account and password."; return; }
      msg.textContent = "Demo site: corporate accounts are not connected. Please contact your ORA planner.";
    });
  }

  /* ------------------------------------------------------------ footer "More" */
  var more = $(".ftr-more > button");
  if (more) more.addEventListener("click", function () {
    if (ftr.classList.contains("open-all") || window.innerWidth <= 960) {
      var top = $(".ftr-box").getBoundingClientRect().top + window.scrollY - 200;
      window.scrollTo({ top: top, behavior: "smooth" });
      return;
    }
    var o = ftr.classList.toggle("open"); more.setAttribute("aria-expanded", o ? "true" : "false");
    closeMenu();
  });
  var fbox = $(".ftr-box");
  if (fbox) fbox.addEventListener("mouseleave", function () { if (!touch) ftr.classList.remove("open"); });

  /* subscribe form (no data is sent anywhere — wire up your own service here) */
  var sub = $(".ftr-sub");
  if (sub) sub.addEventListener("click", function (e) {
    var b = e.target.closest(".fs-btn"); if (!b) return;
    var input = $("input", sub), msg = $(".fs-msg", sub), v = input.value.trim();
    msg.classList.remove("err");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { msg.classList.add("err"); msg.textContent = "Please enter a valid email address."; input.focus(); return; }
    msg.textContent = b.dataset.act === "sub" ? "Thank you! " + v + " is now subscribed." : v + " has been unsubscribed.";
    input.value = "";
  });

  /* ------------------------------------------------------------ back to top */
  var bt = $(".backtop");
  function onScroll() { bt && bt.classList.toggle("show", window.scrollY > 150); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  if (bt) $("button", bt).addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  /* ------------------------------------------------------------ small helper for page scripts:
     ORA.inView(el, cb, offset) → cb once when el enters viewport */
  ORA.inView = function (els, cls, margin) {
    if (!("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add(cls); }); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add(cls); io.unobserve(en.target); } });
    }, { rootMargin: margin || "0px 0px -15% 0px" });
    els.forEach(function (el) { io.observe(el); });
  };
  /* generic loader exit for inner pages (page scripts may run their own; this is idempotent) */
  var ld = $("#loading");
  if (ld && !document.body.classList.contains("page-home")) {
    var t0 = performance.now();
    var exit = function () {
      setTimeout(function () {
        var l = $("#loading"); if (!l) { wrap.classList.remove("home-anim"); return; }
        l.classList.add("ring-out");
        setTimeout(function () { l.classList.add("fade"); wrap.classList.remove("home-anim"); }, 600);
        setTimeout(function () { l.parentNode && l.remove(); }, 1300);
      }, Math.max(0, 1200 - (performance.now() - t0)));
    };
    if (document.readyState === "complete") exit(); else window.addEventListener("load", exit);
  }
  if (location.hash === "#explore") setTimeout(openWizard, 300);
})();
