# Project Guide

## Purpose and architecture

This is Semih Algan’s Turkish personal software showcase. It uses React 19, TypeScript, TanStack Start, TanStack Router, Vite, Tailwind CSS 4, and the Netlify TanStack Start plugin. The landing page is server-rendered; React handles the mobile menu and clipboard interaction.

The owner explicitly requested a coming-soon announcement, not example products. Purchases, payments, prices, carts, login, and mailing-list signup are intentionally absent. Do not reintroduce template commerce content or invent products, testimonials, experience, or sales claims.

## Key files

- `src/routes/index.tsx`: complete landing page, biography, public contact details, mobile navigation, and clipboard feedback.
- `src/routes/__root.tsx`: Turkish document shell, metadata, Google Fonts links, and favicon. `siteName` and `siteDescription` are finished sharing copy. `og:image` and `twitter:image` point to the owner-approved branded card at `public/og-image.png` (1200×630) via an absolute production URL.
- `src/styles.css`: color tokens, custom layouts, CSS artwork, responsive breakpoints, focus styles, and reduced-motion behavior.
- `src/router.tsx`: router factory and scroll restoration.
- `public/favicon.svg`: custom code-mark favicon.
- `public/og-image.png`: 1200×630 social share card (cream background, green code-mark icon, `semihalgan.` wordmark).
- `vite.config.ts` and `netlify.toml`: framework and Netlify deployment configuration.
- `.agents/skills/`: local framework instructions; read the relevant skill before extending framework features.
- `.netlify/results.md`: standalone description of the completed changes.

## Conventions

Use TypeScript with strict checking, PascalCase React components, camelCase functions, and Lucide icons. Keep user-facing copy in natural Turkish and use semantic sections and accessible labels. Preserve the cream/forest-green visual system and the mobile layout. Do not add inline code comments or unnecessary dependencies.

Section links are native fragment anchors; contact actions use `mailto:` and `tel:`. Clipboard feedback must handle both success and failure and announce the result with `role="status"`. The abstract hero artwork is native CSS, not an external image. Do not replace the personal monogram with an invented portrait.

The biography and contact values were supplied by the owner for public display. Do not duplicate them into logs or introduce additional personal information. There is no persistent user state or data collection. If a future feature requires persistence, use the Netlify database/storage skills and platform primitives, not local JSON files or external databases.

## Development and deployment

Use pnpm and Node.js 22 or later. `pnpm dev` runs local Vite on port 3000; `netlify dev --port 8889` runs Netlify local emulation. The pipeline installs dependencies, generates the TanStack route tree, and builds the app; never manually edit `src/routeTree.gen.ts`.

During automated project-editing runs, do not run local build, test, type-check, or server commands; review source changes instead and let the platform validate. Do not inspect `.git`, create commits, or print secrets.
