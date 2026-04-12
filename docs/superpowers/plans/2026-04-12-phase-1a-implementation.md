# Phase 1A: Free-Tier Simplification & Comparison Gallery — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplify the free tier to 4 output fields + 2 settings, reduce languages to Norwegian/English, and add an inline comparison gallery showing pre-baked Mistral vs Claude outputs with locked premium fields.

**Architecture:** Static comparison data committed as TypeScript constants — zero runtime API calls. Gallery embedded in the existing hero section. Premium fields hidden behind an `isPremiumUser` prop (defaults to `false`) threaded from `page.tsx` through child components.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, TypeScript 5

**Note on testing:** This project has no test framework set up. Steps use `npm run build` for type-checking and manual visual verification via `npm run dev` instead of unit tests. Adding a test framework would be scope creep for Phase 1A.

---

### Task 1: Language reduction

**Files:**
- Modify: `lib/i18n.ts`
- Modify: `lib/vision/prompt.ts`

- [ ] **Step 1: Reduce i18n.ts to 2 languages**

Replace the entire contents of `lib/i18n.ts` — remove the `de`, `es`, and `ko` entries from the `Language` type, `LANGUAGES` array, and `translations` record. Keep only `en` and `no`.

```typescript
export type Language = "en" | "no";

export const LANGUAGES: { code: Language; name: string; gradient: string }[] = [
  { code: "en", name: "English", gradient: "linear-gradient(135deg, #012169 0%, #C8102E 50%, #012169 100%)" },
  { code: "no", name: "Norsk", gradient: "linear-gradient(135deg, #EF2B2D 0%, #002868 50%, #EF2B2D 100%)" },
];

const translations: Record<Language, Record<string, string>> = {
  en: {
    settings: "Settings",
    apiOk: "You're all set",
    apiError: "Please contact dennis.hoel@proton.me to configure API key",
    sourceFolder: "Source Folder",
    destFolder: "Destination Folder",
    browse: "Browse",
    prefix: "Prefix",
    suffix: "Suffix",
    separator: "Separator",
    scanning: "Scanning...",
    scanSource: "Scan Source Folder",
    processing: "Processing...",
    processAll: "Process All",
    exportAllProcessed: "Export All Processed",
    noImages: "No images loaded yet.",
    noImagesSub: "Upload images using the drop zone above.",
    imagesFound: "images found",
    imageFound: "image found",
    dropImages: "Drop images here",
    dropSub: "or use the source folder scan",
    dropSubBrowser: "Click to browse or drag and drop images",
    imagesLoaded: "images loaded",
    maxFilesReached: "Maximum 10 images reached. Remove some to add more.",
    imageDetails: "Image Details",
    original: "Original",
    new: "New",
    analyzeAi: "Analyze with AI",
    analyzing: "Analyzing...",
    descriptiveName: "Descriptive Name",
    altText: "Alt Text",
    metaDescription: "Meta Description",
    keywords: "Keywords (comma-separated)",
    mdPreview: ".md Preview",
    exported: "Exported",
    exportImage: "Export Image",
    pending: "pending",
    done: "Ready to export",
    error: "error",
    loading: "Loading...",
    noSubfolders: "No subfolders",
    cancel: "Cancel",
    selectFolder: "Select This Folder",
    language: "Language",
    selectSource: "Select Source Folder",
    selectDest: "Select Destination Folder",
    remove: "Remove",
    reset: "Reset",
    title: "Title",
    description: "Description",
    location: "Location",
    locationName: "Location Name",
    city: "City",
    stateProvince: "State/Province",
    country: "Country",
    copyright: "Copyright",
    creator: "Creator",
    dateCreated: "Date Created",
    webRights: "Web Statement of Rights",
    // Gallery chrome
    galleryHeading: "Free vs Premium — see the difference",
    galleryFree: "Free",
    galleryPremium: "Premium",
    galleryLockTooltip: "Available with Premium",
    galleryUpgrade: "Upgrade to Premium",
    galleryNotify: "Get notified when Premium launches",
    galleryFileName: "File Name",
  },
  no: {
    settings: "Innstillinger",
    apiOk: "Alt er klart",
    apiError: "Kontakt dennis.hoel@proton.me for å konfigurere API-nøkkel",
    sourceFolder: "Kildemappe",
    destFolder: "Målmappe",
    browse: "Bla",
    prefix: "Prefiks",
    suffix: "Suffiks",
    separator: "Skilletegn",
    scanning: "Skanner...",
    scanSource: "Skann kildemappe",
    processing: "Behandler...",
    processAll: "Behandle alle",
    exportAllProcessed: "Eksporter alle behandlede",
    noImages: "Ingen bilder lastet inn.",
    noImagesSub: "Last opp bilder med slippfeltet ovenfor.",
    imagesFound: "bilder funnet",
    imageFound: "bilde funnet",
    dropImages: "Slipp bilder her",
    dropSub: "eller bruk kildemappe-skanning",
    dropSubBrowser: "Klikk for å bla eller dra og slipp bilder",
    imagesLoaded: "bilder lastet inn",
    maxFilesReached: "Maksimalt 10 bilder nådd. Fjern noen for å legge til flere.",
    imageDetails: "Bildedetaljer",
    original: "Original",
    new: "Ny",
    analyzeAi: "Analyser med AI",
    analyzing: "Analyserer...",
    descriptiveName: "Beskrivende navn",
    altText: "Alt-tekst",
    metaDescription: "Metabeskrivelse",
    keywords: "Nøkkelord (kommaseparert)",
    mdPreview: ".md Forhåndsvisning",
    exported: "Eksportert",
    exportImage: "Eksporter bilde",
    pending: "venter",
    done: "Klar til eksport",
    error: "feil",
    loading: "Laster...",
    noSubfolders: "Ingen undermapper",
    cancel: "Avbryt",
    selectFolder: "Velg denne mappen",
    language: "Språk",
    selectSource: "Velg kildemappe",
    selectDest: "Velg målmappe",
    remove: "Fjern",
    reset: "Tilbakestill",
    title: "Tittel",
    description: "Beskrivelse",
    location: "Sted",
    locationName: "Stedsnavn",
    city: "By",
    stateProvince: "Fylke",
    country: "Land",
    copyright: "Opphavsrett",
    creator: "Opphavsperson",
    dateCreated: "Opprettelsesdato",
    webRights: "Rettighetsside",
    // Gallery chrome
    galleryHeading: "Gratis vs Premium — se forskjellen",
    galleryFree: "Gratis",
    galleryPremium: "Premium",
    galleryLockTooltip: "Tilgjengelig med Premium",
    galleryUpgrade: "Oppgrader til Premium",
    galleryNotify: "Få beskjed når Premium lanseres",
    galleryFileName: "Filnavn",
  },
};

export function t(key: string, lang: Language): string {
  return translations[lang]?.[key] ?? translations.en[key] ?? key;
}
```

