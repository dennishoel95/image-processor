# Vercel Deployment Design: Browser-Only Architecture

**Date:** 2026-02-22
**Status:** Approved

## Summary

Convert the image processor from a local file-system app to a browser-based app deployable on Vercel. All image data stays in the browser. The server is stateless — it receives images, calls Claude, returns metadata.

## Architecture

```
User's Browser                         Vercel Serverless
┌─────────────────────┐               ┌─────────────────────┐
│                     │               │                     │
│  1. File picker     │               │  Server Action:     │
│     (drag & drop    │  base64 img   │  processImage()     │
│      or browse)     │ ─────────────►│                     │
│                     │               │  - Receives base64  │
│  2. Images held     │               │  - Calls Claude API │
│     in React state  │  JSON result  │  - Returns metadata │
│     as base64       │ ◄─────────────│                     │
│                     │               └─────────────────────┘
│  3. Edit metadata   │
│     in UI           │               Vercel Env Vars
│                     │               ┌─────────────────────┐
│  4. JSZip generates │               │ ANTHROPIC_API_KEY   │
│     ZIP in browser  │               └─────────────────────┘
│                     │
│  5. Download ZIP    │
└─────────────────────┘
```

## Decisions

- **Approach:** Browser-Only (no database, no cloud storage, no auth)
- **API key:** Server-side only (env var). User's key during testing, swap to cheaper vision API later.
- **Export:** ZIP bundle (renamed images + .md metadata sidecars) via JSZip
- **Batch limit:** 10 images max
- **File types:** .jpg, .jpeg, .png, .webp, .gif, .avif (no TIFF — browsers/Claude don't support it)
- **AI integration:** Keep modular for future swap to Google Cloud Vision or similar

## Upload Flow

- Drop zone and `<input type="file" multiple accept="image/*">` replace folder scanning
- Files read client-side via `FileReader.readAsDataURL()` → stored as base64 in React state
- Thumbnails via `URL.createObjectURL(file)` — no server call needed
- Max 10 files, max 20MB per file enforced client-side

## Processing Flow

- Server action receives base64 image + media type + language setting
- Calls Claude API with ANTHROPIC_API_KEY from env var
- Returns structured metadata JSON
- Sequential processing, one image at a time
- Results stored in browser state, editable in detail panel

## Export Flow

- JSZip generates ZIP in browser memory
- Each processed image: renamed file + .md sidecar
- ZIP structure: flat directory with image/metadata pairs
- Browser triggers download

## Settings Panel

- **Keep:** Language selector, prefix/suffix/separator, action buttons
- **Remove:** Source folder input, destination folder input, folder browser modal
- **Add:** File count indicator, reset button

## Files to Delete

- `lib/filesystem.ts`
- `app/api/browse/route.ts`
- `app/api/thumbnail/route.ts`
- `components/folder-browser.tsx`

## Files to Modify

- `app/page.tsx` — browser file handling
- `app/actions.ts` — receive base64 directly, remove fs imports
- `components/settings-panel.tsx` — remove folder inputs
- `components/drop-zone.tsx` — make functional with file input
- `components/image-card.tsx` — blob URLs for thumbnails
- `components/image-grid.tsx` — props changes
- `components/image-detail.tsx` — export trigger
- `lib/types.ts` — ImageItem holds file data instead of path

## Files to Add

- `lib/export.ts` — client-side ZIP generation

## New Dependency

- `jszip` — ZIP generation in browser

## Deployment

- Connect GitHub repo to Vercel
- Framework auto-detected as Next.js
- Add ANTHROPIC_API_KEY in Vercel dashboard
- No vercel.json needed
- Works locally with `npm run dev` + `.env.local`
