#!/usr/bin/env node

const STATUS = {
  new: {
    label: "新工單",
    title: "工單已送出",
    color: "#F4E9DA",
    accent: "#A27C56",
    nextLabel: "我收到工單",
    nextAction: "accept",
  },
  accepted: {
    label: "已受理",
    title: "店家已受理",
    color: "#F4E9DA",
    accent: "#A27C56",
    nextLabel: "開始處理",
    nextAction: "start_processing",
  },
  processing: {
    label: "處理中",
    title: "正在處理中",
    color: "#F4E9DA",
    accent: "#A27C56",
    nextLabel: "已解決",
    nextAction: "resolve",
  },
  pending_confirmation: {
    label: "待客戶確認",
    title: "已處理，請確認",
    color: "#F4E9DA",
    accent: "#A27C56",
  },
  completed: {
    label: "已完成",
    title: "工單已完成",
    color: "#E6E3DD",
    accent: "#777777",
  },
};

const CATEGORY = {
  商品問題: "商品",
  配送問題: "配送",
  退款問題: "退款",
  客服問題: "客服",
  系統問題: "系統",
  訂單問題: "訂單",
  建議事項: "建議",
};

const sampleTicket = {
  issueId: "#00031",
  category: "配送問題",
  customerName: "王先生",
  description: "芒果禮盒尚未收到。",
  priority: "緊急",
  createdAtLabel: "07/01 09:20",
  assigneeName: "店長 小明",
  acceptedAtLabel: "10:35",
  progressText: "已聯絡物流公司",
  resolution: "重新配送一箱",
  deliveryTimeLabel: "14:30",
  finishedAtLabel: "15:40",
  elapsedLabel: "6小時20分",
};

const STATUS_ORDER = ["new", "accepted", "processing", "pending_confirmation", "completed"];
const CUSTOMER_STEP_LABELS = {
  new: "送出",
  accepted: "已受理",
  processing: "處理中",
  pending_confirmation: "待確認",
  completed: "完成",
};

const CUSTOMER_THEME = {
  color: "#F4E9DA",
  accent: "#A27C56",
  soft: "#FBF7F1",
  text: "#4A4038",
};

const STAFF_THEME = {
  color: "#E8EEF2",
  accent: "#6F7F8F",
  text: "#3E4448",
};

function text(textValue, options = {}) {
  return {
    type: "text",
    text: String(textValue || "未填"),
    color: options.color || "#4A4A4A",
    size: options.size || "sm",
    weight: options.weight,
    wrap: options.wrap ?? true,
    flex: options.flex,
    margin: options.margin,
    align: options.align,
  };
}

function labelValue(label, value, options = {}) {
  return {
    type: "box",
    layout: "vertical",
    spacing: "xs",
    margin: options.margin || "md",
    contents: [
      text(label, { size: "xs", color: "#8A8A8A", weight: "bold" }),
      text(value, { size: options.valueSize || "sm", weight: "bold", color: "#4A4A4A" }),
    ],
  };
}

function divider() {
  return {
    type: "separator",
    margin: "lg",
    color: "#E8E1D8",
  };
}

function postbackButton(label, data, options = {}) {
  return {
    type: "button",
    style: options.style || "primary",
    height: "sm",
    color: options.color || "#4A4A4A",
    margin: options.margin || "lg",
    action: {
      type: "postback",
      label,
      data,
      displayText: options.displayText || label.replace(/^[^\s]+ /, ""),
    },
  };
}

function ticketActionData(ticket, action, nextStatus) {
  const params = new URLSearchParams({
    source: "line_ticket_flex",
    issue_id: ticket.issueId,
    action,
  });
  if (nextStatus) params.set("next_status", nextStatus);
  return params.toString();
}

function customerActionData(ticket, action, nextStatus) {
  const params = new URLSearchParams({
    source: "line_ticket_customer_flex",
    issue_id: ticket.issueId,
    action,
  });
  if (nextStatus) params.set("next_status", nextStatus);
  return params.toString();
}

