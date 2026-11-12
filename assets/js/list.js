/* ORA Travel — list pages: load more, tour date panels, Good Days side panel */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------ load more (reveals the next 4 hidden cards) */
  $$(".js-more").forEach(function (a) {
    var box = a.closest(".load-more");
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var rest = $$(".tlist-box li[data-more][hidden]");
      rest.slice(0, 4).forEach(function (li, i) {
        li.hidden = false;
        li.style.animationDelay = (i * 80) + "ms";
        li.classList.add("reveal");
      });
      if (rest.length <= 4) { box.classList.add("done"); setTimeout(function () { box.hidden = true; }, 400); }
    });
  });

  /* ------------------------------------------------------------ tour boards: click card → dates panel */
  var panels = $$(".page-tours .bd");
  function closeAll(except) { panels.forEach(function (p) { if (p !== except) { p.classList.remove("open"); setBtn(p, false); } }); }
  function setBtn(p, on) { var b = p.parentNode.querySelector(".card-btn"); if (b) b.setAttribute("aria-expanded", on ? "true" : "false"); }
  $$(".page-tours [data-card]").forEach(function (card) {
    var bd = $(".bd", card), btn = $(".card-btn", card);
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", function () {
      closeAll(bd); bd.classList.add("open"); setBtn(bd, true);
      var first = $("a", bd); if (first && btn.matches(":focus-visible")) first.focus({ preventScroll: true });
    });
    bd.addEventListener("mouseleave", function () { closeAll(); });
  });
  if (panels.length) {
    var outside = function (e) { if (!e.target.closest(".bd")) closeAll(); };
    document.addEventListener("mousedown", outside);
    document.addEventListener("touchstart", outside, { passive: true });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var open = $(".bd.open"); if (!open) return;
      closeAll(); var b = open.parentNode.querySelector(".card-btn"); b && b.focus();
    });
    document.addEventListener("focusin", function (e) { var o = $(".bd.open"); if (o && !o.contains(e.target) && !e.target.closest(".card-btn")) closeAll(); });
  }

  /* ------------------------------------------------------------ Good Days side panel */
  var xp = $("#xpanel");
  if (xp) {
    var box = $("#xpContent", xp), scroller = $(".xpanel-c", xp), menu = $(".hdr-menu"), isOpen = false, lastFocus = null, timer;
    var fill = function (i) {
      var tpl = document.getElementById("exp-tpl-" + i);
      if (!tpl) return;
      box.innerHTML = ""; box.appendChild(tpl.content.cloneNode(true));
      box.dataset.idx = i;
    };
    var show = function (i) {
      if (isOpen) { // swap content (prev / next)
        box.classList.add("swap");
        setTimeout(function () { fill(i); scroller.scrollTop = 0; box.classList.remove("swap"); }, reduce ? 0 : 300);
        return;
      }
      lastFocus = document.activeElement;
      fill(i); scroller.scrollTop = 0;
      clearTimeout(timer);
      xp.classList.remove("closing"); xp.classList.add("open"); xp.setAttribute("aria-hidden", "false");
      document.body.classList.add("xp-open"); menu && menu.classList.add("black");
      document.documentElement.style.overflow = "hidden";
      isOpen = true;
      setTimeout(function () { $(".xpanel-x", xp).focus({ preventScroll: true }); }, 300);
    };
    var hide = function () {
      if (!isOpen) return;
      isOpen = false;
      xp.classList.add("closing");
      timer = setTimeout(function () { xp.classList.remove("open", "closing"); xp.setAttribute("aria-hidden", "true"); }, reduce ? 0 : 600);
      document.body.classList.remove("xp-open"); menu && menu.classList.remove("black");
      document.documentElement.style.overflow = "";
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    };
    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-exp]");
      if (t) { e.preventDefault(); show(Number(t.dataset.exp)); return; }
      if (e.target.closest(".xpanel-x, .xpanel-mask, [data-close]")) { e.preventDefault(); hide(); }
    });
    document.addEventListener("keydown", function (e) {
      if (!isOpen) return;
      if (e.key === "Escape") hide();
      else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        var n = $$("template[id^='exp-tpl-']").length, i = Number(box.dataset.idx || 0);
        show((i + (e.key === "ArrowRight" ? 1 : -1) + n) % n);
      } else if (e.key === "Tab") { // keep focus inside the dialog
        var f = $$("button, a[href]", $(".xpanel-c", xp)), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    var m = /^#good-day-(\d+)$/.exec(location.hash);
    if (m) setTimeout(function () { show(Number(m[1]) - 1); }, 300);
  }
})();
