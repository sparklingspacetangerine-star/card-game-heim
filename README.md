# Arcana — Collector's Guild

A dark, responsive collectible card gacha built with Next.js, React and TypeScript.

## Included

- 37 cards across Ruby, Diamond, Gold, Silver, Bronze and Wood rarities
- Single summons and five-card boosters
- Gold, Diamond and Ruby pity mechanics
- Collection gallery, filters, progress and statistics
- Duplicate tracking and recent summon history
- Local demo persistence with `localStorage`
- GitHub Pages deployment via GitHub Actions

## Run locally

```bash
npm ci
npm run dev
```

The production build is static and can be generated with `npm run build`. The workflow in `.github/workflows/deploy.yml` publishes the site to GitHub Pages whenever `main` changes.
