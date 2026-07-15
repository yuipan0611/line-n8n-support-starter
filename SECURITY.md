# Security

## Reporting a vulnerability

Please open a GitHub security advisory (Security → Report a vulnerability) rather than a public issue. You'll get a response within a week.

## Secret handling rules

- All credentials live in environment variables — see `.env.example`. `.gitignore` excludes every `.env*` file except `.env.example`.
- `npm run check:leaks` scans the tree for tokens and known identifier patterns; it runs in CI and must pass before any commit.
- n8n workflow exports must not contain credential values, `webhookId`s, instance IDs, or pinned execution data. Re-run the leak check after adding any export.
- Rotate immediately any token that ever touches a commit, a screenshot, or a shared export.

## Webhook security

- Every LINE webhook must be verified against `x-line-signature` **before** JSON parsing. The kit ships a verifier (`tools/line/line-signature.cjs`), a local test server (`npm run line:webhook`), and unit tests pinned to LINE's documented example.
- The ticket postback route verifies the source group against the Notion group whitelist before touching any ticket.

## Least privilege by design

- The bot ignores all group messages unless the group, the sender, and an @-mention all check out.
- Customers only ever receive edit access to Notion *draft* databases; live databases and tickets are integration-only. See [docs/architecture.md](docs/architecture.md#security-model).
