import { NextResponse } from "next/server";
import { TAIWAN_TIME_ZONE, taiwanDateISO, taiwanDateTimeLabel } from "@/lib/format";
import type { SupportRequest } from "@/lib/types";

type SupportRequestPayload = SupportRequest & {
  liffUrl?: string;
  source?: "LIFF表單";
  timezone?: typeof TAIWAN_TIME_ZONE;
  createdAtLabel?: string;
  notification?: {
    lineGroupId?: string;
    mentionUserIds: string[];
    shouldMention: boolean;
    priorityLabel: SupportRequest["urgency"];
  };
};

const notionDatabaseId = process.env.NOTION_TICKETS_DATABASE_ID;
const notionLineGroupsDatabaseId = process.env.NOTION_LINE_GROUPS_DATABASE_ID;
const notionToken = process.env.NOTION_API_TOKEN || process.env.NOTION_API_KEY;
const supportWebhookUrl = process.env.N8N_SUPPORT_WEBHOOK_URL;
const supportLineGroupId = process.env.SUPPORT_LINE_GROUP_ID;
const urgentMentionUserIds = parseCsv(process.env.SUPPORT_URGENT_MENTION_USER_IDS);

export async function POST(request: Request) {
  const payload = (await request.json()) as SupportRequestPayload;
  const normalized = await normalizeSupportRequest(payload);

  const results = {
    n8n: await notifyN8n(normalized),
    notion: await createNotionTicket(normalized),
  };

  const ok = results.n8n.ok || results.notion.ok;

  return NextResponse.json({
    ok,
    requestId: normalized.requestId,
    results,
  }, { status: ok ? 200 : 503 });
}

async function normalizeSupportRequest(payload: SupportRequestPayload): Promise<SupportRequestPayload> {
  const lineGroupId = supportLineGroupId || (await findSupportLineGroupId());

  return {
    ...payload,
    source: "LIFF表單",
    status: payload.status || "新工單",
    createdAt: payload.createdAt || new Date().toISOString(),
    timezone: TAIWAN_TIME_ZONE,
    createdAtLabel: taiwanDateTimeLabel(payload.createdAt || new Date()),
    notification: {
      lineGroupId,
      mentionUserIds: payload.urgency === "急件" ? urgentMentionUserIds : [],
      shouldMention: payload.urgency === "急件" && urgentMentionUserIds.length > 0,
      priorityLabel: payload.urgency,
    },
  };
}

async function findSupportLineGroupId() {
  if (!notionLineGroupsDatabaseId || !notionToken) return undefined;

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${notionLineGroupsDatabaseId}/query`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${notionToken}`,
        "content-type": "application/json",
        "notion-version": "2022-06-28",
      },
      body: JSON.stringify({
        filter: {
          and: [
            { property: "狀態", status: { equals: "啟用" } },
            { property: "用途", multi_select: { contains: "工單通知" } },
          ],
        },
        page_size: 1,
      }),
    });

    if (!response.ok) return undefined;

    const data = (await response.json()) as {
      results?: Array<{
        properties?: {
          "Group ID"?: {
            rich_text?: Array<{ plain_text?: string }>;
          };
        };
      }>;
    };

    return data.results?.[0]?.properties?.["Group ID"]?.rich_text?.[0]?.plain_text || undefined;
  } catch {
    return undefined;
  }
}

async function notifyN8n(payload: SupportRequestPayload) {
  if (!supportWebhookUrl) return { ok: false, skipped: "N8N_SUPPORT_WEBHOOK_URL is not configured" };

  try {
    const response = await fetch(supportWebhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    return { ok: response.ok, status: response.status };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unknown n8n error" };
  }
}

async function createNotionTicket(payload: SupportRequestPayload) {
  if (!notionDatabaseId || !notionToken) {
    return { ok: false, skipped: "NOTION_TICKETS_DATABASE_ID or NOTION_API_TOKEN is not configured" };
  }

  try {
    const dueDate = payload.urgency === "一般" ? addDays(1) : today();
    const ticketStatus = payload.status || "新工單";
    const ticketCategory = mapTicketCategory(payload.topic);
    const priority = mapTicketPriority(payload.urgency);
    const titleText = `${payload.requestId}｜${payload.customerName}｜${ticketCategory}`;

    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        authorization: `Bearer ${notionToken}`,
        "content-type": "application/json",
        "notion-version": "2022-06-28",
      },
      body: JSON.stringify({
        parent: { database_id: notionDatabaseId },
        properties: {
          工單標題: title(titleText),
          工單編號: richText(payload.requestId),
          狀態: { status: { name: ticketStatus } },
          急迫度: { select: { name: payload.urgency } },
          優先級: { select: { name: priority } },
          類型: { select: { name: ticketCategory } },
          來源: { select: { name: "LIFF表單" } },
          "LINE User ID": richText(payload.lineUserId),
          "LINE Group ID": richText(payload.notification?.lineGroupId || ""),
          客戶名稱: richText(payload.customerName),
          聯絡人: richText(payload.contactPerson),
          電話: { phone_number: payload.phone || null },
          相關訂單: richText(payload.relatedOrderId),
          問題說明: richText(payload.message),
          目前進度: richText("等待負責人接單"),
          處理結果: richText(""),
          建立時間: { date: { start: payload.createdAt } },
          最後更新時間: { date: { start: payload.createdAt } },
          下一步: { select: { name: getNextStep(ticketStatus) } },
          到期日: { date: { start: dueDate } },
          完成通知: { checkbox: false },
        },
      }),
    });

    if (!response.ok) {
      return { ok: false, status: response.status, error: await response.text() };
    }

    const data = (await response.json()) as { id?: string; url?: string };
    return { ok: true, status: response.status, pageId: data.id, url: data.url };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unknown Notion error" };
  }
}

function title(content: string) {
  return { title: [{ text: { content } }] };
}

function richText(content: string) {
  return { rich_text: content ? [{ text: { content } }] : [] };
}

function today() {
  return taiwanDateISO();
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return taiwanDateISO(date);
}

function mapTicketCategory(topic: SupportRequest["topic"]) {
  const map: Record<SupportRequest["topic"], string> = {
    訂單問題: "訂單問題",
    商品報價: "商品問題",
    配送安排: "配送問題",
    帳款月結: "客服問題",
    其他: "客服問題",
  };

  return map[topic];
}

function mapTicketPriority(urgency: SupportRequest["urgency"]) {
  if (urgency === "急件") return "緊急";
  if (urgency === "今天需回覆") return "高";
  return "普通";
}

function getNextStep(status: SupportRequest["status"]) {
  const map: Record<SupportRequest["status"], string> = {
    新工單: "等待負責人接單",
    已受理: "等待開始處理",
    處理中: "處理中",
    待客戶確認: "等待客戶確認",
    已完成: "已結案",
  };

  return map[status];
}

function parseCsv(value?: string) {
  return value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}