- [ ] **Step 2: Reduce LANGUAGE_NAMES in prompt.ts**

In `lib/vision/prompt.ts`, replace the `LANGUAGE_NAMES` record:

```typescript
// Replace this:
const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  no: "Norwegian (Bokmål)",
  de: "German",
  es: "Spanish",
  ko: "Korean",
};

// With this:
const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  no: "Norwegian (Bokmål)",
};
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Compiles successfully. Any file importing the old `Language` type with `"de" | "es" | "ko"` will now fail — fix any type errors that surface.

- [ ] **Step 4: Commit**

```bash
git add lib/i18n.ts lib/vision/prompt.ts
git commit -m "feat: reduce languages to Norwegian and English only

Remove German, Spanish, and Korean. Add gallery comparison i18n keys
for the upcoming ComparisonGallery component."
```

---

### Task 2: isPremiumUser prop + free-tier UI reduction

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/settings-panel.tsx`
- Modify: `components/image-detail.tsx`
- Modify: `lib/export.ts`

- [ ] **Step 1: Thread isPremiumUser from page.tsx**

In `app/page.tsx`, add a state variable and pass it to child components. At the top of the `Home` function (after existing state declarations around line 107):

```typescript
// After: const [mobileTab, setMobileTab] = useState<...>("grid");
// Add:
const isPremiumUser = false; // Phase 1B: read from Clerk user.plan
```

