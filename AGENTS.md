# Project Guide

## Purpose and architecture

This is Semih Algan’s Turkish personal software showcase. It uses React 19, TypeScript, TanStack Start, TanStack Router, Vite, Tailwind CSS 4, and the Cloudflare Vite plugin. The application is designed to be deployed on Cloudflare Pages/Workers, utilizing Cloudflare D1 for database needs.

The owner explicitly requested a coming-soon announcement, not example products. Purchases, payments, prices, carts, login for customers, and mailing-list signup are intentionally absent. Do not reintroduce template commerce content or invent products, testimonials, experience, or sales claims.

## Key files

- src/routes/index.tsx: complete landing page, biography, public contact details, mobile navigation, and clipboard feedback.
- src/routes/__root.tsx: Turkish document shell, metadata, Google Fonts links, and favicon. 
- src/styles.css: color tokens, custom layouts, CSS artwork, responsive breakpoints, focus styles, and reduced-motion behavior.
- src/router.tsx: router factory and scroll restoration.
- src/routes/api/community/$action.ts: Custom backend built on Cloudflare Workers and D1 database. Handles auth, rate limiting, and all database operations using raw SQL.
- wrangler.toml: Cloudflare deployment, D1 database bindings, and worker configuration.
- .agents/skills/: local framework instructions; read the relevant skill before extending framework features.

## Conventions

Use TypeScript with strict checking, PascalCase React components, camelCase functions, and Lucide icons. Keep user-facing copy in natural Turkish and use semantic sections and accessible labels. Preserve the cream/forest-green visual system and the mobile layout. Do not add inline code comments or unnecessary dependencies.

Section links are native fragment anchors; contact actions use mailto: and tel:. Clipboard feedback must handle both success and failure and announce the result with role="status". The abstract hero artwork is native CSS, not an external image. Do not replace the personal monogram with an invented portrait.

The biography and contact values were supplied by the owner for public display. Do not duplicate them into logs or introduce additional personal information. Persistent user state and authentication are handled via HTTP-only cookies and Cloudflare D1. If a future feature requires persistence, use the Cloudflare D1/R2 platforms and primitives.

## Development and deployment

Use pnpm and Node.js 22 or later. `pnpm dev` runs local Vite on port 3000; `npx wrangler pages dev` or `pnpm exec wrangler pages dev` runs the Cloudflare local emulation (including D1 Database). The pipeline installs dependencies, generates the TanStack route tree, and builds the app; never manually edit src/routeTree.gen.ts.

During automated project-editing runs, do not run local build, test, type-check, or server commands; review source changes instead and let the platform validate. Do not inspect .git, create commits, or print secrets.
