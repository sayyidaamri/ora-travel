/* ORA Travel — group C form pages: loader, validation, captcha, privacy modal, date picker,
   job tabs, contact scroll, tour/date selects, tailor-made hero + slide-in form.
   Nothing is ever sent anywhere: submit only validates and shows a thank-you state. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var body = document.body, wrap = $("#wrapper"), loading = $("#loading");

  /* ------------------------------------------------------------ loader (inner pages: no chrome slide-in) */
  wrap && wrap.classList.remove("home-anim");
  var bootFns = [];
  function boot() {
    if (loading) {
      loading.classList.add("ring-out");
      setTimeout(function () { loading.classList.add("fade"); }, 600);
      setTimeout(function () { loading.remove(); }, 1300);
    }
    bootFns.forEach(function (f) { f(); });
  }
  var t0 = performance.now(), minShow = reduce ? 0 : 1200;
  function onLoad() { setTimeout(boot, Math.max(0, minShow - (performance.now() - t0))); }
  if (document.readyState === "complete") onLoad(); else window.addEventListener("load", onLoad);

  function smoothTo(y, ms) {
    if (reduce) { window.scrollTo(0, y); return; }
    var y0 = window.scrollY, d = y - y0, s = performance.now();
    (function step(n) {
      var p = Math.min(1, (n - s) / ms), e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      window.scrollTo(0, y0 + d * e);
      if (p < 1) requestAnimationFrame(step);
    })(s);
  }

  /* ------------------------------------------------------------ verification code */
  var CH = "abcdefghjkmnpqrstuvwxyz";
  function newCode(cap) {
    var code = "", svg = "";
    for (var i = 0; i < 5; i++) {
      var c = CH[Math.floor(Math.random() * CH.length)];
      code += c;
      var x = 14 + i * 22 + (Math.random() * 6 - 3), y = 26 + (Math.random() * 6 - 3), r = Math.round(Math.random() * 40 - 20);
      svg += '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" transform="rotate(' + r + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')" text-anchor="middle">' + c + "</text>";
    }
    var noise = '<path d="M4 ' + (14 + Math.random() * 12).toFixed(0) + 'Q60 ' + (Math.random() * 38).toFixed(0) + " 116 " + (14 + Math.random() * 12).toFixed(0) + '" stroke="#222" stroke-width="1.2" fill="none" opacity=".55"/>';
    $(".cap-svg", cap).innerHTML = '<svg viewBox="0 0 120 38" aria-hidden="true"><g font-family="Georgia,\'Times New Roman\',serif" font-weight="700" font-size="21" fill="#111">' + svg + "</g>" + noise + "</svg>";
    cap.dataset.code = code;
    $(".cap-code", cap).setAttribute("aria-label", "Verification code: " + code.split("").join(" ") + ". Click for a new code.");
  }
  $$(".cap").forEach(function (cap) {
    newCode(cap);
    $(".cap-code", cap).addEventListener("click", function () { newCode(cap); });
    $(".cap-re", cap).addEventListener("click", function () { newCode(cap); var i = cap.parentNode.querySelector("input"); i && i.focus(); });
  });

  /* ------------------------------------------------------------ privacy-policy modal */
  var pol = $("#policy"), polBack = null;
  function openPolicy(from) {
    if (!pol) return;
    polBack = from || document.activeElement;
    pol.hidden = false;
    document.documentElement.classList.add("pol-lock");
    requestAnimationFrame(function () { pol.classList.add("show"); });
    $(".pol-x", pol).focus();
  }
  function closePolicy() {
    if (!pol || pol.hidden) return;
    pol.classList.remove("show");
    document.documentElement.classList.remove("pol-lock");
    setTimeout(function () { pol.hidden = true; }, reduce ? 0 : 250);
    polBack && polBack.focus && polBack.focus();
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-policy]");
    if (a) { e.preventDefault(); openPolicy(a); return; }
    if (pol && !pol.hidden && (e.target.closest(".pol-x") || !e.target.closest(".pol-box"))) closePolicy();
  });
  if (pol) pol.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return; // keep focus inside the dialog
    e.preventDefault(); $(".pol-x", pol).focus();
  });

  /* ------------------------------------------------------------ date picker */
  var dp = null, dpInput = null, dpMonth = null;
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var iso = function (d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  function renderDp() {
    var y = dpMonth.getFullYear(), m = dpMonth.getMonth(), first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var h = '<div class="dp-hd"><button type="button" class="dp-p" aria-label="Previous month"><svg viewBox="0 0 10 16"><path fill="none" stroke="currentColor" stroke-width="2" d="M8 1L2 8l6 7"/></svg></button>' + MONTHS[m] + " " + y +
      '<button type="button" class="dp-n" aria-label="Next month"><svg viewBox="0 0 10 16"><path fill="none" stroke="currentColor" stroke-width="2" d="M2 1l6 7-6 7"/></svg></button></div><table><thead><tr>';
    ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].forEach(function (d) { h += "<th>" + d + "</th>"; });
    h += "</tr></thead><tbody><tr>";
    for (var i = 0; i < first; i++) h += "<td></td>";
    for (var d = 1; d <= days; d++) {
      var dt = new Date(y, m, d), v = iso(dt), past = dt < today;
      if ((first + d - 1) % 7 === 0 && d > 1) h += "</tr><tr>";
      h += "<td>" + (past ? "<span>" + d + "</span>" : '<button type="button" data-d="' + v + '" class="' + (dt.getTime() === today.getTime() ? "today " : "") + (dpInput.value === v ? "on" : "") + '">' + d + "</button>") + "</td>";
    }
    dp.innerHTML = h + "</tr></tbody></table>";
  }
  function openDp(input) {
    if (!dp) {
      dp = document.createElement("div"); dp.className = "dp"; dp.setAttribute("role", "dialog"); dp.setAttribute("aria-label", "Choose a date");
      document.body.appendChild(dp);
      dp.addEventListener("click", function (e) {
        e.stopPropagation();
        if (e.target.closest(".dp-p")) { dpMonth.setMonth(dpMonth.getMonth() - 1); renderDp(); }
        else if (e.target.closest(".dp-n")) { dpMonth.setMonth(dpMonth.getMonth() + 1); renderDp(); }
        var b = e.target.closest("[data-d]");
        if (b) { dpInput.value = b.dataset.d; dpInput.dispatchEvent(new Event("input", { bubbles: true })); closeDp(); dpInput.focus(); }
      });
    }
    dpInput = input;
    var v = input.value ? new Date(input.value + "T00:00") : new Date();
    dpMonth = new Date(v.getFullYear(), v.getMonth(), 1);
    renderDp();
    var r = input.getBoundingClientRect();
    dp.style.left = Math.max(8, Math.min(r.left + window.scrollX, document.documentElement.clientWidth - 270)) + "px";
    dp.style.top = (r.bottom + window.scrollY + 2) + "px";
    dp.hidden = false;
  }
  function closeDp() { if (dp) dp.hidden = true; }
  $$("[data-datepicker]").forEach(function (inp) {
    inp.addEventListener("click", function (e) { e.stopPropagation(); openDp(inp); });
    inp.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") { e.preventDefault(); openDp(inp); }
      if (e.key === "Backspace" || e.key === "Delete") inp.value = "";
    });
  });
  document.addEventListener("click", function (e) { if (dp && !dp.hidden && !e.target.closest(".dp")) closeDp(); });

  /* ------------------------------------------------------------ validation + success state */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, TEL = /^[+()\d][\d\s()+\-]{5,}$/;
  function setErr(boxEl, msg) {
    var next = boxEl.nextElementSibling;
    if (next && next.classList.contains("ferr")) next.remove();
    boxEl.classList.toggle("has-err", !!msg);
    if (!msg) return;
    var s = document.createElement("span"); s.className = "ferr"; s.setAttribute("role", "alert"); s.textContent = msg;
    boxEl.parentNode.insertBefore(s, boxEl.nextSibling);
  }
  function check(el) {
    var v = (el.value || "").trim(), t = el.dataset.type;
    if (el.type === "checkbox") return el.checked ? "" : el.dataset.req;
    if (!v) return el.dataset.req || "";
    if (t === "email" && !EMAIL.test(v)) return "Please enter a valid e-mail address.";
    if (t === "tel" && !TEL.test(v)) return "Please enter a valid phone number (digits only, with area code).";
    if (t === "captcha") {
      var cap = $(".cap", el.closest(".fbox"));
      if (cap && v.toLowerCase() !== cap.dataset.code) return "The verification code is incorrect — please try again.";
    }
    return "";
  }
  $$("form.fform").forEach(function (form) {
    function validate() {
      var first = null;
      $$(".fbox", form).forEach(function (b) {
        var msg = "";
        if (b.dataset.reqGroup) msg = $('input[name="' + b.dataset.reqGroup + '"]:checked', b) ? "" : b.dataset.req;
        else $$("[data-req], [data-type]", b).some(function (el) { msg = check(el); return !!msg; });
        setErr(b, msg);
        if (msg && !first) first = b;
      });
      // contact-via "other" needs a value when ticked
      $$("[data-other]", form).forEach(function (c) {
        var o = document.getElementById(c.dataset.other), b = c.closest(".fbox");
        if (c.checked && !o.value.trim() && !b.classList.contains("has-err")) { setErr(b, "Please tell us how else we can reach you."); first = first || b; }
      });
      return first;
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = validate();
      if (bad) {
        var f = $("input:not([type=hidden]), select, textarea", bad);
        var top = bad.getBoundingClientRect().top;
        var sc = form.closest(".gp-c");
        if (sc) sc.scrollTo({ top: sc.scrollTop + top - 120, behavior: reduce ? "auto" : "smooth" });
        else if (top < 100 || top > window.innerHeight - 100) smoothTo(window.scrollY + top - 160, 500);
        f && f.focus({ preventScroll: true });
        var cap = $(".cap", form);
        if (cap && bad.querySelector(".cap")) { newCode(cap); $("[data-type=captcha]", form).value = ""; }
        return;
      }
      // success — no data leaves the browser
      var boxes = $(".gf-boxes", form), doneEl = $(".fdone", form);
      boxes.hidden = true; doneEl.hidden = false;
      var sc2 = form.closest(".gp-c");
      if (sc2) sc2.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      else smoothTo(form.closest(".gf, .job-form").getBoundingClientRect().top + window.scrollY - 40, 600);
      doneEl.focus({ preventScroll: true });
    });
    form.addEventListener("input", function (e) {
      var b = e.target.closest(".fbox");
      if (b && b.classList.contains("has-err")) setErr(b, "");
      if (e.target.matches("[id]")) { var c = $('[data-other="' + e.target.id + '"]', form); if (c) c.checked = !!e.target.value.trim(); }
    });
    form.addEventListener("change", function (e) {
      var b = e.target.closest(".fbox");
      if (b && b.classList.contains("has-err") && (e.target.type === "radio" || e.target.type === "checkbox")) setErr(b, "");
    });
    var again = $(".fd-again", form);
    if (again) again.addEventListener("click", function () {
      form.reset();
      $$(".fbox.has-err", form).forEach(function (b) { setErr(b, ""); });
      $$(".cap", form).forEach(newCode);
      $("[data-tour]", form) && fillDates();
      $("[data-region]", form) && fillCountries();
      $(".fdone", form).hidden = true; $(".gf-boxes", form).hidden = false;
      var f = $("input:not([type=radio]):not([type=checkbox]), select", form); f && f.focus();
    });
  });

  /* ------------------------------------------------------------ group tour: tour → departure dates */
  var tourSel = $("[data-tour]"), dateSel = $("[data-dates]"), tourDates = $("#tourDates");
  function fillDates() {
    if (!tourSel || !tourDates) return;
    var map = JSON.parse(tourDates.textContent), list = map[tourSel.value] || [];
    dateSel.innerHTML = list.map(function (d) { return '<option value="' + d + '">' + d + "</option>"; }).join("");
  }
  if (tourSel) {
    tourSel.addEventListener("change", fillDates);
    // keep the selected tour if the user comes back (bfcache) — and keep the back link pointing at it
    var back = $(".gf-back");
    tourSel.addEventListener("change", function () { if (back) back.href = "tour-" + tourSel.value + ".html"; });
  }

  /* ------------------------------------------------------------ custom trip: region → country */
  var regSel = $("[data-region]"), ctySel = $("[data-country]"), rc = $("#regionCountries");
  function fillCountries() {
    if (!regSel || !rc) return;
    var map = JSON.parse(rc.textContent), list = map[regSel.value] || [];
    ctySel.innerHTML = list.map(function (c) { return '<option value="' + c[0] + '">' + c[1] + "</option>"; }).join("");
  }
  if (regSel) regSel.addEventListener("change", fillCountries);

  /* ------------------------------------------------------------ join: job cards act as tabs */
  var tabs = $$(".jobs-hd li"), jobForm = $("#jobForm"), jobSel = $("[data-job-select]");
  function showJob(i, scroll) {
    tabs.forEach(function (li, k) {
      var on = k === i, a = $("a", li);
      li.classList.toggle("on", on); a.setAttribute("aria-selected", on ? "true" : "false");
      var p = document.getElementById("job-" + k);
      p.hidden = !on; p.classList.toggle("in", on);
    });
    if (jobForm.hidden) { jobForm.hidden = false; jobForm.classList.add("in"); }
    if (jobSel && !$(".fdone:not([hidden])", jobForm)) jobSel.value = String(i);
    if (scroll) {
      var c = $(".jobs-c").getBoundingClientRect().top + window.scrollY;
      smoothTo(Math.max(0, c - 172), 700);
    }
  }
  tabs.forEach(function (li, i) {
    $("a", li).addEventListener("click", function (e) { e.preventDefault(); showJob(i, true); });
  });
  if (jobSel) jobSel.addEventListener("change", function () {
    var i = Number(jobSel.value);
    tabs.forEach(function (li, k) { li.classList.toggle("on", k === i); $("a", li).setAttribute("aria-selected", k === i ? "true" : "false"); var p = document.getElementById("job-" + k); p.hidden = k !== i; });
  });
  var m = /^#job-(\d+)$/.exec(location.hash);
  if (m && tabs[m[1]]) showJob(Number(m[1]), false);

  /* ------------------------------------------------------------ contact: "Fill it in" scrolls to the form */
  $$(".gf-cbtn").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.preventDefault();
      smoothTo($(".gf-talk").getBoundingClientRect().top + window.scrollY, reduce ? 0 : 1000);
    });
  });

  /* ------------------------------------------------------------ custom trip: hero sequence */
  var gs = $("#gsWrap");
  if (gs) {
    var steps = $$(".gs-step", gs), dots = $$(".gs-nav li", gs), cur = -1, lock = false;
    var setH = function () { gs.style.height = window.innerHeight + "px"; };
    setH(); window.addEventListener("resize", setH);
    var show = function (i) {
      i = (i + steps.length) % steps.length;
      if (i === cur || lock) return;
      steps.forEach(function (li, k) {
        li.classList.remove("in", "out");
        if (k === cur) li.classList.add("out");
        if (k === i) li.classList.add("in");
        li.setAttribute("aria-hidden", k === i ? "false" : "true");
        $$("a", li).forEach(function (a) { a.tabIndex = k === i && !a.classList.contains("gs-click") ? 0 : -1; });
      });
      dots.forEach(function (d, k) { d.classList.toggle("on", k === i); });
      cur = i; lock = true;
      setTimeout(function () { lock = false; }, reduce ? 100 : 1500);
    };
    // reference starts with step 4 leaving and step 1 arriving
    bootFns.push(function () {
      steps[steps.length - 1].classList.add("out");
      show(0); lock = false;
      gs.classList.add("start");
      $(".gs-start", gs).classList.add("open");
    });
    dots.forEach(function (d, k) { $("button", d).addEventListener("click", function () { show(k); }); });
    var sx = null, sy = 0;
    gs.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    gs.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(cur + (dx < 0 ? 1 : -1));
    }, { passive: true });
    document.addEventListener("keydown", function (e) {
      if (gp.classList.contains("open") || $(".wiz.show")) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") show(cur + 1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") show(cur - 1);
    });

    // slide-in form panel
    var gp = $("#customForm"), gpBack = null;
    var openGp = function (from) {
      gpBack = from;
      gp.classList.remove("closing"); gp.classList.add("open"); gp.setAttribute("aria-hidden", "false");
      document.documentElement.classList.add("gp-lock");
      setTimeout(function () { $(".gp-x", gp).focus({ preventScroll: true }); }, 50);
    };
    var closeGp = function () {
      if (!gp.classList.contains("open")) return;
      gp.classList.remove("open"); gp.classList.add("closing"); gp.setAttribute("aria-hidden", "true");
      document.documentElement.classList.remove("gp-lock");
      closeDp();
      setTimeout(function () { gp.classList.remove("closing"); }, reduce ? 0 : 650);
      gpBack && gpBack.focus && gpBack.focus({ preventScroll: true });
    };
    document.addEventListener("click", function (e) {
      var o = e.target.closest("[data-open-custom]");
      if (o) { e.preventDefault(); openGp(o); return; }
      if (e.target.closest("[data-close-custom]")) { e.preventDefault(); closeGp(); }
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !(pol && !pol.hidden)) closeGp(); });
    if (location.hash === "#customForm") setTimeout(function () { openGp(null); }, 800);
  }

  /* ------------------------------------------------------------ Esc closes the topmost layer */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (dp && !dp.hidden) { closeDp(); dpInput && dpInput.focus(); return; }
    closePolicy();
  });
})();
