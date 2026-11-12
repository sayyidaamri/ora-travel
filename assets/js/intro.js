/* ORA Travel — group D: tour detail / itinerary / country detail / place-hotel-restaurant lists */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mqMobile = window.matchMedia("(max-width: 767px)");
  var body = document.body, wrap = $("#wrapper"), loading = $("#loading");
  var T = function (ms) { return reduce ? Math.min(ms, 50) : ms; };

  /* ------------------------------------------------------------ viewport-sized heroes */
  var lastW = 0;
  function sizeHeroes() {
    if (mqMobile.matches && window.innerWidth === lastW) return; // ignore mobile URL-bar resizes
    lastW = window.innerWidth;
    var h = window.innerHeight;
    var banner = $("#banner"); if (banner) banner.style.height = (h + 50) + "px";
    var seq = $("#seqHero"); if (seq) seq.style.height = h + "px";
    $$(".ip-seq").forEach(function (s) { s.style.height = h + "px"; });
    var lc = $(".localInfo"), te = $(".intro_tourexplain");
    if (lc && te) te.style.height = window.innerWidth > 1200 ? lc.offsetHeight - 130 + "px" : "";
  }
  sizeHeroes();
  window.addEventListener("resize", sizeHeroes);
  window.addEventListener("load", sizeHeroes);

  /* ------------------------------------------------------------ local clocks (data-tz = UTC offset in hours) */
  var clocks = $$("[data-tz]");
  function tick() {
    var now = Date.now() + new Date().getTimezoneOffset() * 60000;
    clocks.forEach(function (el) {
      var d = new Date(now + Number(el.dataset.tz) * 3600000);
      el.textContent = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    });
  }
  if (clocks.length) { tick(); setInterval(tick, 15000); }

  /* ------------------------------------------------------------ load sequence: loader → colour curtain with GO → reveal */
  var curtain = $(".bannerBox .seqStartBg, #seqHero .seqStartBg");
  var heroTitle = $("#seqHero .seqTitle");
  function boot() {
    if (loading) {
      setTimeout(function () { loading.classList.add("ring-out"); }, T(1500));
      setTimeout(function () { loading.classList.add("fade"); }, T(2100));
      setTimeout(function () { loading.remove(); wrap.classList.remove("home-anim"); }, T(2700));
    } else wrap.classList.remove("home-anim");
    setTimeout(function () { if (heroSeq) heroSeq.show(0); }, T(2300));
    setTimeout(function () { curtain && curtain.classList.add("open"); heroTitle && heroTitle.classList.add("start"); }, T(2700));
  }

  /* ------------------------------------------------------------ scroll-down buttons */
  document.addEventListener("click", function (e) {
    var b = e.target.closest(".scrollDown");
    if (!b) return;
    var pop = b.closest(".ip-scroll");
    if (pop) { pop.scrollTo({ top: $(".ip-body", pop).offsetTop, behavior: reduce ? "auto" : "smooth" }); return; }
    var host = b.closest(".bannerBox, .seqComplex");
    var y = host.getBoundingClientRect().bottom + window.scrollY - (host.classList.contains("bannerBox") ? 50 : 100);
    window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  });

  /* ------------------------------------------------------------ "coming soon" downloads */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-soon]");
    if (!a) return;
    e.preventDefault();
    var box = a.closest(".visaTitle_content, .reserveBtn");
    var note = box && $(".soon-note", box);
    if (note) note.textContent = "Coming soon — the downloadable guide is being prepared. Ask your ORA planner for a copy.";
  });

  /* ------------------------------------------------------------ scroll reveals */
  if (window.ORA && ORA.inView) {
    ORA.inView($$(".featureShow"), "element", "0px 0px -25% 0px");
    ORA.inView($$(".featureShowBox .photo"), "elementMobile", "0px 0px -20% 0px");
    ORA.inView($$(".hotelFeature .featureContent"), "elementMobile", "0px 0px -10% 0px");
    ORA.inView($$(".itineraryOther"), "element", "0px 0px -10% 0px");
  }

  /* ------------------------------------------------------------ sticky introduce menu (tour / country) */
  var info = $("#introduceInfo"), menu = info && $("#introMenu", info), plan = $(".planMaxBox");
  function stick() {
    if (!menu) return;
    var fixed = info.getBoundingClientRect().top <= 0;
    if (fixed !== menu.classList.contains("introduceMenuFixed")) {
      menu.classList.toggle("introduceMenuFixed", fixed);
      info.style.paddingTop = fixed ? menu.offsetHeight + "px" : "";
    }
    plan && plan.classList.toggle("hide", fixed);
  }
  window.addEventListener("scroll", stick, { passive: true }); stick();

  /* ------------------------------------------------------------ "more info" tabs (inline on desktop, modal on mobile) */
  var tw = $("#moreInfo"), lastTabBtn = null;
  function closeTab() {
    if (!tw) return;
    var open = $(".tabBox.open", tw);
    if (!open) return false;
    open.classList.remove("open");
    $("#tabsMenu").classList.add("open");
    tw.classList.remove("openMobile");
    lastTabBtn && lastTabBtn.focus({ preventScroll: true });
    return true;
  }
  if (tw) tw.addEventListener("click", function (e) {
    var b = e.target.closest("[data-tab]");
    if (b) {
      lastTabBtn = b;
      var box = $("#" + b.dataset.tab);
      if (mqMobile.matches) tw.classList.add("openMobile"); else $("#tabsMenu").classList.remove("open");
      box.classList.add("open");
      $(".close", box).focus({ preventScroll: true });
      return;
    }
    if (e.target.closest(".close") || (tw.classList.contains("openMobile") && e.target.classList.contains("tabBox"))) closeTab();
  });

  /* ------------------------------------------------------------ sequence slider (itinerary hero) */
  function Seq(root, auto) {
    var li = $$(".seq-canvas > li", root), cur = -1, timer = null, lock = false;
    function show(i) {
      if (!li.length) return;
      i = (i + li.length) % li.length;
      if (i === cur) return;
      li.forEach(function (el, k) { el.classList.remove("seq-in", "seq-out"); if (k === cur) el.classList.add("seq-out"); if (k === i) el.classList.add("seq-in"); });
      cur = i; lock = true; setTimeout(function () { lock = false; }, T(1600));
      restart();
    }
    function restart() { clearInterval(timer); if (auto && li.length > 1 && !reduce) timer = setInterval(function () { show(cur + 1); }, 7000); }
    function go(d) { if (!lock) show(cur + d); }
    var p = $(".seq-prev", root), n = $(".seq-next", root);
    p && p.addEventListener("click", function () { go(-1); });
    n && n.addEventListener("click", function () { go(1); });
    var sx = null;
    root.addEventListener("pointerdown", function (e) { sx = e.clientX; });
    root.addEventListener("pointerup", function (e) { if (sx === null) return; var dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); });
    return { show: show, go: go };
  }
  var heroSeq = $("#seqHero") ? Seq($("#seqHero"), true) : null;

  /* ------------------------------------------------------------ rotating "ITINERARY" letters */
  $$(".box-words-wrapper").forEach(function (w) {
    var words = $$("b", w);
    if (words.length < 2 || reduce) return;
    var k = 0;
    setInterval(function () {
      var a = words[k], b = words[(k + 1) % words.length];
      $$("i", a).forEach(function (i, n) { i.className = ""; setTimeout(function () { i.className = "out"; }, n * 80); });
      $$("i", b).forEach(function (i, n) { i.className = ""; setTimeout(function () { i.className = "in"; }, n * 80); });
      a.classList.remove("is-visible"); b.classList.add("is-visible");
      k = (k + 1) % words.length;
    }, 3500);
  });

  /* ------------------------------------------------------------ list pages */
  var dataEl = $("#listData");
  if (dataEl) initList(JSON.parse(dataEl.textContent));

  function initList(D) {
    var qs = new URLSearchParams(location.search);
    var t = qs.get("t"), c = qs.get("c"), tour = t && D.tours[t];
    var filter = tour ? tour.country : (c && D.countries[c] ? c : null);
    var ul = $("#showBlock"), tiles = $$("li", ul), more = $(".loadMore"), empty = $(".emptyNote");
    var PAGE = 8, shown = PAGE;

    // menu: point back to the tour / country the visitor came from
    var mp = $("#fixedMenu .push_tourname"), q = tour ? "?t=" + t : filter ? "?c=" + filter : "";
    if (tour) {
      $(".tn", mp).textContent = tour.title;
      $("a", mp).href = "tour-" + t + ".html#introduceInfo";
      var pr = document.createElement("div"); pr.className = "push_price";
      pr.innerHTML = '<div class="nowprice">· Guide price</div>Price: <span class="price"></span>';
      $(".price", pr).textContent = tour.price;
      $("#fixedMenu .menuPushBox").appendChild(pr);
      var it = document.createElement("li"); it.innerHTML = '<a href="itinerary-' + t + '.html">Itinerary</a>';
      $("#fixedMenu .introMenu ul").appendChild(it);
    } else if (filter) {
      $(".tn", mp).textContent = D.countries[filter];
      $("a", mp).href = "country-" + filter + ".html#introduceInfo";
      $("samp", mp).textContent = "Back to country guide";
    }
    if (q) $$("#fixedMenu .introMenu li a").forEach(function (a) { if (!/itinerary/.test(a.getAttribute("href"))) a.href = a.getAttribute("href").split("?")[0] + q; });

    var pool = tiles.filter(function (li) { return !filter || li.dataset.country === filter; });
    if (!pool.length) { empty.hidden = false; empty.firstChild.textContent = "No " + ({ place: "places", hotel: "hotels", restaurant: "restaurants" })[D.type] + " listed for " + (D.countries[filter] || "this trip") + " yet — here are our favourites elsewhere. "; pool = tiles; }
    function layout() {
      var vis = pool.slice(0, shown);
      tiles.forEach(function (li) { li.hidden = vis.indexOf(li) < 0; li.className = ""; });
      var rest = vis.slice(2);
      vis.slice(0, 2).forEach(function (li) { li.className = vis.length === 1 ? "sizeF" : "sizeM"; });
      for (var i = 0; i < rest.length; i += 4) {
        var row = rest.slice(i, i + 4);
        row.forEach(function (li, k) {
          li.className = row.length === 4 ? "sizeS" : row.length === 3 ? (k === 0 ? "sizeM" : "sizeS") : row.length === 2 ? "sizeM" : "sizeF";
        });
      }
      more.hidden = pool.length <= shown;
    }
    layout();
    $("button", more).addEventListener("click", function () { shown += PAGE; layout(); });

    /* ---- item detail popup */
    var pop = $("#itemPop"), sc = $(".ip-scroll", pop), seqEl = $(".ip-seq", pop), items = D.items, cur = null, opener = null, io = null, closeT;
    var byId = function (id) { for (var i = 0; i < items.length; i++) if (items[i].id === id) return items[i]; };
    var list = function () { return pool.map(function (li) { return byId(Number(li.dataset.id)); }); };
    function stat(it, k) { var s = (it.id * 7919 + k * 104729) % 9000; return [4000 + s % 900, 3000 + (s * 3) % 6000, 20000 + s * 3][k]; }
    function fill(it) {
      $(".monitorImg", pop).style.backgroundImage = "url(" + it.img + ")";
      $(".seqTitle .subTitle", pop).textContent = it.cname;
      $(".seqTitle .mainTitle span", pop).textContent = it.name;
      $(".pageImg", pop).style.backgroundImage = "url(" + it.img + ")";
      var ii = $(".introImg", pop); if (ii) ii.style.backgroundImage = "url(" + it.img + ")";
      $(".lineOne", pop).textContent = it.name;
      $(".lineTwo", pop).textContent = it.cname;
      $(".describe", pop).textContent = it.text;
      $$(".number", pop).forEach(function (n) { n.textContent = "0"; n.dataset.to = stat(it, Number(n.dataset.n)); });
      var hi = $(".hi-txt", pop);
      if (hi) hi.innerHTML = "Location: " + it.cname + "<br>Check-in 15:00 · Check-out 11:00<br>Rooms are allocated by ORA Travel for each departure; ask your planner about upgrades and connecting rooms.";
      var ra = $(".ri-a", pop), rb = $(".ri-b", pop);
      if (ra) { ra.textContent = it.text.split(/[.,—]/)[0]; rb.textContent = ["Group dinners", "Long lunches", "Celebrations", "Date night"][it.id % 4]; }
      var rel = list().filter(function (x) { return x !== it; }).slice(0, 3);
      if (rel.length < 3) rel = items.filter(function (x) { return x !== it && rel.indexOf(x) < 0; }).slice(0, 3 - rel.length).concat(rel);
      $(".attractionPhoto ul", pop).innerHTML = rel.map(function (r) {
        return '<li><button type="button" data-go="' + r.id + '" aria-label="' + r.name.replace(/"/g, "&quot;") + '"></button><div class="photo" style="background-image:url(' + r.img + ')"></div><div class="newsMask"></div><div class="innerBoxFt"><div class="boxComplex"><span><div class="title"></div><div class="country"></div></span></div></div></li>';
      }).join("");
      $$(".attractionPhoto li", pop).forEach(function (li, k) { $(".title", li).textContent = rel[k].name; $(".country", li).textContent = rel[k].cname; });
    }
    function animate() {
      [seqEl, $(".seqStartBg", pop), $(".seqTitle", pop)].forEach(function (el) { el.classList.remove("show", "open", "start"); });
      $$(".attractionPage, .restaurantInfo", pop).forEach(function (el) { el.classList.remove("element"); });
      void seqEl.offsetWidth;
      seqEl.classList.add("show");
      setTimeout(function () { $(".seqStartBg", pop).classList.add("open"); $(".seqTitle", pop).classList.add("start"); }, T(150));
      if (io) io.disconnect();
      if ("IntersectionObserver" in window) {
        io = new IntersectionObserver(function (ents) {
          ents.forEach(function (en) {
            if (!en.isIntersecting) return;
            en.target.classList.add("element"); io.unobserve(en.target);
            if (en.target.classList.contains("aboutAttraction")) countUp();
          });
        }, { root: sc, rootMargin: "0px 0px -15% 0px" });
        $$(".attractionPage, .restaurantInfo, .aboutAttraction", pop).forEach(function (el) { io.observe(el); });
      } else { $$(".attractionPage, .restaurantInfo", pop).forEach(function (el) { el.classList.add("element"); }); countUp(); }
    }
    function countUp() {
      $$(".number", pop).forEach(function (n) {
        var to = Number(n.dataset.to), t0 = performance.now(), dur = reduce ? 1 : 1500;
        (function step(now) { var p = Math.min(1, (now - t0) / dur); n.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); })(t0);
      });
    }
    function open(id, fromTile) {
      var it = byId(id); if (!it) return;
      clearTimeout(closeT);
      if (!cur) opener = fromTile || document.activeElement;
      cur = it; fill(it);
      pop.hidden = false; sc.scrollTop = 0;
      document.documentElement.classList.add("ip-lock");
      sizeHeroes(); lastW = 0; sizeHeroes();
      requestAnimationFrame(function () { pop.classList.add("vis"); });
      animate();
      $(".ip-x", pop).focus({ preventScroll: true });
    }
    function close() {
      if (!cur) return false;
      cur = null; pop.classList.remove("vis");
      closeT = setTimeout(function () { pop.hidden = true; }, T(400));
      document.documentElement.classList.remove("ip-lock");
      if (/^#(place|hotel|restaurant)-/.test(location.hash)) history.replaceState(null, "", location.pathname + location.search);
      opener && opener.focus && opener.focus({ preventScroll: true });
      return true;
    }
    function step(d) {
      var L = list(), i = L.indexOf(cur); if (i < 0) i = 0;
      var nx = L[(i + d + L.length) % L.length];
      history.replaceState(null, "", "#" + D.type + "-" + nx.id);
      open(nx.id);
    }
    function fromHash() {
      var m = location.hash.match(/^#(place|hotel|restaurant)-(\d+)$/);
      if (m && m[1] === D.type) open(Number(m[2])); else close();
    }
    window.addEventListener("hashchange", fromHash);
    ul.addEventListener("click", function (e) { var a = e.target.closest("li > a"); if (a) opener = a; });
    pop.addEventListener("click", function (e) {
      if (e.target.closest(".ip-close")) { close(); return; }
      if (e.target.closest(".seq-prev")) { step(-1); return; }
      if (e.target.closest(".seq-next")) { step(1); return; }
      var g = e.target.closest("[data-go]");
      if (g) { history.replaceState(null, "", "#" + D.type + "-" + g.dataset.go); open(Number(g.dataset.go)); }
    });
    if (location.hash) setTimeout(fromHash, T(2800));
    ORA.closeItem = close;
    ORA.stepItem = step;
  }

  /* ------------------------------------------------------------ keyboard */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { if (ORA.closeItem && ORA.closeItem()) return; closeTab(); }
    if (ORA.stepItem && $("#itemPop.vis") && (e.key === "ArrowLeft" || e.key === "ArrowRight")) ORA.stepItem(e.key === "ArrowLeft" ? -1 : 1);
  });

  boot();
})();
