# Phase 1A: Free-Tier Simplification, Comparison Gallery & Language Reduction

**Date:** 2026-04-12
**Status:** Approved
**Scope:** Functional work in `image-processor` repo (pre-migration)
**Depends on:** Nothing (no external service dependencies)
**Blocks:** Phase 1B (auth + billing), Phase 2 (migration to autentisk-website)

---

## 1. Summary

Phase 1A delivers three tightly scoped changes to the image-processor:

1. **Simplify the free tier** — reduce visible output from 9 fields to 4, reduce settings inputs from 6 to 3 (language + prefix + separator), reduce languages from 5 to 2 (Norwegian + English).
2. **Pre-baked comparison gallery** — a `<ComparisonGallery />` component showing 6 curated Unsplash sample images, each analyzed by both Mistral (free tier) and Claude (premium tier), rendered as stacked rows with locked premium-only fields.
3. **Email capture CTA** — a simple "Upgrade to Premium" button below the gallery that collects emails for pre-launch notification.

All sample data is static, committed to git, generated once by a local script. Zero runtime API cost for the gallery. Zero auth dependency.

---

## 2. Target Audience Context

From the Autentisk Målkundeprofil (Notion, updated 2026-04-05):

- **Who:** Norwegian SMBs, 1-10 people, 500k-5M NOK revenue, owner-operators aged 40+
- **Digital literacy:** Low to medium. Know terms like SEO/CMS but not skilled in practice.
- **Key behavior:** "De trenger a se, ikke bli fortalt" (they need to see, not be told). Before/after, prototypes, concrete examples beat presentations.
- **Language:** Norwegian first. English terms (SEO, CMS) are known but explanations must be in Norwegian.
- **Platform behavior:** Scroll-oriented. Won't click tabs. Won't navigate to sub-pages for comparison content.

This directly informs the design choice of an inline scroll-visible gallery over a separate /examples route or a tabbed interface.

---

## 3. Free Tier Scope Reduction

### Settings panel (user inputs)

| Setting | Free tier | Premium tier (Phase 1B) |
|---------|-----------|------------------------|
| Language (no/en) | Visible | Visible |
| Prefix | Visible | Visible |
| Separator | Visible | Visible |
| Suffix | Hidden (conditional) | Visible |
| Copyright | Hidden (conditional) | Visible |
| Creator | Hidden (conditional) | Visible |
| Rights URL | Hidden (conditional) | Visible |

Hidden fields are wrapped in a conditional (`isPremiumUser` prop, passed from `app/page.tsx`, defaulting to `false`). When Phase 1B adds tier gating via Clerk, `page.tsx` reads the user's plan from `Clerk.user` and passes `isPremiumUser={user.plan === "pro"}` instead. This restores the hidden fields without a second refactor of any child component.

### Output fields (analysis results)

| Field | Free tier | Premium tier (Phase 1B) |
|-------|-----------|------------------------|
| descriptiveName | Visible | Visible |
| altText | Visible | Visible |
| metaDescription | Visible | Visible |
| keywords | Visible | Visible |
| title | Hidden | Visible |
| locationName | Hidden | Visible |
| city | Hidden | Visible |
| stateProvince | Hidden | Visible |
| country | Hidden | Visible |

Backend prompt (`lib/vision/prompt.ts`) still requests all 9 fields from the model. The filtering is purely at the UI and export layers. This keeps the provider abstraction unchanged.

### Language reduction

`lib/i18n.ts` and `lib/vision/prompt.ts` (`LANGUAGE_NAMES` record) are reduced from 5 entries (en, no, de, es, ko) to 2 entries (en, no). The hero-section language selector renders only 2 buttons instead of 5.

---

## 4. Comparison Gallery Design

### Layout: Stacked rows with locked premium fields (Option B)

Each of the 6 sample images renders as a full-width card containing:

