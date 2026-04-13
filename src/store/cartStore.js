import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useOrdersStore } from "./ordersStore";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: {}, // { [itemId]: { item, qty } }
      lastOrderId: null,

      addItem: (item) =>
        set((state) => {
          const existing = state.items[item.id];
          return {
            items: {
              ...state.items,
              [item.id]: {
                item,
                qty: existing ? existing.qty + 1 : 1,
              },
            },
          };
        }),

      removeItem: (itemId) =>
        set((state) => {
          const existing = state.items[itemId];
          if (!existing) return state;
          if (existing.qty <= 1) {
            const { [itemId]: _, ...rest } = state.items;
            return { items: rest };
          }
          return {
            items: {
              ...state.items,
              [itemId]: { ...existing, qty: existing.qty - 1 },
            },
          };
        }),

      clearCart: () => set({ items: {} }),

      placeOrder: (details) => {
        const items = Object.values(get().items);
        const subtotal = items.reduce(
          (s, e) => s + e.item.price * e.qty,
          0
        );
        const deliveryFee = subtotal > 0 ? 39 : 0;
        const taxes = Math.round(subtotal * 0.05);
        const total = subtotal + deliveryFee + taxes;
        const order = {
          id: "LGC" + Math.floor(100000 + Math.random() * 900000),
          items,
          subtotal,
          deliveryFee,
          taxes,
          total,
          details,
          placedAt: new Date().toISOString(),
          eta: 32,
        };
        useOrdersStore.getState().addOrder(order);
        set({ items: {}, lastOrderId: order.id });
        return order;
      },

      // selectors
      getCount: () =>
        Object.values(get().items).reduce((s, e) => s + e.qty, 0),
      getSubtotal: () =>
        Object.values(get().items).reduce(
          (s, e) => s + e.item.price * e.qty,
          0
        ),
    }),
    { name: "lgc-cart" }
  )
);
