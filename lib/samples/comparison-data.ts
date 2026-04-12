export interface FieldSet {
  descriptiveName: string;
  altText: string;
  metaDescription: string;
  keywords: string[];
  title: string;
  locationName: string;
  city: string;
  stateProvince: string;
  country: string;
}

export interface ComparisonSample {
  id: string;
  imagePath: string;
  photographer: string;
  photographerUrl: string;
  free: FieldSet;
  premium: FieldSet;
}

export const COMPARISON_SAMPLES: ComparisonSample[] = [
  {
    id: "cafe-exterior",
    imagePath: "/samples/1-cafe-exterior.jpg",
    photographer: "JIWON KANG",
    photographerUrl: "https://unsplash.com/@jiwon_kang",
    free: {
      descriptiveName: "kafe-utside-med-planter",
      altText: "En kafé med glassdører og benk utenfor, omgitt av planter i potter.",
      metaDescription: "En koselig kafé med utendørs benk og planter. Innredet med varme lys og en innbydende atmosfære. Perfekt for en kopp kaffe.",
      keywords: ["kafe", "utendørs", "planter", "benk", "inngang", "koselig", "kaffe"],
      title: "Koselig kafé med utendørs benk og planter utenfor inngangen",
      locationName: "",
      city: "",
      stateProvince: "",
      country: "",
    },
    premium: {
      descriptiveName: "paz-kafé-inngang-fasade",
      altText: "Fasaden til kafeen Paz med trekadrert glassdør, varmt interiørlys og planter utenfor.",
      metaDescription: "Inngangspartiet til kafeen Paz med elegant trefasade, store vinduer og varmt lys innenfra. Sjarmerende kafémiljø med planter og benk utenfor.",
      keywords: ["kafé", "fasade", "inngangsparti", "restaurant", "trebetjenste vinduer", "atmosfære", "belysning", "uteservering", "butikkfront", "designkafé"],
      title: "Innbydende fasade til kafeen Paz med varmt lys og trebetjenste vinduer",
      locationName: "",
      city: "",
      stateProvince: "",
      country: "",
    },
  },
  {
    id: "pottery-craftsman",
    imagePath: "/samples/2-pottery-craftsman.jpg",
    photographer: "Alex Jones",
    photographerUrl: "https://unsplash.com/@alexjones",
    free: {
      descriptiveName: "hender-former-leire",
      altText: "Hender som arbeider med leire på et trebord.",
      metaDescription: "Hender former leire på et bord. Bildet viser en nærbilde av hender som arbeider med leire, muligens i en kunst- eller keramikkverksted.",
      keywords: ["leire", "hender", "keramikk", "kunst", "håndverk", "potte"],
      title: "Hender som former en klump leire på et bord",
      locationName: "",
      city: "",
      stateProvince: "",
      country: "",
    },
    premium: {
      descriptiveName: "hender-former-leire-keramikk",
      altText: "To leiregrisete hender former en klump grå leire på et trebord i et keramikkverksted.",
      metaDescription: "Nærbilde av to hender som former rå leire på et trebord i et keramikkverksted. Bildet viser keramikkprosessen og egner seg til bruk i kunst- og håndverkssammenheng.",
      keywords: ["keramikk", "leire", "håndverk", "forming", "pottemaker", "verksted", "kunsthåndverk", "leirearbeid"],
      title: "Hendene former leire på keramikkverksted \u2013 kunsthåndverk i prosess",
      locationName: "",
      city: "",
      stateProvince: "",
      country: "",
    },
  },
  {
    id: "restaurant-shared-plates",
    imagePath: "/samples/3-restaurant-shared-plates.jpg",
    photographer: "Thomas Park",
    photographerUrl: "https://unsplash.com/@thomascpark",
    free: {
      descriptiveName: "grillet-kylling-grønnsaker",
      altText: "Tallerken med grillet kylling og grønnsaker, omgitt av taco-tilbehør.",
      metaDescription: "Bilde av en tallerken med grillet kylling og grønnsaker, sammen med forskjellige tilbehør til taco. Inkluderer lime, ost og sauser.",
      keywords: ["grillet", "kylling", "grønnsaker", "taco", "mat", "tilbehør", "lime", "ost"],
      title: "Grillet kylling med grønnsaker og tilbehør til taco",
      locationName: "",
      city: "",
      stateProvince: "",
      country: "",
    },
    premium: {
      descriptiveName: "kylling-fajitas-middag-bord",
      altText: "Fugleperspektiv av kyllingfajitas med grillet paprika, tortillalefser, revet ost og limebåter på trebord.",
      metaDescription: "Hjemmelaget kyllingfajitas servert med grillet paprika og løk, tortillalefser, revet ost, limebåter og chilisaus på et trebord.",
      keywords: ["kyllingfajitas", "tortillalefser", "meksikansk mat", "grillet kylling", "paprika", "revet ost", "limebåter", "chilisaus", "middag", "tex-mex"],
      title: "Hjemmelaget kyllingfajitas med tortillas, ost og lime",
      locationName: "",
      city: "",
      stateProvince: "",
      country: "",
    },
  },
  {
    id: "event-table-flowers",
    imagePath: "/samples/4-event-table-flowers.jpg",
    photographer: "Clay Banks",
    photographerUrl: "https://unsplash.com/@claybanks",
    free: {
      descriptiveName: "utendørs-spisebord-dekket",
      altText: "Et rustikt utendørs bord med hvite tallerkener, bestikk og kluter.",
      metaDescription: "Et rustikt utendørs spisebord med hvite tallerkener, bestikk og kluter. Perfekt for en koselig middag i hagen.",
      keywords: ["spisebord", "utendørs", "servise", "bestikk", "middag", "hage"],
      title: "Utendørs spisebord dekket med servise og bestikk",
      locationName: "",
      city: "",
      stateProvince: "",
      country: "",
    },
    premium: {
      descriptiveName: "utendørs-dekket-bord-terrasse",
      altText: "Dekket trebord med hvite tallerkener, blå servietter og rotinstoler på en natursteinsterrasse.",
      metaDescription: "Rustikt utendørs spisebord i tre dekket med hvite keramikktallerkener og linservietter på en natursteinsterrasse med rotinstoler og lilla blomster.",
      keywords: ["uteplass", "trebord", "borddekning", "rotinstol", "naturstein", "terrasse", "keramikk", "serviett", "utemøbler", "hageinnredning"],
      title: "Rustikt trebord dekket til middag på solrik uteplass",
      locationName: "",
      city: "",
      stateProvince: "",
      country: "",
    },
  },
  {
    id: "ceramic-mugs-shelf",
    imagePath: "/samples/5-ceramic-mugs-shelf.jpg",
    photographer: "Eric Prouzet",
    photographerUrl: "https://unsplash.com/@eprouzet",
    free: {
      descriptiveName: "keramiske-kope-hylle",
      altText: "Forskjellige keramiske kopper arrangert på en hylle.",
      metaDescription: "En samling av unike keramiske kopper på en hylle. Hver kopp har sitt eget design og farge, perfekt for samlere og kaffelskere.",
      keywords: ["keramikk", "kopper", "hylle", "kaffe", "design", "håndlagde", "samling"],
      title: "Keramiske kopper på en hylle",
      locationName: "",
      city: "",
      stateProvince: "",
      country: "",
    },
    premium: {
      descriptiveName: "keramikkkopper-utstilt-hylle",
      altText: "Samling av unike håndlagde keramikkkopper i ulike farger og mønstre, utstilt i mørke trehyller.",
      metaDescription: "Håndlagde keramikkkopper i en rekke farger og mønstre utstilt i mørke kvadratiske hyller. Perfekt for keramikkentusiaster og kunsthåndverk.",
      keywords: ["keramikk", "kopper", "håndverk", "potter", "stentøy", "kunsthåndverk", "hylle", "glasur", "leire"],
      title: "Håndlagde keramikkkopper utstilt i mørke kvadratiske hyller",
      locationName: "",
      city: "",
      stateProvince: "",
      country: "",
    },
  },
  {
    id: "team-laptop",
    imagePath: "/samples/6-team-laptop.jpg",
    photographer: "Vitaly Gariev",
    photographerUrl: "https://unsplash.com/@silverkblack",
    free: {
      descriptiveName: "kontorarbeid-gruppe-diskusjon",
      altText: "Tre personer som diskuterer og jobber på en bærbar datamaskin.",
      metaDescription: "En gruppe kollegaer som samarbeider på et kontor. De diskuterer og jobber sammen på en bærbar datamaskin.",
      keywords: ["kontor", "arbeid", "samarbeid", "kollegaer", "diskusjon", "datamaskin"],
      title: "Kollegaer som jobber sammen på et kontor",
      locationName: "",
      city: "",
      stateProvince: "",
      country: "",
    },
    premium: {
      descriptiveName: "kolleger-samarbeider-kontor-laptop",
      altText: "Tre kolleger studerer en laptopskjerm sammen ved et kontorpult i et åpent kontorlandskap.",
      metaDescription: "Tre kolleger samarbeider rundt en laptop i et moderne kontorlandskap. Bildet egner seg til temaer som teamarbeid, kontormiljø og profesjonelt samarbeid.",
      keywords: ["samarbeid", "kontorlandskap", "teamarbeid", "kolleger", "laptop", "arbeidsplass", "møte", "forretning"],
      title: "Tre kolleger samarbeider intenst rundt en laptop på moderne kontor",
      locationName: "",
      city: "",
      stateProvince: "",
      country: "",
    },
  },
];

export const FREE_FIELDS: (keyof FieldSet)[] = [
  "descriptiveName",
  "altText",
  "metaDescription",
  "keywords",
];

export const PREMIUM_ONLY_FIELDS: (keyof FieldSet)[] = [
  "title",
  "locationName",
  "city",
  "stateProvince",
  "country",
];
