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
