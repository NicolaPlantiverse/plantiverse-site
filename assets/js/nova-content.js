/* =========================================================================
   Plantiverse — nova: content layer
   Plain script, no fetch, so the page also runs opened straight from disk.
   Every figure carries its source and its state. Nothing here is decorative.
   ========================================================================= */

window.NOVA = (function () {
  "use strict";

  /* --- the four steps of the sequence ---------------------------------- */
  const steps = [
    {
      id: "observe", num: "01",
      en: { name: "Observe", line: "Three sensing families that fail in different ways, so the blind spot of one is covered by another.", meta: "multispectral · hyperspectral · bioelectric" },
      it: { name: "Osservare", line: "Tre famiglie di sensing che sbagliano in modi diversi, così il punto cieco di una è coperto da un'altra.", meta: "multispettrale · iperspettrale · bioelettrico" }
    },
    {
      id: "interpret", num: "02",
      en: { name: "Interpret", line: "Species, stage and site history decide whether a change is ordinary or worth a visit.", meta: "context before conclusion" },
      it: { name: "Interpretare", line: "Specie, stadio e storia del sito decidono se una variazione è ordinaria o merita una visita.", meta: "prima il contesto, poi la conclusione" }
    },
    {
      id: "decide", num: "03",
      en: { name: "Decide", line: "One next move, with its confidence, its date and the check that would prove it wrong.", meta: "evidence attached, always" },
      it: { name: "Decidere", line: "Una mossa successiva, con la sua confidenza, la sua data e la verifica che la smentirebbe.", meta: "evidenza allegata, sempre" }
    },
    {
      id: "learn", num: "04",
      en: { name: "Learn", line: "The measured response returns to the archive and the baseline for that site is updated.", meta: "the record grows with the site" },
      it: { name: "Apprendere", line: "La risposta misurata torna in archivio e la linea di base di quel sito viene aggiornata.", meta: "il registro cresce con il sito" }
    }
  ];

  /* --- where the data comes from --------------------------------------- */
  const horizons = [
    {
      id: "space", img: "assets/nova/horizon-satellite.webp",
      en: { name: "Satellites", line: "Public European satellites give the wide context: moisture, structure, atmosphere.", scale: "10 m to 31 km · days" },
      it: { name: "Satelliti", line: "I satelliti pubblici europei danno il contesto ampio: umidità, struttura, atmosfera.", scale: "da 10 m a 31 km · giorni" }
    },
    {
      id: "territory", img: "assets/nova/horizon-drone.webp",
      en: { name: "Drones", line: "An aerial layer between the satellite and the ground. Route, sensor and cadence are still being scoped.", scale: "in scoping" },
      it: { name: "Droni", line: "Uno strato aereo fra il satellite e il terreno. Rotta, sensore e frequenza sono ancora in fase di valutazione.", scale: "in valutazione" }
    },
    {
      id: "field", img: "assets/nova/horizon-plant.webp",
      en: { name: "Plant", line: "Our own cameras and ground sensors, on your site, looking at the plant that matters.", scale: "centimetres · minutes" },
      it: { name: "Pianta", line: "Le nostre telecamere e i sensori a terra, sul tuo sito, puntati sulla pianta che conta.", scale: "centimetri · minuti" }
    }
  ];

  /* Public data services the platform reads. Status is stated as it is:
     open means no account needed, account means a free registration. */
  const feeds = [
    { name: "Sentinel-1 GRD", agency: "ESA · Copernicus", state: "open", res: "10 m", rev: "6 giorni|6 days",
      en: "C band radar. Sees through cloud, reads moisture and structure.",
      it: "Radar in banda C. Attraversa le nuvole, legge umidità e struttura." },
    { name: "Sentinel-2 MSI", agency: "ESA · Copernicus", state: "open", res: "10-60 m", rev: "5 giorni|5 days",
      en: "Thirteen band optical multispectral, the backbone of vegetation indices.",
      it: "Multispettrale ottico a tredici bande, la spina dorsale degli indici di vegetazione." },
    { name: "Sentinel-5P", agency: "ESA · Copernicus", state: "open", res: "3,5 × 5,5 km", rev: "giornaliero|daily",
      en: "Atmospheric composition. What the plant breathes above the site.",
      it: "Composizione atmosferica. Quello che la pianta respira sopra il sito." },
    { name: "ICON-2I", agency: "ItaliaMeteo · ARPAE", state: "open", res: "2,2 km", rev: "orario|hourly",
      en: "High resolution Italian short range forecast.",
      it: "Previsione italiana ad alta risoluzione, corto raggio." },
    { name: "ECMWF IFS", agency: "ECMWF", state: "open", res: "9 km", rev: "orario|hourly",
      en: "European forecast backbone, wider horizon.",
      it: "Ossatura previsionale europea, orizzonte più ampio." },
    { name: "CAMS", agency: "EEA · Copernicus", state: "open", res: "sito + stazione|site + station", rev: "orario|hourly",
      en: "Pollutant concentration at the site and at the nearest reference station.",
      it: "Concentrazione di inquinanti sul sito e alla stazione di riferimento più vicina." },
    { name: "SoilGrids", agency: "ISRIC", state: "open", res: "250 m", rev: "statico|static",
      en: "Soil baseline where no local survey exists.",
      it: "Linea di base del suolo dove non esiste un rilievo locale." },
    { name: "ERA5", agency: "Copernicus C3S", state: "account", res: "31 km", rev: "archivio|archive",
      en: "Reanalysis archive. Needs a free account, and this is said plainly.",
      it: "Archivio di rianalisi. Richiede un account gratuito, e lo diciamo." }
  ];

  /* --- the instruments -------------------------------------------------- */
  const instruments = [
    {
      id: "lattice", img: "assets/nova/lattice-l4.webp", cls: "cut",
      en: {
        name: "LATTICE array", maker: "MAPIR", state: "In service",
        line: "One to four camera modules in a single housing. Each module carries its own narrow band filter, so the bands are captured together instead of one after the other.",
        specs: [["Modules", "1, 2, 3 or 4"], ["Sensor", "3.2 MP per module"], ["Field", "87° or 41°"], ["Filters", "RGB, RGN, OCN, NGB, narrow band 385 to 850 nm"]]
      },
      it: {
        name: "Array LATTICE", maker: "MAPIR", state: "In esercizio",
        line: "Da uno a quattro moduli camera in un solo corpo. Ogni modulo porta il proprio filtro a banda stretta, così le bande si acquisiscono insieme invece che una dopo l'altra.",
        specs: [["Moduli", "1, 2, 3 o 4"], ["Sensore", "3,2 MP per modulo"], ["Campo", "87° o 41°"], ["Filtri", "RGB, RGN, OCN, NGB, banda stretta da 385 a 850 nm"]]
      }
    },
    {
      id: "eco22", img: "assets/img/photo-active-head-640.webp", cls: "photo", patented: true,
      en: {
        name: "Ecomotica 2.2", maker: "Plantiverse", state: "In validation",
        line: "The active platform. Controlled illumination lets observation continue when daylight stops, which is when several plant responses are easiest to separate.",
        specs: [["Observation", "Continuous, 24 hours"], ["Illumination", "Controlled, multi band"], ["Extra channel", "Bioelectric on selected plants"], ["Use", "Vineyard, controlled environment"]]
      },
      it: {
        name: "Ecomotica 2.2", maker: "Plantiverse", state: "In validazione",
        line: "La piattaforma attiva. L'illuminazione controllata permette di osservare quando la luce naturale finisce, cioè quando diverse risposte della pianta sono più facili da separare.",
        specs: [["Osservazione", "Continua, 24 ore"], ["Illuminazione", "Controllata, multibanda"], ["Canale in più", "Bioelettrico su piante scelte"], ["Impiego", "Vigneto, ambiente controllato"]]
      }
    },
    {
      id: "eco11", img: "assets/img/ecomotica-field-640.webp", cls: "photo", patented: true,
      en: {
        name: "Ecomotica 1.1", maker: "Plantiverse", state: "In service",
        line: "The passive station. It works with the light that is already there, draws almost nothing and stays on a site that has no power and no attention.",
        specs: [["Observation", "Daylight only"], ["Power", "Solar, low duty cycle"], ["Emission", "None"], ["Use", "Roofs, gardens, open field"]]
      },
      it: {
        name: "Ecomotica 1.1", maker: "Plantiverse", state: "In esercizio",
        line: "La stazione passiva. Lavora con la luce che c'è già, consuma quasi nulla e resta su un sito che non ha corrente e non ha attenzione.",
        specs: [["Osservazione", "Solo diurna"], ["Alimentazione", "Solare, ciclo ridotto"], ["Emissione", "Nessuna"], ["Impiego", "Tetti, giardini, campo aperto"]]
      }
    }
  ];

  /* --- where the system works ------------------------------------------ */
  const pilots = [
    { id: "fao", img: "assets/nova/pilot-fao.webp", size: "wide",
      en: { name: "Rooftop garden", place: "Rome, FAO", note: "Urban vegetation under sensing, with the city as a stress factor.", state: "Active" },
      it: { name: "Giardino pensile", place: "Roma, FAO", note: "Vegetazione urbana sotto osservazione, con la città come fattore di stress.", state: "Attivo" } },
    { id: "enea", img: "assets/nova/machine-cir.webp", size: "tall",
      en: { name: "Green roof, ENEA", place: "Rome", note: "Instrumented roof under a research contract, seen here in the same false colour the system reads.", state: "Active" },
      it: { name: "Tetto verde, ENEA", place: "Roma", note: "Tetto strumentato sotto contratto di ricerca, qui nello stesso falso colore che il sistema legge.", state: "Attivo" } },
    { id: "phytotron", img: "assets/nova/pilot-phytotron.webp", size: "wide",
      en: { name: "Phytotron", place: "Sapienza University", note: "Where the climate is a decision, so one factor can be moved on purpose and the reading checked.", state: "Active" },
      it: { name: "Fitotrone", place: "Sapienza Università di Roma", note: "Dove il clima è una decisione, così un fattore si può muovere apposta e la lettura si verifica.", state: "Attivo" } },
    { id: "vineyard", img: "assets/nova/pilot-vineyard.webp", size: "tall",
      en: { name: "Vineyard", place: "Rome, ESA BIC", note: "Sensors along the rows. One question at a time: which rows need attention this week.", state: "In validation" },
      it: { name: "Vigneto", place: "Roma, ESA BIC", note: "Sensori lungo i filari. Una domanda per volta: quali filari richiedono attenzione questa settimana.", state: "In validazione" } },
    { id: "greenhouse", img: "assets/nova/pilot-greenhouse.webp", size: "tall",
      en: { name: "Research greenhouse", place: "Controlled environment", note: "Sensing poles between the rows, on a full growth cycle.", state: "Active" },
      it: { name: "Serra di ricerca", place: "Ambiente controllato", note: "Pali di rilevamento fra le file, su un ciclo di crescita intero.", state: "Attivo" } },
    { id: "agripv", img: "assets/nova/pilot-agrivoltaic.webp", size: "tall",
      en: { name: "Agrivoltaics", place: "Open field", note: "Crops under photovoltaic cover, where light is shared between two harvests.", state: "Study" },
      it: { name: "Agrivoltaico", place: "Campo aperto", note: "Colture sotto copertura fotovoltaica, dove la luce si divide fra due raccolti.", state: "Studio" } },
    { id: "doha", img: "assets/nova/pilot-doha.webp", size: "tall",
      en: { name: "Exhibition garden", place: "Doha, GROW Expo 2023", note: "The installation we designed and built for the exhibition, on stage in front of the public.", state: "Completed" },
      it: { name: "Giardino espositivo", place: "Doha, GROW Expo 2023", note: "L'allestimento che abbiamo progettato e costruito per la fiera, in scena davanti al pubblico.", state: "Conclusa" } },
    { id: "cea", img: "assets/nova/pilot-cea.webp", size: "big",
      en: { name: "CEA, every format", place: "Controlled Environment Agriculture", note: "Greenhouse, hydroponic, vertical, outdoor and indoor, under the same robotic management.", state: "Active" },
      it: { name: "CEA, ogni formato", place: "Agricoltura in ambiente controllato", note: "Serra, idroponica, verticale, outdoor e indoor, sotto la stessa gestione robotica.", state: "Attivo" } }
  ];

  /* --- the record: every line carries a source and a state -------------- */
  const record = [
    { type: "company", date: "25.09.2024",
      en: { title: "Plantiverse S.R.L. incorporated", src: "Company register, REA RM-1740259 · verified" },
      it: { title: "Costituzione di Plantiverse S.R.L.", src: "Registro imprese, REA RM-1740259 · verificato" } },
    { type: "ip", date: "2025",
      en: { title: "Bio-Driven control system, patent granted", src: "Filing and grant record · internal" },
      it: { title: "Sistema di controllo Bio-Driven, brevetto concesso", src: "Registro di deposito e concessione · interno" } },
    { type: "ip", date: "—",
      en: { title: "Five patent families, transferred from EcoBubble to Plantiverse", src: "Transfer complete · internal" },
      it: { title: "Cinque famiglie brevettuali, trasferite da EcoBubble a Plantiverse", src: "Trasferimento completato · interno" } },
    { type: "ip", date: "—",
      en: { title: "Geo-Driven, patent pending", src: "Filing record, shared within the EcoBubble group · internal" },
      it: { title: "Geo-Driven, domanda di brevetto", src: "Registro di deposito, condiviso nel gruppo EcoBubble · interno" } },
    { type: "ip", date: "—",
      en: { title: "ENNOUS, patent pending", src: "Filing record, the most recent, still open · internal" },
      it: { title: "ENNOUS, domanda di brevetto", src: "Registro di deposito, il più recente, ancora aperto · interno" } },
    { type: "partner", date: "attivo|active",
      en: { title: "ENEA research contract, green roof", src: "Contract, milestones to 2027 · verified with partner" },
      it: { title: "Contratto di ricerca ENEA, tetto verde", src: "Contratto, milestone fino al 2027 · verificato con il partner" } },
    { type: "partner", date: "attivo|active",
      en: { title: "Sapienza University and Botanical Garden of Rome", src: "Research collaboration · verified with partner" },
      it: { title: "Sapienza Università di Roma e Orto Botanico", src: "Collaborazione di ricerca · verificata con il partner" } },
    { type: "partner", date: "attivo|active",
      en: { title: "CNR, model validation", src: "Research collaboration · internal" },
      it: { title: "CNR, validazione dei modelli", src: "Collaborazione di ricerca · interno" } },
    { type: "data", date: "2026",
      en: { title: "Above 8,600 acquisition sessions and above 6,300 field reports in the record", src: "Internal archive, figure as at 2026 · internal" },
      it: { title: "Oltre 8.600 sessioni di acquisizione e oltre 6.300 report di campo nel registro", src: "Archivio interno, dato al 2026 · interno" } },
    { type: "data", date: "2026",
      en: { title: "Field accuracy: 77% irrigation, 67% pests, 65% light", src: "Open air, mid term, random forest on 104 features · internal" },
      it: { title: "Accuratezza in campo: 77% irriguo, 67% parassiti, 65% luce", src: "Aria aperta, medio termine, random forest su 104 feature · interno" } },
    { type: "data", date: "2026",
      en: { title: "Indoor greenhouse accuracy: 92% irrigation, 89% pests, 96% light", src: "Tests by interns from partner universities, not independently validated, does not transfer to open air" },
      it: { title: "Accuratezza in serra indoor: 92% irriguo, 89% parassiti, 96% luce", src: "Test di tirocinanti di università partner, non validati in modo indipendente, non trasferibili all'aria aperta" } },
    { type: "method", date: "—",
      en: { title: "No figure is published without its task, its dataset and its date", src: "Method rule · standing" },
      it: { title: "Nessun numero viene pubblicato senza compito, dataset e data", src: "Regola di metodo · permanente" } }
  ];

  /* --- who builds it ----------------------------------------------------- */
  const team = [
    { id: "nicola", img: "assets/nova/team/nn.jpg",
      en: { name: "Nicola Nescatelli", role: "Founder · Project Management", line: "Physicist. Architecture, product and the case for every claim on this page." },
      it: { name: "Nicola Nescatelli", role: "Fondatore · Project Management", line: "Fisico. Architettura, prodotto e la giustificazione di ogni numero in questa pagina." } },
    { id: "federico", img: "assets/nova/team/fd.jpg",
      en: { name: "Federico Di Vincenzo", role: "Founder · Landscape & Design", line: "Landscape and design. Turns a sensing site into a space people want to be in." },
      it: { name: "Federico Di Vincenzo", role: "Fondatore · Landscape & Design", line: "Paesaggio e design. Trasforma un sito di sensing in uno spazio che si vuole vivere." } },
    { id: "fabio", img: "assets/nova/team/fp.jpg",
      en: { name: "Fabio Pallini", role: "Founder · IT", line: "Keeps the platform running on real sites, not only in the lab." },
      it: { name: "Fabio Pallini", role: "Fondatore · IT", line: "Tiene in piedi la piattaforma sui siti veri, non solo in laboratorio." } },
    { id: "andrea", img: "assets/nova/team/ap.jpg",
      en: { name: "Andrea Procaccini", role: "Founder · Data Science", line: "PhD in physics. The models that sit behind the record, kept honest about what they do not know." },
      it: { name: "Andrea Procaccini", role: "Fondatore · Data Science", line: "Dottorato in fisica. I modelli dietro il registro, onesti su quello che non sanno." } },
    { id: "leonardo", img: "assets/nova/team/lg.jpg",
      en: { name: "Leonardo Giannini", role: "Founder · R&D", line: "PhD in geology. Sentinel-2 and Galileo, and the link between the field and the satellite." },
      it: { name: "Leonardo Giannini", role: "Fondatore · R&S", line: "Dottorato in geologia. Sentinel-2 e Galileo, e il collegamento fra il campo e il satellite." } }
  ];

  /* --- who we work with ------------------------------------------------- */
  /* --- proof strip: the same real numbers as the Record, surfaced early -- */
  const proof = [
    { en: { value: "8,600+", label: "sessions in the record" }, it: { value: "8.600+", label: "sessioni nel registro" } },
    { en: { value: "6,072", label: "species tracked" }, it: { value: "6.072", label: "specie nell'elenco" } },
    { en: { value: "7", label: "real sites" }, it: { value: "7", label: "siti reali" } }
  ];

  const partners = [
    { name: "ESA", img: "assets/nova/partner-esa.svg", en: "Business incubation", it: "Incubazione d'impresa" },
    { name: "ENEA", img: "assets/nova/partner-enea.svg", en: "Research contract", it: "Contratto di ricerca" },
    { name: "Sapienza", img: "assets/nova/partner-sapienza.png", en: "Research collaboration", it: "Collaborazione di ricerca" },
    { name: "CNR", img: "assets/nova/partner-cnr.png", en: "Model validation", it: "Validazione dei modelli" },
    { name: "FAO", img: "assets/nova/partner-fao.svg", en: "Rooftop garden", it: "Giardino pensile" },
    { name: "EUSPA", img: "assets/nova/partner-euspa.png", en: "Cassini programme", it: "Programma Cassini" }
  ];

  /* --- contact: three reasons to write ---------------------------------- */
  const intents = [
    { id: "pilot", subject: "Pilot", fields: ["organisation", "site", "message"],
      en: { name: "Start a pilot", line: "Bring a site and a question. The answer is an observation plan that says what it would measure and what it would not." },
      it: { name: "Avvia un pilota", line: "Porta un sito e una domanda. La risposta è un piano di osservazione che dice cosa misurerebbe e cosa no." } },
    { id: "research", subject: "Research or technology partnership", fields: ["organisation", "topic", "message"],
      en: { name: "Research or partnership", line: "Universities, research bodies, technology partners. Joint protocols, shared datasets, results published with the approval of everyone involved." },
      it: { name: "Ricerca o partnership", line: "Università, enti di ricerca, partner tecnologici. Protocolli congiunti, dataset condivisi, risultati pubblicati con l'approvazione di tutti." } },
    { id: "invest", subject: "Investor conversation", fields: ["organisation", "stage", "message"],
      en: { name: "Investors", line: "Materials are shared after a first conversation. Every figure arrives with its source, its date and its state." },
      it: { name: "Investitori", line: "I materiali si condividono dopo un primo confronto. Ogni numero arriva con fonte, data e stato." } }
  ];

  const labels = {
    en: { name: "Name", email: "Email", organisation: "Organisation", site: "Site type", topic: "Topic", stage: "What you would want to see first", message: "Message" },
    it: { name: "Nome", email: "Email", organisation: "Organizzazione", site: "Tipo di sito", topic: "Tema", stage: "Cosa vorresti vedere per primo", message: "Messaggio" }
  };

  /* --- interface strings ------------------------------------------------ */
  const i18n = {
    en: {
      "meta.title": "Plantiverse — plants already say what they need",
      "meta.desc": "Plantiverse builds Bio-Driven Systems: multispectral, hyperspectral and bioelectric instruments, several models kept side by side, and a record where every decision carries its evidence.",
      "nav.sequence": "Sequence", "nav.machine": "Machine view", "nav.data": "Data", "nav.instruments": "Instruments",
      "nav.fields": "Fields", "nav.flora": "Flora", "nav.record": "Record", "nav.team": "Team", "nav.contact": "Contact",
      "nav.menu": "Menu", "nav.close": "Close", "skip": "Skip to content", "lang.aria": "Language",

      "hero.eyebrow": "Bio-Driven Systems · Rome",
      "hero.title": "Plants already say<br><em>what they need.</em>",
      "hero.lede": "We learnt how to listen: instruments that read the plant, and a record that lets every decision be checked.",
      "hero.invite": "Put your own green areas or biological systems on autonomous management and maintenance.",
      "hero.cta1": "See what the machine sees",
      "hero.cta2": "Start a pilot",
      "hero.alt": "A Plantiverse sensing unit on a rooftop, with the ruins of Rome behind it",
      "hero.m1": "Founded", "hero.m1v": "2024, spinoff of EcoBubble",
      "hero.m2": "Sites", "hero.m2v": "Roof, vineyard, phytotron, greenhouse",
      "hero.m3": "Rule", "hero.m3v": "No figure without its source",
      "hero.scroll": "Scroll",

      "seq.eyebrow": "02 / The sequence",
      "seq.title": "Four steps, and none of them is hidden.",
      "seq.lede": "This is the whole method. Everything else on this page is one of these four steps done properly.",

      "machine.eyebrow": "01 / Machine view",
      "machine.title": "The same roof, seen twice.",
      "machine.lede": "On the left the camera view, in false colour, where healthy vegetation turns bright. On the right the same scene as an index map, which is what the system actually reads. Drag the handle.",
      "machine.left": "Camera view · false colour",
      "machine.right": "Index map · what the system reads",
      "machine.note": "Green roof, ENEA. Acquisition and processing by Plantiverse. The index shown is aggregated, the formula and the band weights are not published.",
      "machine.drag": "Drag",

      "data.eyebrow": "03 / Where the data comes from",
      "data.title": "Three distances, one record.",
      "data.lede": "A satellite knows the region and ignores the plant. A drone could cover the ground in between. An instrument on the plant knows everything about it and nothing about the valley. The record joins them and keeps the difference visible.",
      "data.sources": "Public services read by the platform",
      "data.open": "Open", "data.account": "Free account",
      "data.res": "Resolution", "data.rev": "Update",
      "data.honest": "Where a service needs a registration, it is written here rather than hidden.",
      "data.credit": "Satellite photograph: Copernicus Sentinel-2A, 17 January 2016, Rome and Lake Bracciano, ESA, CC BY-SA 3.0 IGO. Drone photograph: Val di Cembra, by Syrio, CC BY-SA 4.0, Wikimedia Commons. Both illustrative, near our ENEA site but not one of our own captures. Plant photograph: our own hardware, real site.",

      "inst.eyebrow": "04 / Instruments",
      "inst.title": "Hardware that can stay outside for a season.",
      "inst.lede": "Three configurations. The array captures the bands together, the passive station lives where there is no power, the active one keeps observing when the light stops.",
      "inst.maker": "Made by",
      "inst.patented": "Plantiverse Patented",
      "inst.credit": "LATTICE product photographs: MAPIR. Ecomotica photographs: Plantiverse.",

      "fields.eyebrow": "05 / Fields",
      "fields.title": "Where it already works.",
      "fields.lede": "Seven sites, four of them running. Each one is a different way for a reading to be wrong, which is the point.",
      "fields.video": "On stage at the European Union Agency for the Space Programme",

      "flora.eyebrow": "06 / Flora",
      "flora.title": "Six thousand species, and the ones we have actually observed.",
      "flora.lede": "The list the platform works on. Type a name. Species marked as observed have been through a Plantiverse acquisition, the others are in the reference list only.",
      "flora.ph": "Try aloe, vitis, lavandula",
      "flora.observed": "Observed", "flora.listed": "In the list",
      "flora.count": "species in the list",
      "flora.none": "No match. Try part of a name.",
      "flora.hint": "Showing the first 24 matches",

      "rec.eyebrow": "07 / The record",
      "rec.title": "Everything we claim, with its source.",
      "rec.lede": "Company facts, patents, partners, datasets and the two accuracy figures kept separate because the conditions are not comparable.",
      "rec.all": "All", "rec.company": "Company", "rec.ip": "Patents", "rec.partner": "Partners", "rec.data": "Data", "rec.method": "Method",
      "rec.partners": "Working with",

      "team.eyebrow": "08 / Team",
      "team.title": "The people who answer when you write.",
      "team.lede": "Five founders. Project management, landscape and design, IT, data science and R&D, in one small team that ships to real sites.",

      "contact.eyebrow": "09 / Contact",
      "contact.title": "Let's talk about your site.",
      "contact.lede": "Pick the reason that fits. We ask different questions for a pilot, a research partnership or an investor conversation, so the first reply is useful, not generic.",
      "contact.compose": "Compose the message",
      "contact.note": "This composes a message in your own mail client. Nothing is sent from this page and nothing is stored here.",
      "contact.required": "Name, email and message are needed.",
      "contact.done": "Message composed in your mail client.",
      "contact.direct": "Or write to",

      "footer.title": "Plants already say what they need. We learnt how to listen.",
      "footer.addr": "Plantiverse S.R.L. · Via Benadir 8, 00199 Rome · REA RM-1740259",
      "footer.img": "Photographs document Plantiverse hardware, sites and field work. LATTICE product photographs are by MAPIR.",
      "footer.top": "Back to top"
    },

    it: {
      "meta.title": "Plantiverse — le piante dicono già di cosa hanno bisogno",
      "meta.desc": "Plantiverse costruisce Bio-Driven Systems: strumenti multispettrali, iperspettrali e bioelettrici, più modelli tenuti affiancati, e un registro dove ogni decisione porta la sua evidenza.",
      "nav.sequence": "Sequenza", "nav.machine": "Vista macchina", "nav.data": "Dati", "nav.instruments": "Strumenti",
      "nav.fields": "Campi", "nav.flora": "Flora", "nav.record": "Registro", "nav.team": "Team", "nav.contact": "Contatti",
      "nav.menu": "Menu", "nav.close": "Chiudi", "skip": "Vai al contenuto", "lang.aria": "Lingua",

      "hero.eyebrow": "Bio-Driven Systems · Roma",
      "hero.title": "Le piante dicono già<br><em>di cosa hanno bisogno.</em>",
      "hero.lede": "Noi abbiamo imparato ad ascoltarle: gli strumenti che le leggono, e il registro che permette di verificare ogni decisione.",
      "hero.invite": "Metti le tue aree verdi o i tuoi sistemi biologici in gestione e manutenzione autonoma.",
      "hero.cta1": "Guarda cosa vede la macchina",
      "hero.cta2": "Avvia un pilota",
      "hero.alt": "Un'unità di rilevamento Plantiverse su un tetto, con le rovine di Roma alle spalle",
      "hero.m1": "Fondata", "hero.m1v": "2024, spinoff di EcoBubble",
      "hero.m2": "Siti", "hero.m2v": "Tetto, vigneto, fitotrone, serra",
      "hero.m3": "Regola", "hero.m3v": "Nessun numero senza la sua fonte",
      "hero.scroll": "Scorri",

      "seq.eyebrow": "02 / La sequenza",
      "seq.title": "Quattro passi, e nessuno è nascosto.",
      "seq.lede": "Questo è tutto il metodo. Tutto il resto di questa pagina è uno di questi quattro passi fatto per bene.",

      "machine.eyebrow": "01 / Vista macchina",
      "machine.title": "Lo stesso tetto, visto due volte.",
      "machine.lede": "A sinistra la vista della camera, in falso colore, dove la vegetazione sana si accende. A destra la stessa scena come mappa di indice, che è quello che il sistema legge davvero. Trascina la maniglia.",
      "machine.left": "Vista camera · falso colore",
      "machine.right": "Mappa di indice · quello che il sistema legge",
      "machine.note": "Tetto verde, ENEA. Acquisizione ed elaborazione Plantiverse. L'indice mostrato è aggregato: la formula e i pesi delle bande non sono pubblicati.",
      "machine.drag": "Trascina",

      "data.eyebrow": "03 / Da dove vengono i dati",
      "data.title": "Tre distanze, un registro solo.",
      "data.lede": "Un satellite conosce la regione e ignora la pianta. Un drone potrebbe coprire il terreno in mezzo. Uno strumento sulla pianta sa tutto di lei e niente della valle. Il registro le unisce e tiene visibile la differenza.",
      "data.sources": "Servizi pubblici letti dalla piattaforma",
      "data.open": "Aperto", "data.account": "Account gratuito",
      "data.res": "Risoluzione", "data.rev": "Aggiornamento",
      "data.honest": "Dove un servizio richiede una registrazione, sta scritto qui invece che nascosto.",
      "data.credit": "Fotografia satellitare: Copernicus Sentinel-2A, 17 gennaio 2016, Roma e lago di Bracciano, ESA, CC BY-SA 3.0 IGO. Fotografia drone: Val di Cembra, di Syrio, CC BY-SA 4.0, Wikimedia Commons. Entrambe illustrative, vicine al nostro sito ENEA ma non uno scatto nostro. Fotografia della pianta: il nostro hardware, sito reale.",

      "inst.eyebrow": "04 / Strumenti",
      "inst.title": "Hardware che può restare fuori una stagione.",
      "inst.lede": "Tre configurazioni. L'array cattura le bande insieme, la stazione passiva vive dove non c'è corrente, quella attiva continua a osservare quando la luce finisce.",
      "inst.maker": "Costruito da",
      "inst.patented": "Plantiverse Patented",
      "inst.credit": "Fotografie di prodotto LATTICE: MAPIR. Fotografie Ecomotica: Plantiverse.",

      "fields.eyebrow": "05 / Campi",
      "fields.title": "Dove funziona già.",
      "fields.lede": "Sette siti, quattro in funzione. Ognuno è un modo diverso di sbagliare una lettura, ed è esattamente il punto.",
      "fields.video": "Sul palco dell'Agenzia dell'Unione europea per il programma spaziale",

      "flora.eyebrow": "06 / Flora",
      "flora.title": "Seimila specie, e quelle che abbiamo osservato davvero.",
      "flora.lede": "L'elenco su cui lavora la piattaforma. Scrivi un nome. Le specie segnate come osservate sono passate da un'acquisizione Plantiverse, le altre stanno solo nell'elenco di riferimento.",
      "flora.ph": "Prova aloe, vitis, lavandula",
      "flora.observed": "Osservata", "flora.listed": "Nell'elenco",
      "flora.count": "specie nell'elenco",
      "flora.none": "Nessun risultato. Prova con una parte del nome.",
      "flora.hint": "Mostro i primi 24 risultati",

      "rec.eyebrow": "07 / Il registro",
      "rec.title": "Tutto quello che affermiamo, con la sua fonte.",
      "rec.lede": "Fatti societari, brevetti, partner, dataset e i due valori di accuratezza tenuti separati perché le condizioni non sono confrontabili.",
      "rec.all": "Tutto", "rec.company": "Società", "rec.ip": "Brevetti", "rec.partner": "Partner", "rec.data": "Dati", "rec.method": "Metodo",
      "rec.partners": "Lavoriamo con",

      "team.eyebrow": "08 / Team",
      "team.title": "Le persone che rispondono quando scrivi.",
      "team.lede": "Cinque fondatori. Project management, paesaggio e design, IT, data science e R&S, in una squadra piccola che lavora su siti veri.",

      "contact.eyebrow": "09 / Contatti",
      "contact.title": "Parliamo del tuo sito.",
      "contact.lede": "Scegli il motivo giusto. Facciamo domande diverse per un pilota, una partnership di ricerca o un confronto con investitori, così la prima risposta è utile, non generica.",
      "contact.compose": "Componi il messaggio",
      "contact.note": "Questo compone un messaggio nel tuo programma di posta. Da questa pagina non viene inviato né conservato nulla.",
      "contact.required": "Servono nome, email e messaggio.",
      "contact.done": "Messaggio composto nel tuo programma di posta.",
      "contact.direct": "Oppure scrivi a",

      "footer.title": "Le piante dicono già di cosa hanno bisogno. Noi abbiamo imparato ad ascoltarle.",
      "footer.addr": "Plantiverse S.R.L. · Via Benadir 8, 00199 Roma · REA RM-1740259",
      "footer.img": "Le fotografie documentano hardware, siti e lavoro sul campo di Plantiverse. Le fotografie di prodotto LATTICE sono di MAPIR.",
      "footer.top": "Torna su"
    }
  };

  return { steps, horizons, feeds, instruments, pilots, record, team, proof, partners, intents, labels, i18n };
})();
