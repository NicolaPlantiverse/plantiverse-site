/* Esplora · the Plantiverse brain.
   The graph view of OMNIA 2 applied to what Plantiverse publishes: every species of the reference
   list, the phytoremediation literature, the index catalogue, the platform, sites, patents, events,
   collaborations and team. Positions come precomputed from tools/build_esplora_brain.py
   (window.EXB). Drawing: three.js points with a glow, additive links and a light bloom, one colour
   (carta da zucchero) for everything and yellow for what is linked to the chosen node. */
(function () {
  "use strict";
  const D = window.EXB;
  if (!D || !window.THREE) return;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fold = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = () => window.innerWidth <= 900;

  let lang = "en";
  try { const s = localStorage.getItem("pv-lang"); if (s === "it" || s === "en") lang = s; else if (/^it/i.test(navigator.language)) lang = "it"; } catch (e) {}
  const num = (v) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, lang === "it" ? "." : ",");

  /* --- words ------------------------------------------------------------- */
  const T = {
    en: {
      crumb: "Explore", back: "Back to the site", go: "Search", placeholder: "Search a species, a pollutant, an index, a site…", home: "Whole brain",
      hint: "Drag to move · scroll or pinch to zoom · click a point: in yellow everything linked to it",
      title: "The Plantiverse brain", intro: "Everything we know and publish, as one map. At the centre Plantiverse; around it species, phytoremediation, platform, indices, sensors, sites, patents, events, collaborations and team. Every link is a real relation in the data.",
      stats: ["species", "phytoremediation measurements", "publications", "pollutants", "vegetation indices", "links"],
      tryit: "Try", sug: ["Vitis vinifera", "Lead", "Formaldehyde", "NDVI", "Green roof, ENEA", "Bio-Driven", "Hedera helix", "Sapienza"],
      lobes: "Lobes", linked: "Linked", all: "all", more: "and {n} more", back2: "← back", open: "See it on the site ↗",
      phyto: "Phytoremediation", phytoNote: "From the Plantiverse phytoremediation database: which pollutant, in which medium, how many measurements and from which publications. The numeric values stay in the database.",
      meas: "measurements", sources: "Publications", observed: "Observed in the field at a Plantiverse site.", genus: "Genus", cats: "Categories",
      inList: "In the reference list.", phyOnly: "From the phytoremediation literature, not in the reference list.", species: "species", topSp: "Species with the most measurements",
      medium: { air: "Air", soil: "Soil", water: "Water" }, name: "Name", principle: "What it shows", range: "Range",
      place: "Place", state: "State", agency: "Agency", res: "Resolution", rev: "Revisit", role: "Role", date: "Date",
      indTitle: "Indicators", indNote: "Illustrative series: they show what the platform tracks for this site, not its measured values.",
      ind: ["Vigour (NIR/red)", "Water stress", "Cover"], photo: "Photo", wildNote: "Open licence photo from iNaturalist or Wikimedia Commons, loaded when you open the card.", rule: "No generated text: every card is data from the site, the reference list, the phytoremediation literature or the index catalogue.",
      none: "Nothing matches. Try a Latin or common name, a pollutant (lead, ozone), an index (NDVI), a site.",
      kinds: { root: "Centre", hub: "Lobe", species: "Species", genus: "Genus", category: "Category", medium: "Medium", pollutant: "Pollutant", family: "Index family", index: "Index",
        site: "Site", sensor: "Sensor", feed: "Public data", capability: "Platform", step: "Cycle", model: "Model", patent: "Patent", event: "Event", collab: "Collaboration", team: "Team" }
    },
    it: {
      crumb: "Esplora", back: "Torna al sito", go: "Cerca", placeholder: "Cerca una specie, un inquinante, un indice, un sito…", home: "Tutto il cervello",
      hint: "Trascina per muoverti · rotella o pizzico per lo zoom · clic su un punto: in giallo tutto ciò che è collegato",
      title: "Il cervello di Plantiverse", intro: "Tutto quello che sappiamo e pubblichiamo, in una sola mappa. Al centro Plantiverse; intorno specie, fitorimedio, piattaforma, indici, sensori, siti, brevetti, eventi, collaborazioni e team. Ogni collegamento è una relazione vera nei dati.",
      stats: ["specie", "misure di fitorimedio", "pubblicazioni", "inquinanti", "indici di vegetazione", "collegamenti"],
      tryit: "Prova", sug: ["Vitis vinifera", "Piombo", "Formaldeide", "NDVI", "Tetto verde, ENEA", "Bio-Driven", "Hedera helix", "Sapienza"],
      lobes: "Lobi", linked: "Collegati", all: "tutti", more: "e altri {n}", back2: "← indietro", open: "Vedilo nel sito ↗",
      phyto: "Fitorimedio", phytoNote: "Dal database di fitorimedio Plantiverse: quale inquinante, in quale mezzo, quante misure e da quali pubblicazioni. I valori numerici restano nel database.",
      meas: "misure", sources: "Pubblicazioni", observed: "Osservata in campo in un sito Plantiverse.", genus: "Genere", cats: "Categorie",
      inList: "Nell'elenco di riferimento.", phyOnly: "Dalla letteratura sul fitorimedio, fuori dall'elenco di riferimento.", species: "specie", topSp: "Specie con più misure",
      medium: { air: "Aria", soil: "Suolo", water: "Acqua" }, name: "Nome", principle: "Cosa mostra", range: "Intervallo",
      place: "Luogo", state: "Stato", agency: "Ente", res: "Risoluzione", rev: "Passaggio", role: "Ruolo", date: "Data",
      indTitle: "Indicatori", indNote: "Serie illustrative: mostrano cosa la piattaforma segue per questo sito, non i suoi valori misurati.",
      ind: ["Vigore (NIR/rosso)", "Stress idrico", "Copertura"], photo: "Foto", wildNote: "Foto con licenza aperta da iNaturalist o Wikimedia Commons, caricata quando apri la scheda.", rule: "Nessun testo generato: ogni scheda è un dato del sito, dell'elenco di riferimento, della letteratura sul fitorimedio o del catalogo degli indici.",
      none: "Nessun risultato. Prova un nome latino o comune, un inquinante (piombo, ozono), un indice (NDVI), un sito.",
      kinds: { root: "Centro", hub: "Lobo", species: "Specie", genus: "Genere", category: "Categoria", medium: "Mezzo", pollutant: "Inquinante", family: "Famiglia di indici", index: "Indice",
        site: "Sito", sensor: "Sensore", feed: "Dati pubblici", capability: "Piattaforma", step: "Ciclo", model: "Modello", patent: "Brevetto", event: "Evento", collab: "Collaborazione", team: "Team" }
    }
  };
  const t = (k) => (T[lang][k] != null ? T[lang][k] : T.en[k]);

  /* --- data -------------------------------------------------------------- */
  const KN = D.kinds, NN = D.n.length;
  const X = new Float32Array(NN), Y = new Float32Array(NN), K = new Uint8Array(NN), DEG = new Uint16Array(NN);
  const KIND = (i) => KN[K[i]];
  D.n.forEach((r, i) => { X[i] = r[3]; Y[i] = -r[4]; K[i] = r[2]; DEG[i] = r[5]; });
  const label = (i) => { const r = D.n[i]; return lang === "en" && r[1] ? r[1] : r[0]; };
  const ex = (i) => D.n[i][6] || {};
  const exl = (i, f) => { const e = ex(i); return e[f + "_" + lang] != null ? e[f + "_" + lang] : e[f + "_en"] != null ? e[f + "_en"] : e[f]; };
  // adjacency (CSR)
  const cnt = new Uint32Array(NN + 1);
  for (let k = 0; k < D.e.length; k++) cnt[D.e[k] + 1]++;
  for (let i = 0; i < NN; i++) cnt[i + 1] += cnt[i];
  const ADJ = new Uint32Array(D.e.length), fill = cnt.slice(0, NN);
  for (let k = 0; k < D.e.length; k += 2) { const a = D.e[k], b = D.e[k + 1]; ADJ[fill[a]++] = b; ADJ[fill[b]++] = a; }
  const nbrs = (i) => ADJ.subarray(cnt[i], cnt[i + 1]);
  const ROOT = K.indexOf(KN.indexOf("root"));
  const HUBS = []; for (let i = 0; i < NN; i++) if (KIND(i) === "hub") HUBS.push(i);
  // pollutant -> species with measurement counts (reverse of the species tables)
  const POLSP = new Map();
  for (let i = 0; i < NN; i++) { const ph = ex(i).ph; if (ph) ph.forEach(([p, n]) => { if (!POLSP.has(p)) POLSP.set(p, []); POLSP.get(p).push([i, n]); }); }
  POLSP.forEach((l) => l.sort((a, b) => b[1] - a[1]));

  /* --- renderer + bloom (same pipeline as OMNIA 2) ----------------------- */
  const canvas = $("#gl");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
  const DPR = Math.min(small() ? 1.5 : 2, window.devicePixelRatio || 1);
  renderer.setPixelRatio(DPR); renderer.setClearColor(0x02030a, 1);
  const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
  const FSQ = new THREE.Scene(), OC = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), QUAD = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)); FSQ.add(QUAD);
  const VQ = "varying vec2 v;void main(){v=uv;gl_Position=vec4(position.xy,0.,1.);}";
  const mkRT = (w, h, s) => new THREE.WebGLRenderTarget(Math.max(1, w | 0), Math.max(1, h | 0), { type: THREE.HalfFloatType, samples: s || 0, depthBuffer: !!s });
  const M_BRIGHT = new THREE.ShaderMaterial({ vertexShader: VQ, uniforms: { t: { value: null }, th: { value: 0.3 } }, fragmentShader: "uniform sampler2D t;uniform float th;varying vec2 v;void main(){vec3 c=texture2D(t,v).rgb;float l=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c*smoothstep(th,th+.5,l),1.);}" });
  const M_BLUR = new THREE.ShaderMaterial({ vertexShader: VQ, uniforms: { t: { value: null }, dir: { value: new THREE.Vector2() } }, fragmentShader: "uniform sampler2D t;uniform vec2 dir;varying vec2 v;void main(){vec3 c=texture2D(t,v).rgb*.227;c+=(texture2D(t,v+dir*1.385).rgb+texture2D(t,v-dir*1.385).rgb)*.316;c+=(texture2D(t,v+dir*3.231).rgb+texture2D(t,v-dir*3.231).rgb)*.07;gl_FragColor=vec4(c,1.);}" });
  const M_COPY = new THREE.ShaderMaterial({ vertexShader: VQ, uniforms: { t: { value: null } }, fragmentShader: "uniform sampler2D t;varying vec2 v;void main(){gl_FragColor=texture2D(t,v);}" });
  const M_COMP = new THREE.ShaderMaterial({ vertexShader: VQ, uniforms: { t: { value: null }, b0: { value: null }, b1: { value: null }, b2: { value: null }, bs: { value: 0.9 } },
    fragmentShader: "uniform sampler2D t,b0,b1,b2;uniform float bs;varying vec2 v;void main(){vec3 c=texture2D(t,v).rgb;vec3 b=texture2D(b0,v).rgb*.6+texture2D(b1,v).rgb*.85+texture2D(b2,v).rgb*1.05;c+=b*bs;float L=dot(c,vec3(.2126,.7152,.0722))*1.3;c=c*1.3*(1.+L/144.)/(1.+L);c=pow(c,vec3(.94));vec2 q=v-.5;c*=1.-dot(q,q)*.7;gl_FragColor=vec4(c,1.);}" });
  let RT, LV = [], W = 1, H = 1;
  const UNI = { uT: { value: reduced ? 1 : 0 }, uZoom: { value: 1 }, uPx: { value: DPR }, uAny: { value: 0 }, uTime: { value: 0 }, uYel: { value: new THREE.Color("#ffd24a") } };
  function resize() {
    const r = canvas.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
    renderer.setSize(W, H, false);
    const w = W * DPR, h = H * DPR;
    if (RT) { RT.dispose(); LV.forEach((l) => { l.a.dispose(); l.b.dispose(); }); }
    RT = mkRT(w, h, 4); LV = [2, 4, 8].map((f) => ({ a: mkRT(w / f, h / f), b: mkRT(w / f, h / f), w: w / f, h: h / f }));
    UNI.uPx.value = DPR;
  }
  function pass(m, target) { QUAD.material = m; renderer.setRenderTarget(target); renderer.render(FSQ, OC); }
  function render() {
    renderer.setRenderTarget(RT); renderer.render(scene, camera);
    M_BRIGHT.uniforms.t.value = RT.texture; pass(M_BRIGHT, LV[0].a);
    for (let k = 0; k < LV.length; k++) {
      const L = LV[k];
      if (k) { M_COPY.uniforms.t.value = LV[k - 1].a.texture; pass(M_COPY, L.a); }
      M_BLUR.uniforms.t.value = L.a.texture; M_BLUR.uniforms.dir.value.set(1 / L.w, 0); pass(M_BLUR, L.b);
      M_BLUR.uniforms.t.value = L.b.texture; M_BLUR.uniforms.dir.value.set(0, 1 / L.h); pass(M_BLUR, L.a);
    }
    const u = M_COMP.uniforms; u.t.value = RT.texture; u.b0.value = LV[0].a.texture; u.b1.value = LV[1].a.texture; u.b2.value = LV[2].a.texture; pass(M_COMP, null);
  }

  /* --- points and links -------------------------------------------------- */
  const SUGAR = new THREE.Color("#9db7d5");
  const pos = new Float32Array(NN * 3), size = new Float32Array(NN), hl = new Float32Array(NN), tw = new Float32Array(NN), bright = new Float32Array(NN);
  for (let i = 0; i < NN; i++) {
    pos[i * 3] = X[i]; pos[i * 3 + 1] = Y[i];
    const k = KIND(i), d = DEG[i];
    size[i] = k === "root" ? 30 : k === "hub" ? 17 : k === "species" ? (ex(i).obs ? 4.2 : 2.6) : k === "genus" ? 2.4 + Math.min(5, Math.sqrt(d) * 0.5)
      : ["pollutant", "medium", "category", "family"].includes(k) ? 4 + Math.min(8, Math.sqrt(d) * 0.6) : 6.5;
    bright[i] = k === "root" ? 2.2 : k === "hub" ? 1.7 : k === "species" ? 0.62 : k === "genus" ? 0.7 : 1.05;
    tw[i] = Math.abs((Math.sin(i * 12.9898) * 43758.5453) % 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("size", new THREE.BufferAttribute(size, 1));
  g.setAttribute("hl", new THREE.BufferAttribute(hl, 1));
  g.setAttribute("tw", new THREE.BufferAttribute(tw, 1));
  g.setAttribute("br", new THREE.BufferAttribute(bright, 1));
  const VS_P = "attribute float size;attribute float hl;attribute float tw;attribute float br;uniform float uT,uZoom,uPx,uAny,uTime;uniform vec3 uYel;varying vec3 vC;" +
    "void main(){float e=uT<.5?4.*uT*uT*uT:1.-pow(-2.*uT+2.,3.)/2.;vec3 p=position*mix(.04,1.,e);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);" +
    "float z=clamp(pow(uZoom,.55),.55,3.2);float big=1.+step(.5,hl)*.7+step(1.5,hl)*1.4;gl_PointSize=max(1.5,size*z*big*uPx*.62);" +
    "float tws=.85+.15*sin(uTime*(.6+tw*2.)+tw*40.);vec3 s=vec3(.616,.718,.835);" +
    "vec3 c=hl>.5?uYel*(1.1+step(1.5,hl)*.9):s*br*tws;c*=uAny>.5&&hl<.5?.22:1.;vC=c;}";
  const FS_P = "varying vec3 vC;void main(){vec2 q=gl_PointCoord-.5;float d=dot(q,q);if(d>.25)discard;float a=exp(-d*24.)*.8+exp(-d*120.)*.9;gl_FragColor=vec4(vC*a,1.);}";
  const ADD = { transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending };
  const points = new THREE.Points(g, new THREE.ShaderMaterial(Object.assign({ vertexShader: VS_P, fragmentShader: FS_P, uniforms: UNI }, ADD)));

  // links: hub spokes a little brighter than species links, all in sugar
  const lp = new Float32Array(D.e.length * 3), lc = new Float32Array(D.e.length * 3);
  const isHub = (i) => KIND(i) === "hub" || KIND(i) === "root";
  for (let k = 0; k < D.e.length; k += 2) {
    const a = D.e[k], b = D.e[k + 1];
    // spokes from a lobe to its own structure are bright; species reaching across lobes stay faint
    const spec = KIND(a) === "species" || KIND(b) === "species";
    const strong = (isHub(a) || isHub(b)) && !spec, cross = KIND(a) === "pollutant" || KIND(b) === "pollutant" || ((isHub(a) || isHub(b)) && spec);
    const f = strong ? 0.16 : cross ? 0.0045 : spec ? 0.03 : 0.06;
    for (const [q, i] of [[k, a], [k + 1, b]]) { lp[q * 3] = X[i]; lp[q * 3 + 1] = Y[i]; lc[q * 3] = SUGAR.r * f; lc[q * 3 + 1] = SUGAR.g * f; lc[q * 3 + 2] = SUGAR.b * f; }
  }
  const lg = new THREE.BufferGeometry();
  lg.setAttribute("position", new THREE.BufferAttribute(lp, 3)); lg.setAttribute("color", new THREE.BufferAttribute(lc, 3));
  const LU = { uA: { value: 1 }, uT: UNI.uT };
  const VS_L = "attribute vec3 color;uniform float uT;varying vec3 vC;void main(){float e=uT<.5?4.*uT*uT*uT:1.-pow(-2.*uT+2.,3.)/2.;vC=color*e;gl_Position=projectionMatrix*modelViewMatrix*vec4(position*mix(.04,1.,e),1.);}";
  const FS_L = "varying vec3 vC;uniform float uA;void main(){gl_FragColor=vec4(vC*uA,1.);}";
  const lines = new THREE.LineSegments(lg, new THREE.ShaderMaterial(Object.assign({ vertexShader: VS_L, fragmentShader: FS_L, uniforms: LU }, ADD)));
  const hg = new THREE.BufferGeometry();
  hg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(0), 3));
  const hlines = new THREE.LineSegments(hg, new THREE.LineBasicMaterial(Object.assign({ color: 0xffd24a, opacity: 0.55 }, ADD)));
  scene.add(lines); scene.add(hlines); scene.add(points);

  /* --- camera: pan and zoom ---------------------------------------------- */
  let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
  for (let i = 0; i < NN; i++) { minX = Math.min(minX, X[i]); maxX = Math.max(maxX, X[i]); minY = Math.min(minY, Y[i]); maxY = Math.max(maxY, Y[i]); }
  const cam = { x: 0, y: 0, s: 1 }, goal = { x: 0, y: 0, s: 1 }, home = { x: 0, y: 0, s: 1 };
  function viewport() { // the free area between the two panels
    if (small()) return { l: 0, r: W, t: 64, b: H };
    const c = canvas.getBoundingClientRect(), L = $("#left").getBoundingClientRect(), R = $("#right");
    const rr = R.innerHTML ? R.getBoundingClientRect().left - c.left : W;
    return { l: L.right - c.left + 10, r: rr - 10, t: 64, b: H - 10 };
  }
  function fitHome() {
    const v = viewport(), w = v.r - v.l, h = v.b - v.t;
    home.s = Math.min(w / (maxX - minX), h / (maxY - minY)) * 0.96; // px per world unit
    home.x = (minX + maxX) / 2 - ((v.l + v.r) / 2 - W / 2) / home.s;
    home.y = (minY + maxY) / 2 + ((v.t + v.b) / 2 - H / 2) / home.s;
  }
  const toScreen = (x, y) => [(x - cam.x) * cam.s + W / 2, H / 2 - (y - cam.y) * cam.s];
  const toWorld = (sx, sy) => [(sx - W / 2) / cam.s + cam.x, (H / 2 - sy) / cam.s + cam.y];
  function applyCam() {
    camera.left = cam.x - W / 2 / cam.s; camera.right = cam.x + W / 2 / cam.s; camera.top = cam.y + H / 2 / cam.s; camera.bottom = cam.y - H / 2 / cam.s;
    camera.updateProjectionMatrix(); UNI.uZoom.value = cam.s / home.s;
  }

  /* --- picking with a world grid ----------------------------------------- */
  const CELL = 24, grid = new Map();
  for (let i = 0; i < NN; i++) { const key = Math.floor(X[i] / CELL) + "," + Math.floor(Y[i] / CELL); if (!grid.has(key)) grid.set(key, []); grid.get(key).push(i); }
  function pick(sx, sy) {
    const [wx, wy] = toWorld(sx, sy), rad = 12 / cam.s, cx = Math.floor(wx / CELL), cy = Math.floor(wy / CELL), span = Math.ceil(rad / CELL) + 1;
    let best = -1, bd = 1e9;
    for (let a = cx - span; a <= cx + span; a++) for (let b = cy - span; b <= cy + span; b++) {
      const l = grid.get(a + "," + b); if (!l) continue;
      for (const i of l) { const d = Math.hypot(X[i] - wx, Y[i] - wy) - (isHub(i) ? 10 / cam.s : 0); if (d < rad && d < bd) { bd = d; best = i; } }
    }
    return best;
  }

  /* --- labels (HTML over the canvas) -------------------------------------- */
  const labelsEl = $("#labels"), pool = [];
  function drawLabels() {
    const out = [], placed = [], v = viewport();
    const nb = sel >= 0 ? new Set(nbrs(sel)) : null;
    const want = [[ROOT, "is-root", 1e9]];
    HUBS.forEach((i) => want.push([i, "is-hub" + (nb && nb.has(i) ? " is-yel" : ""), 1e8]));
    if (sel >= 0) { want.push([sel, "is-sel", 1e10]); if (nb.size <= 80) nb.forEach((j) => { if (!isHub(j)) want.push([j, "is-yel", 1e7 + DEG[j]]); }); }
    const z = cam.s / home.s;
    if (z > 1.6) { // closer in: the busiest visible points get a name
      const [x0, y1] = toWorld(v.l, v.t), [x1, y0] = toWorld(v.r, v.b);
      for (let i = 0; i < NN; i++) {
        if (X[i] < x0 || X[i] > x1 || Y[i] < y0 || Y[i] > y1 || isHub(i)) continue;
        const sp = KIND(i) === "species";
        if (sp && z < 4) continue;
        const score = DEG[i] + (sp ? 3 : 0);
        if (score > (z > 3 ? 2 : 5)) want.push([i, "", score]);
      }
    }
    want.sort((a, b) => b[2] - a[2]);
    for (const [i, cls] of want) {
      if (out.length > (small() ? 26 : 64)) break;
      const [sx, sy] = toScreen(X[i], Y[i]);
      if (sx < v.l - 4 || sx > v.r + 4 || sy < v.t || sy > v.b) continue;
      const txt = label(i), w = Math.min(240, txt.length * (cls.includes("hub") ? 7.6 : 6.3) + 10);
      const centred = cls.includes("is-root") || cls.includes("is-hub");
      const box = centred ? [sx - w / 2, sy + 6, sx + w / 2, sy + 26] : [sx + 8, sy - 9, sx + 8 + w, sy + 9];
      if (!cls.includes("is-sel") && placed.some((q) => box[0] < q[2] && box[2] > q[0] && box[1] < q[3] && box[3] > q[1])) continue;
      placed.push(box); out.push([sx, sy, txt, cls]);
    }
    while (pool.length < out.length) { const s = document.createElement("span"); labelsEl.appendChild(s); pool.push(s); }
    pool.forEach((s, k) => {
      if (k >= out.length) { s.style.display = "none"; return; }
      const [sx, sy, txt, cls] = out[k];
      s.style.display = ""; s.className = cls; s.textContent = txt; s.style.left = sx + "px"; s.style.top = sy + "px";
    });
  }

  /* --- loop ---------------------------------------------------------------- */
  let raf = 0, t0 = 0, introDone = reduced, lastLabel = 0, visible = true;
  const kick = () => { if (!raf && visible) raf = requestAnimationFrame(frame); };
  function frame(now) {
    raf = 0;
    if (!t0) t0 = now;
    const k = reduced ? 1 : 0.16;
    cam.x += (goal.x - cam.x) * k; cam.y += (goal.y - cam.y) * k; cam.s *= Math.pow(goal.s / cam.s, k);
    if (!introDone) { UNI.uT.value = Math.min(1, (now - t0) / 1900); if (UNI.uT.value >= 1) introDone = true; }
    UNI.uTime.value = now / 1000;
    applyCam(); render();
    if (now - lastLabel > 40) { drawLabels(); lastLabel = now; }
    const moving = Math.abs(goal.x - cam.x) * cam.s > 0.3 || Math.abs(goal.y - cam.y) * cam.s > 0.3 || Math.abs(goal.s / cam.s - 1) > 0.002 || !introDone;
    if (moving) kick(); else { drawLabels(); if (!reduced) setTimeout(kick, 60); } // the points keep breathing, slowly
  }
  document.addEventListener("visibilitychange", () => { visible = !document.hidden; if (visible) kick(); });

  /* --- interaction ------------------------------------------------------------ */
  const ptrs = new Map(); let drag = null, pinch = null;
  const clampS = (s) => Math.max(home.s * 0.5, Math.min(home.s * 60, s));
  function zoomAt(sx, sy, f) {
    const [wx, wy] = toWorld(sx, sy), s = clampS(goal.s * f);
    const gx = wx - (wx - cam.x) * (cam.s / s), gy = wy - (wy - cam.y) * (cam.s / s);
    goal.x = gx; goal.y = gy; goal.s = s; kick();
  }
  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]);
    if (ptrs.size === 1) drag = { x: e.clientX, y: e.clientY, gx: cam.x, gy: cam.y, moved: false };
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), s: goal.s }; drag = null; }
    canvas.classList.add("is-drag");
  });
  canvas.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect(), sx = e.clientX - r.left, sy = e.clientY - r.top;
    if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, [e.clientX, e.clientY]);
    if (pinch && ptrs.size === 2) { const [a, b] = [...ptrs.values()]; goal.s = clampS(pinch.s * Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch.d); kick(); return; }
    if (drag) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
      if (drag.moved) { goal.x = cam.x = drag.gx - dx / cam.s; goal.y = cam.y = drag.gy + dy / cam.s; goal.s = cam.s; kick(); return; }
    }
    const i = pick(sx, sy), tip = $("#tip");
    canvas.classList.toggle("is-over", i >= 0);
    if (i >= 0 && e.pointerType === "mouse") {
      tip.hidden = false; tip.innerHTML = "<small>" + esc(t("kinds")[KIND(i)]) + "</small>" + esc(label(i));
      tip.style.left = Math.min(sx + 14, W - 290) + "px"; tip.style.top = sy + 14 + "px";
    } else tip.hidden = true;
  });
  const up = (e) => {
    ptrs.delete(e.pointerId); canvas.classList.remove("is-drag");
    if (ptrs.size < 2) pinch = null;
    if (drag && !drag.moved && e.type === "pointerup") { const r = canvas.getBoundingClientRect(), i = pick(e.clientX - r.left, e.clientY - r.top); if (i >= 0) select(i, true); }
    drag = null;
  };
  canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up);
  canvas.addEventListener("pointerleave", () => { $("#tip").hidden = true; });
  canvas.addEventListener("wheel", (e) => { e.preventDefault(); const r = canvas.getBoundingClientRect(); zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * 0.0016)); }, { passive: false });
  canvas.addEventListener("dblclick", (e) => { const r = canvas.getBoundingClientRect(); zoomAt(e.clientX - r.left, e.clientY - r.top, 2.2); });
  $("#zin").addEventListener("click", () => zoomAt(W / 2, H / 2, 1.7));
  $("#zout").addEventListener("click", () => zoomAt(W / 2, H / 2, 1 / 1.7));
  $("#home").addEventListener("click", () => { clearSel(); renderIntro(); renderRight(); fitHome(); Object.assign(goal, home); kick(); });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") { $("#results").hidden = true; if (sel >= 0) { clearSel(); renderIntro(); renderRight(); kick(); } } });

  /* --- selection ------------------------------------------------------------ */
  let sel = -1, hist = [], filt = "";
  function unlight() { if (sel >= 0) { hl[sel] = 0; nbrs(sel).forEach((j) => { hl[j] = 0; }); } }
  function clearSel() {
    unlight(); sel = -1; hist = []; filt = ""; UNI.uAny.value = 0; LU.uA.value = 1;
    g.attributes.hl.needsUpdate = true; hg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(0), 3));
  }
  function select(i, push) {
    if (push && sel >= 0 && sel !== i) hist.push(sel);
    unlight(); sel = i; filt = "";
    const nb = nbrs(i); nb.forEach((j) => { hl[j] = 1; }); hl[i] = 2; g.attributes.hl.needsUpdate = true;
    UNI.uAny.value = 1; LU.uA.value = 0.35;
    const P = new Float32Array(nb.length * 6);
    nb.forEach((j, k) => { P[k * 6] = X[i]; P[k * 6 + 1] = Y[i]; P[k * 6 + 3] = X[j]; P[k * 6 + 4] = Y[j]; });
    hg.setAttribute("position", new THREE.BufferAttribute(P, 3));
    $("#results").hidden = true;
    renderCard(i); renderRight();
    // frame the node with its links (hubs and centre do not count: they are far by design)
    let x0 = X[i], x1 = X[i], y0 = Y[i], y1 = Y[i];
    if (nb.length <= 400) nb.forEach((j) => { if (isHub(j)) return; x0 = Math.min(x0, X[j]); x1 = Math.max(x1, X[j]); y0 = Math.min(y0, Y[j]); y1 = Math.max(y1, Y[j]); });
    const v = viewport(), w = v.r - v.l, h = v.b - v.t;
    const s = Math.min(home.s * 14, Math.max(home.s * (isHub(i) ? 1.4 : 2.4), Math.min(w / (x1 - x0 + 40), h / (y1 - y0 + 40))));
    goal.s = s; goal.x = (x0 + x1) / 2 - ((v.l + v.r) / 2 - W / 2) / s; goal.y = (y0 + y1) / 2 + ((v.t + v.b) / 2 - H / 2) / s;
    kick();
    if (small() && push) $("#left").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }

  /* --- left panel ----------------------------------------------------------- */
  const tag = (i) => '<span class="k k--y">' + esc(t("kinds")[KIND(i)]) + "</span>";
  const btn = (i, txt) => '<button type="button" data-n="' + i + '">' + esc(txt || label(i)) + "</button>";
  const rows = (pairs) => "<dl>" + pairs.filter((p) => p[1]).map((p) => "<dt>" + esc(p[0]) + "</dt><dd>" + p[1] + "</dd>").join("") + "</dl>";
  const HREF = { species: "#flora", genus: "#flora", category: "#flora", site: "#fields", sensor: "#instruments", feed: "#data", capability: "#platform", step: "#sequence", model: "#mind",
    patent: "#record", event: "#record", collab: "#record", team: "#team", index: "#machine", family: "#machine" };
  const goSite = (i) => (HREF[KIND(i)] ? '<a class="go" href="index.html' + HREF[KIND(i)] + '">' + esc(t("open")) + "</a>" : "");
  const backBtn = () => (hist.length ? '<button type="button" class="backbtn" data-back>' + esc(t("back2")) + "</button><br>" : "");

  function renderIntro() {
    const s = D.stats;
    $("#left").innerHTML = '<div class="card"><span class="k k--y">' + esc(t("kinds").root) + "</span><h1>" + esc(t("title")) + "</h1>" + photo(0) + "<p>" + esc(t("intro")) + "</p>" +
      '<div class="stat">' + [[s.species, 0], [s.phyto_rows, 1], [s.sources, 2], [s.pollutants, 3], [s.indices, 4], [s.edges, 5]]
        .map(([v, k]) => "<div><b>" + num(v) + "</b><span>" + esc(t("stats")[k]) + "</span></div>").join("") + "</div>" +
      '<p class="eb">' + esc(t("tryit")) + '</p><div class="chips">' + t("sug").map((q) => '<button type="button" data-q="' + esc(q) + '">' + esc(q) + "</button>").join("") + "</div>" +
      '<p class="note" style="margin-top:18px">' + esc(t("rule")) + "</p></div>";
  }

  function spark(vals, w, h) {
    const lo = Math.min(...vals), hi = Math.max(...vals) + 1e-9, st = w / (vals.length - 1);
    return vals.map((v, k) => (k ? "L" : "M") + (k * st).toFixed(1) + " " + (h - 3 - ((v - lo) / (hi - lo)) * (h - 6)).toFixed(1)).join("");
  }
  function siteSeries(id) { // deterministic and illustrative: seeded by the site id
    let sd = 7; for (const c of String(id)) sd = (sd * 31 + c.charCodeAt(0)) >>> 0;
    const rnd = () => { sd = (sd * 1664525 + 1013904223) >>> 0; return sd / 4294967296; };
    const out = [[], [], []]; let v = 0.6 + rnd() * 0.2, w = 0.2, c = 0.7 + rnd() * 0.15; const ph = rnd() * 6;
    for (let d = 0; d < 60; d++) {
      const heat = Math.max(0, Math.sin((d - 18 - ph) / 7)) * 0.5;
      w += (heat * 0.6 - w) * 0.25 + (rnd() - 0.5) * 0.05; if (rnd() < 0.08) w *= 0.4;
      v += (0.72 - 0.35 * w - v) * 0.15 + (rnd() - 0.5) * 0.015; c += (0.8 - 0.2 * w - c) * 0.08 + (rnd() - 0.5) * 0.01;
      out[0].push(v * 4.2 + 0.8); out[1].push(Math.max(0, w)); out[2].push(c * 100);
    }
    return out;
  }
  const dec = (v, d) => v.toFixed(d).replace(".", lang === "it" ? "," : ".");

  /* --- photos: our own images from the data, species and genera from iNaturalist --- */
  function photo(i) {
    const e = ex(i);
    if (!e.img) return "";
    if (e.imgs === "logo") return '<div class="ph ph--logo"><img src="' + esc(e.img) + '" alt=""></div>';
    const k = KIND(i), st = k === "sensor" ? ' style="object-fit:contain;background:#0b1018"' : k === "team" ? ' style="aspect-ratio:1;object-position:50% 25%"' : "";
    return '<img class="ph" src="' + esc(e.img) + '" alt=""' + st + ">";
  }
  const OPEN_LIC = /^(cc0|cc-by|cc-by-sa)$/, WILD = new Map();
  const LIC = { "cc0": "CC0", "cc-by": "CC BY", "cc-by-sa": "CC BY-SA" };
  function wildPhoto(i) {
    const k = KIND(i), name = D.n[i][0].toLowerCase().replace(/\s+/g, " ").trim().split(" ").slice(0, k === "genus" ? 1 : 2).join(" ");
    if (WILD.has(name)) return WILD.get(name);
    const api = "https://api.inaturalist.org/v1/taxa", pick = (ph) => ph && OPEN_LIC.test(ph.license_code || "") && ph.medium_url ? ph : null;
    const p = fetch(api + "?q=" + encodeURIComponent(name) + "&rank=" + k + "&taxon_id=47126&per_page=3")
      .then((r) => (r.ok ? r.json() : { results: [] }))
      .then(async (j) => {
        const tx = (j.results || []).find((r) => r.name.toLowerCase() === name);
        if (!tx) return null;
        let ph = pick(tx.default_photo);
        if (!ph) {
          const full = await fetch(api + "/" + tx.id).then((r) => (r.ok ? r.json() : { results: [] }));
          const tp = ((full.results || [])[0] || {}).taxon_photos || [];
          ph = tp.map((x) => pick(x.photo)).find(Boolean) || null;
        }
        return ph ? { src: ph.medium_url, by: ph.attribution_name || "", lic: LIC[ph.license_code], href: "https://www.inaturalist.org/taxa/" + tx.id, from: "iNaturalist" } : null;
      })
      .catch(() => null)
      .then((w) => w || commonsPhoto(name));
    WILD.set(name, p);
    return p;
  }
  // second source: the lead image of the Wikipedia page, kept only with a licence that allows commercial use
  function commonsPhoto(name) {
    const W = "https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages&piprop=name&titles=";
    const C = "https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=640&titles=File:";
    const strip = (h) => { const d = document.createElement("div"); d.innerHTML = h || ""; return d.textContent.replace(/\s+/g, " ").trim(); };
    return fetch(W + encodeURIComponent(name)).then((r) => r.json()).then((j) => {
      const pg = Object.values((j.query || {}).pages || {})[0] || {};
      if (!pg.pageimage) return null;
      return fetch(C + encodeURIComponent(pg.pageimage)).then((r) => r.json()).then((c) => {
        const ii = ((Object.values((c.query || {}).pages || {})[0] || {}).imageinfo || [])[0];
        if (!ii) return null;
        const m = ii.extmetadata || {}, lic = strip((m.LicenseShortName || {}).value);
        if (!/^(cc0|public domain|cc by(-sa)?( \d\.\d)?)$/i.test(lic)) return null;
        return { src: ii.thumburl || ii.url, by: strip((m.Artist || {}).value).slice(0, 60), lic, href: ii.descriptionurl, from: "Wikimedia Commons" };
      });
    }).catch(() => null);
  }
  function fillWild(i) {
    const fig = document.querySelector('#left .ph-wild[data-i="' + i + '"]');
    if (!fig) return;
    wildPhoto(i).then((w) => {
      if (!w || sel !== i || !fig.isConnected) { fig.remove(); return; }
      fig.innerHTML = '<img class="ph" src="' + esc(w.src) + '" alt="' + esc(label(i)) + '" loading="lazy"><figcaption>' + esc(t("photo")) + ": " +
        (w.by ? esc(w.by) + ", " : "") + esc(w.lic) + ' · <a href="' + esc(w.href) + '" target="_blank" rel="noopener">' + esc(w.from) + "</a></figcaption>";
      fig.classList.add("is-on");
      fig.querySelector("img").addEventListener("error", () => fig.remove());
    });
  }

  function renderCard(i) {
    const k = KIND(i), e = ex(i), L = $("#left");
    if (k === "root") { renderIntro(); return; }
    let body = "";
    if (k === "hub") {
      body = "<p>" + esc(exl(i, "d")) + "</p>";
    } else if (k === "species") {
      const nb = [...nbrs(i)], gen = nb.find((j) => KIND(j) === "genus"), cats = nb.filter((j) => KIND(j) === "category");
      body = (e.common ? '<p class="sub">' + esc(e.common) + "</p>" : "") +
        rows([[t("genus"), gen != null ? btn(gen) : ""], [t("cats"), cats.map((j) => btn(j)).join(" · ")]]) +
        "<p>" + esc(e.obs ? t("observed") : e.phyto_only ? t("phyOnly") : t("inList")) + "</p>";
      if (e.ph && e.ph.length) {
        const srcs = [...new Set(e.ph.flatMap((r) => r[2]))].slice(0, 8);
        body += '<p class="eb">' + esc(t("phyto")) + '</p><table class="ptab">' + e.ph.map(([p, n]) =>
          "<tr><td>" + esc(t("medium")[ex(p).med]) + "</td><td>" + btn(p) + "</td><td>" + num(n) + " " + esc(t("meas")) + "</td></tr>").join("") + "</table>" +
          '<p class="note">' + esc(t("phytoNote")) + "</p>" +
          (srcs.length ? '<div class="src"><b>' + esc(t("sources")) + "</b><ol>" + srcs.map((s) => "<li>" + esc(D.src[s]) + "</li>").join("") + "</ol></div>" : "");
      }
    } else if (k === "pollutant") {
      const l = POLSP.get(i) || [], tot = l.reduce((a, r) => a + r[1], 0);
      body = rows([[t("kinds").medium, esc(t("medium")[e.med])]]) +
        '<div class="stat"><div><b>' + num(l.length) + "</b><span>" + esc(t("species")) + "</span></div><div><b>" + num(tot) + "</b><span>" + esc(t("meas")) + "</span></div></div>" +
        '<p class="eb">' + esc(t("topSp")) + '</p><table class="ptab">' + l.slice(0, 10).map(([s, n]) => "<tr><td></td><td>" + btn(s) + "</td><td>" + num(n) + "</td></tr>").join("") + "</table>" +
        '<p class="note">' + esc(t("phytoNote")) + "</p>";
    } else if (k === "index") {
      body = rows([[t("name"), esc(e.name)], [t("principle"), esc(e.d_en)], [t("range"), esc(e.range)]]);
    } else if (k === "site") {
      const ser = siteSeries(e.sid || label(i));
      body = rows([[t("place"), esc(exl(i, "place"))], [t("state"), esc(exl(i, "state"))]]) +
        (exl(i, "d") ? "<p>" + esc(exl(i, "d")) + "</p>" : "") +
        '<p class="eb">' + esc(t("indTitle")) + "</p>" + ser.map((s, q) => '<div class="ind"><header><span>' + esc(t("ind")[q]) + "</span><b>" +
          (q === 2 ? dec(s[s.length - 1], 0) + "%" : dec(s[s.length - 1], 2)) + "</b></header>" +
          '<svg viewBox="0 0 300 46" preserveAspectRatio="none" aria-hidden="true"><path d="' + spark(s, 300, 46) + '" fill="none" stroke="currentColor" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg></div>').join("") +
        '<p class="note">' + esc(t("indNote")) + "</p>";
    } else if (k === "sensor") {
      body = rows([[t("state"), esc(exl(i, "state"))]]) + "<p>" + esc(exl(i, "d")) + "</p>";
    } else if (k === "feed") {
      body = rows([[t("agency"), esc(e.agency)], [t("res"), esc(e.res)], [t("rev"), esc(exl(i, "rev"))]]) + "<p>" + esc(exl(i, "d")) + "</p>";
    } else if (k === "team") {
      body = rows([[t("role"), esc(exl(i, "role"))]]) + "<p>" + esc(exl(i, "d")) + "</p>";
    } else if (k === "event") {
      body = rows([[t("date"), esc(e.date)]]);
    } else if (k === "patent") {
      body = rows([[t("state"), esc(exl(i, "state"))]]);
    } else if (k === "step") {
      body = "<p>" + esc(exl(i, "d")) + "</p>" + (exl(i, "meta") ? '<p class="note">' + esc(exl(i, "meta")) + "</p>" : "");
    } else if (k === "genus" || k === "category" || k === "medium" || k === "family") {
      const nb = nbrs(i), inner = [...nb].filter((j) => ["species", "pollutant", "index"].includes(KIND(j))).length;
      const what = k === "medium" ? t("kinds").pollutant : k === "family" ? t("kinds").index : t("species");
      body = '<div class="stat"><div><b>' + num(inner) + "</b><span>" + esc(what) + "</span></div><div><b>" + num(nb.length) + "</b><span>" + esc(t("linked")) + "</span></div></div>";
    } else {
      body = exl(i, "d") ? "<p>" + esc(exl(i, "d")) + "</p>" : "";
    }
    const title = k === "species" || k === "genus" ? "<em>" + esc(label(i)) + "</em>" : esc(label(i));
    const wild = !e.img && (k === "species" || k === "genus");
    const pic = wild ? '<figure class="ph-wild" data-i="' + i + '"><span class="ph ph--wait"></span></figure>' : photo(i);
    L.innerHTML = '<div class="card">' + backBtn() + tag(i) + "<h1>" + title + "</h1>" + pic + body + goSite(i) + "</div>";
    if (wild) fillWild(i);
  }

  /* --- right panel ---------------------------------------------------------- */
  function renderRight() {
    const R = $("#right");
    if (sel < 0) {
      R.innerHTML = '<p class="eb" style="margin-top:0">' + esc(t("lobes")) + '</p><ul class="links">' +
        HUBS.map((h) => '<li><button type="button" data-n="' + h + '"><b>' + esc(label(h)) + "</b><small>" + esc(exl(h, "d")) + "</small></button></li>").join("") + "</ul>";
      return;
    }
    const nb = [...nbrs(sel)], by = {};
    nb.forEach((j) => { const k = KIND(j); by[k] = (by[k] || 0) + 1; });
    const kinds = Object.keys(by).sort((a, b) => by[b] - by[a]);
    let list = nb.filter((j) => !filt || KIND(j) === filt).sort((a, b) => isHub(b) - isHub(a) || DEG[b] - DEG[a]);
    const MAX = 160, rest = Math.max(0, list.length - MAX);
    list = list.slice(0, MAX);
    R.innerHTML = '<p class="eb" style="margin-top:0">' + esc(t("linked")) + " · " + num(nb.length) + "</p>" +
      (kinds.length > 1 ? '<div class="filt"><button type="button" data-f="" aria-pressed="' + !filt + '">' + esc(t("all")) + "</button>" +
        kinds.map((k) => '<button type="button" data-f="' + k + '" aria-pressed="' + (filt === k) + '">' + esc(t("kinds")[k]) + " " + by[k] + "</button>").join("") + "</div>" : "") +
      '<ul class="links">' + list.map((j) => {
        const e = ex(j), sub = KIND(j) === "species" ? e.common || t("kinds").species : KIND(j) === "pollutant" ? t("medium")[e.med] : t("kinds")[KIND(j)];
        return '<li><button type="button" data-n="' + j + '"><b>' + esc(label(j)) + "</b><small>" + esc(sub) + "</small></button></li>";
      }).join("") + "</ul>" + (rest ? '<p class="more">' + esc(t("more").replace("{n}", num(rest))) + "</p>" : "");
  }

  /* --- search ------------------------------------------------------------------ */
  const HAY = new Array(NN);
  const buildHay = () => { for (let i = 0; i < NN; i++) { const r = D.n[i], e = r[6] || {}; HAY[i] = " " + fold([r[0], r[1] || "", e.common || "", e.name || ""].join(" | ")); } };
  buildHay();
  function search(q) {
    const toks = fold(q).replace(/[^a-z0-9\s\.\-]/g, " ").split(/\s+/).filter((w) => w.length > 1);
    if (!toks.length) return [];
    const res = [];
    for (let i = 0; i < NN; i++) {
      const h = HAY[i]; let s = 0;
      for (const w of toks) {
        if (h.startsWith(" " + w)) s += 3; else if (h.indexOf(" " + w) >= 0 || h.indexOf("(" + w) >= 0) s += 2; else if (w.length > 3 && h.indexOf(w) >= 0) s += 1; else { s = 0; break; }
      }
      if (s > 0) { const k = KIND(i); s += k === "hub" ? 1.2 : ["pollutant", "site", "patent", "collab", "index", "event", "team"].includes(k) ? 0.8 : 0; s += Math.min(1, DEG[i] / 60); res.push([i, s]); }
    }
    return res.sort((a, b) => b[1] - a[1]).slice(0, 14).map((r) => r[0]);
  }
  function showResults(q) {
    const box = $("#results"), r = search(q);
    box.innerHTML = r.length ? r.map((i, k) => {
      const e = ex(i), sub = KIND(i) === "species" ? e.common : KIND(i) === "pollutant" ? t("medium")[e.med] : KIND(i) === "index" ? e.name : exl(i, "place") || "";
      return '<li><button type="button" data-n="' + i + '"' + (k ? "" : ' class="is-on"') + '><span class="k">' + esc(t("kinds")[KIND(i)]) + "</span><b>" + esc(label(i)) + "</b>" + (sub ? "<small>" + esc(sub) + "</small>" : "") + "</button></li>";
    }).join("") : '<li class="none">' + esc(t("none")) + "</li>";
    box.hidden = false;
  }
  let typing = 0;
  $("#q").addEventListener("input", () => { clearTimeout(typing); typing = setTimeout(() => { const q = $("#q").value.trim(); if (q.length > 1) showResults(q); else $("#results").hidden = true; }, 140); });
  $("#search").addEventListener("submit", (e) => { e.preventDefault(); const on = $("#results:not([hidden]) button.is-on"); if (on) select(Number(on.dataset.n), true); else if ($("#q").value.trim()) showResults($("#q").value.trim()); });
  $("#q").addEventListener("keydown", (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const bs = [...document.querySelectorAll("#results button")]; if (!bs.length) return;
    e.preventDefault(); let i = bs.findIndex((b) => b.classList.contains("is-on")); bs.forEach((b) => b.classList.remove("is-on"));
    i = (i + (e.key === "ArrowDown" ? 1 : -1) + bs.length) % bs.length; bs[i].classList.add("is-on"); bs[i].scrollIntoView({ block: "nearest" });
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-n],[data-q],[data-f],[data-back]");
    if (!b) { if (!e.target.closest(".xb-search,.xb-results")) $("#results").hidden = true; return; }
    if (b.dataset.back != null) { const k = hist.pop(); if (k != null) select(k, false); return; }
    if (b.dataset.f != null) { filt = b.dataset.f; renderRight(); return; }
    if (b.dataset.q) { $("#q").value = b.dataset.q; showResults(b.dataset.q); return; }
    select(Number(b.dataset.n), true);
  });

  /* --- language -------------------------------------------------------------- */
  function setLang(l) {
    lang = l; document.documentElement.lang = l;
    try { localStorage.setItem("pv-lang", l); } catch (e) {}
    document.querySelectorAll("[data-t]").forEach((el) => { el.textContent = t(el.dataset.t); });
    document.querySelectorAll("[data-tp]").forEach((el) => { el.setAttribute(el.dataset.tp, t(el.dataset.tp)); });
    document.querySelectorAll("[data-ta]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.ta)); });
    document.querySelectorAll(".lang button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === l)));
    document.title = "Plantiverse · " + t("crumb");
    $("#hint").textContent = t("hint");
    $("#results").hidden = true;
    if (sel >= 0) renderCard(sel); else renderIntro();
    renderRight(); kick();
  }
  document.querySelectorAll(".lang button").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));

  /* --- start -------------------------------------------------------------- */
  let rt = 0;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { const wasHome = sel < 0; resize(); fitHome(); if (wasHome) Object.assign(goal, home); kick(); }, 120); });
  setLang(lang);
  resize(); fitHome(); Object.assign(goal, home); Object.assign(cam, home); cam.s = home.s * 0.8;
  kick();
  setTimeout(() => $("#load").classList.add("is-done"), 250);
  // a link from the site can open a node directly: esplora.html#n=Catharanthus roseus
  const m = decodeURIComponent(location.hash || "").match(/^#n=(.+)$/);
  if (m) { const r = search(m[1]); if (r.length) setTimeout(() => select(r[0], true), reduced ? 0 : 1500); }
})();
