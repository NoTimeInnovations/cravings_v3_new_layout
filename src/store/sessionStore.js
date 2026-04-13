import { create } from "zustand";
import { persist } from "zustand/middleware";

const uid = (p) =>
  `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// Simple random lat/lng jitter around a base Delhi coordinate (MVP stand-in
// for Google Maps / geolocation — replace with real APIs later).
const BASE = { lat: 28.6315, lng: 77.2167 };
export function randomNearbyCoords() {
  const jitter = () => (Math.random() - 0.5) * 0.08; // ~4km radius
  return { lat: BASE.lat + jitter(), lng: BASE.lng + jitter() };
}

// Haversine distance in km.
export function distanceKm(a, b) {
  if (!a || !b) return Infinity;
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export const useSessionStore = create(
  persist(
    (set, get) => ({
      hasOnboarded: false,
      orderType: null, // 'delivery' | 'takeaway'
      selectedOutletId: null,
      selectedAddressId: null,
      savedAddresses: [], // [{id, label, address, lat, lng}]

      setOrderType: (t) => set({ orderType: t }),
      selectOutlet: (id) => set({ selectedOutletId: id }),

      addAddress: (addr) => {
        const id = uid("addr");
        const entry = {
          id,
          label: addr.label || "Home",
          address: addr.address || "",
          ...(addr.lat != null ? { lat: addr.lat, lng: addr.lng } : randomNearbyCoords()),
        };
        set((s) => ({
          savedAddresses: [...s.savedAddresses, entry],
          selectedAddressId: id,
        }));
        return entry;
      },
      selectAddress: (id) => set({ selectedAddressId: id }),
      deleteAddress: (id) =>
        set((s) => ({
          savedAddresses: s.savedAddresses.filter((a) => a.id !== id),
          selectedAddressId:
            s.selectedAddressId === id ? null : s.selectedAddressId,
        })),

      completeOnboarding: () => set({ hasOnboarded: true }),
      resetOnboarding: () =>
        set({
          hasOnboarded: false,
          orderType: null,
          selectedOutletId: null,
          selectedAddressId: null,
        }),
    }),
    { name: "lgc-session" }
  )
);
