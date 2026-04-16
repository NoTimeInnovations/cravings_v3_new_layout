import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  restaurant as seedRestaurant,
  categories as seedCategories,
  menu as seedMenu,
} from "@/data/menu";

const uid = (prefix) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// 10 premium brand color palettes — HSL values for --primary, --primary-foreground, --ring
export const BRAND_COLORS = [
  { id: "burnt-orange",    name: "Burnt Orange",    hex: "#e85d04", primary: "16 100% 50%",   ring: "16 100% 50%",   foreground: "60 9.1% 97.8%" },
  { id: "obsidian-gold",   name: "Obsidian Gold",   hex: "#b8860b", primary: "38 85% 38%",    ring: "38 85% 38%",    foreground: "60 9.1% 97.8%" },
  { id: "royal-burgundy",  name: "Royal Burgundy",  hex: "#8b1a4a", primary: "335 70% 33%",   ring: "335 70% 33%",   foreground: "60 9.1% 97.8%" },
  { id: "midnight-emerald",name: "Midnight Emerald",hex: "#0d6b4e", primary: "160 78% 24%",   ring: "160 78% 24%",   foreground: "60 9.1% 97.8%" },
  { id: "sapphire",        name: "Sapphire",        hex: "#1e4db7", primary: "222 72% 42%",   ring: "222 72% 42%",   foreground: "60 9.1% 97.8%" },
  { id: "charcoal-noir",   name: "Charcoal Noir",   hex: "#2c2c2c", primary: "0 0% 17%",      ring: "0 0% 17%",      foreground: "60 9.1% 97.8%" },
  { id: "deep-violet",     name: "Deep Violet",     hex: "#6b21a8", primary: "272 68% 40%",   ring: "272 68% 40%",   foreground: "60 9.1% 97.8%" },
  { id: "rose-blush",      name: "Rose Blush",      hex: "#be185d", primary: "338 76% 42%",   ring: "338 76% 42%",   foreground: "60 9.1% 97.8%" },
  { id: "teal-luxe",       name: "Teal Luxe",       hex: "#0f766e", primary: "176 78% 26%",   ring: "176 78% 26%",   foreground: "60 9.1% 97.8%" },
  { id: "warm-copper",     name: "Warm Copper",     hex: "#b45309", primary: "28 88% 37%",    ring: "28 88% 37%",    foreground: "60 9.1% 97.8%" },
];

export const GRADIENTS = [
  "from-amber-200 via-orange-200 to-rose-200",
  "from-yellow-200 via-amber-200 to-orange-300",
  "from-rose-200 via-pink-200 to-red-200",
  "from-red-300 via-orange-300 to-amber-200",
  "from-yellow-300 via-lime-200 to-green-200",
  "from-orange-300 via-rose-300 to-red-300",
  "from-red-200 via-orange-200 to-yellow-200",
  "from-green-200 via-emerald-200 to-lime-200",
  "from-amber-100 via-yellow-200 to-orange-200",
  "from-orange-300 via-red-300 to-rose-400",
  "from-lime-200 via-green-200 to-emerald-300",
  "from-emerald-200 via-teal-200 to-cyan-200",
  "from-stone-200 via-amber-200 to-yellow-200",
  "from-amber-200 via-stone-200 to-yellow-200",
  "from-pink-200 via-rose-200 to-red-200",
  "from-stone-300 via-amber-200 to-yellow-100",
  "from-sky-200 via-blue-200 to-indigo-200",
  "from-violet-200 via-purple-200 to-fuchsia-200",
];

const seedOutlets = [
  {
    id: "outlet-cp",
    name: "Connaught Place",
    place: "12, Park Street, Connaught Place, New Delhi",
    phone: "+91 98765 43210",
    lat: 28.6315,
    lng: 77.2167,
  },
  {
    id: "outlet-saket",
    name: "Saket",
    place: "Select Citywalk, Saket, New Delhi",
    phone: "+91 98765 11122",
    lat: 28.5286,
    lng: 77.2197,
  },
  {
    id: "outlet-gk",
    name: "Greater Kailash",
    place: "M-Block Market, GK-1, New Delhi",
    phone: "+91 98765 33344",
    lat: 28.5494,
    lng: 77.2425,
  },
];

// Seed items get availability[outletId]=true for every seed outlet.
const defaultAvailability = (outletIds) =>
  Object.fromEntries(outletIds.map((id) => [id, true]));

