import { NextResponse } from "next/server";
import { taiwanDateTimeLabel } from "@/lib/format";

type LinePostbackEvent = {
  type?: string;
  replyToken?: string;
  source?: {
    type?: string;
    userId?: string;
    groupId?: string;
    roomId?: string;
  };
  postback?: {
    data?: string;
  };
};

type NotionRichText = {
  plain_text?: string;
};

type NotionPage = {
  id: string;
  url?: string;
  properties?: Record<string, NotionProperty>;
};

type NotionProperty = {
  title?: NotionRichText[];
  rich_text?: NotionRichText[];
  phone_number?: string | null;
  select?: { name?: string } | null;
  status?: { name?: string } | null;
  date?: { start?: string } | null;
};

const notionDatabaseId = process.env.NOTION_TICKETS_DATABASE_ID;
const notionToken = process.env.NOTION_API_TOKEN || process.env.NOTION_API_KEY;

const actionToStatus: Record<string, "已受理" | "處理中" | "待客戶確認" | "已完成"> = {
  accept: "已受理",
  start_processing: "處理中",
  resolve: "待客戶確認",
  complete: "已完成",
  reopen: "處理中",
};

const statusToNextStep: Record<string, string> = {
  新工單: "等待負責人接單",
  已受理: "等待開始處理",
  處理中: "處理中",
  待客戶確認: "等待客戶確認",
  已完成: "已結案",
};

export async function POST(request: Request) {
  if (!notionDatabaseId || !notionToken) {
    return NextResponse.json({ ok: false, error: "Notion env is not configured" }, { status: 500 });
  }

  const payload = await request.json();
  const event = normalizeEvent(payload);
  const params = parseQuery(event.postback?.data || "");

  if (event.type !== "postback" || params.source !== "line_ticket_flex") {
    return NextResponse.json({ ok: true, skipped: "Not a ticket postback" });
  }

  const issueId = params.issue_id;
  const action = params.action;
  const nextStatus = normalizeStatus(params.next_status) || actionToStatus[action];
  const groupId = event.source?.groupId || event.source?.roomId || "";

  if (!issueId || !action || !nextStatus || !groupId) {
    return NextResponse.json({ ok: false, error: "Missing ticket postback fields" }, { status: 400 });
  }

  const ticket = await findTicket(issueId);
  if (!ticket) {
    return NextResponse.json({ ok: false, error: "Ticket not found", issueId }, { status: 404 });
  }

  const properties = ticket.properties || {};
  const ticketGroupId = plainText(properties["LINE Group ID"]);

  if (ticketGroupId && ticketGroupId !== groupId) {
    return NextResponse.json({ ok: false, error: "LINE group does not match ticket", issueId }, { status: 403 });
  }

  const now = new Date().toISOString();
  const updated = await updateTicket(ticket.id, {
    action,
    nextStatus,
    now,
    userId: event.source?.userId || "",
  });

  if (!updated.ok) {
    return NextResponse.json(updated, { status: 502 });
  }

  const nextTicket = {
    issueId,
    status: nextStatus,
    category: selectName(properties["類型"]) || "客服問題",
    customerName: plainText(properties["客戶名稱"]) || "未填",
    contactPerson: plainText(properties["聯絡人"]) || "",
    phone: properties["電話"]?.phone_number || "",
    relatedOrderId: plainText(properties["相關訂單"]),
    description: plainText(properties["問題說明"]) || "未填",
    priority: selectName(properties["優先級"]) || selectName(properties["急迫度"]) || "普通",
    progressText: progressText(nextStatus),
    resultText: resultText(nextStatus),
    nowLabel: formatTime(now),
  };

  return NextResponse.json({
    ok: true,
    issueId,
    action,
    status: nextStatus,
    pageId: ticket.id,
    pageUrl: ticket.url,
    to: groupId,
    messages: [
      {
        type: "flex",
        altText: `${nextStatus} ${issueId}`,
        contents: buildStaffFlex(nextTicket),
      },
    ],
  });
}

