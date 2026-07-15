export function currency(value: number) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(value);
}

export const TAIWAN_TIME_ZONE = "Asia/Taipei";

export function dateLabel(value: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    timeZone: TAIWAN_TIME_ZONE,
  }).format(new Date(value));
}

export function taiwanDateTimeLabel(value: string | Date) {
  return new Intl.DateTimeFormat("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TAIWAN_TIME_ZONE,
  }).format(new Date(value));
}

export function taiwanDateISO(value: string | Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: TAIWAN_TIME_ZONE,
  }).formatToParts(new Date(value));

  const get = (type: string) => parts.find((part) => part.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function taiwanDateParts(value: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: TAIWAN_TIME_ZONE,
  }).formatToParts(value);
  const get = (type: string) => parts.find((part) => part.type === type)?.value || "";
  return {
    y: get("year"),
    m: get("month"),
    d: get("day"),
  };
}

export function orderId() {
  const now = new Date();
  const { y, m, d } = taiwanDateParts(now);
  const n = String(Math.floor(Math.random() * 900) + 100);
  return `FG${y}${m}${d}${n}`;
}

export function supportRequestId() {
  const now = new Date();
  const { y, m, d } = taiwanDateParts(now);
  const n = String(Math.floor(Math.random() * 900) + 100);
  return `SR${y}${m}${d}${n}`;
}