1. The Unsplash photo (responsive, aspect-ratio preserved)
2. Photographer attribution (small text, bottom-right of image)
3. 9 metadata field rows, each with two sub-cells:
   - **Free cell** (left): populated for the 4 free fields, **blurred placeholder + lock icon + "Premium" chip** for the 5 premium-only fields
   - **Premium cell** (right): always populated for all 9 fields

### Scroll behavior

- Sample 1 is always expanded (fully visible on first scroll)
- Samples 2-6 are collapsed by default (show image thumbnail + one-line summary)
- Click/tap on a collapsed sample expands it, collapsing the previously open one (accordion pattern)
- This prevents the gallery from becoming a wall of 54 field rows (9 fields x 6 samples)

### Responsive behavior

- **Desktop (md+):** Free and Premium cells side-by-side in each row
- **Mobile (<md):** Free and Premium cells stack vertically within each row, with a clear "Gratis" / "Premium" label above each

### Gallery chrome (i18n-aware)

- Section header: "Gratis vs Premium - se forskjellen" (no) / "Free vs Premium - see the difference" (en)
- Field labels adapt to active language
- Lock tooltip: "Tilgjengelig med Premium" (no) / "Available with Premium" (en)

---

## 5. Sample Images

6 curated Unsplash photos representing content Norwegian SMBs would upload to their own websites:

| # | Category | Filename | Unsplash ID | Photographer |
|---|----------|----------|-------------|--------------|
| 1 | Small cafe exterior | `1-cafe-exterior.jpg` | `v_yE1cAl_Tc` | JIWON KANG (@jiwon_kang) |
| 2 | Pottery craftsman | `2-pottery-craftsman.jpg` | `Tq4YjCa2BSc` | (verify on page) |
| 3 | Restaurant shared plates | `3-restaurant-shared-plates.jpg` | `G3hZMCdLUdw` | Thomas Park (@thomascpark) |
| 4 | Event table with flowers | `4-event-table-flowers.jpg` | `5y71Otj5xek` | Clay Banks (@claybanks) |
| 5 | Ceramic mugs on shelf | `5-ceramic-mugs-shelf.jpg` | `5lUMTeo7-bE` | Eric Prouzet (@eprouzet) |
| 6 | Small team at laptop | `6-team-laptop.jpg` | `CN54mBf1f8I` | Vitaly Gariev (@silverkblack) |

Images are downloaded at Medium resolution (~1920px), compressed to ~300-500 KB during implementation, and stored in `public/samples/`. Committed to git.

---

## 6. Sample Generation Workflow

### Script: `scripts/generate-samples.ts`

Run manually via `npm run generate-samples`. One-time execution, not part of the build pipeline.

