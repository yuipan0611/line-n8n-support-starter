# Notion databases

The kit uses eight databases — three customer-editable **draft** databases, their three system-only **live** counterparts, plus **tickets** and a **LINE group registry**.

Fastest setup: duplicate the public template (see [TEMPLATE.md](TEMPLATE.md)), share the page with your integration, and copy the database IDs into `.env.local`.

Building by hand instead: follow the schema docs exactly — the n8n sync workflows validate against these field names, types, and select options:

| Doc | Databases |
|---|---|
| [schemas/products.md](schemas/products.md) | 商品編輯庫 / 商品正式庫 |
| [schemas/knowledge.md](schemas/knowledge.md) | 知識庫編輯庫 / 知識庫正式庫 |
| [schemas/delivery-rules.md](schemas/delivery-rules.md) | 配送規則編輯庫 / 配送規則正式庫 |
| [schemas/tickets.md](schemas/tickets.md) | LINE 工單待辦 |
| [schemas/line-groups.md](schemas/line-groups.md) | LINE 群組登錄 |

Why draft/live pairs exist, who gets shared what, and how the sync guards data quality: [docs/architecture.md](../docs/architecture.md#two-layer-notion-database-design) and the full Chinese design doc [docs/two-layer-database-architecture.zh-TW.md](../docs/two-layer-database-architecture.zh-TW.md).
