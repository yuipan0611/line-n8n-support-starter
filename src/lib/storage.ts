import { mockCustomer, seedOrders } from "./mock-data";
import type { Customer, Order, SupportRequest } from "./types";

const ordersKey = "fruit-liff-orders";
const customerKey = "fruit-liff-customer";
const supportRequestsKey = "fruit-liff-support-requests";

export function readOrders(): Order[] {
  if (typeof window === "undefined") return seedOrders;
  const raw = window.localStorage.getItem(ordersKey);
  if (!raw) {
    window.localStorage.setItem(ordersKey, JSON.stringify(seedOrders));
    return seedOrders;
  }
  try {
    return JSON.parse(raw) as Order[];
  } catch {
    return seedOrders;
  }
}

export function saveOrder(order: Order) {
  const orders = [order, ...readOrders().filter((item) => item.orderId !== order.orderId)];
  window.localStorage.setItem(ordersKey, JSON.stringify(orders));
}

export function readCustomer(): Customer {
  if (typeof window === "undefined") return mockCustomer;
  const raw = window.localStorage.getItem(customerKey);
  if (!raw) {
    window.localStorage.setItem(customerKey, JSON.stringify(mockCustomer));
    return mockCustomer;
  }
  try {
    return JSON.parse(raw) as Customer;
  } catch {
    return mockCustomer;
  }
}

export function saveCustomer(customer: Customer) {
  window.localStorage.setItem(customerKey, JSON.stringify(customer));
}

export function readSupportRequests(): SupportRequest[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(supportRequestsKey);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SupportRequest[];
  } catch {
    return [];
  }
}

export function readSupportRequest(requestId: string) {
  return readSupportRequests().find((item) => item.requestId === requestId);
}

export function saveSupportRequest(request: SupportRequest) {
  const requests = [
    request,
    ...readSupportRequests().filter((item) => item.requestId !== request.requestId),
  ];
  window.localStorage.setItem(supportRequestsKey, JSON.stringify(requests));
}