function baseBubble(ticket, statusKey, bodyContents, footerContents = []) {
  const status = STATUS[statusKey];
  const theme = STAFF_THEME;

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
            text(status.title, { size: "lg", weight: "bold", color: theme.text }),
            text(`${status.label}・${ticket.issueId}`, { size: "xs", weight: "bold", color: theme.accent }),
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
          contents: bodyContents,
        },
      ],
    },
    footer: footerContents.length
      ? {
          type: "box",
          layout: "vertical",
          paddingAll: "16px",
          spacing: "sm",
          contents: footerContents,
        }
      : undefined,
  };
}

function infoPanel(contents) {
  return {
    type: "box",
    layout: "vertical",
    margin: "lg",
    paddingAll: "14px",
    cornerRadius: "12px",
    backgroundColor: "#FFFFFF",
    borderColor: "#E8E1D8",
    borderWidth: "1px",
    spacing: "sm",
    contents,
  };
}

function progressDot({ color, isCurrent, isPending }) {
  const size = isCurrent ? "15px" : "9px";
  return {
    type: "box",
    layout: "vertical",
    width: size,
    height: size,
    cornerRadius: "999px",
    backgroundColor: isCurrent ? "#FFFFFF" : color,
    borderColor: isCurrent ? color : isPending ? "#E7E2DA" : color,
    borderWidth: isCurrent ? "2px" : "0px",
    contents: [],
  };
}

function dashedConnector(color) {
  return {
    type: "box",
    layout: "horizontal",
    spacing: "sm",
    height: "18px",
    contents: [
      {
        type: "box",
        layout: "vertical",
        width: "18px",
        alignItems: "center",
        spacing: "xs",
        contents: Array.from({ length: 3 }, () => ({
          type: "box",
          layout: "vertical",
          width: "2px",
          height: "4px",
          cornerRadius: "999px",
          backgroundColor: color,
          contents: [],
        })),
      },
      {
        type: "box",
        layout: "vertical",
        flex: 1,
        contents: [],
      },
    ],
  };
}

function buildProgressTrack(statusKey) {
  const currentIndex = STATUS_ORDER.indexOf(statusKey);
  const currentStatus = STATUS[statusKey] || STATUS.new;

  return {
    type: "box",
    layout: "vertical",
    margin: "lg",
    paddingTop: "14px",
    paddingBottom: "14px",
    paddingStart: "12px",
    paddingEnd: "12px",
    cornerRadius: "12px",
    backgroundColor: "#FFFFFF",
    borderColor: "#E8E1D8",
    borderWidth: "1px",
    spacing: "none",
    contents: STATUS_ORDER.flatMap((key, index) => {
      const isDone = index < currentIndex;
      const isCurrent = index === currentIndex;
      const nodeColor = isDone || isCurrent ? currentStatus.accent : "#E7E2DA";
      const textColor = isCurrent ? currentStatus.accent : isDone ? "#5F5A55" : "#8A8A8A";

      const row = {
        type: "box",
        layout: "horizontal",
        spacing: "sm",
        alignItems: "center",
        contents: [
          progressDot({ color: nodeColor, isCurrent, isPending: !isDone && !isCurrent }),
          text(CUSTOMER_STEP_LABELS[key], {
            size: "xs",
            weight: isCurrent ? "bold" : undefined,
            color: textColor,
            flex: 1,
            wrap: false,
          }),
          text(isCurrent ? "目前" : isDone ? "完成" : "等待", {
            size: "xxs",
            weight: isCurrent ? "bold" : undefined,
            color: textColor,
            align: "end",
            wrap: false,
          }),
        ],
      };

      if (index === STATUS_ORDER.length - 1) return [row];

      return [
        row,
        dashedConnector(index < currentIndex ? currentStatus.accent : "#E8E1D8"),
      ];
    }),
  };
}

