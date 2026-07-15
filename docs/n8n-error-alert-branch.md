# n8n Error Alert Branch

Use this so Demo Fruit Shop LINE 客服助手 failures notify you immediately instead of silently dying in Executions.

Recommended setup: create a separate n8n workflow with an **Error Trigger** node. That catches failures from active workflows without needing to wire every node manually.

## Importable Template

Import `docs/n8n-error-alert-workflow.template.json` into n8n, then edit:

- `LINE_PUSH_USER_ID_OR_GROUP_ID`
- The LINE credential on the HTTP Request node
- Optional Notion/Slack/Email nodes if you want more destinations

After import, set this workflow as the error workflow for the customer-service workflow.

## Manual Paste Version

Create these nodes:

1. **Error Trigger**
2. **Code** node named `Build LINE alert`
3. **HTTP Request** node named `Push LINE alert`

Paste this into the Code node:

```js
const execution = $json.execution || {};
const workflow = $json.workflow || {};
const lastNode = execution.lastNodeExecuted || "unknown node";
const error = execution.error || {};
const message = error.message || $json.message || "Unknown n8n error";
const executionUrl = execution.url || "Open n8n Executions";

return [
  {
    json: {
      to: "LINE_PUSH_USER_ID_OR_GROUP_ID",
      messages: [
        {
          type: "text",
          text: [
            "Demo Fruit Shop LINE 客服助手失敗通知",
            `Workflow: ${workflow.name || workflow.id || "unknown"}`,
            `Node: ${lastNode}`,
            `Error: ${message}`,
            `Execution: ${executionUrl}`,
          ].join("\n"),
        },
      ],
    },
  },
];
```

Configure the HTTP Request node:

```text
Method: POST
URL: https://api.line.me/v2/bot/message/push
Authentication: predefined credential or generic bearer token
Header: Content-Type = application/json
Body: JSON = {{$json}}
```

Use the same Messaging API Channel Access Token credential that belongs to the Official Account you monitor.

## Existing Workflow Branch

For nodes that support an error output, add:

```text
Problem node error output -> Build LINE alert -> Push LINE alert
```

Use this branch on high-risk nodes:

- Notion database query/update
- OpenAI or AI Agent node
- LINE reply API HTTP Request
- Any Code node that parses AI output

Keep the global Error Trigger workflow enabled even if you add per-node branches. The global workflow is the catch-all; branches are for richer local context.
