# n8n setup

Works on n8n Cloud (free trial is enough to evaluate) or self-hosted n8n. The kit ships full workflows plus small branch templates in [`workflows/`](../workflows/).

## 1. Import

n8n → *Workflows* → *Import from file* → pick each JSON in `workflows/`:

| File | Workflow | Purpose |
|---|---|---|
| `a-line-ai-agent.json` | **A** | LINE Messaging webhook → AI reply (1:1) + group permission gate |
| `b-liff-support-ticket.json` | **B** | LIFF ticket intake → Notion ticket + Flex push to work group |
| `c1-products-sync.json` | **C1** | Products draft → live gatekeeper sync |
| `c2-knowledge-sync.json` | **C2** | FAQ/knowledge draft → live gatekeeper sync |
| `c3-delivery-sync.json` | **C3** | Delivery-rules draft → live gatekeeper sync |

`workflows/branches/` contains standalone branch templates (error alerts, group auto-registry, group todo query, Flex push) you can merge into A/B or run separately.

## 2. Credentials

Create these once; every imported node referencing a placeholder credential must be re-pointed to yours:

| Credential | Type in n8n | Used by |
|---|---|---|
| LINE Messaging API | Header Auth — `Authorization: Bearer <channel access token>` | A, B, branches |
| Notion | Notion API (integration token) | A, B, C1–C3 |
| LLM provider | e.g. OpenAI API | A |

## 3. Configuration

- Replace every `<your-...>` / `$env.NOTION_*` placeholder with your Notion database IDs (or define them as n8n environment variables).
- In A: fill the group ID and user ID whitelists.
- In B: point to your tickets database and work group.
- C1–C3: default schedule is daily; each also has a manual trigger for immediate runs.

## 4. Activate and wire up

1. Activate **A** → copy its **production** webhook URL → LINE Developers console → Messaging API → Webhook URL → Verify → enable *Use webhook*.
2. Activate **B** → copy its production webhook URL → Vercel env `N8N_SUPPORT_WEBHOOK_URL`.
3. Test C1–C3 manually once before enabling their schedules.

## 5. Acceptance checklist

- 1:1 text message → A replies using the knowledge base.
- Group message **without** @bot → no reply.
- Group message with @bot from a whitelisted user in a whitelisted group → reply.
- LIFF support form → Notion ticket created → Flex card in the work group.
- Tap the Flex accept button → Notion status becomes 已受理 → next card arrives.
- Edit a draft product with an invalid price → C1 marks the row 有錯誤 and the live DB is untouched.

## Self-hosting notes

Migrating from Cloud to self-hosted: re-import the same JSONs, recreate the three credentials, then update the two production webhook URLs (LINE console for A, Vercel env for B). Nothing else changes.
