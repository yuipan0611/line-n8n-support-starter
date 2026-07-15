import type { DeliveryRule } from "./types";

export function resolveDeliveryRule(address: string, deliveryRules: DeliveryRule[]) {
  const activeRules = deliveryRules
    .filter((rule) => rule.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const fallbackRule =
    deliveryRules.find((rule) => rule.id === "taichung-core") ?? deliveryRules[0];

  if (!fallbackRule) {
    throw new Error("No delivery rules available");
  }

  return (
    activeRules.find((rule) => rule.districts.some((district) => address.includes(district))) ??
    fallbackRule
  );
}

export function calculateDeliveryFee(subtotal: number, rule: DeliveryRule) {
  if (subtotal === 0) return 0;
  if (subtotal >= rule.freeShippingThreshold) return 0;
  return rule.deliveryFee;
}
