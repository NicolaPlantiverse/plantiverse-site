/* =========================================================================
   Plantiverse — ai: behaviour (fork of nova.js)
   Vanilla, no build step, no dependency, works from file:// as well as http.
   Modules: i18n · header · spine · rise · steps · wipe · data · instruments
            fields · flora · record · router
   ========================================================================= */

(function () {
  "use strict";

  const N = window.NOVA;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  let lang = "en";

  /* a few strings carry both languages separated by a pipe: "attivo|active" */
  const pick = (value) => {
    if (typeof value !== "string" || value.indexOf("|") === -1) return value;
    const parts = value.split("|");
    return lang === "it" ? parts[0] : parts[1];
  };
  const tr = (obj) => (obj && obj[lang]) || (obj && obj.en) || {};

  /* --- i18n ------------------------------------------------------------- */
  const i18n = {
    get(key) {
      const d = N.i18n[lang] || N.i18n.en;
      return Object.prototype.hasOwnProperty.call(d, key) ? d[key] : N.i18n.en[key] || "";
    },
    detect() {
      const asked = new URLSearchParams(window.location.search).get("lang");
      if (asked === "en" || asked === "it") return asked;
      let stored = null;
      try { stored = window.localStorage.getItem("pv-lang"); } catch (e) { stored = null; }
      if (stored === "en" || stored === "it") return stored;
      return (navigator.language || "en").toLowerCase().indexOf("it") === 0 ? "it" : "en";
    },
    store(v) { try { window.localStorage.setItem("pv-lang", v); } catch (e) {} },
    mark(v) {
      if (!window.history || !window.history.replaceState) return;
      const url = new URL(window.location.href);
      url.searchParams.set("lang", v);
      window.history.replaceState({}, "", url);
    },
    apply(next) {
      lang = next;
      document.documentElement.lang = next;
      document.title = i18n.get("meta.title");
      const set = (sel, attr, key) => { const el = $(sel); if (el) el.setAttribute(attr, i18n.get(key)); };
      set('meta[name="description"]', "content", "meta.desc");
      set('meta[property="og:title"]', "content", "meta.title");
      set('meta[property="og:description"]', "content", "meta.desc");
      const loc = $('meta[property="og:locale"]');
      if (loc) loc.setAttribute("content", next === "it" ? "it_IT" : "en_GB");

      $$("[data-i18n]").forEach((el) => { el.textContent = i18n.get(el.dataset.i18n); });
      $$("[data-i18n-html]").forEach((el) => { el.innerHTML = i18n.get(el.dataset.i18nHtml); });
      $$("[data-i18n-aria]").forEach((el) => { el.setAttribute("aria-label", i18n.get(el.dataset.i18nAria)); });
      $$("[data-lang-href]").forEach((el) => {
        const m = el.dataset.langHref.split(",").map((x) => x.split(":"));
        const hit = m.filter((x) => x[0] === next)[0];
        if (hit) el.setAttribute("href", hit[1]);
      });
      $$("[data-i18n-alt]").forEach((el) => { el.setAttribute("alt", i18n.get(el.dataset.i18nAlt)); });
      $$("[data-i18n-ph]").forEach((el) => { el.setAttribute("placeholder", i18n.get(el.dataset.i18nPh)); });
      $$(".lang button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === next)));

      proof.render(); steps.render(); wipe.copy(); data.render(); instruments.render();
      fields.render(); flora.render(); record.render(); team.render(); router.render();
      mind.render(); platform.render(); counters.render(); neural.relabel();
      if (plant.dlg && plant.dlg.open) plant.render();
    }
  };

  /* --- header and drawer ------------------------------------------------ */
  const header = {
    init() {
      const drawer = $("#drawer"), btn = $("#burger");
      const open = (v) => {
        drawer.classList.toggle("is-open", v);
        btn.setAttribute("aria-expanded", String(v));
        const lab = $("[data-menu-label]", btn);
        if (lab) lab.textContent = i18n.get(v ? "nav.close" : "nav.menu");
      };
      btn.addEventListener("click", () => open(!drawer.classList.contains("is-open")));
      $$("a", drawer).forEach((a) => a.addEventListener("click", () => open(false)));
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && drawer.classList.contains("is-open")) { open(false); btn.focus(); }
      });
      window.addEventListener("resize", () => { if (window.innerWidth > 900) open(false); });

      $$(".lang button").forEach((b) => b.addEventListener("click", () => {
        if (b.dataset.lang === lang) return;
        i18n.store(b.dataset.lang); i18n.apply(b.dataset.lang); i18n.mark(b.dataset.lang);
      }));
    }
  };

  /* --- spine: the record fills while the visitor goes down -------------- */
  const spine = {
    init() {
      const fill = $("#spineFill"), dots = $$(".spine__dot"), links = $$(".nav a");
      const rail = $(".spine");
      const height = () => (rail ? rail.clientHeight - 192 : 0);

      const onScroll = () => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        if (fill) fill.style.height = (height() * p) + "px";
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      onScroll();

      const sections = $$("main section[id]");
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const id = e.target.id;
          dots.forEach((d) => {
            if (d.dataset.sec === id) d.classList.add("is-seen", "is-here");
            else d.classList.remove("is-here");
          });
          links.forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + id)));
        });
      }, { rootMargin: "-45% 0px -45% 0px" });
      sections.forEach((s) => io.observe(s));

      window.addEventListener("scroll", () => {
        if (window.scrollY > window.innerHeight * 0.5) return;
        dots.forEach((d) => d.classList.remove("is-here"));
        links.forEach((a) => a.setAttribute("aria-current", "false"));
      }, { passive: true });
    }
  };

  /* --- reveal ----------------------------------------------------------- */
  const rise = {
    init() {
      const items = $$(".rise, .step");
      if (reduced || !("IntersectionObserver" in window)) {
        items.forEach((el) => el.classList.add("is-visible"));
        return;
      }
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
      }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
      items.forEach((el) => io.observe(el));
    },
    rescan() {
      if (reduced) { $$(".step").forEach((el) => el.classList.add("is-visible")); return; }
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
      }, { threshold: 0.12 });
      $$(".step:not(.is-visible)").forEach((el) => io.observe(el));
    }
  };

  /* --- proof strip: same numbers as the Record, shown before anyone has
     to scroll for them --------------------------------------------------- */
  const proof = {
    render() {
      const stats = $("#proofStats");
      if (stats) {
        stats.innerHTML = N.proof.map((x) => {
          const t = tr(x);
          return '<div class="proof__stat"><b>' + esc(t.value) + "</b><span>" + esc(t.label) + "</span></div>";
        }).join("");
      }
      const p = $("#proofPartners");
      if (p) { p.textContent = N.partners.map((x) => x.name).join(" · "); }
    }
  };

  /* --- 01 the four steps, each with its own small reading --------------- */
  const SPARKS = {
    observe:
      '<path d="M2 30 8 22 14 33 20 18 26 28 32 14 38 31 44 20 50 34 56 17 62 27 68 12 74 30 80 21 86 33 92 16 98 29 104 19 110 32 116 15 122 26 128 13 134 28 140 20 146 31 152 17 158 25 164 22" fill="none" stroke="currentColor" stroke-width="1.1" stroke-opacity=".55"/>' +
      '<g fill="currentColor"><circle cx="32" cy="14" r="2.2"/><circle cx="98" cy="29" r="2.2"/><circle cx="152" cy="17" r="2.2"/></g>',
    interpret:
      '<path d="M2 34 14 26 26 36 38 22 50 32 62 18 74 30 86 20 98 31 110 17 122 27 134 15 146 26 158 19 164 23" fill="none" stroke="currentColor" stroke-width="1" stroke-opacity=".22"/>' +
      '<path d="M2 32C28 30 40 26 62 24S104 20 130 16 158 12 164 11" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    decide:
      '<path d="M2 20h164" stroke="currentColor" stroke-width="1" stroke-dasharray="3 5" stroke-opacity=".35"/>' +
      '<path d="M2 33C26 31 44 28 66 26s34 2 46-6 30-12 52-14" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
      '<circle cx="120" cy="14" r="4.5" fill="none" stroke="#e0a34c" stroke-width="1.4"/><circle cx="120" cy="14" r="1.8" fill="#e0a34c"/>',
    automate:
      '<path d="M2 23H68M80 23H98" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
      '<circle cx="74" cy="23" r="5" fill="none" stroke="currentColor" stroke-width="1.4"/>' +
      '<path d="M98 13L120 33V13L98 33Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>' +
      '<path d="M138 14c4 6 6 9 6 12a6 6 0 0 1-12 0c0-3 2-6 6-12z" fill="currentColor" fill-opacity=".75"/>' +
      '<path d="M158 24c3 4 4 6 4 8a4 4 0 0 1-8 0c0-2 1-4 4-8z" fill="currentColor" fill-opacity=".45"/>' +
      '<circle cx="2" cy="23" r="2.2" fill="currentColor"/>',
    learn:
      '<path d="M2 30C30 30 48 24 72 22s28 6 46 4" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
      '<path d="M118 26c22-2 34-10 30-18-4-7-18-4-16 4 2 7 16 12 32 14" fill="none" stroke="currentColor" stroke-width="1.2" stroke-opacity=".6" stroke-dasharray="2.5 3"/>' +
      '<circle cx="2" cy="30" r="2.2" fill="currentColor"/>'
  };

  const steps = {
    render() {
      const host = $("#steps");
      if (!host) return;
      host.innerHTML = N.steps.map((s) => {
        const t = tr(s);
        return '<article class="step">' +
          '<span class="step__num">' + s.num + "</span>" +
          '<svg class="step__spark" viewBox="0 0 168 46" aria-hidden="true" focusable="false">' + SPARKS[s.id] + "</svg>" +
          '<h3 class="h3 step__name">' + esc(t.name) + "</h3>" +
          '<p class="step__line">' + esc(t.line) + "</p>" +
          '<span class="step__meta">' + esc(t.meta) + "</span>" +
          "</article>";
      }).join("");
      rise.rescan();
    }
  };

  /* --- 02 the wipe between camera view and index map -------------------- */
  const wipe = {
    init() {
      const box = $("#wipe");
      if (!box) return;
      const range = $("#wipeRange");
      const set = (pct) => {
        const v = Math.max(0, Math.min(100, pct));
        box.style.setProperty("--x", v + "%");
        if (range && Number(range.value) !== Math.round(v)) range.value = Math.round(v);
      };
      const fromEvent = (e) => {
        const r = box.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
        set((x / r.width) * 100);
      };
      let dragging = false;
      const start = (e) => { dragging = true; fromEvent(e); };
      const move = (e) => { if (dragging) { fromEvent(e); if (e.cancelable) e.preventDefault(); } };
      const end = () => { dragging = false; };
      box.addEventListener("dragstart", (e) => e.preventDefault());
      box.addEventListener("mousedown", start);
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", end);
      box.addEventListener("touchstart", start, { passive: true });
      window.addEventListener("touchmove", move, { passive: false });
      window.addEventListener("touchend", end);
      if (range) range.addEventListener("input", () => set(Number(range.value)));
      set(50);
    },
    copy() {
      const host = $("#wipeCopy");
      if (!host) return;
      host.innerHTML =
        '<div class="inst__specs" style="grid-template-columns:1fr">' +
        '<div><dt>' + esc(i18n.get("machine.left")) + "</dt><dd>" +
        (lang === "it"
          ? "La vegetazione sana riflette molto nel vicino infrarosso, quindi nell'immagine in falso colore appare più luminosa."
          : "Healthy vegetation reflects strongly in the near infrared, so in the false-colour image it shows up brightest.") +
        "</dd></div>" +
        '<div><dt>' + esc(i18n.get("machine.right")) + "</dt><dd>" +
        (lang === "it"
          ? "La stessa scena ridotta dal modello a un numero per punto: da qui l'intelligenza artificiale decide dove guardare per primo."
          : "The same scene reduced by the model to one number per point: from here the artificial intelligence decides where to look first.") +
        "</dd></div></div>";
    }
  };

  /* --- 03 horizons and public services ---------------------------------- */
  const data = {
    render() {
      const h = $("#horizons");
      if (h) {
        h.innerHTML = N.horizons.map((x) => {
          const t = tr(x);
          return '<article class="horizon">' +
            '<img src="' + x.img + '" alt="" loading="lazy" decoding="async">' +
            '<span class="horizon__scale">' + esc(t.scale) + "</span>" +
            '<h3 class="h3">' + esc(t.name) + "</h3>" +
            "<p>" + esc(t.line) + "</p></article>";
        }).join("");
      }
      const f = $("#feeds");
      if (f) {
        f.innerHTML = N.feeds.map((x) => {
          const stateKey = x.state === "open" ? "data.open" : "data.account";
          return '<article class="feed">' +
            '<div class="feed__top"><span class="feed__name">' + esc(x.name) + "</span>" +
            '<span class="state state--' + x.state + '">' + esc(i18n.get(stateKey)) + "</span></div>" +
            '<span class="feed__ag">' + esc(x.agency) + "</span>" +
            '<p class="feed__d">' + esc(x[lang] || x.en) + "</p>" +
            '<div class="feed__nums"><span>' + esc(i18n.get("data.res")) + "<b>" + esc(pick(x.res)) + "</b></span>" +
            "<span>" + esc(i18n.get("data.rev")) + "<b>" + esc(pick(x.rev)) + "</b></span></div>" +
            "</article>";
        }).join("");
      }
    }
  };

  /* --- sensors, kept compact: the eyes of the model, not the product ----- */
  const instruments = {
    render() {
      const host = $("#instruments-list");
      if (!host) return;
      host.innerHTML = N.instruments.map((x) => {
        const t = tr(x);
        return '<article class="eye">' +
          '<figure class="eye__media ' + x.cls + '"><img src="' + x.img + '" alt="' + esc(t.name) + '" loading="lazy" decoding="async"></figure>' +
          '<div class="eye__body"><div class="eye__top"><h3 class="eye__name">' + esc(t.name) + "</h3>" +
          '<span class="tag ' + (x.id === "eco22" ? "tag--val" : "tag--on") + '">' + esc(t.state) + "</span></div>" +
          '<span class="inst__maker' + (x.patented ? " inst__maker--patent" : "") + '">' +
          (x.patented ? esc(i18n.get("inst.patented")) : esc(i18n.get("inst.maker")) + " · " + esc(t.maker)) + "</span>" +
          '<p class="eye__line">' + esc(t.line) + "</p></div></article>";
      }).join("");
    }
  };

  /* --- 05 fields --------------------------------------------------------- */
  const fields = {
    render() {
      const host = $("#mosaic");
      if (!host) return;
      host.innerHTML = N.pilots.map((p) => {
        const t = tr(p);
        const cls = p.size === "wide" ? " plot--wide" : p.size === "big" ? " plot--big" : "";
        const tagCls = /valid/i.test(t.state) ? "tag--val" : /stud/i.test(t.state) ? "tag--study" : /complet|conclus/i.test(t.state) ? "tag--done" : "tag--on";
        return '<article class="plot' + cls + '">' +
          '<img src="' + p.img + '" alt="' + esc(t.name) + ", " + esc(t.place) + '" loading="lazy" decoding="async">' +
          '<div class="plot__body"><span class="tag ' + tagCls + '" style="align-self:flex-start">' + esc(t.state) + "</span>" +
          "<div><span class='plot__place'>" + esc(t.place) + "</span>" +
          '<h3 class="h3" style="margin-top:6px">' + esc(t.name) + "</h3>" +
          (t.note ? '<p class="plot__note">' + esc(t.note) + "</p>" : "") +
          (p.demo && N.plant ? '<button type="button" class="plot__open" data-plant-open>' + esc(tr(N.plant).open) + ' <span aria-hidden="true">&#8599;</span></button>' : "") +
          "</div></div></article>";
      }).join("");
    }
  };

  /* --- 06 flora ---------------------------------------------------------- */
  const flora = {
    ready: false,
    init() {
      const input = $("#floraInput");
      if (!input) return;
      input.addEventListener("input", () => flora.search(input.value));
      // the list arrives as a deferred script, so wait for it before the first draw
      const wait = window.setInterval(() => {
        if (window.FLORA_DATA) { window.clearInterval(wait); flora.ready = true; flora.render(); }
      }, 120);
      window.setTimeout(() => window.clearInterval(wait), 8000);
    },
    render() {
      const total = $("#floraTotal");
      const line = $("#floraObservedLine");
      if (!window.FLORA_DATA) { if (total) total.textContent = "6.072"; return; }
      const list = window.FLORA_DATA;
      const seen = list.filter((r) => r[3]).length;
      if (total) total.textContent = list.length.toLocaleString(lang === "it" ? "it-IT" : "en-GB");
      if (line) {
        line.textContent = lang === "it"
          ? seen + " di queste sono passate da un'acquisizione Plantiverse. Le altre restano nell'elenco di riferimento, in attesa del loro turno."
          : seen + " of them have been through a Plantiverse acquisition. The others stay in the reference list, waiting their turn.";
      }
      flora.search($("#floraInput") ? $("#floraInput").value : "");
    },
    search(q) {
      const out = $("#floraOut"), foot = $("#floraFoot");
      if (!out || !window.FLORA_DATA) return;
      const term = (q || "").trim().toLowerCase();
      const list = window.FLORA_DATA;
      let rows = term
        ? list.filter((r) => r[0].indexOf(term) !== -1 || (r[1] && r[1].indexOf(term) !== -1))
        : list.filter((r) => r[3]);
      const shown = rows.slice(0, 24);
      if (!shown.length) {
        out.innerHTML = '<div class="sp" style="grid-column:1/-1"><b style="font-style:normal">' + esc(i18n.get("flora.none")) + "</b></div>";
        if (foot) foot.textContent = "";
        return;
      }
      out.innerHTML = shown.map((r) => {
        const name = r[0].replace(/\s+/g, " ").trim();
        const on = r[3] ? " on" : "";
        const mark = r[3] ? i18n.get("flora.observed") : i18n.get("flora.listed");
        return '<div class="sp"><b>' + esc(name) + (r[1] ? "<span>" + esc(r[1]) + "</span>" : "") + "</b>" +
          '<span class="mark' + on + '">' + esc(mark) + "</span></div>";
      }).join("");
      if (foot) foot.textContent = rows.length > 24 ? i18n.get("flora.hint") + " · " + rows.length : "";
    }
  };

  /* --- 07 record and partners -------------------------------------------- */
  const record = {
    filter: "all",
    init() {
      const f = $("#recFilters");
      if (!f) return;
      f.addEventListener("click", (e) => {
        const b = e.target.closest("button");
        if (!b) return;
        record.filter = b.dataset.f;
        $$("button", f).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        record.apply();
      });
    },
    render() {
      const host = $("#rec");
      if (host) {
        host.innerHTML = N.record.map((r) => {
          const t = tr(r);
          return '<article class="rec__row" data-t="' + r.type + '">' +
            '<span class="rec__date">' + esc(pick(r.date)) + "</span>" +
            '<div><h3 class="rec__title">' + esc(t.title) + "</h3>" +
            '<span class="rec__src">' + esc(t.src) + "</span></div>" +
            '<span class="rec__type">' + esc(i18n.get("rec." + (r.type === "partner" ? "partner" : r.type))) + "</span></article>";
        }).join("");
        record.apply();
      }
      const p = $("#partners");
      if (p) {
        p.innerHTML = N.partners.map((x) =>
          "<figure><img src=\"" + x.img + '" alt="' + esc(x.name) + '" loading="lazy" decoding="async">' +
          "<figcaption>" + esc(x[lang] || x.en) + "</figcaption></figure>").join("");
      }
    },
    apply() {
      $$("#rec .rec__row").forEach((row) => {
        row.classList.toggle("is-out", record.filter !== "all" && row.dataset.t !== record.filter);
      });
    }
  };

  /* --- 08 team ------------------------------------------------------------ */
  const team = {
    render() {
      const host = $("#team-list");
      if (!host) return;
      host.innerHTML = N.team.map((m) => {
        const t = tr(m);
        return '<article class="member">' +
          '<img class="member__img" src="' + m.img + '" alt="' + esc(t.name) + '" loading="lazy" decoding="async">' +
          '<h3 class="h3 member__name">' + esc(t.name) + "</h3>" +
          '<span class="member__role">' + esc(t.role) + "</span>" +
          '<p class="member__line">' + esc(t.line) + "</p></article>";
      }).join("");
    }
  };

  /* --- 09 contact router -------------------------------------------------- */
  const router = {
    active: 0,
    init() {
      const list = $("#intents");
      if (!list) return;
      list.addEventListener("click", (e) => {
        const b = e.target.closest(".intent");
        if (b) { router.active = Number(b.dataset.i); router.render(); }
      });
      list.addEventListener("keydown", (e) => {
        const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
        if (keys.indexOf(e.key) === -1) return;
        e.preventDefault();
        const last = N.intents.length - 1;
        let n = router.active;
        if (e.key === "ArrowDown") n = n >= last ? 0 : n + 1;
        if (e.key === "ArrowUp") n = n <= 0 ? last : n - 1;
        if (e.key === "Home") n = 0;
        if (e.key === "End") n = last;
        router.active = n; router.render();
        const b = $('.intent[data-i="' + n + '"]', list);
        if (b) b.focus();
      });
      $("#contactForm").addEventListener("submit", (e) => { e.preventDefault(); router.compose(); });
    },
    render() {
      const list = $("#intents");
      if (!list) return;
      list.innerHTML = N.intents.map((x, i) => {
        const t = tr(x);
        return '<button type="button" class="intent" role="tab" aria-controls="contactForm" data-i="' + i + '"' +
          ' aria-selected="' + (i === router.active) + '" tabindex="' + (i === router.active ? "0" : "-1") + '">' +
          '<span class="intent__n">0' + (i + 1) + "</span><span>" + esc(t.name) + "</span>" +
          '<span class="intent__m" aria-hidden="true">&#9679;</span></button>';
      }).join("");

      const intent = N.intents[router.active];
      const t = tr(intent);
      const labels = N.labels[lang] || N.labels.en;
      $("#formIntro").textContent = t.line;
      const control = (name) => {
        const id = "f-" + name;
        const input = name === "message"
          ? '<textarea id="' + id + '" name="' + name + '"></textarea>'
          : '<input id="' + id + '" name="' + name + '" type="' + (name === "email" ? "email" : "text") + '">';
        return '<div class="field"><label for="' + id + '">' + esc(labels[name]) + "</label>" + input + "</div>";
      };
      $("#formFields").innerHTML =
        '<div class="pair">' + control("name") + control("email") + "</div>" +
        intent.fields.map(control).join("");
      $("#formSubmit").textContent = i18n.get("contact.compose");
      $("#formStatus").textContent = "";
    },
    compose() {
      const intent = N.intents[router.active];
      const labels = N.labels[lang] || N.labels.en;
      const status = $("#formStatus");
      const val = (n) => { const el = $("#f-" + n); return el ? el.value.trim() : ""; };
      if (!val("name") || !val("email") || !val("message")) {
        status.textContent = i18n.get("contact.required");
        return;
      }
      const body = ["name", "email"].concat(intent.fields).map((n) => labels[n] + ": " + val(n)).join("\n") +
        "\n\n" + (lang === "it" ? "Inviato dal sito Plantiverse" : "Sent from the Plantiverse site");
      window.location.href = "mailto:info@plantiverse.it?subject=" +
        encodeURIComponent("Plantiverse / " + intent.subject) + "&body=" + encodeURIComponent(body);
      status.textContent = i18n.get("contact.done");
    }
  };

  /* --- pager: free, native scroll that settles onto a section edge ---------
     Sections are no longer forced to one screen: a short one (team, sequence)
     already reads as a single page because of min-height, a long one
     (instruments, fields, record) simply scrolls through like a normal page,
     with nothing clipped or hidden inside its own scrollbar. The only thing
     this module does is notice when the visitor has STOPPED near a section
     edge and ease the rest of the way there, the way Stripe or Apple's
     product pages do it: scrolling itself is always native and continuous,
     the correction is a small, rare nudge, never a forced jump on every
     gesture. */
  const easeInOutQuint = (t) => (t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2);

  const pager = {
    edges: [],
    settleTimer: null,
    animating: false,
    raf: null,
    DURATION: 500,
    SETTLE_MS: 160,
    THRESHOLD: 0.3, // only correct when resting within 30% of a screen from an edge
    init() {
      pager.bindLinks(); // in-page nav links glide too, now that native smooth-scroll is off
      if (reduced) return; // no auto-correction for reduced-motion visitors
      pager.measure();
      window.addEventListener("resize", pager.measure);
      window.addEventListener("scroll", pager.onScroll, { passive: true });
    },
    bindLinks() {
      $$('a[href^="#"]').forEach((a) => {
        a.addEventListener("click", (e) => {
          const id = a.getAttribute("href").slice(1);
          const target = id ? document.getElementById(id) : document.body;
          if (!target) return;
          e.preventDefault();
          const y = Math.max(0, target.getBoundingClientRect().top + window.scrollY - 92);
          if (reduced) { window.scrollTo(0, y); return; }
          pager.glideTo(y);
        });
      });
    },
    measure() {
      const sections = [$(".hero")].concat($$("main section[id]"));
      pager.edges = sections.map((s) => s.offsetTop);
    },
    onScroll() {
      if (pager.animating) return;
      window.clearTimeout(pager.settleTimer);
      pager.settleTimer = window.setTimeout(pager.settle, pager.SETTLE_MS);
    },
    settle() {
      if (pager.animating) return;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (y <= 1 || y >= max - 1) return; // already resting at the very top or the very bottom (footer)
      const threshold = window.innerHeight * pager.THRESHOLD;
      let nearest = null, nearestDist = Infinity;
      for (let i = 0; i < pager.edges.length; i++) {
        const d = Math.abs(pager.edges[i] - y);
        if (d < nearestDist) { nearestDist = d; nearest = pager.edges[i]; }
      }
      if (nearest !== null && nearestDist > 2 && nearestDist < threshold) pager.glideTo(nearest);
    },
    glideTo(target) {
      pager.animating = true;
      window.cancelAnimationFrame(pager.raf);
      const from = window.scrollY;
      const delta = target - from;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / pager.DURATION);
        window.scrollTo(0, from + delta * easeInOutQuint(t));
        if (t < 1) { pager.raf = window.requestAnimationFrame(tick); }
        else { pager.animating = false; }
      };
      pager.raf = window.requestAnimationFrame(tick);
    }
  };

  /* --- hero: a plant drawn as a neural network ---------------------------
     Branches grow on load; signals travel from the leaves (where the data
     arrive) down to the root (where the decision forms). The cursor wakes
     the leaves it passes over. Paused off screen, static for reduced motion. */
  const LEAF_LABELS = {
    en: ["NIR", "Sentinel-2", "soil moisture", "weather", "agronomist report", "growth stage", "Sentinel-1", "temperature", "site history"],
    it: ["NIR", "Sentinel-2", "umidità del suolo", "meteo", "report agronomo", "stadio fenologico", "Sentinel-1", "temperatura", "storia del sito"]
  };

  const neural = {
    cv: null, ctx: null, w: 0, h: 0, dpr: 1, nodes: [], links: [], tips: [], labels: [],
    pulses: [], t0: 0, last: 0, raf: 0, running: false, mouse: { x: -1e4, y: -1e4 },
    flash: 0, nextSpawn: 0, mobile: false, MAX: 7,
    init() {
      neural.cv = $("#neural");
      if (!neural.cv) return;
      neural.ctx = neural.cv.getContext("2d");
      neural.build();
      let rt = 0;
      window.addEventListener("resize", () => { window.clearTimeout(rt); rt = window.setTimeout(() => { neural.build(); if (reduced) neural.draw(1e9); }, 160); });
      const hero = $(".hero");
      hero.addEventListener("pointermove", (e) => {
        const r = neural.cv.getBoundingClientRect();
        neural.mouse.x = e.clientX - r.left; neural.mouse.y = e.clientY - r.top;
      });
      hero.addEventListener("pointerleave", () => { neural.mouse.x = -1e4; neural.mouse.y = -1e4; });
      if (reduced) { neural.draw(1e9); return; }
      const io = new IntersectionObserver((en) => { en[0].isIntersecting ? neural.start() : neural.stop(); }, { threshold: 0.02 });
      io.observe(hero);
      document.addEventListener("visibilitychange", () => { document.hidden ? neural.stop() : neural.start(); });
    },
    start() {
      if (neural.running || document.hidden) return;
      neural.running = true;
      if (!neural.t0) neural.t0 = performance.now();
      neural.last = performance.now();
      const loop = (now) => { if (!neural.running) return; neural.draw(now - neural.t0, now - neural.last); neural.last = now; neural.raf = requestAnimationFrame(loop); };
      neural.raf = requestAnimationFrame(loop);
    },
    stop() { neural.running = false; cancelAnimationFrame(neural.raf); },
    build() {
      const cv = neural.cv, box = cv.parentElement.getBoundingClientRect();
      neural.dpr = Math.min(2, window.devicePixelRatio || 1);
      neural.w = box.width; neural.h = box.height;
      cv.width = Math.round(neural.w * neural.dpr); cv.height = Math.round(neural.h * neural.dpr);
      neural.ctx.setTransform(neural.dpr, 0, 0, neural.dpr, 0, 0);
      neural.mobile = neural.w < 900;
      const w = neural.w, h = neural.h, MAX = neural.mobile ? 6 : neural.MAX;
      const nodes = [{ x: neural.mobile ? w * 0.62 : w * 0.73, y: h + 12, parent: -1, depth: 0, birth: 0 }];
      const grow = (pi, ang, len, depth) => {
        const p = nodes[pi];
        const n = { x: p.x + Math.cos(ang) * len, y: p.y + Math.sin(ang) * len, parent: pi, depth: depth, birth: p.birth + 200 + Math.random() * 240 };
        const i = nodes.push(n) - 1;
        if (depth >= MAX) { n.tip = true; return; }
        const kids = depth < 2 ? 3 : (Math.random() < 0.22 ? 3 : 2);
        for (let k = 0; k < kids; k++) {
          const spread = 0.46 + depth * 0.025;
          const a = ang + (k - (kids - 1) / 2) * spread * (0.75 + Math.random() * 0.5) + (Math.random() - 0.5) * 0.22;
          grow(i, a, len * (0.73 + Math.random() * 0.1), depth + 1);
        }
      };
      grow(0, -Math.PI / 2 + (Math.random() - 0.5) * 0.08, h * (neural.mobile ? 0.15 : 0.185), 1);
      neural.nodes = nodes;
      neural.tips = nodes.map((n, i) => (n.tip ? i : -1)).filter((i) => i >= 0);

      // neural cross links between nearby outer nodes of different branches
      const links = [], deg = new Map();
      const outer = nodes.map((n, i) => (n.depth >= MAX - 2 ? i : -1)).filter((i) => i >= 0);
      for (let a = 0; a < outer.length; a++) {
        for (let b = a + 1; b < outer.length; b++) {
          const A = nodes[outer[a]], B = nodes[outer[b]];
          if (A.parent === B.parent) continue;
          const d = Math.hypot(A.x - B.x, A.y - B.y);
          if (d < 64 && (deg.get(a) || 0) < 2 && (deg.get(b) || 0) < 2) {
            links.push([outer[a], outer[b]]); deg.set(a, (deg.get(a) || 0) + 1); deg.set(b, (deg.get(b) || 0) + 1);
          }
        }
      }
      neural.links = links;

      // a few leaves carry the name of the data they receive
      const sorted = neural.tips.slice().sort((a, b) => nodes[a].x - nodes[b].x)
        .filter((i) => nodes[i].y > 90 && nodes[i].y < h - 120 && nodes[i].x > w * 0.5 && nodes[i].x < w - 60);
      const want = neural.mobile ? 0 : 7, labels = [];
      for (let k = 0; k < want && sorted.length; k++) labels.push({ node: sorted[Math.floor((k + 0.5) * sorted.length / want)], k: k });
      neural.labels = labels;
      neural.pulses = [];
    },
    relabel() { /* labels are read from the current language at draw time */ if (reduced && neural.cv) neural.draw(1e9); },
    pathFrom(i) { const p = []; while (i >= 0) { p.push(i); i = neural.nodes[i].parent; } return p; },
    draw(t, dt) {
      const ctx = neural.ctx, nodes = neural.nodes, w = neural.w, h = neural.h, MAXD = neural.mobile ? 6 : neural.MAX;
      if (!ctx) return;
      dt = Math.min(dt || 16, 50);
      ctx.clearRect(0, 0, w, h);
      const sway = (n) => (reduced ? 0 : Math.sin(t * 0.00055 + n.depth * 0.6) * n.depth * 0.7);
      const P = nodes.map((n) => ({ x: n.x + sway(n), y: n.y }));
      const mx = neural.mouse.x, my = neural.mouse.y;

      // branches
      ctx.lineCap = "round";
      for (let i = 1; i < nodes.length; i++) {
        const n = nodes[i], p = nodes[n.parent];
        const prog = Math.max(0, Math.min(1, (t - p.birth) / (n.birth - p.birth)));
        if (prog <= 0) continue;
        const a = P[n.parent], b = P[i];
        const k = 1 - n.depth / (MAXD + 1);
        ctx.strokeStyle = "rgba(147,201,109," + (0.14 + 0.32 * k).toFixed(3) + ")";
        ctx.lineWidth = Math.max(0.55, 3.4 * k * k);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(a.x + (b.x - a.x) * prog, a.y + (b.y - a.y) * prog); ctx.stroke();
      }
      // neural links
      ctx.lineWidth = 0.6;
      neural.links.forEach((l) => {
        const A = nodes[l[0]], B = nodes[l[1]];
        if (t < Math.max(A.birth, B.birth) + 300) return;
        ctx.strokeStyle = "rgba(168,200,216,0.10)";
        ctx.beginPath(); ctx.moveTo(P[l[0]].x, P[l[0]].y); ctx.lineTo(P[l[1]].x, P[l[1]].y); ctx.stroke();
      });
      // leaves
      neural.tips.forEach((i) => {
        const n = nodes[i];
        if (t < n.birth) return;
        const d = Math.hypot(P[i].x - mx, P[i].y - my);
        const near = Math.max(0, 1 - d / 140);
        const fade = Math.min(1, (t - n.birth) / 500);
        ctx.fillStyle = "rgba(194,230,162," + ((0.35 + 0.65 * near) * fade).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(P[i].x, P[i].y, 1.5 + near * 2.6, 0, Math.PI * 2); ctx.fill();
        if (near > 0.2 && !reduced && Math.random() < near * 0.05 && neural.pulses.length < 46) neural.spawn(i);
      });

      // signals: from a leaf down to the root
      if (!reduced) {
        const grown = t > 2600;
        if (grown && t > neural.nextSpawn && neural.pulses.length < 34) {
          neural.spawn(neural.tips[Math.floor(Math.random() * neural.tips.length)]);
          neural.nextSpawn = t + 140 + Math.random() * 220;
        }
        for (let q = neural.pulses.length - 1; q >= 0; q--) {
          const s = neural.pulses[q];
          const a = P[s.path[s.seg]], b = P[s.path[s.seg + 1]];
          const len = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
          s.f += (s.speed * dt) / len;
          while (s.f >= 1 && s.seg < s.path.length - 2) { s.f -= 1; s.seg++; }
          if (s.f >= 1) { neural.pulses.splice(q, 1); neural.flash = Math.min(1.4, neural.flash + 0.22); continue; }
          const A = P[s.path[s.seg]], B = P[s.path[s.seg + 1]];
          const x = A.x + (B.x - A.x) * s.f, y = A.y + (B.y - A.y) * s.f;
          const g = ctx.createRadialGradient(x, y, 0, x, y, 9);
          g.addColorStop(0, s.amber ? "rgba(240,190,110,0.95)" : "rgba(214,242,186,0.95)");
          g.addColorStop(1, "rgba(147,201,109,0)");
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill();
        }
        neural.flash *= 0.965;
      }

      // the root, where the decision forms
      const r = P[0], glow = 0.25 + Math.min(1, neural.flash) * 0.55;
      const rg = ctx.createRadialGradient(r.x, r.y - 30, 0, r.x, r.y - 30, 150);
      rg.addColorStop(0, "rgba(224,163,76," + (glow * 0.55).toFixed(3) + ")");
      rg.addColorStop(1, "rgba(224,163,76,0)");
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(r.x, r.y - 30, 150, 0, Math.PI * 2); ctx.fill();

      // data labels on a few leaves
      if (neural.labels.length) {
        const names = LEAF_LABELS[lang] || LEAF_LABELS.en;
        ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.textBaseline = "middle";
        neural.labels.forEach((l) => {
          const n = nodes[l.node], p = P[l.node];
          const fade = Math.max(0, Math.min(1, (t - n.birth - 600) / 900));
          if (!fade) return;
          const pulse = reduced ? 0.6 : 0.45 + 0.25 * Math.sin(t * 0.0012 + l.k * 1.7);
          const lx = p.x + 12, ly = p.y - 10;
          ctx.strokeStyle = "rgba(168,200,216," + (0.35 * fade).toFixed(3) + ")";
          ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(p.x + 3, p.y - 2); ctx.lineTo(lx - 3, ly); ctx.stroke();
          ctx.fillStyle = "rgba(205,222,214," + (pulse * fade).toFixed(3) + ")";
          ctx.fillText(names[l.k % names.length].toUpperCase(), lx, ly);
        });
      }
    },
    spawn(i) {
      if (i === undefined) return;
      neural.pulses.push({ path: neural.pathFrom(i), seg: 0, f: 0, speed: 0.09 + Math.random() * 0.08, amber: Math.random() < 0.28 });
    }
  };

  /* --- 01 the reasoning: three illustrative scenarios ------------------- */
  const REL = [[1, 1, 1], [1, 0.4, 0.6], [1, 0.6, 0.8], [0.8, 0.8, 0.5], [0.6, 1, 0.5]];
  const G = { inp: [[34, 46], [34, 128], [34, 210], [34, 292], [34, 374]], mod: [[262, 104], [262, 210], [262, 316]], out: [474, 210] };
  const num = (v, d) => (lang === "it" ? v.toFixed(d).replace(".", ",") : v.toFixed(d));

  const mind = {
    active: 0, auto: true, timer: 0, typing: 0, visible: false,
    init() {
      const tabs = $("#mindTabs");
      if (!tabs) return;
      tabs.addEventListener("click", (e) => {
        const b = e.target.closest("button");
        if (!b) return;
        mind.auto = false; window.clearInterval(mind.timer);
        mind.go(Number(b.dataset.i));
      });
      if (reduced) return;
      const io = new IntersectionObserver((en) => {
        mind.visible = en[0].isIntersecting;
        window.clearInterval(mind.timer);
        if (mind.visible && mind.auto) mind.timer = window.setInterval(() => mind.go((mind.active + 1) % N.scenarios.length), 9000);
      }, { threshold: 0.35 });
      io.observe($("#mind"));
    },
    go(i) { mind.active = i; mind.render(); },
    render() {
      const tabs = $("#mindTabs");
      if (!tabs) return;
      const sc = N.scenarios[mind.active], t = tr(sc);
      tabs.innerHTML = N.scenarios.map((s, i) => {
        const x = tr(s);
        return '<button type="button" role="tab" data-i="' + i + '" aria-selected="' + (i === mind.active) + '">' +
          "<b>" + esc(x.tab) + "</b><span>" + esc(x.place) + "</span></button>";
      }).join("");

      const names = N.inputs[lang] || N.inputs.en, models = N.models[lang] || N.models.en;
      $("#mindInputs").innerHTML = '<span class="mono mind__cap">' + esc(i18n.get("mind.inputs")) + "</span>" +
        names.map((n, i) => {
          const s = sc.strength[i];
          return '<div class="inp' + (s < 0.15 ? " inp--mute" : "") + '" style="--s:' + s + '">' +
            '<div class="inp__top"><b>' + esc(n) + '</b><span class="mono">' + esc(i18n.get("mind.weight")) + " " + num(s, 2) + "</span></div>" +
            '<p>' + esc(t.read[i]) + '</p><i class="inp__bar"><i></i></i></div>';
        }).join("");

      // graph
      let edges = "";
      G.inp.forEach((a, i) => {
        G.mod.forEach((b, m) => {
          const wgt = sc.strength[i] * REL[i][m] * (0.3 + sc.scores[m]);
          const hot = m === sc.win && wgt > 0.3;
          const op = (0.05 + Math.min(1, wgt) * 0.85).toFixed(2), sw = (0.6 + Math.min(1, wgt) * 2.8).toFixed(2);
          const cx = (a[0] + b[0]) / 2;
          edges += '<path class="e' + (hot ? " e--hot" : "") + '" d="M' + a[0] + " " + a[1] + "C" + cx + " " + a[1] + " " + cx + " " + b[1] + " " + b[0] + " " + b[1] + '" style="stroke-opacity:' + op + ";stroke-width:" + sw + '"/>';
        });
      });
      G.mod.forEach((b, m) => {
        const s = sc.scores[m], hot = m === sc.win;
        const cx = (b[0] + G.out[0]) / 2;
        edges += '<path class="e' + (hot ? " e--hot" : "") + '" d="M' + b[0] + " " + b[1] + "C" + cx + " " + b[1] + " " + cx + " " + G.out[1] + " " + G.out[0] + " " + G.out[1] + '" style="stroke-opacity:' + (0.12 + s * 0.85).toFixed(2) + ";stroke-width:" + (0.8 + s * 4).toFixed(2) + '"/>';
      });
      let dots = G.inp.map((a, i) => '<circle class="n n--in" cx="' + a[0] + '" cy="' + a[1] + '" r="' + (5 + sc.strength[i] * 7).toFixed(1) + '" style="opacity:' + (0.3 + sc.strength[i] * 0.7).toFixed(2) + '"/>').join("");
      dots += G.mod.map((b, m) => {
        const s = sc.scores[m], win = m === sc.win;
        return '<g class="mod' + (win ? " mod--win" : "") + '"><circle class="halo" cx="' + b[0] + '" cy="' + b[1] + '" r="' + (16 + s * 34).toFixed(1) + '"/>' +
          '<circle class="n" cx="' + b[0] + '" cy="' + b[1] + '" r="' + (9 + s * 20).toFixed(1) + '"/>' +
          '<text x="' + b[0] + '" y="' + (b[1] + 20 + 9 + s * 20).toFixed(1) + '">' + esc(models[m]) + " · " + num(s, 2) + "</text></g>";
      }).join("");
      const calm = sc.win < 0;
      dots += '<g class="out' + (calm ? " out--calm" : "") + '"><circle class="halo" cx="' + G.out[0] + '" cy="' + G.out[1] + '" r="34"/><circle class="n" cx="' + G.out[0] + '" cy="' + G.out[1] + '" r="15"/></g>';
      const svg = $("#mindGraph");
      svg.innerHTML = edges + dots;
      svg.classList.remove("is-on"); void svg.getBoundingClientRect(); svg.classList.add("is-on");

      // decision card
      const out = $("#mindOut");
      out.innerHTML =
        '<span class="mono mind__cap">' + esc(i18n.get("mind.move")) + "</span>" +
        '<p class="mind__move' + (calm ? " is-calm" : "") + '" id="mindMove"></p>' +
        '<div class="mind__conf"><span class="mono">' + esc(i18n.get("mind.conf")) + "</span><b>" + num(sc.conf, 2) + '</b><i><i style="width:' + Math.round(sc.conf * 100) + '%"></i></i></div>' +
        (calm ? '<p class="mind__calm mono">' + esc(i18n.get("mind.none")) + "</p>" : "") +
        '<dl class="mind__dl"><div><dt>' + esc(i18n.get("mind.why")) + "</dt><dd>" + esc(t.why) + "</dd></div>" +
        "<div><dt>" + esc(i18n.get("mind.refute")) + "</dt><dd>" + esc(t.refute) + "</dd></div>" +
        "<div><dt>" + esc(i18n.get("mind.check")) + "</dt><dd>" + esc(t.check) + "</dd></div></dl>";
      mind.type($("#mindMove"), t.move);
    },
    type(el, text) {
      window.clearInterval(mind.typing);
      if (reduced) { el.textContent = text; return; }
      let i = 0; el.textContent = "";
      el.setAttribute("aria-label", text);
      mind.typing = window.setInterval(() => { i += 2; el.textContent = text.slice(0, i); if (i >= text.length) window.clearInterval(mind.typing); }, 22);
    }
  };

  /* --- 04 platform ---------------------------------------------------------- */
  const CAP_ICONS = {
    forecast: '<path d="M4 46C18 44 26 30 40 33s20 10 32-2" fill="none" stroke="currentColor" stroke-width="1.8"/><path class="dash" d="M72 31c12-12 22-18 40-20" fill="none" stroke="#e0a34c" stroke-width="1.6" stroke-dasharray="4 5"/><circle cx="72" cy="31" r="3.4" fill="#e0a34c"/>',
    knowledge: '<g stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 14h62M6 26h48M6 38h56M6 50h36"/></g><g fill="none" stroke="#e0a34c" stroke-width="1.2"><path class="dash" d="M70 14C90 14 92 30 104 30M56 26c22 0 30 4 48 4M64 38c20 0 26-8 40-8" stroke-dasharray="3 4"/></g><circle cx="106" cy="30" r="5" fill="#e0a34c"/>',
    twin: '<g fill="currentColor">' + [0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => '<circle cx="' + (10 + c * 12) + '" cy="' + (12 + r * 12) + '" r="2.2"/>').join("")).join("") + '</g><g fill="none" stroke="currentColor" stroke-opacity=".5">' + [0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => '<rect x="' + (68 + c * 12) + '" y="' + (9 + r * 12) + '" width="6" height="6"/>').join("")).join("") + '</g><path class="dash" d="M50 30h14" stroke="#e0a34c" stroke-width="1.4" stroke-dasharray="3 3"/>',
    ledger: '<g stroke="currentColor" stroke-width="1.4"><rect x="6" y="6" width="74" height="12" rx="2" fill="none"/><rect x="6" y="24" width="74" height="12" rx="2" fill="none"/><rect x="6" y="42" width="74" height="12" rx="2" fill="none" stroke="#e0a34c"/></g><path d="M92 30l7 7 15-16" fill="none" stroke="#e0a34c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'
  };
  const platform = {
    render() {
      const host = $("#caps");
      if (!host) return;
      host.innerHTML = N.capabilities.map((c, i) => {
        const t = tr(c);
        return '<article class="cap rise is-visible"><span class="step__num">0' + (i + 1) + "</span>" +
          '<svg class="cap__icon" viewBox="0 0 120 60" aria-hidden="true" focusable="false">' + CAP_ICONS[c.id] + "</svg>" +
          '<h3 class="h3">' + esc(t.name) + '</h3><p class="cap__line">' + esc(t.line) + "</p></article>";
      }).join("");
      const chips = $("#chips");
      if (chips) chips.innerHTML = (N.chips[lang] || N.chips.en).map((c) => "<span>" + esc(c) + "</span>").join("");
    }
  };

  /* --- 05 counters: the training asset, counted up once on view ------------- */
  const counters = {
    done: false,
    init() {
      const host = $("#counters");
      if (!host) return;
      if (reduced || !("IntersectionObserver" in window)) { counters.done = true; return; }
      const io = new IntersectionObserver((en) => {
        if (!en[0].isIntersecting) return;
        io.disconnect(); counters.run();
      }, { threshold: 0.4 });
      io.observe(host);
    },
    // it-IT leaves four-digit numbers ungrouped (8600): group by hand so both languages read 8.600 / 8,600
    fmt(v, plus) { return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, lang === "it" ? "." : ",") + (plus ? "+" : ""); },
    render() {
      const host = $("#counters");
      if (!host) return;
      host.innerHTML = N.counters.map((c, i) =>
        '<div class="ctr"><b data-i="' + i + '">' + (counters.done ? counters.fmt(c.value, c.plus) : "0") + "</b><span>" + esc(c[lang] || c.en) + "</span></div>").join("");
    },
    run() {
      const start = performance.now(), D = 1600;
      const tick = (now) => {
        const p = Math.min(1, (now - start) / D), e = 1 - Math.pow(1 - p, 4);
        $$("#counters b").forEach((b) => {
          const c = N.counters[Number(b.dataset.i)];
          b.textContent = counters.fmt(Math.round(c.value * e), c.plus && p === 1);
        });
        if (p < 1) requestAnimationFrame(tick); else counters.done = true;
      };
      requestAnimationFrame(tick);
    }
  };


  /* --- the Doha garden, one plant opened ---------------------------------
     Indicators, the plant-driven rule against the calendar, and the
     phytoremediation values from the literature. The series come from a
     small simulation and are labelled as illustrative in the dialog. */
  const plantSim = (mode) => {
    const H = 14 * 24, out = { theta: [], stress: [], leaf: [], cmds: [], water: 0, drain: 0, stressH: 0 };
    let th = 0.30, S = 0, last = -99;
    for (let h = 0; h < H; h++) {
      const d = Math.floor(h / 24), hr = h % 24, heat = d >= 5 && d <= 8 ? 1 : 0;
      const Tday = 28 + ((d * 37) % 4) + 10 * heat;
      const sun = Math.max(0, Math.sin(Math.PI * (hr - 6) / 12));
      const T = Tday - 6 + 8 * sun;
      th = Math.max(0.08, th - 0.0085 * sun * ((T - 18) / 16) * Math.min(1, (th - 0.08) / 0.14));
      let dose = 0;
      if (mode === "calendar") { if (hr === 6) dose = 0.06; }
      else if (S > 0.42 && h - last > 3) { dose = Math.max(0, 0.27 - th); last = h; }
      if (dose > 0) { th += dose; out.water += dose; out.cmds.push(h); }
      if (th > 0.34) { out.drain += th - 0.34; th = 0.34; }
      const target = Math.min(1, Math.max(0, (0.24 - th) / 0.09)) * 0.75 + 0.3 * sun * Math.min(1, (T - 30) / 10) * Math.min(1, Math.max(0, (0.3 - th) / 0.1));
      S += (Math.min(1, Math.max(0, target)) - S) * 0.35;
      if (S > 0.5) out.stressH++;
      out.theta.push(th); out.stress.push(S); out.leaf.push(-1.6 + 5.5 * S * (0.4 + 0.6 * sun));
    }
    out.liters = Math.round(out.water * 800); out.drainL = Math.round(out.drain * 800);
    return out;
  };

  const plant = {
    dlg: null, mode: 1, runs: null,
    init() {
      if (!N.plant) return;
      plant.runs = [plantSim("calendar"), plantSim("plant")];
      document.addEventListener("click", (e) => {
        if (e.target.closest("[data-plant-open]")) { e.preventDefault(); plant.open(); return; }
        if (!plant.dlg || !plant.dlg.open) return;
        if (e.target.closest("[data-plant-close]") || e.target === plant.dlg) plant.close();
        const m = e.target.closest("[data-plant-mode]");
        if (m) { plant.mode = Number(m.dataset.plantMode); plant.renderSim(); }
      });
    },
    open() {
      if (!plant.dlg) {
        plant.dlg = document.createElement("dialog");
        plant.dlg.className = "pdlg";
        plant.dlg.setAttribute("aria-labelledby", "pdlgTitle");
        document.body.appendChild(plant.dlg);
        plant.dlg.addEventListener("close", () => { document.documentElement.classList.remove("is-locked"); });
      }
      plant.render();
      document.documentElement.classList.add("is-locked");
      if (plant.dlg.showModal) plant.dlg.showModal(); else plant.dlg.setAttribute("open", "");
      plant.dlg.scrollTop = 0;
    },
    close() { if (plant.dlg.close) plant.dlg.close(); else plant.dlg.removeAttribute("open"); document.documentElement.classList.remove("is-locked"); },
    spark(vals, lo, hi, w, h) {
      const step = w / (vals.length - 1);
      const y = (v) => h - 3 - ((v - lo) / (hi - lo)) * (h - 6);
      return vals.map((v, i) => (i ? "L" : "M") + (i * step).toFixed(1) + " " + y(v).toFixed(1)).join("");
    },
    render() {
      const P = N.plant, t = tr(P), r = plant.runs[1];
      const daily = (arr, f) => arr.filter((_, i) => i % 3 === 0).map(f);
      // canopy vigour and cover move over days, not hours: a 24 h running mean
      const slow = r.stress.map((_, i, a) => { const w = a.slice(Math.max(0, i - 23), i + 1); return w.reduce((x, y) => x + y, 0) / w.length; });
      const series = [
        daily(slow, (s) => 4.6 - 2.4 * s),
        daily(r.leaf, (v) => v),
        daily(r.theta, (v) => v * 100),
        daily(slow, (s) => 81 - 12 * s)
      ];
      const fmt = (v, k) => (k === 0 ? v.toFixed(2) : k === 1 ? (v > 0 ? "+" : "") + v.toFixed(1) : v.toFixed(0) + "%").replace(".", lang === "it" ? "," : ".");
      const inds = t.ind.map((d, k) => {
        const v = series[k], lo = Math.min(...v), hi = Math.max(...v) + 1e-6;
        return '<div class="pind"><span class="pind__k">' + esc(d[0]) + '</span><b>' + fmt(v[v.length - 1], k) + "</b>" +
          '<svg viewBox="0 0 220 52" preserveAspectRatio="none" aria-hidden="true"><path d="' + plant.spark(v, lo, hi, 220, 52) + '" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>' +
          '<span class="pind__d">' + esc(d[1]) + "</span></div>";
      }).join("");
      const metals = t.metals.map((m) => '<div class="pmet"><b>' + esc(m[1]) + '</b><span class="pmet__k">' + esc(m[0]) + "</span><span>" + esc(m[2]) + "</span></div>").join("");
      plant.dlg.innerHTML =
        '<div class="pdlg__in">' +
        '<button type="button" class="pdlg__x" data-plant-close aria-label="' + esc(t.close) + '">&times;</button>' +
        '<header class="pdlg__head"><img src="' + P.img + '" alt="' + esc(P.sci) + '"><div>' +
        '<span class="eyebrow">' + esc(t.where) + "</span>" +
        '<h2 class="h2" id="pdlgTitle"><em>' + esc(P.sci) + "</em></h2>" +
        '<p class="pdlg__common">' + esc(t.common) + "</p>" +
        '<p class="pdlg__intro">' + esc(t.intro) + "</p></div></header>" +
        '<section class="pdlg__sec"><h3 class="h3"><span>01</span> ' + esc(t.t1) + '</h3><div class="pinds">' + inds + '</div><p class="pdlg__note">' + esc(t.t1note) + "</p></section>" +
        '<section class="pdlg__sec"><h3 class="h3"><span>02</span> ' + esc(t.t2) + '</h3><p class="pdlg__lede">' + esc(t.t2lede) + "</p>" +
        '<div class="pmode" role="group">' + t.modes.map((m, i) => '<button type="button" data-plant-mode="' + i + '">' + esc(m) + "</button>").join("") + "</div>" +
        '<div id="psim"></div><p class="pdlg__note">' + esc(t.t2note) + "</p></section>" +
        '<section class="pdlg__sec"><h3 class="h3"><span>03</span> ' + esc(t.t3) + '</h3><p class="pdlg__lede">' + esc(t.t3lede) + '</p><div class="pmets">' + metals + "</div>" +
        '<p class="pdlg__note">' + esc(t.t3note) + "</p>" +
        '<p class="pdlg__src"><b>' + esc(t.src) + "</b>" + P.sources.map(esc).join("<br>") + "</p></section></div>";
      plant.renderSim();
    },
    renderSim() {
      const host = $("#psim"); if (!host) return;
      const t = tr(N.plant), r = plant.runs[plant.mode], other = plant.runs[1 - plant.mode];
      $$("[data-plant-mode]").forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.plantMode) === plant.mode)));
      const W = 900, Ht = 150, Hs = 110, n = r.theta.length, x = (i) => (i / (n - 1)) * W;
      const yT = (v) => Ht - 6 - ((v - 0.1) / 0.26) * (Ht - 14);
      const yS = (v) => Hs - 4 - v * (Hs - 10);
      const line = (arr, f) => arr.map((v, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + f(v).toFixed(1)).join("");
      const days = Array.from({ length: 15 }, (_, d) => '<line x1="' + x(d * 24) + '" x2="' + x(d * 24) + '" y1="0" y2="' + (Ht + Hs + 18) + '" class="psim__grid"/>').join("");
      const heat = '<rect x="' + x(5 * 24) + '" width="' + (x(9 * 24) - x(5 * 24)) + '" y="0" height="' + (Ht + Hs + 18) + '" class="psim__heat"/>';
      const cmds = r.cmds.map((h) => '<line x1="' + x(h) + '" x2="' + x(h) + '" y1="' + (Ht - 2) + '" y2="' + (Ht - 18) + '" class="psim__cmd"/><circle cx="' + x(h) + '" cy="' + (Ht - 22) + '" r="3.2" class="psim__cmdd"/>').join("");
      const svg = '<svg class="psim__svg" viewBox="0 0 ' + W + " " + (Ht + Hs + 30) + '" preserveAspectRatio="none" role="img" aria-label="' + esc(t.t2) + '">' +
        heat + days +
        '<path d="' + line(r.theta, yT) + '" class="psim__theta"/>' + cmds +
        '<g transform="translate(0,' + (Ht + 18) + ')"><line x1="0" x2="' + W + '" y1="' + yS(0.5) + '" y2="' + yS(0.5) + '" class="psim__thr"/>' +
        '<path d="' + line(r.stress, yS) + '" class="psim__stress"/></g></svg>';
      const liters = (v) => v.toLocaleString(lang === "it" ? "it-IT" : "en-GB") + " L";
      const diff = Math.round((1 - r.liters / other.liters) * 100);
      host.innerHTML =
        '<p class="psim__line">' + esc(t.modeLine[plant.mode]) + "</p>" +
        '<div class="psim__kpi"><div><b>' + liters(r.liters) + "</b><span>" + esc(t.kpi[0]) + (plant.mode === 1 && diff > 0 ? " · −" + diff + "%" : "") + "</span></div>" +
        "<div><b>" + r.stressH + "</b><span>" + esc(t.kpi[1]) + "</span></div>" +
        "<div><b>" + r.cmds.length + "</b><span>" + esc(t.kpi[2]) + "</span></div></div>" +
        '<div class="psim__chart">' + '<span class="psim__heatl" style="left:calc(12px + (100% - 24px) * ' + (7 * 24 / (n - 1)).toFixed(4) + ')">' + esc(t.heat) + "</span>" + svg + '<div class="psim__days"><span>' + esc(t.day) + " 1</span><span>" + esc(t.day) + " 14</span></div></div>" +
        '<ul class="psim__legend"><li><i class="l-theta"></i>' + esc(t.legend[0]) + '</li><li><i class="l-stress"></i>' + esc(t.legend[1]) + '</li><li><i class="l-thr"></i>' + esc(t.legend[2]) + '</li><li><i class="l-cmd"></i>' + esc(t.legend[3]) + "</li></ul>";
    }
  };

  /* --- boot ---------------------------------------------------------------- */
  function boot() {
    header.init();
    neural.init();
    mind.init();
    counters.init();
    wipe.init();
    record.init();
    router.init();
    flora.init();
    plant.init();
    i18n.apply(i18n.detect());
    rise.init();
    spine.init();
    pager.init();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
