import { useState } from "react";
import { Store, Tags, UtensilsCrossed, Plus, Trash2, Pencil, Check, X, RotateCcw, Star, ReceiptText, ChevronDown, ChevronUp, MapPin, Phone, Clock, LayoutList, LayoutGrid, Image, Megaphone } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useMenuStore, GRADIENTS, BRAND_COLORS } from "@/store/menuStore";
import { useOrdersStore, ORDER_STATUSES, STATUS_BY_ID, CANCELLED_STATUS } from "@/store/ordersStore";
import { cn, formatINR } from "@/lib/utils";

const TABS = [
  { id: "orders", label: "Orders", icon: ReceiptText },
  { id: "items", label: "Menu", icon: UtensilsCrossed },
  { id: "banners", label: "Banners", icon: Megaphone },
  { id: "categories", label: "Categories", icon: Tags },
  { id: "outlets", label: "Outlets", icon: Store },
  { id: "restaurant", label: "Brand", icon: Store },
];

export default function Admin() {
  const [tab, setTab] = useState("orders");
  const resetAll = useMenuStore((s) => s.resetAll);

  return (
    <div className="min-h-screen bg-secondary/30 pb-16">
      <Header title="Admin Panel" />

      <div className="mx-auto max-w-2xl px-3 py-4">
        {/* Title bar */}
        <div className="flex items-center justify-between gap-3 rounded-2xl border bg-white p-4 shadow-sm">
          <div>
            <h1 className="font-display text-xl font-extrabold tracking-tight">
              Manage your store
            </h1>
            <p className="text-xs text-muted-foreground">
              Edits update the live menu instantly. No reload needed.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm("Reset all menu data to defaults?")) resetAll();
            }}
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
        </div>

        {/* Tabs */}
        <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto rounded-2xl border bg-white p-1.5 shadow-sm">
          {TABS.map((t) => {
            const Icon = t.icon;
            const sel = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex shrink-0 items-center justify-center gap-1 rounded-xl px-2.5 py-2 text-[11px] font-bold transition",
                  sel
                    ? "bg-foreground text-background shadow"
                    : "text-muted-foreground hover:bg-accent"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="mt-3">
          {tab === "orders" && <OrdersTab />}
          {tab === "banners" && <BannersTab />}
          {tab === "restaurant" && <RestaurantTab />}
          {tab === "categories" && <CategoriesTab />}
          {tab === "outlets" && <OutletsTab />}
          {tab === "items" && <ItemsTab />}
        </div>
      </div>
    </div>
  );
}

/* ============================ ORDERS TAB ============================ */
function OrdersTab() {
  const orders = useOrdersStore((s) => s.orders);
  const [openId, setOpenId] = useState(null);
  const [filter, setFilter] = useState("all");

  const counts = {
    all: orders.length,
    active: orders.filter(
      (o) => o.status !== "delivered" && o.status !== "cancelled"
    ).length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  const visible = orders.filter((o) => {
    if (filter === "all") return true;
    if (filter === "active")
      return o.status !== "delivered" && o.status !== "cancelled";
    return o.status === filter;
  });

  return (
    <div className="space-y-3">
      <Card>
        <SectionTitle
          title="Customer Orders"
          subtitle={`${orders.length} total · live updates`}
        />

        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
            All ({counts.all})
          </FilterPill>
          <FilterPill
            active={filter === "active"}
            onClick={() => setFilter("active")}
          >
            🟢 Active ({counts.active})
          </FilterPill>
          <FilterPill
            active={filter === "delivered"}
            onClick={() => setFilter("delivered")}
          >
            ✓ Delivered ({counts.delivered})
          </FilterPill>
          <FilterPill
            active={filter === "cancelled"}
            onClick={() => setFilter("cancelled")}
          >
            ✕ Cancelled ({counts.cancelled})
          </FilterPill>
        </div>

        <Separator className="my-3" />

        <div className="space-y-2">
          {visible.length === 0 && (
            <div className="py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-3xl">
                📋
              </div>
              <p className="mt-3 text-sm font-bold">No orders here</p>
              <p className="text-xs text-muted-foreground">
                Orders placed by customers will appear here.
              </p>
            </div>
          )}
          {visible.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              open={openId === order.id}
              onToggle={() =>
                setOpenId(openId === order.id ? null : order.id)
              }
            />
          ))}
        </div>
      </Card>
    </div>
  );
}