function getCustomerStatusCopy(ticket, statusKey) {
  const map = {
    new: {
      headline: "我們已收到您的工單",
      body: "店家會盡快確認內容，接手後會更新進度。",
    },
    accepted: {
      headline: "店家已受理",
      body: `${ticket.assigneeName || "店家人員"} 已接手處理，會協助確認後續狀況。`,
    },
    processing: {
      headline: "正在處理中",
      body: ticket.progressText || "店家正在確認問題，請稍候通知。",
    },
    pending_confirmation: {
      headline: "已處理，請確認",
      body: ticket.resolution || "店家已完成處理，請確認問題是否已解決。",
    },
    completed: {
      headline: "工單已完成",
      body: "感謝您的確認，這筆工單已完成結案。",
    },
  };

  return map[statusKey] || map.new;
}

function buildCustomerProgressBubble(ticket, statusKey) {
  const status = STATUS[statusKey] || STATUS.new;
  const copy = getCustomerStatusCopy(ticket, statusKey);
  const bodyContents = [
    buildProgressTrack(statusKey),
    infoPanel([
        labelValue("工單", ticket.issueId, { margin: "none" }),
        labelValue("問題", ticket.category),
        labelValue("目前進度", copy.body, { valueSize: "md" }),
        ...(statusKey === "pending_confirmation" && ticket.deliveryTimeLabel
          ? [labelValue("預計/安排時間", ticket.deliveryTimeLabel)]
          : []),
        ...(statusKey === "completed" ? [labelValue("完成時間", ticket.finishedAtLabel), labelValue("總耗時", ticket.elapsedLabel)] : []),
      ]),
  ];

  const footerContents =
    statusKey === "pending_confirmation"
      ? [
          postbackButton("已解決", customerActionData(ticket, "customer_confirm", "已完成"), {
            color: CUSTOMER_THEME.accent,
            displayText: "已解決",
          }),
          postbackButton("還需要協助", customerActionData(ticket, "customer_needs_help", "處理中"), {
            style: "secondary",
            color: "#FFFFFF",
            displayText: "還需要協助",
          }),
        ]
      : [];

  return {
    type: "bubble",
    size: "mega",
    styles: {
      body: { backgroundColor: "#F8F5F0" },
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
            text(copy.headline, { size: "lg", weight: "bold", color: CUSTOMER_THEME.text }),
            text(`${status.label}・${ticket.issueId}`, { size: "xs", weight: "bold", color: status.accent }),
          ],
        },
        ...bodyContents,
      ],
    },
    footer: footerContents.length
      ? {
          type: "box",
          layout: "vertical",
          paddingAll: "16px",
          spacing: "sm",
          contents: footerContents,
        }
      : undefined,
  };
}

function buildNewTicketBubble(ticket) {
  return baseBubble(
    ticket,
    "new",
    [
      labelValue("類型", `${CATEGORY[ticket.category] || ""} ${ticket.category}`.trim()),
      labelValue("客戶", ticket.customerName),
      labelValue("內容", ticket.description, { valueSize: "md" }),
      labelValue("優先", ticket.priority),
      labelValue("建立", ticket.createdAtLabel),
      divider(),
      text("請由群組負責人點擊下方按鈕接手。", { size: "xs", color: "#8A8A8A" }),
    ],
    [
      postbackButton("我收到工單", ticketActionData(ticket, "accept", "已受理"), {
        color: STAFF_THEME.accent,
        displayText: "我收到工單",
      }),
    ],
  );
}

function buildAcceptedBubble(ticket) {
  return baseBubble(
    ticket,
    "accepted",
    [
      labelValue("工單", ticket.issueId),
      labelValue("負責人", ticket.assigneeName),
      labelValue("受理時間", ticket.acceptedAtLabel),
      labelValue("目前狀態", "已受理"),
      divider(),
      text("準備進入實際處理階段。", { size: "xs", color: "#8A8A8A" }),
    ],
    [
      postbackButton("開始處理", ticketActionData(ticket, "start_processing", "處理中"), {
        color: STAFF_THEME.accent,
        displayText: "開始處理",
      }),
    ],
  );
}

function buildProcessingBubble(ticket) {
  return baseBubble(
    ticket,
    "processing",
    [
      labelValue("工單", ticket.issueId),
      labelValue("負責人", ticket.assigneeName),
      labelValue("目前進度", ticket.progressText, { valueSize: "md" }),
      divider(),
      text("問題處理完成後，請點擊已解決送客戶確認。", { size: "xs", color: "#8A8A8A" }),
    ],
    [
      postbackButton("已解決", ticketActionData(ticket, "resolve", "待客戶確認"), {
        color: STAFF_THEME.accent,
        displayText: "已解決",
      }),
    ],
  );
}