function normalizeEvent(payload: unknown): LinePostbackEvent {
  if (typeof payload === "string") {
    try {
      return normalizeEvent(JSON.parse(payload));
    } catch {
      return {};
    }
  }

  if (isRecord(payload)) {
    if (typeof payload.body === "string") {
      try {
        return normalizeEvent({ ...payload, body: JSON.parse(payload.body) });
      } catch {
        // Keep falling through to the other supported shapes.
      }
    }

    if (isRecord(payload.event)) return payload.event as LinePostbackEvent;
    if (Array.isArray(payload.events)) return (payload.events[0] || {}) as LinePostbackEvent;
    if (isRecord(payload.body) && Array.isArray(payload.body.events)) {
      return (payload.body.events[0] || {}) as LinePostbackEvent;
    }
  }

  return {};
}

function parseQuery(value: string) {
  return value.split("&").reduce<Record<string, string>>((acc, pair) => {
    if (!pair) return acc;
    const [rawKey, ...rawValue] = pair.split("=");
    const key = safeDecode(rawKey);
    acc[key] = safeDecode(rawValue.join("="));
    return acc;
  }, {});
}

function safeDecode(value = "") {
  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return value;
  }
}

function normalizeStatus(value?: string) {
  return value && Object.values(actionToStatus).includes(value as never)
    ? (value as "已受理" | "處理中" | "待客戶確認" | "已完成")
    : undefined;
}

async function findTicket(issueId: string) {
  const response = await fetch(`https://api.notion.com/v1/databases/${notionDatabaseId}/query`, {
    method: "POST",
    headers: notionHeaders(),
    body: JSON.stringify({
      filter: { property: "工單編號", rich_text: { equals: issueId } },
      page_size: 1,
    }),
  });

  if (!response.ok) return undefined;

  const data = (await response.json()) as { results?: NotionPage[] };
  return data.results?.[0];
}

async function updateTicket(
  pageId: string,
  update: { action: string; nextStatus: string; now: string; userId: string },
) {
  const properties: Record<string, unknown> = {
    狀態: { status: { name: update.nextStatus } },
    下一步: { select: { name: statusToNextStep[update.nextStatus] || "處理中" } },
    目前進度: richText(progressText(update.nextStatus)),
    最後更新時間: { date: { start: update.now } },
  };

  if (update.userId) properties["負責人"] = richText(update.userId);
  if (update.action === "accept") properties["受理時間"] = { date: { start: update.now } };
  if (update.action === "start_processing" || update.action === "reopen") {
    properties["開始處理時間"] = { date: { start: update.now } };
  }
  if (update.action === "resolve") properties["待確認時間"] = { date: { start: update.now } };
  if (update.action === "complete") {
    properties["完成時間"] = { date: { start: update.now } };
    properties["完成通知"] = { checkbox: true };
  }

  const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: "PATCH",
    headers: notionHeaders(),
    body: JSON.stringify({ properties }),
  });

  if (!response.ok) {
    return { ok: false, status: response.status, error: await response.text() };
  }

  return { ok: true };
}