function OrderRow({ order, open, onToggle }) {
  const updateStatus = useOrdersStore((s) => s.updateStatus);
  const cancelOrder = useOrdersStore((s) => s.cancelOrder);
  const deleteOrder = useOrdersStore((s) => s.deleteOrder);

  const isCancelled = order.status === "cancelled";
  const status = isCancelled ? CANCELLED_STATUS : STATUS_BY_ID[order.status];
  const StatusIcon = status.icon;
  const colorMap = {
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };

  const placed = new Date(order.placedAt);
  const timeStr = placed.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="overflow-hidden rounded-xl border bg-secondary/30">
      {/* Summary row */}
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-secondary/50"
      >
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
            colorMap[status.color]
          )}
        >
          <StatusIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-bold">#{order.id}</p>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                colorMap[status.color]
              )}
            >
              {status.label}
            </span>
          </div>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {order.details.name} ·{" "}
            {order.items.reduce((s, e) => s + e.qty, 0)} items · {timeStr}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-extrabold">{formatINR(order.total)}</p>
          {open ? (
            <ChevronUp className="ml-auto h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="space-y-4 border-t bg-white p-4 animate-fade-in">
          {/* Status update controls */}
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Update Status
            </p>
            <div className="flex flex-wrap gap-2">
              {ORDER_STATUSES.map((s) => {
                const sel = order.status === s.id;
                return (
                  <button
                    key={s.id}
                    disabled={isCancelled}
                    onClick={() => updateStatus(order.id, s.id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition",
                      sel
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-border bg-background text-foreground hover:bg-accent",
                      isCancelled && "opacity-40"
                    )}
                  >
                    <s.icon className="h-3.5 w-3.5" />
                    {s.label}
                  </button>
                );
              })}
              {!isCancelled && (
                <button
                  onClick={() => {
                    if (confirm("Cancel this order?")) cancelOrder(order.id);
                  }}
                  className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100"
                >
                  <X className="h-3.5 w-3.5" /> Cancel
                </button>
              )}
            </div>
          </div>

          <Separator />

          {/* Customer */}
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Customer
            </p>
            <div className="space-y-1 text-sm">
              <p className="font-bold capitalize">
                {order.details.addressType} · {order.details.name}
              </p>
              <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                {order.details.address}
                {order.details.landmark && ` · ${order.details.landmark}`}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" /> {order.details.phone}
              </p>
            </div>
          </div>

          <Separator />

          {/* Items */}
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Items ({order.items.length})
            </p>
            <div className="space-y-2">
              {order.items.map(({ item, qty }) => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-xl ring-1 ring-black/5",
                      item.gradient
                    )}
                  >
                    {item.emoji}
                  </div>
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-secondary text-[10px] font-extrabold">
                    {qty}×
                  </span>
                  <span className="flex-1 truncate font-medium">
                    {item.name}
                  </span>
                  <span className="font-bold">
                    {formatINR(item.price * qty)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Bill */}
          <div className="space-y-1.5 text-sm">
            <Row label="Item Total" value={formatINR(order.subtotal)} />
            <Row label="Delivery" value={formatINR(order.deliveryFee)} />
            <Row label="GST & Charges" value={formatINR(order.taxes)} />
            <Separator className="my-2" />
            <div className="flex items-center justify-between text-base font-extrabold">
              <span>Total</span>
              <span>{formatINR(order.total)}</span>
            </div>
            <p className="text-[11px] capitalize text-muted-foreground">
              Payment:{" "}
              {order.details.payment === "cod"
                ? "Cash on Delivery"
                : order.details.payment.toUpperCase()}
            </p>
          </div>

          <button
            onClick={() => {
              if (confirm("Permanently delete this order record?"))
                deleteOrder(order.id);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-red-600"
          >
            <Trash2 className="h-3 w-3" /> Delete order
          </button>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

/* ============================ BANNERS TAB ============================ */
function BannersTab() {
  const banners = useMenuStore((s) => s.banners);
  const addBanner = useMenuStore((s) => s.addBanner);
  const updateBanner = useMenuStore((s) => s.updateBanner);
  const deleteBanner = useMenuStore((s) => s.deleteBanner);

  const offers = banners.filter((b) => b.type === "offer");
  const announcements = banners.filter((b) => b.type === "announcement");

  return (
    <div className="space-y-3">
      {/* Offers */}
      <Card>
        <div className="flex items-center justify-between">
          <SectionTitle title="Offers" subtitle="Discount banners shown to customers" inline />
          <Button
            size="sm"
            onClick={() =>
              addBanner({
                type: "offer",
                name: "New Offer",
                description: "Get discount on your order",
                code: "SAVE20",
                validDays: 7,
              })
            }
          >
            <Plus className="h-3.5 w-3.5" /> Add Offer
          </Button>
        </div>

        <div className="mt-2 space-y-2">
          {offers.length === 0 && (
            <p className="py-4 text-center text-xs text-muted-foreground">
              No offers yet. Add one to show discount banners to customers.
            </p>
          )}
          {offers.map((b) => (
            <div
              key={b.id}
              className="space-y-2 rounded-xl border bg-secondary/30 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-lg">
                    🏷️
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Offer
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateBanner(b.id, { active: !b.active })}
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold",
                      b.active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {b.active ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this offer?")) deleteBanner(b.id);
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <Field label="Offer Name">
                <Input
                  value={b.name}
                  onChange={(e) => updateBanner(b.id, { name: e.target.value })}
                  placeholder="e.g. 50% OFF up to ₹100"
                />
              </Field>
              <Field label="Description">
                <Input
                  value={b.description}
                  onChange={(e) =>
                    updateBanner(b.id, { description: e.target.value })
                  }
                  placeholder="e.g. Valid on orders above ₹199"
                />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Coupon Code">
                  <Input
                    value={b.code}
                    onChange={(e) =>
                      updateBanner(b.id, {
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="SAVE20"
                  />
                </Field>
                <Field label="Valid (days)">
                  <Input
                    type="number"
                    min="1"
                    value={b.validDays}
                    onChange={(e) =>
                      updateBanner(b.id, {
                        validDays: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Announcements */}
      <Card>
        <div className="flex items-center justify-between">
          <SectionTitle
            title="Announcements"
            subtitle="Info banners for your customers"
            inline
          />
          <Button
            size="sm"
            onClick={() =>
              addBanner({
                type: "announcement",
                name: "New Announcement",
                description: "Important update for customers",
              })
            }
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>

        <div className="mt-2 space-y-2">
          {announcements.length === 0 && (
            <p className="py-4 text-center text-xs text-muted-foreground">
              No announcements yet. Add one to share news with customers.
            </p>
          )}
          {announcements.map((b) => (
            <div
              key={b.id}
              className="space-y-2 rounded-xl border bg-secondary/30 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-lg">
                    📢
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    Announcement
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateBanner(b.id, { active: !b.active })}
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold",
                      b.active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {b.active ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this announcement?"))
                        deleteBanner(b.id);
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <Field label="Title">
                <Input
                  value={b.name}
                  onChange={(e) => updateBanner(b.id, { name: e.target.value })}
                  placeholder="e.g. New menu items added!"
                />
              </Field>
              <Field label="Description">
                <Input
                  value={b.description}
                  onChange={(e) =>
                    updateBanner(b.id, { description: e.target.value })
                  }
                  placeholder="e.g. Check out our fresh summer specials"
                />
              </Field>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ============================ RESTAURANT TAB ============================ */
function RestaurantTab() {
  const restaurant = useMenuStore((s) => s.restaurant);
  const updateRestaurant = useMenuStore((s) => s.updateRestaurant);
  const menuLayout = useMenuStore((s) => s.menuLayout);
  const setMenuLayout = useMenuStore((s) => s.setMenuLayout);

  const brandColor = useMenuStore((s) => s.brandColor);
  const setBrandColor = useMenuStore((s) => s.setBrandColor);

  const set = (k) => (e) => updateRestaurant({ [k]: e.target.value });

  return (
    <div className="space-y-3">
      {/* Brand Color */}
      <Card>
        <SectionTitle title="Brand Color" subtitle="Choose your signature color — applied across the entire storefront" />
        <div className="grid grid-cols-2 gap-2">
          {BRAND_COLORS.map((c) => {
            const sel = brandColor === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setBrandColor(c.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-2 p-3 text-left transition",
                  sel
                    ? "border-foreground bg-foreground/5 shadow-sm"
                    : "border-border bg-secondary/30 hover:border-foreground/30"
                )}
              >
                <div
                  className="h-10 w-10 shrink-0 rounded-full ring-2 ring-black/10 ring-offset-2"
                  style={{ backgroundColor: c.hex }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold">{c.name}</p>
                  {sel && (
                    <p className="text-[10px] font-semibold text-emerald-600">Active</p>
                  )}
                </div>
                {sel && <Check className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <SectionTitle title="Menu Layout" subtitle="Choose how menu items appear to customers" />
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 1, icon: LayoutList, label: "Detailed", desc: "List view" },
            { id: 2, icon: LayoutGrid, label: "Compact", desc: "2-col grid" },
            { id: 3, icon: Image, label: "Photo", desc: "3-col grid" },
          ].map((l) => {
            const Icon = l.icon;
            const sel = menuLayout === l.id;
            return (
              <button
                key={l.id}
                onClick={() => setMenuLayout(l.id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition",
                  sel
                    ? "border-primary bg-primary/5"
                    : "border-border bg-secondary/30 hover:border-primary/40"
                )}
              >
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  sel ? "bg-primary text-white" : "bg-white text-foreground"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-extrabold">{l.label}</p>
                  <p className="text-[10px] text-muted-foreground">{l.desc}</p>
                </div>
                {sel && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <SectionTitle title="Brand" subtitle="Name and tagline shown on the home page" />
        <div className="space-y-3">
          <Field label="Restaurant Name">
            <Input value={restaurant.name} onChange={set("name")} />
          </Field>
          <Field label="Tagline">
            <Input value={restaurant.tagline} onChange={set("tagline")} />
          </Field>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Service Details" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Rating">
            <Input
              type="number"
              step="0.1"
              value={restaurant.rating}
              onChange={(e) => updateRestaurant({ rating: parseFloat(e.target.value) || 0 })}
            />
          </Field>
          <Field label="Ratings Count">
            <Input value={restaurant.ratingsCount} onChange={set("ratingsCount")} />
          </Field>
          <Field label="Delivery Time">
            <Input value={restaurant.deliveryTime} onChange={set("deliveryTime")} />
          </Field>
          <Field label="Distance">
            <Input value={restaurant.distance} onChange={set("distance")} />
          </Field>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Address" />
        <Field label="Full Address">
          <Input value={restaurant.address} onChange={set("address")} />
        </Field>
      </Card>

      <p className="px-2 text-[11px] text-muted-foreground">
        ✓ Changes saved automatically as you type.
      </p>
    </div>
  );
}

/* ============================ CATEGORIES TAB ============================ */
function CategoriesTab() {
  const categories = useMenuStore((s) => s.categories);
  const items = useMenuStore((s) => s.items);
  const addCategory = useMenuStore((s) => s.addCategory);
  const updateCategory = useMenuStore((s) => s.updateCategory);
  const deleteCategory = useMenuStore((s) => s.deleteCategory);

  return (
    <div className="space-y-3">
      <Card>
        <div className="flex items-center justify-between">
          <SectionTitle title="Categories" subtitle={`${categories.length} categories`} inline />
          <Button size="sm" onClick={() => addCategory({})}>
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>

        <div className="mt-2 space-y-2">
          {categories.map((cat) => {
            const count = items.filter((i) => i.category === cat.id).length;
            return (
              <div
                key={cat.id}
                className="flex items-center gap-3 rounded-xl border bg-secondary/30 p-3"
              >
                <Input
                  value={cat.icon}
                  onChange={(e) => updateCategory(cat.id, { icon: e.target.value })}
                  className="h-10 w-14 text-center text-xl"
                  maxLength={2}
                />
                <Input
                  value={cat.name}
                  onChange={(e) => updateCategory(cat.id, { name: e.target.value })}
                  className="h-10 flex-1"
                />
                <Badge variant="secondary" className="shrink-0">
                  {count} items
                </Badge>
                <button
                  onClick={() => {
                    if (
                      confirm(
                        `Delete "${cat.name}"? ${count} item(s) in this category will also be deleted.`
                      )
                    )
                      deleteCategory(cat.id);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
          {categories.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No categories. Click "Add" to create one.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

/* ============================ ITEMS TAB ============================ */
function ItemsTab() {
  const categories = useMenuStore((s) => s.categories);
  const items = useMenuStore((s) => s.items);
  const addItem = useMenuStore((s) => s.addItem);
  const deleteItem = useMenuStore((s) => s.deleteItem);

  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("all");

  const visible =
    filter === "all" ? items : items.filter((i) => i.category === filter);

  return (
    <div className="space-y-3">
      <Card>
        <div className="flex items-center justify-between">
          <SectionTitle title="Menu Items" subtitle={`${items.length} total`} inline />
          <Button
            size="sm"
            onClick={() => {
              const id = Date.now();
              addItem({});
              // Find the just-added item to open it
              setTimeout(() => {
                const latest = useMenuStore.getState().items.slice(-1)[0];
                if (latest) setEditingId(latest.id);
              }, 0);
            }}
          >
            <Plus className="h-3.5 w-3.5" /> Add Item
          </Button>
        </div>

        {/* Filter pills */}
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
            All ({items.length})
          </FilterPill>
          {categories.map((c) => (
            <FilterPill
              key={c.id}
              active={filter === c.id}
              onClick={() => setFilter(c.id)}
            >
              {c.icon} {c.name} ({items.filter((i) => i.category === c.id).length})
            </FilterPill>
          ))}
        </div>

        <Separator className="my-3" />

        <div className="space-y-2">
          {visible.map((item) =>
            editingId === item.id ? (
              <ItemEditor
                key={item.id}
                item={item}
                onClose={() => setEditingId(null)}
              />
            ) : (
              <ItemRow
                key={item.id}
                item={item}
                onEdit={() => setEditingId(item.id)}
                onDelete={() => {
                  if (confirm(`Delete "${item.name}"?`)) deleteItem(item.id);
                }}
              />
            )
          )}
          {visible.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No items in this category.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

function ItemRow({ item, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-secondary/30 p-3">
      <div
        className={cn(
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-3xl ring-1 ring-black/5",
          item.gradient
        )}
      >
        {item.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-3.5 w-3.5 items-center justify-center rounded-sm border-[1.5px]",
              item.veg ? "border-emerald-600" : "border-red-600"
            )}
          >
            <div
              className={cn(
                "h-1 w-1 rounded-full",
                item.veg ? "bg-emerald-600" : "bg-red-600"
              )}
            />
          </div>
          <p className="truncate text-sm font-bold">{item.name}</p>
          {item.bestseller && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600">
              ⭐ Best
            </span>
          )}
        </div>
        <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
          {item.desc || <em>No description</em>}
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs">
          <span className="font-bold">{formatINR(item.price)}</span>
          <span className="flex items-center gap-0.5 font-semibold text-emerald-700">
            <Star className="h-2.5 w-2.5 fill-current" />
            {item.rating}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <button
          onClick={onEdit}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ItemEditor({ item, onClose }) {
  const updateItem = useMenuStore((s) => s.updateItem);
  const categories = useMenuStore((s) => s.categories);
  const outlets = useMenuStore((s) => s.outlets);
  const setItemAvailability = useMenuStore((s) => s.setItemAvailability);

  const set = (patch) => updateItem(item.id, patch);

  return (
    <div className="space-y-3 rounded-xl border-2 border-primary bg-primary/5 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-extrabold uppercase tracking-wider text-primary">
          Editing item
        </h4>
        <button
          onClick={onClose}
          className="flex h-8 items-center gap-1 rounded-lg bg-foreground px-3 text-xs font-bold text-background hover:bg-foreground/90"
        >
          <Check className="h-3.5 w-3.5" /> Done
        </button>
      </div>

      {/* Preview */}
      <div className="flex items-center gap-3 rounded-xl bg-white p-2">
        <div
          className={cn(
            "flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-4xl ring-1 ring-black/5",
            item.gradient
          )}
        >
          {item.emoji}
        </div>
        <div className="text-xs text-muted-foreground">Live preview</div>
      </div>

      <Field label="Name">
        <Input value={item.name} onChange={(e) => set({ name: e.target.value })} />
      </Field>

      <Field label="Description">
        <Input value={item.desc} onChange={(e) => set({ desc: e.target.value })} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Price (₹)">
          <Input
            type="number"
            value={item.price}
            onChange={(e) => set({ price: parseInt(e.target.value) || 0 })}
          />
        </Field>
        <Field label="Rating">
          <Input
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={item.rating}
            onChange={(e) => set({ rating: parseFloat(e.target.value) || 0 })}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Emoji">
          <Input
            value={item.emoji}
            onChange={(e) => set({ emoji: e.target.value })}
            maxLength={2}
            className="text-center text-2xl"
          />
        </Field>
        <Field label="Category">
          <select
            value={item.category}
            onChange={(e) => set({ category: e.target.value })}
            className="flex h-12 w-full rounded-lg border border-input bg-background px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Card Gradient">
        <div className="grid grid-cols-6 gap-2">
          {GRADIENTS.map((g) => (
            <button
              key={g}
              onClick={() => set({ gradient: g })}
              className={cn(
                "h-10 rounded-lg bg-gradient-to-br ring-2 ring-offset-1 transition",
                g,
                item.gradient === g ? "ring-primary" : "ring-transparent"
              )}
            />
          ))}
        </div>
      </Field>

      <div className="flex gap-2">
        <Toggle
          label="Veg"
          checked={item.veg}
          onChange={(v) => set({ veg: v })}
          color="emerald"
        />
        <Toggle
          label="Non-Veg"
          checked={!item.veg}
          onChange={(v) => set({ veg: !v })}
          color="red"
        />
        <Toggle
          label="Bestseller"
          checked={item.bestseller}
          onChange={(v) => set({ bestseller: v })}
          color="amber"
        />
      </div>

      <Separator />

      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Available at outlets
        </p>
        <div className="space-y-1.5">
          {outlets.map((o) => {
            const available = item.availability?.[o.id] !== false;
            return (
              <label
                key={o.id}
                className={cn(
                  "flex cursor-pointer items-start gap-2 rounded-lg border-2 p-2 transition",
                  available
                    ? "border-emerald-600/40 bg-emerald-50"
                    : "border-border bg-white"
                )}
              >
                <input
                  type="checkbox"
                  checked={available}
                  onChange={(e) =>
                    setItemAvailability(item.id, o.id, e.target.checked)
                  }
                  className="mt-0.5 h-4 w-4 accent-emerald-600"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold">{o.name}</p>
                  <p className="line-clamp-1 text-[10px] text-muted-foreground">
                    {o.place}
                  </p>
                </div>
              </label>
            );
          })}
          {outlets.length === 0 && (
            <p className="text-[11px] text-muted-foreground">
              No outlets yet. Add one in the Outlets tab.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================ OUTLETS TAB ============================ */
function OutletsTab() {
  const outlets = useMenuStore((s) => s.outlets);
  const addOutlet = useMenuStore((s) => s.addOutlet);
  const updateOutlet = useMenuStore((s) => s.updateOutlet);
  const deleteOutlet = useMenuStore((s) => s.deleteOutlet);

  return (
    <div className="space-y-3">
      <Card>
        <div className="flex items-center justify-between">
          <SectionTitle
            title="Outlets"
            subtitle={`${outlets.length} branch${outlets.length === 1 ? "" : "es"}`}
            inline
          />
          <Button size="sm" onClick={() => addOutlet({})}>
            <Plus className="h-3.5 w-3.5" /> Add Outlet
          </Button>
        </div>

        <div className="mt-3 space-y-3">
          {outlets.map((o) => (
            <div
              key={o.id}
              className="space-y-2 rounded-xl border bg-secondary/30 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-primary" />
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Branch
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (
                      confirm(
                        `Delete outlet "${o.name}"? Items will be marked unavailable there.`
                      )
                    )
                      deleteOutlet(o.id);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <Field label="Outlet name">
                <Input
                  value={o.name}
                  onChange={(e) => updateOutlet(o.id, { name: e.target.value })}
                />
              </Field>
              <Field label="Place / full address">
                <Input
                  value={o.place}
                  onChange={(e) => updateOutlet(o.id, { place: e.target.value })}
                />
              </Field>
              <Field label="Phone">
                <Input
                  value={o.phone}
                  onChange={(e) => updateOutlet(o.id, { phone: e.target.value })}
                />
              </Field>
              <p className="text-[10px] text-muted-foreground">
                Coords (sim): {o.lat?.toFixed(4)}, {o.lng?.toFixed(4)}
              </p>
            </div>
          ))}
          {outlets.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No outlets yet. Click "Add Outlet" to create one.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

/* ============================ Helpers ============================ */
function Card({ children }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">{children}</div>
  );
}

function SectionTitle({ title, subtitle, inline }) {
  return (
    <div className={inline ? "" : "mb-4"}>
      <h3 className="font-display text-lg font-extrabold tracking-tight">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function FilterPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition",
        active
          ? "bg-foreground text-background"
          : "bg-secondary text-foreground hover:bg-accent"
      )}
    >
      {children}
    </button>
  );
}

function Toggle({ label, checked, onChange, color = "emerald" }) {
  const colors = {
    emerald: checked ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "",
    red: checked ? "border-red-600 bg-red-50 text-red-700" : "",
    amber: checked ? "border-amber-600 bg-amber-50 text-amber-700" : "",
  };
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 px-3 py-2 text-xs font-bold transition",
        checked ? colors[color] : "border-border bg-background text-muted-foreground"
      )}
    >
      {checked ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}
