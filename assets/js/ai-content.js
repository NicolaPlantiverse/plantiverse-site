/* =========================================================================
   Plantiverse — ai: content layer on top of nova-content.js
   Same record, told from the model's side: the intelligence leads, the
   sensors follow. Loaded after nova-content.js, it patches window.NOVA.
   ========================================================================= */

(function () {
  "use strict";
  const N = window.NOVA;

  /* --- the learning cycle ---------------------------------------------- */
  N.steps = [
    { id: "observe", num: "01",
      en: { name: "Observe", line: "Sensors, satellites and weather land in the same archive, aligned by plant, by hour and by site.", meta: "many sources, one reference" },
      it: { name: "Osservare", line: "Sensori, satelliti e meteo entrano nello stesso archivio, allineati per pianta, per ora e per sito.", meta: "molte fonti, un solo riferimento" } },
    { id: "interpret", num: "02",
      en: { name: "Interpret", line: "Several models work side by side. Species, stage and site history decide whether a change is ordinary or worth a visit.", meta: "context before conclusion" },
      it: { name: "Interpretare", line: "Più modelli lavorano affiancati. Specie, stadio e storia del sito decidono se una variazione è ordinaria o merita una visita.", meta: "prima il contesto, poi la conclusione" } },
    { id: "decide", num: "03",
      en: { name: "Decide", line: "One next move, with its confidence, its date and the check that would prove it wrong.", meta: "confidence and check, always" },
      it: { name: "Decidere", line: "Una mossa successiva, con la sua confidenza, la sua data e la verifica che la smentirebbe.", meta: "confidenza e verifica, sempre" } },
    { id: "automate", num: "04",
      en: { name: "Automate", line: "Where the site allows it, the decision drives irrigation, light and climate. The plant's signals lead, not the calendar, and the operator can stop any command.", meta: "plant-driven · patent granted, in trials" },
      it: { name: "Automatizzare", line: "Dove il sito lo consente, la decisione comanda irrigazione, luce e clima. Guidano i segnali della pianta, non il calendario, e l'operatore può fermare ogni comando.", meta: "plant-driven · brevetto concesso, in sperimentazione" } },
    { id: "learn", num: "05",
      en: { name: "Learn", line: "The measured outcome and the agronomist's report return to the archive and retrain the model of that site.", meta: "the model grows with the site" },
      it: { name: "Apprendere", line: "L'esito misurato e il report dell'agronomo tornano nell'archivio e riaddestrano il modello di quel sito.", meta: "il modello cresce con il sito" } }
  ];

  /* --- the reasoning demo: three illustrative scenarios ------------------ */
  N.inputs = {
    en: ["Plant spectrum", "Satellite", "Weather", "Site history", "Agronomist report"],
    it: ["Spettro della pianta", "Satellite", "Meteo", "Storia del sito", "Report dell'agronomo"]
  };
  N.models = { en: ["Water", "Pests", "Light"], it: ["Acqua", "Parassiti", "Luce"] };

  N.scenarios = [
    { id: "vineyard", strength: [0.9, 0.7, 0.85, 0.6, 0.3], scores: [0.71, 0.18, 0.11], win: 0, conf: 0.71,
      en: { tab: "Vineyard", place: "Rome, ESA BIC",
        read: ["NIR/red falling on row 7", "Sentinel-1: drier soil", "6 dry days, 31 °C ahead", "Row 7 sits on sandy soil", "Last visit 9 days ago"],
        move: "Irrigate rows 6, 7 and 8 within 48 hours. The others stay under observation.",
        why: "The drop sits on the sandiest soil and matches six dry days, so the water model outweighs the other two.",
        refute: "If NIR/red does not recover within 5 days of irrigation, the cause is not water and the pest model takes the lead.",
        check: "in 5 days" },
      it: { tab: "Vigneto", place: "Roma, ESA BIC",
        read: ["NIR/rosso in calo sul filare 7", "Sentinel-1: suolo più secco", "6 giorni secchi, 31 °C previsti", "Il filare 7 è su suolo sabbioso", "Ultima visita 9 giorni fa"],
        move: "Irrigare i filari 6, 7 e 8 entro 48 ore. Gli altri restano in osservazione.",
        why: "Il calo è concentrato sul suolo più sabbioso e coincide con sei giorni secchi, quindi il modello idrico pesa più degli altri due.",
        refute: "Se il rapporto NIR/rosso non risale entro 5 giorni dall'irrigazione, la causa non è idrica e passa in testa il modello parassiti.",
        check: "tra 5 giorni" } },
    { id: "roof", strength: [0.6, 0.2, 0.5, 0.9, 0.8], scores: [0.22, 0.12, 0.3], win: -1, conf: 0.66,
      en: { tab: "Green roof", place: "Rome, ENEA",
        read: ["Cover falling on an edge plot", "No anomaly across the region", "Strong wind for 2 days", "Autumn drop expected for this species", "Report: leaves intact"],
        move: "No intervention. The drop sits within the ordinary autumn variation of this species.",
        why: "The signal is real, but the satellite sees nothing across the region and the site history already explains it. The agronomist report agrees.",
        refute: "If cover falls another 10% next week, the change is not seasonal and the site moves back up the list.",
        check: "in 7 days" },
      it: { tab: "Tetto verde", place: "Roma, ENEA",
        read: ["Copertura in calo su una parcella di bordo", "Nessuna anomalia sulla regione", "Vento forte per 2 giorni", "Calo autunnale atteso per la specie", "Report: foglie integre"],
        move: "Nessun intervento. Il calo rientra nella variazione autunnale ordinaria di questa specie.",
        why: "Il segnale c'è, ma il satellite non vede nulla sulla regione e la storia del sito lo spiega già. Il report dell'agronomo lo conferma.",
        refute: "Se la copertura scende di un altro 10% la prossima settimana, il calo non è stagionale e il sito torna in priorità.",
        check: "tra 7 giorni" } },
    { id: "greenhouse", strength: [0.85, 0.05, 0.75, 0.8, 0.7], scores: [0.14, 0.64, 0.22], win: 1, conf: 0.64,
      en: { tab: "Greenhouse", place: "Controlled environment",
        read: ["Spots on 3 plants, green band", "Not relevant indoors", "Night humidity at 88%", "Pest outbreak at week 6, last cycle", "Report: curled leaves, row B"],
        move: "Inspect plants B12, B13 and B14 tomorrow morning, before any treatment.",
        why: "Three independent signals point the same way: spectrum, night humidity and the history of the last cycle.",
        refute: "If the inspection finds no pests, the outcome returns to the archive and the model lowers the weight of humidity for this greenhouse.",
        check: "tomorrow" },
      it: { tab: "Serra", place: "Ambiente controllato",
        read: ["Macchie su 3 piante, banda verde", "Non pertinente in serra", "Umidità notturna all'88%", "Focolaio alla settimana 6, ciclo scorso", "Report: foglie arricciate, fila B"],
        move: "Ispezionare le piante B12, B13 e B14 domattina, prima di qualsiasi trattamento.",
        why: "Tre segnali indipendenti puntano nella stessa direzione: spettro, umidità notturna e storia del ciclo precedente.",
        refute: "Se l'ispezione non trova parassiti, l'esito torna nell'archivio e il modello abbassa il peso dell'umidità per questa serra.",
        check: "domani" } }
  ];

  /* --- what the platform does ------------------------------------------- */
  N.capabilities = [
    { id: "forecast",
      en: { name: "Stress forecast", line: "For every plant the model estimates water status, pest pressure and light, and points to where to look first." },
      it: { name: "Previsione dello stress", line: "Per ogni pianta il modello stima stato idrico, pressione dei parassiti e luce, e indica dove guardare per primo." } },
    { id: "knowledge",
      en: { name: "Knowledge Engine", line: "Searches the agronomists' field reports and shows which observations each answer comes from." },
      it: { name: "Knowledge Engine", line: "Cerca nei report di campo degli agronomi e mostra da quali osservazioni viene ogni risposta." } },
    { id: "twin",
      en: { name: "Site digital twin", line: "Plants, plots, sensors and their history in one place, so every reading has its context." },
      it: { name: "Gemello digitale del sito", line: "Piante, parcelle, sensori e la loro storia in un punto solo, così ogni lettura ha il suo contesto." } },
    { id: "ledger",
      en: { name: "Decision record", line: "Each proposal stays saved with the data that produced it. Whoever checks later sees what the model saw." },
      it: { name: "Registro delle decisioni", line: "Ogni proposta resta salvata con i dati che l'hanno prodotta. Chi controlla dopo vede quello che ha visto il modello." } }
  ];

  N.chips = {
    en: ["Models side by side (mixture of experts)", "European cloud", "Views for agronomists, researchers, investors", "Field reports from the phone, offline too"],
    it: ["Modelli affiancati (mixture of experts)", "Cloud europeo", "Viste per agronomi, ricercatori, investitori", "Report di campo dal telefono, anche offline"]
  };

  /* --- the training asset ------------------------------------------------ */
  N.counters = [
    { value: 8600, plus: true, en: "acquisition sessions", it: "sessioni di acquisizione" },
    { value: 6300, plus: true, en: "agronomist field reports", it: "report di campo degli agronomi" },
    { value: 6072, plus: false, en: "species in the reference list", it: "specie nell'elenco di riferimento" },
    { value: 8, plus: false, en: "public satellite and weather services", it: "servizi satellitari e meteo pubblici" }
  ];

  /* --- hero proof strip -------------------------------------------------- */
  N.proof = [
    { en: { value: "8,600+", label: "acquisition sessions" }, it: { value: "8.600+", label: "sessioni di acquisizione" } },
    { en: { value: "6,300+", label: "agronomist reports" }, it: { value: "6.300+", label: "report degli agronomi" } },
    { en: { value: "7", label: "real sites" }, it: { value: "7", label: "siti reali" } }
  ];

  /* --- record: the withdrawn accuracies are replaced by the figures that
     hold on the agronomists' corpus (registro affermazioni, 2026-08-18) --- */
  N.record = N.record.filter((r) => !/accuracy/i.test(r.en.title));
  const method = N.record.pop();
  N.record.push(
    { type: "data", date: "2026",
      en: { title: "The models beat the simplest prediction (most frequent class): +2.5 points on water, +2.9 on pests, +7.4 on light", src: "506 plants, cross-validation grouped by plant · internal" },
      it: { title: "I modelli superano la previsione più semplice (classe più frequente): +2,5 punti sull'acqua, +2,9 sui parassiti, +7,4 sulla luce", src: "506 piante, validazione incrociata raggruppata per pianta · interno" } },
    { type: "data", date: "2026",
      en: { title: "In balanced accuracy, the gain over chance is +11.7 points on water, +8.5 on pests, +14.2 on light", src: "Same corpus and same validation · internal" },
      it: { title: "In accuratezza bilanciata, il guadagno sul caso è di +11,7 punti sull'acqua, +8,5 sui parassiti, +14,2 sulla luce", src: "Stesso corpus e stessa validazione · interno" } },
    method
  );

  /* --- record: closed loop on irrigation (FAO site). Stays off until the
     [DA COMPLETARE] fields hold real data; then set FAO_READY = true. ------ */
  const FAO_READY = false;
  if (FAO_READY) {
    N.record.splice(N.record.length - 1, 0,
      { type: "data", date: "[DA COMPLETARE: anno]",
        en: { title: "Closed loop at the FAO site: the model reads plant stress and drives a small irrigation unit on its own, within set limits", src: "[DA COMPLETARE: sensore, periodo, numero di interventi] · internal" },
        it: { title: "Anello chiuso al sito FAO: il modello legge lo stress delle piante e comanda da solo un piccolo irrigatore, entro limiti impostati", src: "[DA COMPLETARE: sensore, periodo, numero di interventi] · interno" } });
  }

  /* --- team: one line moves toward the models ----------------------------- */
  N.team.forEach((m) => {
    if (m.id === "andrea") {
      m.en.line = "PhD in physics. Builds the artificial intelligence models and keeps them honest about what they do not know.";
      m.it.line = "Dottorato in fisica. Costruisce i modelli di intelligenza artificiale e li tiene onesti su quello che non sanno.";
    }
  });

  /* --- interface strings ------------------------------------------------- */
  Object.assign(N.i18n.en, {
    "meta.title": "Plantiverse · artificial intelligence that listens to plants",
    "meta.desc": "Plantiverse builds artificial intelligence for living systems: models that read every plant together with satellites, weather and site history, and propose the next move with its confidence and its source.",
    "nav.mind": "Intelligence", "nav.machine": "Vision", "nav.sequence": "Cycle", "nav.platform": "Platform",
    "nav.data": "Data", "nav.instruments": "Sensors",

    "hero.eyebrow": "Artificial intelligence for living systems · Rome",
    "hero.lede": "Our artificial intelligence listens to every plant. It reads stress together with satellites, weather and the history of the site, and decides the action that keeps your green area lush and productive. Where irrigation or lighting is connected, it acts on its own, within the limits you set.",
    "hero.invite": "Bring your green areas or biological systems: the model learns your site.",
    "hero.cta1": "See how it reasons",
    "hero.canvas": "A plant drawn as a neural network: signals travel from the leaves, where the data arrive, down to the root, where the decision forms.",

    "mind.eyebrow": "01 / The reasoning",
    "mind.title": "One site, five sources, one decision.",
    "mind.lede": "Pick a site. See which data matter, which model takes the lead and what the system proposes, with its confidence and the check that would prove it wrong.",
    "mind.inputs": "What the model reads", "mind.weight": "weight",
    "mind.move": "Next move", "mind.conf": "Confidence", "mind.why": "Why", "mind.refute": "What would prove it wrong", "mind.check": "Check",
    "mind.none": "no model above threshold",
    "mind.credit": "Illustrative scenarios: they show the format of a platform decision (data, weights, confidence, check). Values are built for the example, not measured.",

    "machine.eyebrow": "02 / How it sees",
    "machine.title": "The camera records light. The model draws the map.",
    "machine.lede": "On the left, what arrives from the sensor. On the right, the same scene rewritten by the model as one value per point, the first step before deciding where to look. Drag the handle.",
    "machine.right": "Index map · what the model reads",

    "seq.eyebrow": "03 / The cycle",
    "seq.title": "A cycle that learns from every site.",
    "seq.lede": "Observe, interpret, decide, automate, learn. Each pass leaves the model of that site a little more precise than before.",

    "plat.eyebrow": "04 / The platform",
    "plat.title": "The model, at work every day.",
    "plat.lede": "Agronomists, researchers and green space managers use the same platform, each with the view of their own role.",
    "plat.cta": "Sign in to the platform",
    "inst.credit": "LATTICE product photographs: <a href=\"https://www.mapir.camera\" target=\"_blank\" rel=\"noopener\">MAPIR</a>. Ecomotica photographs: Plantiverse.",
    "footer.img": "Photographs document Plantiverse hardware, sites and field work. LATTICE product photographs are by <a href=\"https://www.mapir.camera\" target=\"_blank\" rel=\"noopener\">MAPIR</a>.",
    "plat.ennous": "Plantiverse reasoning is built on ENNOUS, the artificial intelligence engine developed by the same team. Plants are where it was born and where it was first put to the test.",
    "explore.eyebrow": "Explore",
    "explore.title": "The Plantiverse brain, as one map.",
    "explore.line": "8,000 species, phytoremediation from 605 publications, 97 vegetation indices, platform, sites, patents, events and collaborations. Pick a point: in yellow everything linked to it.",
    "explore.go": "Open Explore",

    "data.eyebrow": "05 / The data",
    "data.title": "The model learns from real sites.",
    "data.lede": "A model is worth the data it learns from. Ours come from real sites: each session is paired with the report of the agronomist who saw the same plant, and this pairing is what teaches the model.",
    "data.sub": "Three distances feed the same archive. A satellite knows the region and ignores the plant, a sensor on the plant knows everything about it and nothing about the valley. The model joins them and keeps the difference visible.",

    "fields.eyebrow": "06 / Fields",
    "fields.title": "Where the model already learns.",
    "fields.lede": "Seven sites, four of them running. Each site teaches the model a different way for a reading to be wrong, which is the point.",

    "flora.eyebrow": "07 / Flora",

    "inst.eyebrow": "08 / Sensors",
    "inst.title": "The sensors are the eyes. We provide the brain.",
    "inst.lede": "The model works with multispectral cameras, with our own Ecomotica stations and with public satellites. The sensor changes from site to site, the model that reads it stays the same.",

    "rec.eyebrow": "09 / The record",
    "rec.lede": "Company facts, patents, partners, data and the honest measure of the models: how much they add over the simplest prediction.",
    "team.eyebrow": "10 / Team",
    "team.lede": "Five founders. Physics, data science, geology, design and software, in one small team that works on real sites.",
    "contact.eyebrow": "11 / Contact",

    "footer.privacy": "Privacy",
    "footer.title": "Plants already say what they need. Our artificial intelligence listens."
  });

  Object.assign(N.i18n.it, {
    "meta.title": "Plantiverse · intelligenza artificiale che ascolta le piante",
    "meta.desc": "Plantiverse sviluppa intelligenza artificiale per i sistemi viventi: modelli che leggono ogni pianta insieme a satelliti, meteo e storia del sito, e propongono la prossima mossa con la sua confidenza e la sua fonte.",
    "nav.mind": "Intelligenza", "nav.machine": "Visione", "nav.sequence": "Ciclo", "nav.platform": "Piattaforma",
    "nav.data": "Dati", "nav.instruments": "Sensori",

    "hero.eyebrow": "Intelligenza artificiale per i sistemi viventi · Roma",
    "hero.lede": "La nostra intelligenza artificiale ascolta ogni pianta. Legge lo stress insieme a satelliti, meteo e storia del sito, e decide l'intervento che mantiene il tuo spazio verde rigoglioso e produttivo. Dove irrigazione o luci sono collegate, agisce da sola, nei limiti che imposti tu.",
    "hero.invite": "Porta le tue aree verdi o i tuoi sistemi biologici: il modello impara il tuo sito.",
    "hero.cta1": "Guarda come ragiona",
    "hero.canvas": "Una pianta disegnata come una rete neurale: i segnali viaggiano dalle foglie, dove arrivano i dati, fino alla radice, dove si forma la decisione.",

    "mind.eyebrow": "01 / Il ragionamento",
    "mind.title": "Un sito, cinque fonti, una decisione.",
    "mind.lede": "Scegli un sito. Guarda quali dati contano, quale modello prende la parola e cosa propone il sistema, con la sua confidenza e la verifica che lo smentirebbe.",
    "mind.inputs": "Cosa legge il modello", "mind.weight": "peso",
    "mind.move": "Prossima mossa", "mind.conf": "Confidenza", "mind.why": "Perché", "mind.refute": "Cosa la smentirebbe", "mind.check": "Verifica",
    "mind.none": "nessun modello sopra soglia",
    "mind.credit": "Scenari illustrativi: mostrano il formato di una decisione della piattaforma (dati, pesi, confidenza, verifica). I valori sono costruiti per l'esempio, non misurati.",

    "machine.eyebrow": "02 / Come vede",
    "machine.title": "La fotocamera cattura la luce. Il modello la trasforma in una mappa.",
    "machine.lede": "A sinistra quello che arriva dal sensore. A destra la stessa scena trasformata dal modello in un valore per ogni punto, il primo passo prima di decidere dove guardare. Trascina la maniglia.",
    "machine.right": "Mappa di indice · quello che legge il modello",

    "seq.eyebrow": "03 / Il ciclo",
    "seq.title": "Un ciclo che impara da ogni sito.",
    "seq.lede": "Osservare, interpretare, decidere, automatizzare, apprendere. Ogni giro lascia il modello di quel sito un po' più preciso di prima.",

    "plat.eyebrow": "04 / La piattaforma",
    "plat.title": "Il modello, al lavoro ogni giorno.",
    "plat.lede": "Agronomi, ricercatori e gestori del verde lavorano sulla stessa piattaforma, ognuno con la vista del proprio ruolo.",
    "plat.cta": "Accedi alla piattaforma",
    "inst.credit": "Fotografie di prodotto LATTICE: <a href=\"https://www.mapir.camera\" target=\"_blank\" rel=\"noopener\">MAPIR</a>. Fotografie Ecomotica: Plantiverse.",
    "footer.img": "Le fotografie documentano hardware, siti e lavoro sul campo di Plantiverse. Le fotografie di prodotto LATTICE sono di <a href=\"https://www.mapir.camera\" target=\"_blank\" rel=\"noopener\">MAPIR</a>.",
    "plat.ennous": "Il ragionamento di Plantiverse nasce con ENNOUS, il motore di intelligenza artificiale sviluppato dallo stesso team. Le piante sono il settore dove è nato e dove è stato messo alla prova per primo.",
    "explore.eyebrow": "Esplora",
    "explore.title": "Il cervello di Plantiverse, in una sola mappa.",
    "explore.line": "8.000 specie, fitorimedio da 605 pubblicazioni, 97 indici di vegetazione, piattaforma, siti, brevetti, eventi e collaborazioni. Scegli un punto: in giallo tutto ciò che è collegato.",
    "explore.go": "Apri Esplora",

    "data.eyebrow": "05 / I dati",
    "data.title": "Il modello impara da siti veri.",
    "data.lede": "Un modello vale quanto i dati da cui impara. I nostri vengono da siti veri: ogni sessione è abbinata al report dell'agronomo che ha visto la stessa pianta, ed è questo abbinamento che insegna al modello.",
    "data.sub": "Tre distanze alimentano lo stesso archivio. Un satellite conosce la regione e ignora la pianta, un sensore sulla pianta sa tutto di lei e niente della valle. Il modello le unisce e tiene visibile la differenza.",

    "fields.eyebrow": "06 / Campi",
    "fields.title": "Dove il modello impara già.",
    "fields.lede": "Sette siti, quattro in funzione. Ogni sito insegna al modello un modo diverso di sbagliare una lettura, ed è esattamente il punto.",

    "flora.eyebrow": "07 / Flora",

    "inst.eyebrow": "08 / Sensori",
    "inst.title": "I sensori sono gli occhi. Noi forniamo il cervello.",
    "inst.lede": "Il modello lavora con camere multispettrali, con le nostre stazioni Ecomotica e con i satelliti pubblici. Il sensore cambia da un sito all'altro, il modello che lo legge resta lo stesso.",

    "rec.eyebrow": "09 / Il registro",
    "rec.lede": "Fatti societari, brevetti, partner, dati e la misura onesta dei modelli: quanto aggiungono rispetto alla previsione più semplice.",
    "team.eyebrow": "10 / Team",
    "team.lede": "Cinque fondatori. Fisica, data science, geologia, design e software, in una squadra piccola che lavora su siti veri.",
    "contact.eyebrow": "11 / Contatti",

    "footer.privacy": "Privacy",
    "footer.title": "Le piante dicono già di cosa hanno bisogno. La nostra intelligenza artificiale le ascolta."
  });

  /* --- 17/10: our own satellite scene, an illustrated drone, credits ------ */
  N.horizons = N.horizons.map((h) =>
    h.id === "space" ? Object.assign({}, h, { img: "assets/nova/horizon-sentinel2.webp" }) :
    h.id === "territory" ? Object.assign({}, h, { img: "assets/nova/horizon-drone-illustrazione.webp" }) : h);
  N.i18n.en["data.credit"] = "Satellite image: Copernicus Sentinel-2. Drone image: illustration by Plantiverse. Plant photograph: our own hardware, real site.";
  N.i18n.it["data.credit"] = "Immagine satellitare: Copernicus Sentinel-2. Immagine drone: illustrazione Plantiverse. Fotografia della pianta: il nostro hardware, sito reale.";

  /* --- the Doha garden opens one of its species ------------------------- */
  N.pilots = N.pilots.map((p) => p.id !== "doha" ? p : Object.assign({}, p, {
    demo: "plant",
    en: Object.assign({}, p.en, { place: "Expo 2023 Doha", note: "" }),
    it: Object.assign({}, p.it, { place: "Expo 2023 Doha", note: "" })
  }));

  N.plant = {
    sci: "Catharanthus roseus", img: "assets/nova/doha-catharanthus.webp",
    en: {
      open: "Inside one plant of the garden", common: "Madagascar periwinkle", where: "Exhibition garden · Expo 2023 Doha",
      intro: "One species of the garden, opened up: what the sensors read, how the system waters only when the plant asks, and what this plant can take out of the soil.",
      close: "Close",
      t1: "What the sensors read", t1note: "Fourteen days, one reading per hour. Illustrative series, not a Doha measurement.",
      ind: [
        ["NIR / red", "vigour of the canopy"], ["Leaf minus air", "°C, rises when the plant is short of water"],
        ["Soil moisture", "% of volume, at the roots"], ["Cover", "% of the bed under leaves"]
      ],
      t2: "Plant-driven", t2lede: "Watering by the calendar or by the plant. Same bed, same heat, two rules. Switch between them.",
      modes: ["Calendar", "Plant-driven"],
      modeLine: [
        "Every morning at six, the same dose, whether the plant needs it or not.",
        "Water arrives only when the plant's own signal crosses the threshold, and only as much as it needs."
      ],
      legend: ["Soil moisture", "Plant stress signal", "Threshold", "Irrigation command"],
      kpi: ["water used", "hours over the stress threshold", "commands"],
      t2note: "Simulation on illustrative data: it shows the rule, not a result measured in Doha.",
      t3: "Phytoremediation", t3lede: "Plants also clean. This species accumulates heavy metals from the soil, so the system can choose it for where the soil needs it, and then measure whether it holds up.",
      metals: [
        ["Lead (Pb)", "183.33", "mg/kg accumulated"], ["Nickel (Ni)", "59.87", "mg/kg accumulated"], ["Chromium (Cr)", "38%", "removal efficiency"]
      ],
      t3note: "Literature values from the Plantiverse phytoremediation database, not measured in Doha.",
      src: "Sources", day: "day", heat: "heat wave"
    },
    it: {
      open: "Dentro una pianta del giardino", common: "Pervinca del Madagascar", where: "Giardino espositivo · Expo 2023 Doha",
      intro: "Una specie del giardino, aperta: cosa leggono i sensori, come il sistema irriga solo quando la pianta lo chiede, e cosa questa pianta sa togliere dal suolo.",
      close: "Chiudi",
      t1: "Cosa leggono i sensori", t1note: "Quattordici giorni, una lettura all'ora. Serie illustrative, non una misura di Doha.",
      ind: [
        ["NIR / rosso", "vigore della chioma"], ["Foglia meno aria", "°C, sale quando alla pianta manca acqua"],
        ["Umidità del suolo", "% di volume, alle radici"], ["Copertura", "% dell'aiuola sotto le foglie"]
      ],
      t2: "Plant-driven", t2lede: "Irrigare secondo il calendario o secondo la pianta. Stessa aiuola, stesso caldo, due regole. Passa dall'una all'altra.",
      modes: ["Calendario", "Plant-driven"],
      modeLine: [
        "Ogni mattina alle sei, la stessa dose, che la pianta ne abbia bisogno o no.",
        "L'acqua arriva solo quando il segnale della pianta supera la soglia, e solo quanta ne serve."
      ],
      legend: ["Umidità del suolo", "Segnale di stress della pianta", "Soglia", "Comando di irrigazione"],
      kpi: ["acqua usata", "ore sopra la soglia di stress", "comandi"],
      t2note: "Simulazione su dati illustrativi: mostra la regola, non un risultato misurato a Doha.",
      t3: "Fitorimedio", t3lede: "Le piante puliscono anche. Questa specie accumula metalli pesanti dal suolo, così il sistema può sceglierla dove il terreno ne ha bisogno, e poi misurare se regge.",
      metals: [
        ["Piombo (Pb)", "183,33", "mg/kg accumulati"], ["Nichel (Ni)", "59,87", "mg/kg accumulati"], ["Cromo (Cr)", "38%", "efficienza di rimozione"]
      ],
      t3note: "Valori di letteratura dal database di fitorimedio Plantiverse, non misurati a Doha.",
      src: "Fonti", day: "giorno", heat: "ondata di caldo"
    },
    sources: [
      "Subhashini, V., & Swamy, A. V. V. S. (2013). Phytoremediation of Pb and Ni contaminated soils using Catharanthus roseus (L.). Universal Journal of Environmental Research & Technology, 3(4).",
      "Ahmad, R., & Misra, N. (2014). Evaluation of phytoremediation potential of Catharanthus roseus with respect to chromium contamination. American Journal of Plant Sciences."
    ]
  };
})();
