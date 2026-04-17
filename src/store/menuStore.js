import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  restaurant as seedRestaurant,
  categories as seedCategories,
  menu as seedMenu,
} from "@/data/menu";
import { fetchRestaurant } from "@/lib/hasura";

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

// Storefront section types. Each maps to a renderer component.
export const SECTION_TYPES = [
  { id: "hero",         label: "Hero",           icon: "🎯", desc: "Big banner with headline & CTA" },
  { id: "carousel",     label: "Banner Carousel",icon: "🖼️", desc: "Scrollable image slides" },
  { id: "imageText",    label: "Image + Text",   icon: "📰", desc: "Story block with image & copy" },
  { id: "featured",     label: "Featured Items", icon: "⭐", desc: "Highlight menu items" },
  { id: "cta",          label: "Call to Action", icon: "📣", desc: "Full-width CTA band" },
  { id: "testimonials", label: "Testimonials",   icon: "💬", desc: "Customer reviews" },
  { id: "about",        label: "About / Story",  icon: "📖", desc: "Long-form about section" },
  { id: "footer",       label: "Footer",         icon: "🔗", desc: "Contact, socials, copyright" },
];

const DEFAULT_CONTENT = {
  hero: {
    heading: "Welcome to our restaurant",
    subheading: "Authentic flavors, crafted fresh daily",
    eyebrow: "",
    backgroundImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200",
    overlayOpacity: 55,
    ctaPrimary: { label: "Order Now", link: "/" },
    ctaSecondary: { label: "View Menu", link: "/" },
  },
  carousel: {
    title: "",
    slides: [
      { id: uid("sld"), image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800", heading: "Fresh Daily", description: "Baked with love every morning" },
    ],
  },
  imageText: {
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900",
    heading: "Our Story",
    description: "Share what makes your restaurant special. Talk about your ingredients, your traditions, or the people behind the kitchen.",
    ctaLabel: "",
    ctaLink: "",
    imagePosition: "top",
  },
  featured: {
    title: "Featured",
    subtitle: "Our most loved dishes",
    ctaLabel: "View full menu",
    ctaLink: "/",
    itemIds: [],
  },
  cta: {
    heading: "Order Online",
    description: "Order directly to save on fees, get faster service, and support local.",
    ctaLabel: "Order Now",
    ctaLink: "/",
    backgroundImage: "",
    variant: "primary",
  },
  testimonials: {
    title: "What our guests are saying",
    quotes: [
      { id: uid("q"), name: "Gabriel Y.", text: "Excellent pizza! Pepperoni and mushroom pie was proportioned perfectly, crust crispy and full of flavor.", rating: 5 },
    ],
  },
  about: {
    heading: "About Us",
    description: "Tell your customers about the craft that goes into every plate — ingredients, history, and people.",
    image: "",
  },
  footer: {
    description: "",
    phone: "",
    email: "",
    copyright: `© ${new Date().getFullYear()} All rights reserved`,
  },
};

const defaultContentFor = (type) =>
  JSON.parse(JSON.stringify(DEFAULT_CONTENT[type] || {}));

const SEED_STOREFRONT = {
  enabled: true,
  logoType: "image", // 'emoji' | 'image'
  logoEmoji: "🍽️",
  logoImage: "/legrand-logo.jpg",
  brandName: "", // falls back to restaurant.name when empty
  sections: [
    { id: uid("sec"), type: "hero",         enabled: true, content: {
      heading: "Your Authentic Neighborhood Pizza Restaurant, Since 1928",
      subheading: "",
      eyebrow: "Best Pizza in Henderson",
      backgroundImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200",
      overlayOpacity: 55,
      ctaPrimary: { label: "Order Online", link: "/" },
      ctaSecondary: { label: "Order with App", link: "/" },
    }},
    { id: uid("sec"), type: "imageText",    enabled: true, content: {
      image: "https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=900",
      heading: "Upcoming Events",
      description: "There's always something cooking at our kitchen. Check our upcoming events including tasting nights, live comedy, and chef specials — unlimited pizza, drinks, and great company.",
      ctaLabel: "View Events",
      ctaLink: "/",
      imagePosition: "top",
    }},
    { id: uid("sec"), type: "imageText",    enabled: true, content: {
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900",
      heading: "Where Flavors Ignite",
      description: "Experience our rich legacy. Each day in the kitchen we handcraft dough using premium wheat, stretch it skillfully, and bake it to perfection on hearth stones.",
      ctaLabel: "",
      ctaLink: "",
      imagePosition: "top",
    }},
    { id: uid("sec"), type: "imageText",    enabled: true, content: {
      image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=900",
      heading: "Come Visit Us",
      description: "Our restaurant is the perfect place for lunch or dinner with friends and family. Drop by and stay for our amazing hospitality and delicious food.",
      ctaLabel: "Get Directions",
      ctaLink: "/",
      imagePosition: "top",
    }},
    { id: uid("sec"), type: "featured",     enabled: true, content: {
      title: "Featured",
      subtitle: "Our most loved dishes",
      ctaLabel: "View full menu",
      ctaLink: "/",
      itemIds: [],
    }},
    { id: uid("sec"), type: "cta",          enabled: true, content: {
      heading: "Order Online",
      description: "Order directly to save money on fees, get faster service, and support local businesses.",
      ctaLabel: "Order Now",
      ctaLink: "/",
      backgroundImage: "",
      variant: "primary",
    }},
    { id: uid("sec"), type: "testimonials", enabled: true, content: {
      title: "What our guests are saying",
      quotes: [
        { id: uid("q"), name: "Gabriel Y.",  text: "Excellent pizza! I ordered delivery — a large pepperoni and mushroom pie, and a small pepperoni. Cheese was well proportioned and amazing crust.", rating: 5 },
        { id: uid("q"), name: "Priya S.",    text: "Best pizza in town. Fresh ingredients, amazing service, and the vibe is so warm.", rating: 5 },
      ],
    }},
    { id: uid("sec"), type: "about",        enabled: true, content: {
      heading: "Fresh Craft Pizza",
      description: "We deliver fresh handmade dough stretched daily and baked perfectly to achieve crisp edges and a soft center. Our sauce is made from vine-ripened tomatoes and every topping is chosen for quality.",
      image: "",
    }},
    { id: uid("sec"), type: "footer",       enabled: true, content: {
      description: "Come for the food, stay for the experience.",
      phone: "+91 98765 43210",
      email: "hello@restaurant.com",
      copyright: `© ${new Date().getFullYear()} All rights reserved`,
    }},
  ],
};

export const useMenuStore = create(
  persist(
    (set, get) => ({
      restaurant: seedRestaurant,
      categories: seedCategories,
      items: seedMenuWithAvailability,
      outlets: seedOutlets,
      menuLayout: 1, // 1 = detailed list, 2 = compact grid, 3 = photo grid
      heroLayout: "compact", // "compact" | "banner"
      heroBanners: [], // [{ id, imageUrl }] — overrides restaurant.heroImage when non-empty
      heroBannerAutoplayMs: 4000, // 0 to disable autoplay
      brandColor: "burnt-orange", // id from BRAND_COLORS
      banners: [
        // type: 'offer' | 'announcement'
        // offers: { id, type:'offer', name, description, code, validDays }
        // announcements: { id, type:'announcement', name, description }
      ],
      storefront: SEED_STOREFRONT,

      // Remote fetch state
      dbLoading: false,
      dbError: null,
      dbLatencyMs: null,
      dbFetchedAt: null,
      dbSource: "seed", // 'seed' | 'remote'

      loadFromDb: async (partnerId) => {
        set({ dbLoading: true, dbError: null });
        try {
          const data = await fetchRestaurant(partnerId);
          set((s) => {
            const outletIds = s.outlets.map((o) => o.id);
            const backfillAvailability = Object.fromEntries(
              outletIds.map((id) => [id, true])
            );
            return {
              restaurant: { ...s.restaurant, ...data.restaurant },
              categories: data.categories,
              items: data.items.map((it) => ({
                ...it,
                availability: backfillAvailability,
              })),
              dbLoading: false,
              dbError: null,
              dbLatencyMs: data._latencyMs,
              dbFetchedAt: data._fetchedAt,
              dbSource: "remote",
            };
          });
          return data;
        } catch (err) {
          set({
            dbLoading: false,
            dbError: err.message || "Failed to load",
            dbSource: get().dbSource === "remote" ? "remote" : "seed",
          });
          throw err;
        }
      },

      // Layout & Brand Color
      setMenuLayout: (layout) => set({ menuLayout: layout }),
      setHeroLayout: (layout) => set({ heroLayout: layout }),
      setHeroBannerAutoplayMs: (ms) => set({ heroBannerAutoplayMs: ms }),
      setBrandColor: (colorId) => set({ brandColor: colorId }),

      // Hero banners (multiple images that carousel on the menu page)
      addHeroBanner: (imageUrl = "") =>
        set((s) => ({
          heroBanners: [
            ...s.heroBanners,
            { id: uid("hb"), imageUrl },
          ],
        })),
      updateHeroBanner: (id, patch) =>
        set((s) => ({
          heroBanners: s.heroBanners.map((b) =>
            b.id === id ? { ...b, ...patch } : b
          ),
        })),
      removeHeroBanner: (id) =>
        set((s) => ({
          heroBanners: s.heroBanners.filter((b) => b.id !== id),
        })),
      moveHeroBanner: (id, dir) =>
        set((s) => {
          const list = [...s.heroBanners];
          const idx = list.findIndex((b) => b.id === id);
          if (idx < 0) return {};
          const to = dir === "up" ? idx - 1 : idx + 1;
          if (to < 0 || to >= list.length) return {};
          [list[idx], list[to]] = [list[to], list[idx]];
          return { heroBanners: list };
        }),

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
              imageUrl: "",
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

      // Storefront
      updateStorefront: (patch) =>
        set((s) => ({ storefront: { ...s.storefront, ...patch } })),
      addSection: (type) =>
        set((s) => ({
          storefront: {
            ...s.storefront,
            sections: [
              ...s.storefront.sections,
              {
                id: uid("sec"),
                type,
                enabled: true,
                content: defaultContentFor(type),
              },
            ],
          },
        })),
      updateSection: (id, contentPatch) =>
        set((s) => ({
          storefront: {
            ...s.storefront,
            sections: s.storefront.sections.map((sec) =>
              sec.id === id
                ? { ...sec, content: { ...sec.content, ...contentPatch } }
                : sec
            ),
          },
        })),
      toggleSection: (id) =>
        set((s) => ({
          storefront: {
            ...s.storefront,
            sections: s.storefront.sections.map((sec) =>
              sec.id === id ? { ...sec, enabled: !sec.enabled } : sec
            ),
          },
        })),
      removeSection: (id) =>
        set((s) => ({
          storefront: {
            ...s.storefront,
            sections: s.storefront.sections.filter((sec) => sec.id !== id),
          },
        })),
      moveSection: (id, dir) =>
        set((s) => {
          const list = [...s.storefront.sections];
          const idx = list.findIndex((x) => x.id === id);
          if (idx < 0) return {};
          const to = dir === "up" ? idx - 1 : idx + 1;
          if (to < 0 || to >= list.length) return {};
          [list[idx], list[to]] = [list[to], list[idx]];
          return { storefront: { ...s.storefront, sections: list } };
        }),
      addSlide: (sectionId, slide) =>
        set((s) => ({
          storefront: {
            ...s.storefront,
            sections: s.storefront.sections.map((sec) =>
              sec.id === sectionId
                ? {
                    ...sec,
                    content: {
                      ...sec.content,
                      slides: [
                        ...(sec.content.slides || []),
                        { id: uid("sld"), image: "", heading: "", description: "", ...slide },
                      ],
                    },
                  }
                : sec
            ),
          },
        })),
      updateSlide: (sectionId, slideId, patch) =>
        set((s) => ({
          storefront: {
            ...s.storefront,
            sections: s.storefront.sections.map((sec) =>
              sec.id === sectionId
                ? {
                    ...sec,
                    content: {
                      ...sec.content,
                      slides: (sec.content.slides || []).map((sl) =>
                        sl.id === slideId ? { ...sl, ...patch } : sl
                      ),
                    },
                  }
                : sec
            ),
          },
        })),
      removeSlide: (sectionId, slideId) =>
        set((s) => ({
          storefront: {
            ...s.storefront,
            sections: s.storefront.sections.map((sec) =>
              sec.id === sectionId
                ? {
                    ...sec,
                    content: {
                      ...sec.content,
                      slides: (sec.content.slides || []).filter(
                        (sl) => sl.id !== slideId
                      ),
                    },
                  }
                : sec
            ),
          },
        })),
      addQuote: (sectionId, quote) =>
        set((s) => ({
          storefront: {
            ...s.storefront,
            sections: s.storefront.sections.map((sec) =>
              sec.id === sectionId
                ? {
                    ...sec,
                    content: {
                      ...sec.content,
                      quotes: [
                        ...(sec.content.quotes || []),
                        { id: uid("q"), name: "", text: "", rating: 5, ...quote },
                      ],
                    },
                  }
                : sec
            ),
          },
        })),
      updateQuote: (sectionId, quoteId, patch) =>
        set((s) => ({
          storefront: {
            ...s.storefront,
            sections: s.storefront.sections.map((sec) =>
              sec.id === sectionId
                ? {
                    ...sec,
                    content: {
                      ...sec.content,
                      quotes: (sec.content.quotes || []).map((q) =>
                        q.id === quoteId ? { ...q, ...patch } : q
                      ),
                    },
                  }
                : sec
            ),
          },
        })),
      removeQuote: (sectionId, quoteId) =>
        set((s) => ({
          storefront: {
            ...s.storefront,
            sections: s.storefront.sections.map((sec) =>
              sec.id === sectionId
                ? {
                    ...sec,
                    content: {
                      ...sec.content,
                      quotes: (sec.content.quotes || []).filter(
                        (q) => q.id !== quoteId
                      ),
                    },
                  }
                : sec
            ),
          },
        })),
      resetStorefront: () => set({ storefront: SEED_STOREFRONT }),

      resetAll: () =>
        set({
          restaurant: seedRestaurant,
          categories: seedCategories,
          items: seedMenuWithAvailability,
          outlets: seedOutlets,
          banners: [],
          brandColor: "burnt-orange",
          storefront: SEED_STOREFRONT,
        }),
    }),
    {
      name: "lgc-menu",
      // Don't persist transient fetch state — it's always fresh on reload.
      partialize: (s) => {
        const { dbLoading, dbError, ...rest } = s;
        return rest;
      },
    }
  )
);