**What it does:**
1. Reads each image from `public/samples/`
2. Compresses to base64
3. Calls `mistralProvider.analyzeImage(base64, mediaType, "no")` (free output)
4. Waits ~3 seconds (respects Mistral's 0.42 RPS free-tier limit)
5. Calls `claudeProvider.analyzeImage(base64, mediaType, "no")` (premium output)
6. Writes all results to `lib/samples/comparison-data.ts` as a typed constant

**What it does NOT do:**
- Download images from Unsplash (manual step, done once)
- Run during `next build` or `next dev`
- Auto-format or "fix" model output (authentic differences are the point)

### Data shape

```typescript
export interface ComparisonSample {
  id: string;
  imagePath: string;
  photographer: string;
  photographerUrl: string;
  free: FieldSet;      // Mistral output
  premium: FieldSet;   // Claude output
}

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

export const COMPARISON_SAMPLES: ComparisonSample[] = [
  // 6 entries
];
```

### Cost per generation run

- 6 Mistral calls: free (Experiment tier)
- 6 Claude calls: ~$0.03-0.06 total
- Total: effectively free

### Regeneration policy

Re-run only when:
- Sample images change
- Provider models are updated and you want fresher output
- Prompt changes meaningfully

The generated file is committed to git. Deterministic. No API dependency at build time.

---

## 7. Component Architecture

### New files

| File | Purpose |
|------|---------|
| `components/comparison-gallery.tsx` | Top-level container: section header, accordion state, CTA button |
| `components/comparison-sample.tsx` | One sample card: image + photographer credit + field rows |
| `components/field-row.tsx` | Single field row with free cell + premium cell; supports locked variant |
| `lib/samples/comparison-data.ts` | Static generated data (output of generate-samples script) |
| `lib/samples/README.md` | Instructions for regenerating samples |
| `scripts/generate-samples.ts` | One-time sample generator script |

### Modified files

| File | Change |
|------|--------|
| `lib/i18n.ts` | Reduce LANGUAGES array from 5 to 2 (en, no) |
| `lib/vision/prompt.ts` | Reduce LANGUAGE_NAMES record from 5 to 2 entries |
| `components/hero-section.tsx` | Embed `<ComparisonGallery />` between feature cards and language selector |
| `components/settings-panel.tsx` | Wrap suffix/copyright/creator/rightsUrl inputs in `isPremiumUser` conditional |
| `components/image-detail.tsx` | Hide title and location fields behind `isPremiumUser` conditional |
| `lib/export.ts` | Conditionally exclude premium-only fields from ZIP/CSV export when `isPremiumUser` is false |

### Component tree at runtime

```
HeroSection
  |-- eyebrow text
  |-- H1 + subtitle
  |-- feature cards row (existing)
  |-- <ComparisonGallery>                          [NEW]
  |     |-- section header (i18n)
  |     |-- <ComparisonSample> x6 (accordion)      [NEW]
  |     |     |-- <img> + photographer credit
  |     |     |-- <FieldRow> x9 per sample          [NEW]
  |     |           |-- Free cell (value or locked)
  |     |           |-- Premium cell (always value)
  |     |-- CTA button ("Oppgrader til Premium")
  |     |-- Email capture field
  |-- shimmer divider (existing)
  |-- language selector (existing, now 2 options)
  |-- CTA button (existing)
```

---

## 8. "Upgrade" CTA Behavior (Pre-Auth)

Since no payment system exists in Phase 1A:

- **Button text:** "Oppgrader til Premium" (no) / "Upgrade to Premium" (en)
- **On click:** Scrolls to an inline email capture field directly below the button
- **Email field label:** "Fa beskjed nar Premium lanseres" (no) / "Get notified when Premium launches" (en)
- **On submit:** Opens a pre-filled `mailto:` link to the business email (e.g. `mailto:dennis@autentisk.io?subject=Premium%20-%20Interesse&body=Jeg%20vil%20gjerne%20vite%20mer%20om%20Premium`). Zero backend, zero storage, zero external dependency. Phase 1B replaces this with a proper form connected to Clerk's notification system.
- **No dead links, no broken checkout, no placeholder modals.**

This gives you direct contact from interested leads until the proper payment flow exists.

---

## 9. Out of Scope

| Item | Reason | Deferred to |
|------|--------|-------------|
| Clerk auth (login/signup/sessions) | Needs MCP install + own design cycle | Phase 1B |
| Clerk Billing (payment/plans) | Depends on auth | Phase 1B |
| Tier gating in `lib/vision/index.ts` | Needs Clerk user object | Phase 1B |
| Rate limiting | Auth-adjacent, pre-launch priority | Phase 1B |
| Visual restyling to match autentisk.io | Happens once in target repo | Phase 2 |
| Migration to autentisk-website | After functional completion | Phase 2 |
| Vercel subdomain configuration | User-side config | Phase 2 |
| "Upgrade" button wired to real checkout | No payment page yet | Phase 1B |

---

## 10. Success Criteria

Phase 1A is complete when:

1. The app runs with only Norwegian and English language options
2. Free-tier users see only 4 output fields and 3 settings inputs
3. The comparison gallery renders 6 samples with locked premium fields on the landing page
4. The "Upgrade" CTA captures an email address
5. `npm run build` passes without API calls (all sample data is static)
6. Premium-only fields in settings and detail views are hidden but restorable via a single boolean flag
