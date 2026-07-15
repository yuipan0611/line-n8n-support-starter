# n8n workflows

Import each JSON via n8n → *Workflows* → *Import from file*. Full walkthrough: [docs/setup-n8n.md](../docs/setup-n8n.md).

## Full workflows

| File | Workflow | Trigger | What it does |
|---|---|---|---|
| `a-line-ai-agent.json` *(coming in v0.1.0)* | **A** | LINE Messaging API webhook | 1:1 AI replies from the Notion knowledge base; group messages pass a whitelist + @-mention gate |
| `b-liff-support-ticket.json` *(coming in v0.1.0)* | **B** | Webhook from `/api/support-request` | Creates a Notion ticket, pushes a Flex card to the work group |
| `c1-products-sync.json` *(coming in v0.1.0)* | **C1** | Daily schedule + manual | Products draft → live gatekeeper sync |
| `c2-knowledge-sync.json` *(coming in v0.1.0)* | **C2** | Daily schedule + manual | Knowledge/FAQ draft → live gatekeeper sync |
| `c3-delivery-sync.json` *(coming in v0.1.0)* | **C3** | Daily schedule + manual | Delivery-rules draft → live gatekeeper sync |

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

Exports reference environment-style placeholders such as `$env.NOTION_LINE_GROUPS_DATABASE_ID`. Either define these as [n8n environment variables](https://docs.n8n.io/hosting/configuration/environment-variables/), or paste your literal database ID into the node. Never re-export a workflow with real IDs or credentials — run `npm run check:leaks` before committing.
