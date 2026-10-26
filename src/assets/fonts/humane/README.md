# Humane font files

The design uses **Humane** for oversized headings. Humane isn't released under an open-source licence, so its
files are not included in this repository.

1. Get Humane from its foundry with a licence that covers use on a website.
2. Copy the web font files here, for example `Humane-Regular.woff2` (optionally `.woff` and other weights).
   The weight is read from the file name (`Thin`, `Light`, `Regular`, `Medium`, `SemiBold`, `Bold`, `Black`, …).
3. Rebuild (`npm run build`). The font is registered automatically by `src/lib/fonts.js`.

Until the files are present, headings use **Six Caps** (SIL Open Font License), which has the same
ultra-condensed proportions.
