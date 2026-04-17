# CV To Portfolio (Single-Page)

A simple, single-page portfolio/CV built with React + TypeScript + Vite.

## Quick Start

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Edit Content (No Hardcoding)

All page content lives in one file:

- `src/data/cv.json`

The UI renders from that JSON via:

- `src/data/cv.ts`
- `src/App.tsx`

To update your name, links, skills, experience, projects, education, etc., edit `src/data/cv.json` only.

### Links

In `hero.contacts`, set:

- `href`: URL or `mailto:...`
- `external: true`: opens in a new tab (adds `rel="noopener noreferrer"`)

## Scripts

- `npm run dev` - start local dev server
- `npm run lint` - run ESLint
- `npm run build` - typecheck + build
- `npm run preview` - preview the production build

