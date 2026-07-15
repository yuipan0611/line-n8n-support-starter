# n8n workflows

Import each JSON via n8n → *Workflows* → *Import from file*. Full walkthrough: [docs/setup-n8n.md](../docs/setup-n8n.md).

## Full workflows

| File | Workflow | Trigger | What it does |
|---|---|---|---|
| `a-line-ai-agent.json` | **A** | LINE Messaging API webhook | 1:1 AI replies from the Notion knowledge base; group messages pass a whitelist + @-mention gate |
| `b-liff-support-ticket.json` | **B** | Webhook from `/api/support-request` | Creates a Notion ticket, pushes a Flex card to the work group |
| `c1-products-sync.json` | **C1** | Daily schedule + manual | Products draft → live gatekeeper sync |
| `c2-knowledge-sync.json` | **C2** | Daily schedule + manual | Knowledge/FAQ draft → live gatekeeper sync |
| `c3-delivery-sync.json` | **C3** | Daily schedule + manual | Delivery-rules draft → live gatekeeper sync |

## Branch templates (`branches/`)

Standalone pieces you can merge into A/B or run alone:

| File | Purpose |
|---|---|
| `n8n-error-alert-workflow.template.json` | Error Trigger → LINE push, so failed executions ping you ([guide](../docs/n8n-error-alert-branch.md)) |
| `n8n-line-group-registry-branch.template.json` | Auto-registers any group the bot joins into the Notion group registry (as disabled, pending manual approval) |
| `n8n-group-todo-branch.template.json` | @-mention todo query in a group → Notion lookup → reply |
| `n8n-liff-support-line-push-branch.template.json` | Builds the group notification message (with @-mention) for new tickets |

## Credentials to create

| Credential | n8n type | Used by |
|---|---|---|
| LINE Messaging API | Header Auth (`Authorization: Bearer <channel access token>`) | A, B, branches |
| Notion | Notion API | A, B, C1–C3, branches |
| LLM provider | e.g. OpenAI API | A |

## Placeholders

After importing, search each workflow for `REPLACE_WITH` and fill in your values:

| Placeholder | Where to find your value |
|---|---|
| `REPLACE_WITH_YOUR_CREDENTIAL_ID` | re-select the credential you created above in each node |
| `C_REPLACE_WITH_YOUR_WORK_GROUP_ID` | your LINE work group ID (`C` + 32 hex) — see [docs/setup-line.md](../docs/setup-line.md#5-group-setup-for-ticketing) |
| `U_REPLACE_WITH_ALLOWED_USER_ID_1` | LINE user IDs allowed to trigger the bot in groups |
| `REPLACE_WITH_*_DB_ID` | the matching Notion database ID (see [`notion/README.md`](../notion/README.md)) |
| `https://your-workspace.app.n8n.cloud` | your n8n instance URL (auto-correct after import) |
| `https://your-app.vercel.app` | your deployed app URL (used by A to call `/api/ticket-postback`) |

Branch templates additionally use `$env.NOTION_LINE_GROUPS_DATABASE_ID` — define it as an [n8n environment variable](https://docs.n8n.io/hosting/configuration/environment-variables/) or paste the literal ID.

Never re-export a workflow with real IDs, credentials, or pinned execution data — run `npm run check:leaks` before committing.