Pass `isPremiumUser` to `<SettingsPanel>` (around line 393):

```tsx
<SettingsPanel
  settings={settings}
  onSettingsChange={setSettings}
  onProcessAll={handleProcessAll}
  onExportAll={handleExportAll}
  onExportCsv={handleExportCsv}
  onReset={handleReset}
  isProcessing={isProcessing}
  processProgress={processProgress}
  imageCount={images.length}
  processedCount={processedCount}
  apiKeyConfigured={apiKeyConfigured}
  isPremiumUser={isPremiumUser}
/>
```

Pass `isPremiumUser` to `<ImageDetail>` (around line 427):

```tsx
<ImageDetail
  image={selectedImage}
  prefix={settings.prefix}
  suffix={settings.suffix}
  separator={settings.separator}
  copyright={settings.copyright}
  creator={settings.creator}
  rightsUrl={settings.rightsUrl}
  onUpdateAnalysis={handleUpdateAnalysis}
  onProcess={handleProcessSingle}
  onExport={() => handleExportAll()}
  onClose={() => { setSelectedId(null); setMobileTab("grid"); }}
  isProcessing={isProcessing}
  language={settings.language}
  isPremiumUser={isPremiumUser}
/>
```

Pass `isPremiumUser` to the export functions. Update `handleExportAll` (around line 242):

```typescript
const handleExportAll = useCallback(async () => {
  const s = settingsRef.current;
  const processed = imagesRef.current.filter(
    (img) => img.status === "done" && img.analysis
  );
  if (processed.length === 0) return;

  await exportAsZip(processed, {
    prefix: s.prefix,
    suffix: s.suffix,
    separator: s.separator,
    copyright: s.copyright,
    creator: s.creator,
    rightsUrl: s.rightsUrl,
    isPremiumUser,
  });
  // ... rest unchanged
```

Update `handleExportCsv` similarly (around line 267):

```typescript
const handleExportCsv = useCallback(() => {
  const s = settingsRef.current;
  const processed = imagesRef.current.filter(
    (img) => img.status === "done" && img.analysis
  );
  if (processed.length === 0) return;

  exportAsCsv(processed, {
    prefix: s.prefix,
    suffix: s.suffix,
    separator: s.separator,
    copyright: s.copyright,
    creator: s.creator,
    rightsUrl: s.rightsUrl,
    isPremiumUser,
  });
}, [isPremiumUser]);
```

- [ ] **Step 2: Update SettingsPanel to hide premium fields**

In `components/settings-panel.tsx`, add `isPremiumUser` to the props interface (line 17):

```typescript
interface SettingsPanelProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onProcessAll: () => void;
  onExportAll: () => void;
  onExportCsv: () => void;
  onReset: () => void;
  isProcessing: boolean;
  processProgress: { current: number; total: number };
  imageCount: number;
  processedCount: number;
  apiKeyConfigured: boolean;
  isPremiumUser: boolean;
}
```

Add `isPremiumUser` to the destructured props (line 32):

```typescript
}: SettingsPanelProps) {
```

Wrap the suffix input in a conditional. In the naming `<details>` section (around line 113), replace the grid with:

