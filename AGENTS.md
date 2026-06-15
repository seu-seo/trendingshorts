# AGENTS.md — trendingshorts

Working notes for agents and contributors. Keep this accurate; if reality and this
file disagree, fix this file.

## Active app

- The live application is the Next.js (14.2.5, App Router) project under **`app/`**.
  Run commands from there (`workdir: app`).
- App routes live in `app/app/`, shared UI in `app/components/`, logic in `app/lib/`.
- `old/` and `demo/` hold archived / prototype code — **not** the active app. Their
  own `AGENTS.md` files describe those snapshots only; ignore them for live work.

> Note: an older `old/web/AGENTS.md` tells you to read `node_modules/next/dist/docs/`.
> That directory does **not** exist in this install (standard Next.js 14.2.5 — no
> bundled docs). Treat this as a normal App Router project; consult the official
> Next.js docs if needed.

## Health checks

- typecheck: `npx tsc --noEmit`
- lint: `npm run lint`
- tests: `npm test` (Vitest, where present)

## Styling & color

- Colors are **not** hardcoded ad hoc. The system of record is:
  - `app/lib/themes/themes.json` — theme token definitions (color + structure)
  - `app/app/globals.css` — legacy dark `:root` tokens **plus** v7 light themes
    mapped per `[data-theme="indigo|purple|bold"]`
  - `app/lib/themes/types.ts` — TypeScript types mirroring the JSON shape
- Prefer semantic tokens (`var(--color-primary)`, `var(--radius)`, …) over raw hex.

## v7 redesign work

When working on the v7 redesign (light themes A indigo / B bold / C purple, the
conversational onboarding, etc.), **read [docs/v7/THEME-GUIDE.md](docs/v7/THEME-GUIDE.md)
first.** It documents the theme token system and the migration plan.