function buildStaffFlex(ticket: {
  issueId: string;
  status: string;
  category: string;
  customerName: string;
  contactPerson: string;
  phone: string;
  relatedOrderId: string;
  description: string;
  priority: string;
  progressText: string;
  resultText: string;
  nowLabel: string;
}) {
  const next = nextAction(ticket.status);

  return {
    type: "bubble",
    size: "mega",
    styles: {
      body: { backgroundColor: "#F6F4F0" },
      footer: { backgroundColor: "#FFFFFF" },
    },
    body: {
      type: "box",
      layout: "vertical",
      paddingAll: "20px",
      spacing: "md",
      contents: [
        {
          type: "box",
          layout: "vertical",
          spacing: "xs",
          contents: [
            flexText(titleByStatus(ticket.status), { size: "lg", weight: "bold", color: "#3E4448" }),
            flexText(`${ticket.status}・${ticket.issueId}`, { size: "xs", weight: "bold", color: "#6F7F8F" }),
          ],
        },
        {
          type: "box",
          layout: "vertical",
          margin: "lg",
          paddingAll: "14px",
          cornerRadius: "12px",
          backgroundColor: "#FFFFFF",
          borderColor: "#E0DED8",
          borderWidth: "1px",
          spacing: "sm",
          contents: [
            labelValue("類型", ticket.category),
            labelValue("客戶", ticket.customerName),
            labelValue("聯絡人", [ticket.contactPerson, ticket.phone].filter(Boolean).join(" ") || "未填"),
            ticket.relatedOrderId ? labelValue("相關訂單", ticket.relatedOrderId) : undefined,
            labelValue(ticket.status === "待客戶確認" || ticket.status === "已完成" ? "處理結果" : "目前進度", ticket.resultText),
            labelValue("更新時間", ticket.nowLabel),
          ].filter(Boolean),
        },
      ],
    },
    footer: next
      ? {
          type: "box",
          layout: "vertical",
          paddingAll: "16px",
          spacing: "sm",
          contents: [
            {
              type: "button",
              style: "primary",
              height: "sm",
              color: "#6F7F8F",
              action: {
                type: "postback",
                label: next.label,
                displayText: next.label,
                data: ticketActionData(ticket.issueId, next.action, next.nextStatus),
              },
            },
          ],
        }
      : undefined,
  };
}

function nextAction(status: string) {
  if (status === "已受理") return { label: "開始處理", action: "start_processing", nextStatus: "處理中" };
  if (status === "處理中") return { label: "已解決", action: "resolve", nextStatus: "待客戶確認" };
  if (status === "待客戶確認") return { label: "已完成", action: "complete", nextStatus: "已完成" };
  return undefined;
}

function ticketActionData(issueId: string, action: string, nextStatus: string) {
  return [
    ["source", "line_ticket_flex"],
    ["issue_id", issueId],
    ["action", action],
    ["next_status", nextStatus],
  ]
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
}

function titleByStatus(status: string) {
  const map: Record<string, string> = {
    已受理: "店家已受理",
    處理中: "正在處理中",
    待客戶確認: "已處理，請確認",
    已完成: "工單已完成",
  };

  return map[status] || "工單狀態更新";
}

function progressText(status: string) {
  const map: Record<string, string> = {
    已受理: "店家人員已接手處理，會協助確認後續狀況。",
    處理中: "負責人正在處理中。",
    待客戶確認: "問題已處理，等待客戶確認。",
    已完成: "工單已完成結案。",
  };

  return map[status] || "狀態已更新";
}

function resultText(status: string) {
  if (status === "待客戶確認") return "已完成初步處理，請確認是否仍需協助。";
  if (status === "已完成") return "感謝確認，這張工單已完成結案。";
  return progressText(status);
}

function labelValue(label: string, value: string) {
  return {
    type: "box",
    layout: "vertical",
    spacing: "xs",
    margin: "sm",
    contents: [
      flexText(label, { size: "xs", color: "#8A8A8A", weight: "bold" }),
      flexText(value || "未填", { size: "sm", weight: "bold", color: "#4A4A4A" }),
    ],
  };
}

function flexText(
  text: string,
  options: { size?: string; weight?: string; color?: string } = {},
) {
  return {
    type: "text",
    text,
    color: options.color || "#4A4A4A",
    size: options.size || "sm",
    weight: options.weight,
    wrap: true,
  };
}

function notionHeaders() {
  return {
    authorization: `Bearer ${notionToken}`,
    "content-type": "application/json",
    "notion-version": "2022-06-28",
  };
}

function plainText(property?: NotionProperty) {
  return property?.rich_text?.map((item) => item.plain_text || "").join("")
    || property?.title?.map((item) => item.plain_text || "").join("")
    || "";
}

function selectName(property?: NotionProperty) {
  return property?.select?.name || property?.status?.name || "";
}

function richText(content: string) {
  return { rich_text: content ? [{ text: { content } }] : [] };
}

function formatTime(value: string) {
  return taiwanDateTimeLabel(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
