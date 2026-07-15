# Contributing

Thanks for helping make LINE + n8n automation accessible to small businesses!

## Dev setup

```bash
npm install
npm run dev        # runs in mock mode with zero credentials — most UI work needs nothing else
```

Mock mode is a first-class feature: `src/lib/mock-data.ts` backs `/api/catalog` whenever Notion credentials are absent, so you can develop and review UI changes without any external accounts.

## Before you open a PR

```bash
npm run lint
npm run typecheck
npm run test:line-webhook
npm run check:leaks     # must print nothing — never commit tokens, IDs, or real business data
npm run build
```

## What we'd love help with

- **Translations** — several deep-dive docs are in Traditional Chinese; English versions welcome (and vice versa).
- **Deployment reports** — deployed the kit for a real business? Open an issue describing what was confusing; quickstart friction reports are gold.
- **n8n workflow improvements** — keep A/B/C1–C3 separate (see [docs/architecture.md](docs/architecture.md) for why) and strip all credentials/IDs before exporting (`npm run check:leaks` gates this).
- Roadmap items in the README.

## Ground rules

- Never commit secrets, real database IDs, webhook URLs, LINE user/group IDs, or customer data. `.env.local` stays local; `workflows/` JSONs must reference credentials by placeholder only.
- Keep changes small and focused; add or update tests when touching `tools/line/` logic.
- Demo data stays fictional (示範果舖 / Demo Fruit Shop).