```tsx
<div className="mt-3 flex flex-col gap-3">
  <div className={`grid ${isPremiumUser ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
    <div>
      <label className="block text-xs font-medium text-dim mb-1">
        {t("prefix", lang)}
      </label>
      <input
        type="text"
        value={settings.prefix}
        onChange={(e) => update("prefix", e.target.value)}
        placeholder="e.g. blog"
        className={inputClass}
      />
    </div>
    {isPremiumUser && (
      <div>
        <label className="block text-xs font-medium text-dim mb-1">
          {t("suffix", lang)}
        </label>
        <input
          type="text"
          value={settings.suffix}
          onChange={(e) => update("suffix", e.target.value)}
          placeholder="e.g. hero"
          className={inputClass}
        />
      </div>
    )}
  </div>
  <div>
    <label className="block text-xs font-medium text-dim mb-1">
      {t("separator", lang)}
    </label>
    <input
      type="text"
      value={settings.separator}
      onChange={(e) => update("separator", e.target.value)}
      maxLength={3}
      className={`${inputClass} w-20 text-center`}
    />
  </div>
</div>
```

Wrap the entire copyright/creator `<details>` section (lines 157-212) in a conditional:

```tsx
{isPremiumUser && (
  <>
    <hr className="border-elevated" />
    <details open={!settings.copyright && !settings.creator && !settings.rightsUrl} className="group">
      {/* ... entire existing copyright/creator/rightsUrl section unchanged ... */}
    </details>
  </>
)}
```

- [ ] **Step 3: Update ImageDetail to hide premium fields**

In `components/image-detail.tsx`, add `isPremiumUser` to the props interface (line 6):

```typescript
interface ImageDetailProps {
  // ... existing props ...
  isPremiumUser: boolean;
}
```

Add to destructured props. Then wrap the Title section (lines 149-161) in a conditional:

```tsx
{isPremiumUser && (
  <div>
    <div className="flex items-center justify-between mb-1">
      <label className="text-xs font-medium text-dim">{t("title", language)}</label>
      <CharCount value={analysis.title} max={100} warn={90} />
    </div>
    <input
      type="text"
      value={analysis.title}
      onChange={(e) => onUpdateAnalysis(image.id, "title", e.target.value)}
      className={inputClass}
    />
  </div>
)}
```

Wrap the Location section (lines 208-249) in a conditional:

```tsx
{isPremiumUser && (
  <div className="rounded-md border border-raised p-3 space-y-3">
    {/* ... entire existing location section unchanged ... */}
  </div>
)}
```

Also conditionally hide copyright/creator/webRights from the md preview (lines 268-276). Wrap those lines:

```tsx
{isPremiumUser && `\n## ${t("copyright", language)}\n${copyright || "—"}\n\n## ${t("creator", language)}\n${creator || "—"}\n\n## ${t("webRights", language)}\n${rightsUrl || "—"}`}
```

- [ ] **Step 4: Update export functions for premium gating**

In `lib/export.ts`, update the settings type in both `exportAsZip` and `exportAsCsv` function signatures to include `isPremiumUser`:

```typescript
export async function exportAsZip(
  images: ImageItem[],
  settings: { prefix: string; suffix: string; separator: string; copyright: string; creator: string; rightsUrl: string; isPremiumUser: boolean }
): Promise<void> {
```

In `generateMetadataMarkdown` (line 5), add `isPremiumUser` to the `meta` parameter:

```typescript
function generateMetadataMarkdown(
  fileName: string,
  analysis: NonNullable<ImageItem["analysis"]>,
  meta: { copyright: string; creator: string; rightsUrl: string; isPremiumUser: boolean }
): string {
```

Inside `generateMetadataMarkdown`, conditionally include premium-only sections. Replace the location and copyright sections (around lines 10-48):

```typescript
  const location = [analysis.locationName, analysis.city, analysis.stateProvince, analysis.country]
    .filter(Boolean)
    .join(", ");

  let md = `# ${fileName}

## Title
${meta.isPremiumUser ? (analysis.title || "—") : "—"}

## Alt Text
${analysis.altText || "—"}

## Description
${analysis.metaDescription || "—"}

## Keywords
${analysis.keywords.length > 0 ? analysis.keywords.join(", ") : "—"}`;

  if (meta.isPremiumUser) {
    md += `

## Copyright
${meta.copyright || "—"}

## Creator
${meta.creator || "—"}

## Date Created
${new Date().toISOString().split("T")[0]}

## Web Statement of Rights
${meta.rightsUrl || "—"}

## Location
${location || "—"}`;

    if (analysis.locationName || analysis.city || analysis.stateProvince || analysis.country) {
      md += `
### Location Details
${analysis.locationName ? `- **Location Name:** ${analysis.locationName}` : ""}
${analysis.city ? `- **City:** ${analysis.city}` : ""}
${analysis.stateProvince ? `- **State/Province:** ${analysis.stateProvince}` : ""}
${analysis.country ? `- **Country:** ${analysis.country}` : ""}`.trim();
    }
  }

  md += "\n";
  return md;
```

Pass `isPremiumUser` through in `exportAsZip` (around line 100):

```typescript
const mdContent = generateMetadataMarkdown(uniqueName, image.analysis, {
  copyright: settings.copyright,
  creator: settings.creator,
  rightsUrl: settings.rightsUrl,
  isPremiumUser: settings.isPremiumUser,
});
```

In the CSV function, conditionally adjust the headers and row data based on `isPremiumUser`. Update the `exportAsCsv` function signature:

```typescript
export function exportAsCsv(
  images: ImageItem[],
  settings: { prefix: string; suffix: string; separator: string; copyright: string; creator: string; rightsUrl: string; isPremiumUser: boolean }
): void {
```

Conditionally include premium columns:

```typescript
  const headers = settings.isPremiumUser
    ? ["filename", "title", "alt_text", "description", "keywords", "copyright", "creator", "rights_url", "date_created", "location_name", "city", "state_province", "country"]
    : ["filename", "alt_text", "description", "keywords"];

  // ... in the row builder:
  const row = settings.isPremiumUser
    ? [uniqueName, a.title, a.altText, a.metaDescription, a.keywords.join(", "), settings.copyright, settings.creator, settings.rightsUrl, new Date().toISOString().split("T")[0], a.locationName, a.city, a.stateProvince, a.country]
    : [uniqueName, a.altText, a.metaDescription, a.keywords.join(", ")];
  rows.push(row);
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: Compiles successfully. All `isPremiumUser` props are threaded and typed correctly.

- [ ] **Step 6: Visual verification**

Run: `npm run dev`
Check: Settings panel should show only Language + Prefix + Separator (no Suffix, no Copyright section). Image detail should show only Descriptive Name, Alt Text, Description, Keywords (no Title, no Location). Export ZIP/CSV should contain only the free-tier fields.

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx components/settings-panel.tsx components/image-detail.tsx lib/export.ts
git commit -m "feat: simplify free tier to 4 output fields and 3 settings

Hide suffix, copyright, creator, rightsUrl settings and title/location
output fields behind isPremiumUser prop (defaults to false). Phase 1B
will source this from Clerk user plan."
```

---

### Task 3: Static comparison data

**Files:**
- Create: `lib/samples/comparison-data.ts`
- Create: `lib/samples/README.md`

- [ ] **Step 1: Create comparison-data.ts**

Create `lib/samples/comparison-data.ts` with the pre-generated Mistral vs Claude outputs from the manual export:

```typescript
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
    photographer: "Unsplash Photographer",
    photographerUrl: "https://unsplash.com",
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

/** Fields visible on the free tier */
export const FREE_FIELDS: (keyof FieldSet)[] = [
  "descriptiveName",
  "altText",
  "metaDescription",
  "keywords",
];

/** Fields only visible on the premium tier */
export const PREMIUM_ONLY_FIELDS: (keyof FieldSet)[] = [
  "title",
  "locationName",
  "city",
  "stateProvince",
  "country",
];
```

- [ ] **Step 2: Create README.md**

Create `lib/samples/README.md`:

```markdown
# Sample Comparison Data

Static pre-generated Mistral (free) vs Claude (premium) analysis outputs
for the comparison gallery on the landing page.

## How to regenerate

1. Start dev server: `npm run dev`
2. Upload the 6 images from `public/samples/` into the tool
3. Analyze all with Mistral (default provider) — export as ZIP
4. Switch `VISION_PROVIDER=claude` in `.env.local`, restart dev server
5. Analyze same 6 images — export as ZIP
6. Switch `VISION_PROVIDER` back to `mistral` immediately
7. Format both exports into `comparison-data.ts` (match existing structure)
8. Commit the updated file

**Important:** Claude should NEVER run in any automated pipeline.
The one-time manual generation is a business expense. After that,
Claude only runs when a paying user triggers it.
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Compiles successfully. The data file is pure TypeScript with no runtime dependencies.

- [ ] **Step 4: Commit**

```bash
git add lib/samples/
git commit -m "feat: add pre-baked Mistral vs Claude comparison data

6 sample images analyzed by both providers. Static TypeScript constants
with zero runtime API dependency. Data generated manually via the tool."
```

---

### Task 4: FieldRow component

**Files:**
- Create: `components/field-row.tsx`

- [ ] **Step 1: Create FieldRow component**

Create `components/field-row.tsx`:

```tsx
"use client";

interface FieldRowProps {
  label: string;
  freeValue: string | string[];
  premiumValue: string | string[];
  isPremiumOnly: boolean;
  freeLabel: string;
  premiumLabel: string;
  lockTooltip: string;
}

function formatValue(value: string | string[]): string {
  if (Array.isArray(value)) return value.join(", ");
  return value || "—";
}

export function FieldRow({
  label,
  freeValue,
  premiumValue,
  isPremiumOnly,
  freeLabel,
  premiumLabel,
  lockTooltip,
}: FieldRowProps) {
  const freeText = formatValue(freeValue);
  const premiumText = formatValue(premiumValue);

  return (
    <div className="border-b border-elevated last:border-b-0">
      {/* Field label */}
      <div className="px-3 py-1.5 bg-deep/50">
        <span className="text-[10px] font-medium text-dim uppercase tracking-wider">
          {label}
        </span>
      </div>

      {/* Values row */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Free cell */}
        <div className="px-3 py-2 border-b md:border-b-0 md:border-r border-elevated">
          <span className="text-[9px] font-medium text-dim uppercase tracking-wider md:hidden">
            {freeLabel}
          </span>
          {isPremiumOnly ? (
            <div className="flex items-center gap-2 py-1" title={lockTooltip}>
              <div className="flex-1 h-4 rounded bg-elevated/60 blur-[2px]" />
              <span className="flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium text-warm-dim border border-warm-dim/30 bg-warm-dim/5">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Premium
              </span>
            </div>
          ) : (
            <p className="text-xs text-fog leading-relaxed">{freeText}</p>
          )}
        </div>

        {/* Premium cell */}
        <div className="px-3 py-2">
          <span className="text-[9px] font-medium text-dim uppercase tracking-wider md:hidden">
            {premiumLabel}
          </span>
          <p className="text-xs text-cream leading-relaxed">{premiumText}</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiles successfully.

- [ ] **Step 3: Commit**

```bash
git add components/field-row.tsx
git commit -m "feat: add FieldRow component for comparison gallery

Renders a single metadata field with free/premium cells side-by-side.
Premium-only fields show a blurred placeholder with lock icon."
```

---

### Task 5: ComparisonSample component

**Files:**
- Create: `components/comparison-sample.tsx`

- [ ] **Step 1: Create ComparisonSample component**

Create `components/comparison-sample.tsx`:

```tsx
"use client";

import { FieldRow } from "./field-row";
import { t, type Language } from "@/lib/i18n";
import type { ComparisonSample as SampleType } from "@/lib/samples/comparison-data";

interface ComparisonSampleProps {
  sample: SampleType;
  isExpanded: boolean;
  onToggle: () => void;
  language: Language;
}

const FIELD_ORDER: { key: keyof SampleType["free"]; i18nKey: string; isPremiumOnly: boolean }[] = [
  { key: "descriptiveName", i18nKey: "galleryFileName", isPremiumOnly: false },
  { key: "altText", i18nKey: "altText", isPremiumOnly: false },
  { key: "metaDescription", i18nKey: "description", isPremiumOnly: false },
  { key: "keywords", i18nKey: "keywords", isPremiumOnly: false },
  { key: "title", i18nKey: "title", isPremiumOnly: true },
  { key: "locationName", i18nKey: "locationName", isPremiumOnly: true },
  { key: "city", i18nKey: "city", isPremiumOnly: true },
  { key: "stateProvince", i18nKey: "stateProvince", isPremiumOnly: true },
  { key: "country", i18nKey: "country", isPremiumOnly: true },
];

export function ComparisonSampleCard({ sample, isExpanded, onToggle, language }: ComparisonSampleProps) {
  const freeLabel = t("galleryFree", language);
  const premiumLabel = t("galleryPremium", language);
  const lockTooltip = t("galleryLockTooltip", language);

  return (
    <div className="rounded-xl border border-elevated overflow-hidden bg-surface/50">
      {/* Clickable header: image + summary */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-elevated/50 transition-colors"
      >
        {/* Thumbnail */}
        <div className="w-16 h-12 md:w-20 md:h-14 rounded-lg overflow-hidden flex-shrink-0 bg-elevated">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sample.imagePath}
            alt={sample.free.altText}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Summary text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-cream truncate">
            {sample.free.descriptiveName}
          </p>
          <p className="text-xs text-dim truncate mt-0.5">
            {sample.free.altText}
          </p>
        </div>

        {/* Expand/collapse icon */}
        <svg
          className={`w-4 h-4 text-dim transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div>
          {/* Full image */}
          <div className="relative aspect-video bg-elevated">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sample.imagePath}
              alt={sample.premium.altText}
              className="w-full h-full object-cover"
            />
            {/* Photographer credit */}
            <a
              href={sample.photographerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 right-2 text-[9px] text-white/60 hover:text-white/90 bg-black/40 rounded px-1.5 py-0.5 backdrop-blur-sm transition-colors"
            >
              {sample.photographer} / Unsplash
            </a>
          </div>

          {/* Column headers (desktop only) */}
          <div className="hidden md:grid grid-cols-2 border-t border-elevated">
            <div className="px-3 py-2 text-[10px] font-semibold text-dim uppercase tracking-wider border-r border-elevated">
              {freeLabel}
            </div>
            <div className="px-3 py-2 text-[10px] font-semibold text-warm-dim uppercase tracking-wider">
              {premiumLabel}
            </div>
          </div>

          {/* Field rows */}
          <div className="border-t border-elevated">
            {FIELD_ORDER.map((field) => (
              <FieldRow
                key={field.key}
                label={t(field.i18nKey, language)}
                freeValue={sample.free[field.key]}
                premiumValue={sample.premium[field.key]}
                isPremiumOnly={field.isPremiumOnly}
                freeLabel={freeLabel}
                premiumLabel={premiumLabel}
                lockTooltip={lockTooltip}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiles successfully.

- [ ] **Step 3: Commit**

```bash
git add components/comparison-sample.tsx
git commit -m "feat: add ComparisonSample card with accordion expand

Renders one sample image with all 9 field rows. Free fields show real
values on both sides. Premium-only fields show locked placeholder on
the free side."
```

---

### Task 6: ComparisonGallery + CTA

**Files:**
- Create: `components/comparison-gallery.tsx`

- [ ] **Step 1: Create ComparisonGallery component**

Create `components/comparison-gallery.tsx`:

```tsx
"use client";

import { useState } from "react";
import { ComparisonSampleCard } from "./comparison-sample";
import { COMPARISON_SAMPLES } from "@/lib/samples/comparison-data";
import { t, type Language } from "@/lib/i18n";

interface ComparisonGalleryProps {
  language: Language;
}

export function ComparisonGallery({ language }: ComparisonGalleryProps) {
  // First sample is expanded by default; accordion pattern
  const [expandedId, setExpandedId] = useState<string>(COMPARISON_SAMPLES[0].id);

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? "" : id));
  };

  const mailtoHref = `mailto:dennis@autentisk.io?subject=${encodeURIComponent("Premium - Interesse")}&body=${encodeURIComponent("Jeg vil gjerne vite mer om Premium")}`;

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-12 md:py-16">
      {/* Section header */}
      <div className="text-center mb-8 md:mb-10">
        <h2 className="font-display font-light text-cream text-2xl md:text-3xl mb-3">
          {t("galleryHeading", language)}
        </h2>
        <div className="shimmer-line max-w-xs mx-auto" />
      </div>

      {/* Sample cards */}
      <div className="flex flex-col gap-3">
        {COMPARISON_SAMPLES.map((sample) => (
          <ComparisonSampleCard
            key={sample.id}
            sample={sample}
            isExpanded={expandedId === sample.id}
            onToggle={() => handleToggle(sample.id)}
            language={language}
          />
        ))}
      </div>

      {/* CTA */}
      <div className="mt-10 text-center">
        <a
          href={mailtoHref}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-warm/40 text-cream font-body font-medium text-sm tracking-wide transition-all duration-300 hover:bg-warm/10 hover:border-warm/70 hover:shadow-[0_0_30px_rgba(197,163,100,0.12)]"
        >
          {t("galleryUpgrade", language)}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
        <p className="text-xs text-dim mt-3">
          {t("galleryNotify", language)}
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiles successfully.

- [ ] **Step 3: Commit**

```bash
git add components/comparison-gallery.tsx
git commit -m "feat: add ComparisonGallery with 6 samples and upgrade CTA

Accordion gallery showing pre-baked Mistral vs Claude comparison.
First sample expanded by default. CTA links to mailto for pre-launch
lead collection."
```

---

### Task 7: Hero integration + final verification

**Files:**
- Modify: `components/hero-section.tsx`

- [ ] **Step 1: Embed ComparisonGallery in the hero section**

In `components/hero-section.tsx`, add the import at the top:

```typescript
import { ComparisonGallery } from "./comparison-gallery";
```

In the JSX, insert `<ComparisonGallery />` between the feature cards section and the shimmer divider. Find the closing `</div>` of the feature cards `animate-fade-up` div (around line 269), and add after it:

```tsx
        {/* Comparison gallery */}
        <div
          className="animate-fade-up w-screen relative left-1/2 -translate-x-1/2 mt-8"
          style={{ animationDelay: "0.75s" }}
        >
          <ComparisonGallery language={language} />
        </div>
```

The `w-screen relative left-1/2 -translate-x-1/2` breaks out of the `max-w-3xl` content container so the gallery can use the full viewport width, matching the spec's "full-width card" design.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiles successfully with no type errors.

- [ ] **Step 3: Visual verification**

Run: `npm run dev`

Open `http://localhost:3000` in a browser. Verify:

1. Landing page shows only 2 language buttons (English, Norsk) — not 5
2. Scrolling past the feature cards reveals the comparison gallery section
3. First sample (café) is expanded by default, showing all 9 field rows
4. Free column shows real values for the 4 free fields and locked placeholders for the 5 premium-only fields
5. Premium column shows real values for all 9 fields
6. Clicking a collapsed sample expands it and collapses the previous one
7. "Oppgrader til Premium" button opens a mailto link
8. Opening the tool overlay (click "Start Processing"):
   - Settings shows only Language + Prefix + Separator (no Suffix, no Copyright section)
   - After analyzing an image, detail view shows only Descriptive Name, Alt Text, Description, Keywords (no Title, no Location)
9. Export ZIP contains only the 4 free-tier fields in the .md files
10. Mobile view: field rows stack vertically with "Gratis" / "Premium" labels

- [ ] **Step 4: Commit**

```bash
git add components/hero-section.tsx
git commit -m "feat: embed comparison gallery in landing page hero section

Gallery shows 6 pre-baked Mistral vs Claude comparisons with locked
premium fields. Completes Phase 1A: free-tier simplification, language
reduction, and comparison gallery."
```

- [ ] **Step 5: Final build verification**

Run: `npm run build`
Expected: Full production build succeeds with no API calls, no errors. All static pages generate correctly.