const seedMenuWithAvailability = seedMenu.map((it) => ({
  ...it,
  availability: defaultAvailability(seedOutlets.map((o) => o.id)),
}));

export const useMenuStore = create(
  persist(
    (set) => ({
      restaurant: seedRestaurant,
      categories: seedCategories,
      items: seedMenuWithAvailability,
      outlets: seedOutlets,
      menuLayout: 1, // 1 = detailed list, 2 = compact grid, 3 = photo grid
      brandColor: "burnt-orange", // id from BRAND_COLORS
      banners: [
        // type: 'offer' | 'announcement'
        // offers: { id, type:'offer', name, description, code, validDays }
        // announcements: { id, type:'announcement', name, description }
      ],

      // Layout & Brand Color
      setMenuLayout: (layout) => set({ menuLayout: layout }),
      setBrandColor: (colorId) => set({ brandColor: colorId }),

      // Banners
      addBanner: (banner) =>
        set((s) => ({
          banners: [
            ...s.banners,
            {
              id: uid("ban"),
              type: "offer",
              name: "",
              description: "",
              code: "",
              validDays: 7,
              active: true,
              createdAt: Date.now(),
              ...banner,
            },
          ],
        })),
      updateBanner: (id, patch) =>
        set((s) => ({
          banners: s.banners.map((b) => (b.id === id ? { ...b, ...patch } : b)),
        })),
      deleteBanner: (id) =>
        set((s) => ({ banners: s.banners.filter((b) => b.id !== id) })),

      // Restaurant
      updateRestaurant: (patch) =>
        set((s) => ({ restaurant: { ...s.restaurant, ...patch } })),

      // Outlets
      addOutlet: (outlet) =>
        set((s) => {
          const id = uid("outlet");
          const newOutlet = {
            id,
            name: "New Outlet",
            place: "",
            phone: "",
            ...outlet,
            // Random nearby coords if not provided — MVP stub for maps.
            lat:
              outlet?.lat ??
              28.6315 + (Math.random() - 0.5) * 0.12,
            lng:
              outlet?.lng ??
              77.2167 + (Math.random() - 0.5) * 0.12,
          };
          return {
            outlets: [...s.outlets, newOutlet],
            // Existing items default to available at the new outlet.
            items: s.items.map((i) => ({
              ...i,
              availability: { ...(i.availability || {}), [id]: true },
            })),
          };
        }),
      updateOutlet: (id, patch) =>
        set((s) => ({
          outlets: s.outlets.map((o) => (o.id === id ? { ...o, ...patch } : o)),
        })),
      deleteOutlet: (id) =>
        set((s) => ({
          outlets: s.outlets.filter((o) => o.id !== id),
          items: s.items.map((i) => {
            if (!i.availability) return i;
            const { [id]: _, ...rest } = i.availability;
            return { ...i, availability: rest };
          }),
        })),
      setItemAvailability: (itemId, outletId, available) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  availability: {
                    ...(i.availability || {}),
                    [outletId]: available,
                  },
                }
              : i
          ),
        })),

      // Categories
      addCategory: (cat) =>
        set((s) => ({
          categories: [
            ...s.categories,
            { id: uid("cat"), icon: "🍽️", name: "New Category", ...cat },
          ],
        })),
      updateCategory: (id, patch) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, ...patch } : c
          ),
        })),
      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
          items: s.items.filter((i) => i.category !== id),
        })),

      // Items
      addItem: (item) =>
        set((s) => ({
          items: [
            ...s.items,
            {
              id: uid("itm"),
              name: "New Item",
              desc: "",
              price: 0,
              rating: 4.0,
              veg: true,
              bestseller: false,
              emoji: "🍽️",
              gradient: GRADIENTS[0],
              category: s.categories[0]?.id,
              availability: defaultAvailability(s.outlets.map((o) => o.id)),
              ...item,
            },
          ],
        })),
      updateItem: (id, patch) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        })),
      deleteItem: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

      resetAll: () =>
        set({
          restaurant: seedRestaurant,
          categories: seedCategories,
          items: seedMenuWithAvailability,
          outlets: seedOutlets,
          banners: [],
          brandColor: "burnt-orange",
        }),
    }),
    { name: "lgc-menu" }
  )
);
