# Changelog

## Unreleased

Initial public extraction of a production LINE + n8n customer-service stack into a generic starter kit:

- Next.js 16 LIFF app (8 pages) with zero-credential mock mode
- API routes: catalog (Notion live DBs with mock fallback), support-ticket intake, Flex postback status machine
- n8n workflow templates: AI customer-service agent (A), ticketing (B), draft→live content sync gatekeepers (C1–C3), plus 4 branch templates
- Notion database schemas (products / knowledge / delivery rules / tickets / LINE groups) with two-layer draft→live design
- LINE tooling: webhook signature verifier + tester, rich-menu builder/deployer, Flex Message generator
- Docs: quickstart, architecture, LINE/n8n/Notion/Vercel setup guides, webhook troubleshooting
- Leak-check script gating secrets and business identifiers out of the tree
