// Hasura GraphQL client for fetching restaurant data.
// NOTE: admin secret exposed in browser — acceptable for this MVP where the
// data is intentionally public. For production, proxy via a server.

const ENDPOINT =
  import.meta.env.VITE_HASURA_ENDPOINT ||
  "https://hasura-prod-v2.cravings.live/v1/graphql";
const ADMIN_SECRET =
  import.meta.env.VITE_HASURA_ADMIN_SECRET ||
  "grK3WUtZW9mXGtYtjEqU44QfmFkWOMga9qQoa1uBvR03n7DXLkTodHH9cWDcN6cn";

export const LE_GRAND_CAFE_PARTNER_ID =
  "20f7e974-f19e-4c11-b6b7-4385f61f27bf";

// One combined query: partner + categories + menu + active offers.
const RESTAURANT_QUERY = `
  query Restaurant($pid: uuid!, $now: timestamptz!) {
    partners_by_pk(id: $pid) {
      id
      store_name
      name
      description
      store_banner
      phone
      location
      district
      currency
      is_shop_open
      footnote
      social_links
      gst_percentage
    }
    category(
      where: { partner_id: { _eq: $pid }, is_active: { _eq: true }, deletion_status: { _eq: 0 } }
      order_by: { priority: asc }
    ) {
      id
      name
      priority
    }
    menu(
      where: { partner_id: { _eq: $pid }, deletion_status: { _eq: 0 } }
      order_by: { priority: asc }
    ) {
      id
      name
      price
      category_id
      description
      image_url
      is_veg
      is_top
      is_available
      priority
    }
    offers(
      where: {
        partner_id: { _eq: $pid }
        deletion_status: { _eq: 0 }
        end_time: { _gte: $now }
      }
      order_by: { created_at: desc }
    ) {
      id
      menu_item_id
      offer_price
      start_time
      end_time
      items_available
    }
  }
`;

export async function fetchRestaurant(partnerId = LE_GRAND_CAFE_PARTNER_ID) {
  const started = performance.now();
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": ADMIN_SECRET,
    },
    body: JSON.stringify({
      query: RESTAURANT_QUERY,
      variables: { pid: partnerId, now: new Date().toISOString() },
    }),
  });

  if (!res.ok) {
    throw new Error(`Hasura HTTP ${res.status}`);
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors[0]?.message || "GraphQL error");
  }
  const elapsed = Math.round(performance.now() - started);

  const raw = json.data;
  const mapped = mapToAppSchema(raw);
  // eslint-disable-next-line no-console
  console.log(
    `%c[hasura] fetched ${mapped.items.length} items · ${mapped.categories.length} categories · ${elapsed}ms`,
    "color: #16a34a; font-weight: 600"
  );
  return { ...mapped, _latencyMs: elapsed, _fetchedAt: Date.now() };
}

// ------- mapping helpers -------

// Pick a reasonable emoji per category name (best-effort; falls back to 🍽️).
const CATEGORY_EMOJI = [
  [/burger/i, "🍔"],
  [/pizza/i, "🍕"],
  [/sandwich/i, "🥪"],
  [/soup/i, "🍲"],
  [/salad/i, "🥗"],
  [/side/i, "🍟"],
  [/lunch|entr/i, "🍽️"],
  [/starter|appet/i, "🥟"],
  [/desser|sweet/i, "🍰"],
  [/drink|bever|juic|coffe|tea|shake/i, "🥤"],
  [/breakfast/i, "🍳"],
  [/chicken|tandoor/i, "🍗"],
  [/pasta|noodle/i, "🍝"],
  [/ice|cream/i, "🍦"],
  [/fish|seafood/i, "🐟"],
];
const iconFor = (name) => {
  const hit = CATEGORY_EMOJI.find(([r]) => r.test(name || ""));
  return hit ? hit[1] : "🍽️";
};

// Stable deterministic gradient picker so items don't flicker colors.
const GRADIENTS = [
  "from-amber-200 via-orange-200 to-rose-200",
  "from-yellow-200 via-amber-200 to-orange-300",
  "from-rose-200 via-pink-200 to-red-200",
  "from-red-300 via-orange-300 to-amber-200",
  "from-yellow-300 via-lime-200 to-green-200",
  "from-orange-300 via-rose-300 to-red-300",
  "from-green-200 via-emerald-200 to-lime-200",
  "from-amber-100 via-yellow-200 to-orange-200",
  "from-emerald-200 via-teal-200 to-cyan-200",
  "from-sky-200 via-blue-200 to-indigo-200",
];
const gradientFor = (id) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
};

function mapToAppSchema({ partners_by_pk: p, category: cats, menu, offers = [] }) {
  // Offer lookup: menu_item_id -> best offer_price
  const offerByItem = {};
  for (const o of offers) {
    if (!o.menu_item_id) continue;
    const prev = offerByItem[o.menu_item_id];
    if (!prev || o.offer_price < prev.offer_price) offerByItem[o.menu_item_id] = o;
  }

  const categories = cats.map((c) => ({
    id: c.id,
    name: c.name,
    icon: iconFor(c.name),
  }));

  const items = menu.map((m) => {
    const offer = offerByItem[m.id];
    const price = Math.round(Number(m.price) || 0);
    return {
      id: m.id,
      category: m.category_id,
      name: m.name,
      desc: m.description || "",
      price,
      rating: 4.3, // DB has no rating — seed a sensible default
      veg: m.is_veg === true,
      bestseller: !!m.is_top,
      available: m.is_available !== false,
      emoji: "🍽️",
      gradient: gradientFor(m.id),
      imageUrl: m.image_url || "",
      offerPrice: offer ? Math.round(Number(offer.offer_price)) : null,
      offerEndsAt: offer?.end_time || null,
      // availability per outlet — seed to empty, menuStore backfills on load
      availability: {},
    };
  });

  const restaurant = {
    id: p.id,
    name: p.store_name || p.name || "Restaurant",
    tagline: p.description || "",
    rating: 4.5,
    ratingsCount: "2K+",
    deliveryTime: "30–40 min",
    costForTwo: 500,
    distance: "",
    address: p.location || "",
    phone: p.phone || "",
    district: p.district || "",
    heroImage: p.store_banner || "",
    currency: "₹",
    isOpen: p.is_shop_open !== false,
    footnote: p.footnote || "",
    socialLinks: p.social_links || null,
    gstPercentage: Number(p.gst_percentage) || 0,
  };

  return { restaurant, categories, items };
}
