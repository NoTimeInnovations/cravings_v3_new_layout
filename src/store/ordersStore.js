import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ChefHat, Bike, Package, CheckCircle2, XCircle, Clock } from "lucide-react";

export const ORDER_STATUSES = [
  {
    id: "placed",
    label: "Order Placed",
    desc: "We've received your order",
    icon: Clock,
    color: "amber",
  },
  {
    id: "preparing",
    label: "Preparing",
    desc: "Chef is cooking your meal",
    icon: ChefHat,
    color: "orange",
  },
  {
    id: "out_for_delivery",
    label: "Out for Delivery",
    desc: "Rider is on the way",
    icon: Bike,
    color: "blue",
  },
  {
    id: "delivered",
    label: "Delivered",
    desc: "Enjoy your meal!",
    icon: CheckCircle2,
    color: "emerald",
  },
];

export const STATUS_BY_ID = Object.fromEntries(
  ORDER_STATUSES.map((s) => [s.id, s])
);

export const CANCELLED_STATUS = {
  id: "cancelled",
  label: "Cancelled",
  desc: "Your order was cancelled",
  icon: XCircle,
  color: "red",
};

export function statusIndex(id) {
  return ORDER_STATUSES.findIndex((s) => s.id === id);
}

export const useOrdersStore = create(
  persist(
    (set, get) => ({
      orders: [],

      addOrder: (order) =>
        set((s) => ({
          orders: [
            { ...order, status: "placed", updatedAt: new Date().toISOString() },
            ...s.orders,
          ],
        })),

      updateStatus: (id, status) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id
              ? { ...o, status, updatedAt: new Date().toISOString() }
              : o
          ),
        })),

      cancelOrder: (id) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id
              ? { ...o, status: "cancelled", updatedAt: new Date().toISOString() }
              : o
          ),
        })),

      deleteOrder: (id) =>
        set((s) => ({ orders: s.orders.filter((o) => o.id !== id) })),

      getOrder: (id) => get().orders.find((o) => o.id === id),
    }),
    { name: "lgc-orders" }
  )
);