function buildPendingConfirmationBubble(ticket) {
  return baseBubble(
    ticket,
    "pending_confirmation",
    [
      labelValue("處理結果", ticket.resolution, { valueSize: "md" }),
      labelValue("配送時間", ticket.deliveryTimeLabel),
      divider(),
      text("請確認問題是否已解決。", { size: "xs", color: "#8A8A8A" }),
    ],
    [
      postbackButton("已收到", ticketActionData(ticket, "complete", "已完成"), {
        color: STAFF_THEME.accent,
        displayText: "已收到",
      }),
      postbackButton("尚未解決", ticketActionData(ticket, "reopen", "處理中"), {
        style: "secondary",
        color: "#FFFFFF",
        displayText: "尚未解決",
      }),
    ],
  );
}

function buildCompletedBubble(ticket) {
  return baseBubble(ticket, "completed", [
    labelValue("工單", ticket.issueId),
    labelValue("建立", ticket.createdAtLabel),
    labelValue("完成", ticket.finishedAtLabel),
    labelValue("總耗時", ticket.elapsedLabel, { valueSize: "md" }),
    divider(),
    text("感謝您的確認。", { size: "sm", weight: "bold", color: "#4A4A4A" }),
  ]);
}

function buildTicketFlexMessage(ticket, statusKey) {
  const builders = {
    new: buildNewTicketBubble,
    accepted: buildAcceptedBubble,
    processing: buildProcessingBubble,
    pending_confirmation: buildPendingConfirmationBubble,
    completed: buildCompletedBubble,
  };
  const build = builders[statusKey] || builders.new;
  const status = STATUS[statusKey] || STATUS.new;

  return {
    type: "flex",
    altText: `${status.label} ${ticket.issueId} ${ticket.description}`,
    contents: build(ticket),
  };
}

function buildCustomerTicketFlexMessage(ticket, statusKey) {
  const status = STATUS[statusKey] || STATUS.new;

  return {
    type: "flex",
    altText: `工單進度 ${status.label} ${ticket.issueId}`,
    contents: buildCustomerProgressBubble(ticket, statusKey),
  };
}

function buildAllTicketFlexMessages(ticket = sampleTicket) {
  return {
    new: buildTicketFlexMessage(ticket, "new"),
    accepted: buildTicketFlexMessage(ticket, "accepted"),
    processing: buildTicketFlexMessage(ticket, "processing"),
    pending_confirmation: buildTicketFlexMessage(ticket, "pending_confirmation"),
    completed: buildTicketFlexMessage(ticket, "completed"),
  };
}

function buildAllCustomerTicketFlexMessages(ticket = sampleTicket) {
  return {
    new: buildCustomerTicketFlexMessage(ticket, "new"),
    accepted: buildCustomerTicketFlexMessage(ticket, "accepted"),
    processing: buildCustomerTicketFlexMessage(ticket, "processing"),
    pending_confirmation: buildCustomerTicketFlexMessage(ticket, "pending_confirmation"),
    completed: buildCustomerTicketFlexMessage(ticket, "completed"),
  };
}

if (require.main === module) {
  const audience = process.argv.includes("--customer") ? "customer" : "staff";
  const statusKey = process.argv.filter((arg) => !arg.startsWith("--"))[2] || "all";
  const payload =
    audience === "customer"
      ? statusKey === "all"
        ? buildAllCustomerTicketFlexMessages()
        : buildCustomerTicketFlexMessage(sampleTicket, statusKey)
      : statusKey === "all"
        ? buildAllTicketFlexMessages()
        : buildTicketFlexMessage(sampleTicket, statusKey);
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
}

module.exports = {
  buildAllTicketFlexMessages,
  buildAllCustomerTicketFlexMessages,
  buildCustomerTicketFlexMessage,
  buildTicketFlexMessage,
  sampleTicket,
};
