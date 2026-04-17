import { useState } from "react";
import { Link } from "react-router-dom";
import { Store, Tags, UtensilsCrossed, Plus, Trash2, Pencil, Check, X, RotateCcw, Star, ReceiptText, ChevronDown, ChevronUp, MapPin, Phone, Clock, LayoutList, LayoutGrid, Image, Megaphone, Layout, ExternalLink, ArrowUp, ArrowDown, Eye, EyeOff, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SectionRenderer from "@/components/storefront/SectionRenderer";
import { useMenuStore, GRADIENTS, BRAND_COLORS, SECTION_TYPES } from "@/store/menuStore";
import { useOrdersStore, ORDER_STATUSES, STATUS_BY_ID, CANCELLED_STATUS } from "@/store/ordersStore";
import { cn, formatINR } from "@/lib/utils";

const TABS = [
  { id: "orders", label: "Orders", icon: ReceiptText },
  { id: "items", label: "Menu", icon: UtensilsCrossed },
  { id: "storefront", label: "Storefront", icon: Layout },
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
          {tab === "storefront" && <StorefrontTab />}
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
  const heroLayout = useMenuStore((s) => s.heroLayout);
  const setHeroLayout = useMenuStore((s) => s.setHeroLayout);

  const heroBanners = useMenuStore((s) => s.heroBanners);
  const addHeroBanner = useMenuStore((s) => s.addHeroBanner);
  const updateHeroBanner = useMenuStore((s) => s.updateHeroBanner);
  const removeHeroBanner = useMenuStore((s) => s.removeHeroBanner);
  const moveHeroBanner = useMenuStore((s) => s.moveHeroBanner);
  const autoplayMs = useMenuStore((s) => s.heroBannerAutoplayMs);
  const setAutoplayMs = useMenuStore((s) => s.setHeroBannerAutoplayMs);

  const brandColor = useMenuStore((s) => s.brandColor);
  const setBrandColor = useMenuStore((s) => s.setBrandColor);

  const set = (k) => (e) => updateRestaurant({ [k]: e.target.value });

  return (
    <div className="space-y-3">
      {/* Live DB status */}
      <DbStatusCard />

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
        <SectionTitle
          title="Hero Layout"
          subtitle="How the restaurant banner & logo appear on the menu page"
        />
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              id: "compact",
              icon: LayoutList,
              label: "Compact",
              desc: "Small logo next to name",
            },
            {
              id: "banner",
              icon: Image,
              label: "Banner",
              desc: "Large cover image at top",
            },
          ].map((l) => {
            const Icon = l.icon;
            const sel = heroLayout === l.id;
            return (
              <button
                key={l.id}
                onClick={() => setHeroLayout(l.id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition",
                  sel
                    ? "border-primary bg-primary/5"
                    : "border-border bg-secondary/30 hover:border-primary/40"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    sel ? "bg-primary text-white" : "bg-white text-foreground"
                  )}
                >
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
        <div className="flex items-center justify-between">
          <SectionTitle
            title="Hero Banners"
            subtitle={
              heroBanners.length === 0
                ? "Empty = uses live store_banner from Hasura"
                : `${heroBanners.length} banner${heroBanners.length === 1 ? "" : "s"} · auto-scrolls`
            }
            inline
          />
          <Button size="sm" onClick={() => addHeroBanner()}>
            <Plus className="h-3.5 w-3.5" /> Add Banner
          </Button>
        </div>

        <div className="mt-3 space-y-2.5">
          {heroBanners.map((b, idx) => (
            <div
              key={b.id}
              className="rounded-xl border bg-secondary/30 p-2.5"
            >
              <div className="flex items-start gap-2.5">
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary ring-1 ring-black/5">
                  {b.imageUrl ? (
                    <img
                      src={b.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl text-muted-foreground">
                      🖼️
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Input
                    value={b.imageUrl}
                    onChange={(e) =>
                      updateHeroBanner(b.id, { imageUrl: e.target.value })
                    }
                    placeholder="https://... (banner image URL)"
                    className="h-9 text-xs"
                  />
                  <div className="flex items-center gap-1">
                    <button
                      disabled={idx === 0}
                      onClick={() => moveHeroBanner(b.id, "up")}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent disabled:opacity-30"
                      title="Move up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      disabled={idx === heroBanners.length - 1}
                      onClick={() => moveHeroBanner(b.id, "down")}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent disabled:opacity-30"
                      title="Move down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      #{idx + 1}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm("Delete this banner?"))
                          removeHeroBanner(b.id);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {heroBanners.length === 0 && (
            <p className="rounded-xl border-2 border-dashed py-5 text-center text-xs text-muted-foreground">
              No custom banners. Click "Add Banner" to override the default.
            </p>
          )}
        </div>

        {heroBanners.length > 1 && (
          <div className="mt-3 rounded-xl border bg-secondary/30 p-3">
            <Field
              label={
                autoplayMs > 0
                  ? `Auto-scroll every ${(autoplayMs / 1000).toFixed(1)}s`
                  : "Auto-scroll disabled"
              }
            >
              <input
                type="range"
                min="0"
                max="10000"
                step="500"
                value={autoplayMs}
                onChange={(e) => setAutoplayMs(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
            </Field>
            <p className="text-[10px] text-muted-foreground">
              Set to 0 (far left) to turn off auto-scroll — users can still swipe.
            </p>
          </div>
        )}
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
          <Field label="Delivery Time">
            <Input value={restaurant.deliveryTime || ""} onChange={set("deliveryTime")} />
          </Field>
          <Field label="Distance">
            <Input value={restaurant.distance || ""} onChange={set("distance")} />
          </Field>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Contact & Links" subtitle="Shown as icon buttons on the menu" />
        <div className="space-y-3">
          <Field label="Phone (for call button)">
            <Input
              value={restaurant.phone || ""}
              onChange={set("phone")}
              placeholder="+91 98765 43210"
            />
          </Field>
          <Field label="WhatsApp number">
            <Input
              value={restaurant.whatsapp || ""}
              onChange={set("whatsapp")}
              placeholder="+91 98765 43210 (without + for wa.me)"
            />
          </Field>
          <Field label="Instagram URL">
            <Input
              value={restaurant.instagram || ""}
              onChange={set("instagram")}
              placeholder="https://instagram.com/..."
            />
          </Field>
          <Field label="Google Maps URL">
            <Input
              value={restaurant.mapUrl || ""}
              onChange={set("mapUrl")}
              placeholder="https://maps.google.com/... (empty = built from address)"
            />
          </Field>
          <Field label="Google Review URL (for rate button)">
            <Input
              value={restaurant.googleReviewUrl || ""}
              onChange={set("googleReviewUrl")}
              placeholder="https://g.page/r/..."
            />
          </Field>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Address" />
        <Field label="Full Address">
          <Input value={restaurant.address || ""} onChange={set("address")} />
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
            "flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl text-4xl ring-1 ring-black/5",
            !item.imageUrl && "bg-gradient-to-br",
            !item.imageUrl && item.gradient
          )}
        >
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            item.emoji
          )}
        </div>
        <div className="text-xs text-muted-foreground">Live preview</div>
      </div>

      <Field label="Image URL">
        <Input
          value={item.imageUrl || ""}
          onChange={(e) => set({ imageUrl: e.target.value })}
          placeholder="https://... (leave empty to use emoji)"
        />
      </Field>

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
        <Field label="Emoji fallback">
          <Input
            value={item.emoji}
            onChange={(e) => set({ emoji: e.target.value })}
            maxLength={2}
            className="text-center text-2xl"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-3">
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

/* ============================ DB Status ============================ */
function DbStatusCard() {
  const loading = useMenuStore((s) => s.dbLoading);
  const error = useMenuStore((s) => s.dbError);
  const latency = useMenuStore((s) => s.dbLatencyMs);
  const fetchedAt = useMenuStore((s) => s.dbFetchedAt);
  const source = useMenuStore((s) => s.dbSource);
  const items = useMenuStore((s) => s.items);
  const categories = useMenuStore((s) => s.categories);
  const loadFromDb = useMenuStore((s) => s.loadFromDb);

  const badgeClass = error
    ? "bg-red-50 text-red-700 border-red-200"
    : loading
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : source === "remote"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-secondary text-muted-foreground border-border";

  const label = error
    ? "Offline"
    : loading
    ? "Fetching…"
    : source === "remote"
    ? "Live"
    : "Seed";

  const latencyTier = latency == null
    ? null
    : latency < 500
    ? { c: "text-emerald-700", t: "Fast" }
    : latency < 1200
    ? { c: "text-amber-700", t: "OK" }
    : { c: "text-red-700", t: "Slow" };

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-extrabold tracking-tight">
            Live data
          </h3>
          <p className="text-xs text-muted-foreground">
            Pulled from Hasura on every reload
          </p>
        </div>
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider",
            badgeClass
          )}
        >
          {label}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="Items" value={items.length} />
        <Stat label="Categories" value={categories.length} />
        <Stat
          label="Latency"
          value={latency != null ? `${latency}ms` : "—"}
          tone={latencyTier?.c}
          tag={latencyTier?.t}
        />
      </div>

      {error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2 text-[11px] text-red-700">
          {error}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">
          {fetchedAt
            ? `Updated ${new Date(fetchedAt).toLocaleTimeString()}`
            : "Not fetched yet"}
        </p>
        <Button
          size="sm"
          variant="outline"
          disabled={loading}
          onClick={() => loadFromDb().catch(() => {})}
        >
          <RotateCcw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Refetch
        </Button>
      </div>
    </Card>
  );
}

function Stat({ label, value, tone, tag }) {
  return (
    <div className="rounded-xl border bg-secondary/30 p-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-0.5 text-lg font-extrabold", tone)}>{value}</p>
      {tag && (
        <p className={cn("text-[10px] font-bold", tone)}>{tag}</p>
      )}
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

/* ============================ STOREFRONT TAB (BUILDER) ============================ */
function StorefrontTab() {
  const storefront = useMenuStore((s) => s.storefront);
  const updateStorefront = useMenuStore((s) => s.updateStorefront);
  const addSection = useMenuStore((s) => s.addSection);
  const toggleSection = useMenuStore((s) => s.toggleSection);
  const removeSection = useMenuStore((s) => s.removeSection);
  const moveSection = useMenuStore((s) => s.moveSection);
  const resetStorefront = useMenuStore((s) => s.resetStorefront);

  const [editingId, setEditingId] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  const editing = storefront.sections.find((s) => s.id === editingId);

  return (
    <div className="space-y-3">
      {/* Overview */}
      <Card>
        <div className="flex items-start justify-between gap-3">
          <SectionTitle
            title="Storefront builder"
            subtitle="Your public landing page — share on WhatsApp, Google, Instagram"
            inline
          />
          <Button asChild size="sm" variant="outline">
            <Link to="/storefront" target="_blank">
              <ExternalLink className="h-3.5 w-3.5" /> Preview
            </Link>
          </Button>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-xl border bg-secondary/40 p-3.5">
          <Switch
            checked={storefront.enabled}
            onCheckedChange={(v) => updateStorefront({ enabled: v })}
          />
          <div className="flex-1">
            <p className="text-sm font-bold">
              {storefront.enabled ? "Published" : "Unpublished"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              URL: <span className="font-mono font-semibold">/storefront</span>
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (confirm("Reset storefront to defaults? All edits will be lost."))
                resetStorefront();
            }}
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
        </div>
      </Card>

      {/* Logo & Brand */}
      <Card>
        <SectionTitle title="Logo & brand name" subtitle="Shown in header, footer, and share previews" />
        <div className="space-y-4">
          <div>
            <Label>Brand name</Label>
            <Input
              className="mt-1.5"
              value={storefront.brandName}
              onChange={(e) => updateStorefront({ brandName: e.target.value })}
              placeholder="Defaults to your restaurant name"
            />
          </div>

          <div>
            <Label>Logo type</Label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {[
                { id: "emoji", label: "Emoji", icon: "🍕" },
                { id: "image", label: "Image URL", icon: "🖼️" },
              ].map((t) => {
                const sel = storefront.logoType === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => updateStorefront({ logoType: t.id })}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border-2 px-3 py-2.5 text-xs font-bold transition",
                      sel
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    <span className="text-base">{t.icon}</span>
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {storefront.logoType === "emoji" ? (
            <div>
              <Label>Emoji</Label>
              <Input
                className="mt-1.5 text-center text-2xl"
                value={storefront.logoEmoji}
                onChange={(e) => updateStorefront({ logoEmoji: e.target.value })}
                maxLength={2}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Logo image URL</Label>
              <Input
                className="mt-1.5"
                value={storefront.logoImage}
                onChange={(e) => updateStorefront({ logoImage: e.target.value })}
                placeholder="https://..."
              />
              {storefront.logoImage && (
                <img
                  src={storefront.logoImage}
                  alt=""
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-black/10"
                />
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Sections list */}
      <Card>
        <div className="flex items-center justify-between">
          <SectionTitle
            title="Sections"
            subtitle={`${storefront.sections.length} in order · tap to edit`}
            inline
          />
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Add Section
          </Button>
        </div>

        <div className="mt-4 space-y-2">
          {storefront.sections.map((sec, idx) => {
            const meta = SECTION_TYPES.find((t) => t.id === sec.type);
            return (
              <div
                key={sec.id}
                className={cn(
                  "group flex items-center gap-2 rounded-xl border bg-white p-2.5 transition hover:border-primary/40",
                  !sec.enabled && "opacity-60"
                )}
              >
                <div className="flex flex-col gap-0.5">
                  <button
                    disabled={idx === 0}
                    onClick={() => moveSection(sec.id, "up")}
                    className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-accent disabled:opacity-30"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    disabled={idx === storefront.sections.length - 1}
                    onClick={() => moveSection(sec.id, "down")}
                    className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-accent disabled:opacity-30"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                </div>

                <button
                  onClick={() => setEditingId(sec.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-xl">
                    {meta?.icon || "■"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold">
                      {meta?.label || sec.type}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {sectionSummary(sec)}
                    </p>
                  </div>
                </button>

                <Switch
                  checked={sec.enabled}
                  onCheckedChange={() => toggleSection(sec.id)}
                />
                <button
                  onClick={() => setEditingId(sec.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${meta?.label}" section?`))
                      removeSection(sec.id);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}

          {storefront.sections.length === 0 && (
            <div className="rounded-xl border-2 border-dashed bg-secondary/30 py-10 text-center">
              <Layout className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-bold">No sections yet</p>
              <p className="text-xs text-muted-foreground">
                Click "Add Section" to start building.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Add Section Dialog */}
      <AddSectionDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={(type) => {
          addSection(type);
          setAddOpen(false);
          // Open editor for newly added section
          setTimeout(() => {
            const latest = useMenuStore.getState().storefront.sections.slice(-1)[0];
            if (latest) setEditingId(latest.id);
          }, 50);
        }}
      />

      {/* Section Editor Dialog */}
      <SectionEditorDialog
        section={editing}
        onClose={() => setEditingId(null)}
      />
    </div>
  );
}

function sectionSummary(sec) {
  const c = sec.content || {};
  switch (sec.type) {
    case "hero": return c.heading || "(hero)";
    case "carousel": return `${(c.slides || []).length} slide(s)`;
    case "imageText": return c.heading || "(image + text)";
    case "featured": return c.title || "Featured items";
    case "cta": return c.heading || "(call to action)";
    case "testimonials": return `${(c.quotes || []).length} review(s)`;
    case "about": return c.heading || "(about)";
    case "footer": return c.phone || c.email || "Footer";
    default: return "";
  }
}

/* ================== ADD SECTION DIALOG ================== */
function AddSectionDialog({ open, onClose, onAdd }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add a section</DialogTitle>
          <DialogDescription>Pick a block to insert at the end.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-2">
            {SECTION_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => onAdd(t.id)}
                className="flex flex-col items-start gap-2 rounded-xl border bg-white p-3 text-left transition hover:border-primary hover:bg-primary/5"
              >
                <span className="text-2xl">{t.icon}</span>
                <div>
                  <p className="text-xs font-extrabold">{t.label}</p>
                  <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
                    {t.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ================== SECTION EDITOR DIALOG ================== */
function SectionEditorDialog({ section, onClose }) {
  const meta = section ? SECTION_TYPES.find((t) => t.id === section.type) : null;
  return (
    <Dialog open={!!section} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex h-[92vh] flex-col gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="flex flex-row items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg">
            {meta?.icon || "■"}
          </div>
          <div className="flex-1">
            <DialogTitle>Edit · {meta?.label}</DialogTitle>
            <DialogDescription>{meta?.desc}</DialogDescription>
          </div>
          <DialogClose className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>

        {section && (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-secondary/40">
            {/* Live preview */}
            <div className="shrink-0 border-b bg-secondary/50 px-4 py-3">
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                Live preview
              </p>
              <div className="max-h-[32vh] overflow-y-auto overflow-x-hidden rounded-xl bg-white shadow-md ring-1 ring-black/10">
                <div className="pointer-events-none">
                  <SectionRenderer section={{ ...section, enabled: true }} />
                </div>
              </div>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-y-auto bg-white">
              <div className="mx-auto max-w-xl px-5 py-5">
                <SectionFormRouter section={section} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Close</Button>
              <Button onClick={onClose}>Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ================== FORM ROUTER ================== */
function SectionFormRouter({ section }) {
  const updateSection = useMenuStore((s) => s.updateSection);
  const set = (patch) => updateSection(section.id, patch);

  switch (section.type) {
    case "hero":         return <HeroEditor content={section.content} set={set} />;
    case "carousel":     return <CarouselEditor section={section} />;
    case "imageText":    return <ImageTextEditor content={section.content} set={set} />;
    case "featured":     return <FeaturedEditor content={section.content} set={set} />;
    case "cta":          return <CTAEditor content={section.content} set={set} />;
    case "testimonials": return <TestimonialsEditor section={section} />;
    case "about":        return <AboutEditor content={section.content} set={set} />;
    case "footer":       return <FooterEditor content={section.content} set={set} />;
    default: return null;
  }
}

/* ================== REUSABLE FIELD WRAPPERS ================== */
function FieldRow({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ImagePreview({ src }) {
  if (!src) return null;
  return (
    <div className="mt-2 overflow-hidden rounded-lg ring-1 ring-black/5">
      <img src={src} alt="" className="h-32 w-full object-cover" />
    </div>
  );
}

function SubCard({ children, onDelete, title }) {
  return (
    <div className="space-y-3 rounded-xl border bg-secondary/30 p-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        {onDelete && (
          <button
            onClick={onDelete}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

/* ================== HERO ================== */
function HeroEditor({ content, set }) {
  return (
    <Tabs defaultValue="content" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="content">Content</TabsTrigger>
        <TabsTrigger value="cta">Buttons</TabsTrigger>
        <TabsTrigger value="style">Style</TabsTrigger>
      </TabsList>

      <TabsContent value="content" className="space-y-4">
        <FieldRow label="Eyebrow label" hint="Small pill shown above the heading">
          <Input
            value={content.eyebrow || ""}
            onChange={(e) => set({ eyebrow: e.target.value })}
            placeholder="e.g. Best Pizza in Henderson"
          />
        </FieldRow>
        <FieldRow label="Heading">
          <Textarea
            value={content.heading || ""}
            onChange={(e) => set({ heading: e.target.value })}
            rows={2}
          />
        </FieldRow>
        <FieldRow label="Subheading">
          <Textarea
            value={content.subheading || ""}
            onChange={(e) => set({ subheading: e.target.value })}
            rows={2}
          />
        </FieldRow>
      </TabsContent>

      <TabsContent value="cta" className="space-y-5">
        <SubCard title="Primary Button">
          <FieldRow label="Label">
            <Input
              value={content.ctaPrimary?.label || ""}
              onChange={(e) => set({ ctaPrimary: { ...content.ctaPrimary, label: e.target.value } })}
            />
          </FieldRow>
          <FieldRow label="Link / URL">
            <Input
              value={content.ctaPrimary?.link || ""}
              onChange={(e) => set({ ctaPrimary: { ...content.ctaPrimary, link: e.target.value } })}
              placeholder="/ or https://..."
            />
          </FieldRow>
        </SubCard>
        <SubCard title="Secondary Button">
          <FieldRow label="Label" hint="Leave empty to hide">
            <Input
              value={content.ctaSecondary?.label || ""}
              onChange={(e) => set({ ctaSecondary: { ...content.ctaSecondary, label: e.target.value } })}
            />
          </FieldRow>
          <FieldRow label="Link / URL">
            <Input
              value={content.ctaSecondary?.link || ""}
              onChange={(e) => set({ ctaSecondary: { ...content.ctaSecondary, link: e.target.value } })}
            />
          </FieldRow>
        </SubCard>
      </TabsContent>

      <TabsContent value="style" className="space-y-4">
        <FieldRow label="Background image URL">
          <Input
            value={content.backgroundImage || ""}
            onChange={(e) => set({ backgroundImage: e.target.value })}
            placeholder="https://..."
          />
          <ImagePreview src={content.backgroundImage} />
        </FieldRow>
        <FieldRow label={`Overlay darkness · ${content.overlayOpacity ?? 55}%`}>
          <Slider
            value={[content.overlayOpacity ?? 55]}
            min={0}
            max={90}
            step={5}
            onValueChange={([v]) => set({ overlayOpacity: v })}
          />
        </FieldRow>
      </TabsContent>
    </Tabs>
  );
}

/* ================== CAROUSEL ================== */
function CarouselEditor({ section }) {
  const updateSection = useMenuStore((s) => s.updateSection);
  const addSlide = useMenuStore((s) => s.addSlide);
  const updateSlide = useMenuStore((s) => s.updateSlide);
  const removeSlide = useMenuStore((s) => s.removeSlide);
  const slides = section.content.slides || [];

  return (
    <div className="space-y-5">
      <FieldRow label="Section title (optional)">
        <Input
          value={section.content.title || ""}
          onChange={(e) => updateSection(section.id, { title: e.target.value })}
          placeholder="e.g. What's new"
        />
      </FieldRow>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <Label>Slides · {slides.length}</Label>
          <Button size="sm" variant="outline" onClick={() => addSlide(section.id)}>
            <Plus className="h-3.5 w-3.5" /> Slide
          </Button>
        </div>

        <div className="space-y-3">
          {slides.map((sl, i) => (
            <SubCard
              key={sl.id}
              title={`Slide ${i + 1}`}
              onDelete={() => {
                if (confirm("Delete slide?")) removeSlide(section.id, sl.id);
              }}
            >
              {sl.image && (
                <img src={sl.image} alt="" className="h-24 w-full rounded-lg object-cover ring-1 ring-black/5" />
              )}
              <FieldRow label="Image URL">
                <Input
                  value={sl.image}
                  onChange={(e) => updateSlide(section.id, sl.id, { image: e.target.value })}
                  placeholder="https://..."
                />
              </FieldRow>
              <FieldRow label="Heading">
                <Input
                  value={sl.heading}
                  onChange={(e) => updateSlide(section.id, sl.id, { heading: e.target.value })}
                />
              </FieldRow>
              <FieldRow label="Description">
                <Textarea
                  value={sl.description}
                  onChange={(e) => updateSlide(section.id, sl.id, { description: e.target.value })}
                  rows={2}
                />
              </FieldRow>
              <div className="grid grid-cols-2 gap-3">
                <FieldRow label="CTA label">
                  <Input
                    value={sl.ctaLabel || ""}
                    onChange={(e) => updateSlide(section.id, sl.id, { ctaLabel: e.target.value })}
                  />
                </FieldRow>
                <FieldRow label="CTA link">
                  <Input
                    value={sl.ctaLink || ""}
                    onChange={(e) => updateSlide(section.id, sl.id, { ctaLink: e.target.value })}
                  />
                </FieldRow>
              </div>
            </SubCard>
          ))}

          {slides.length === 0 && (
            <p className="rounded-xl border-2 border-dashed py-8 text-center text-xs text-muted-foreground">
              No slides yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================== IMAGE + TEXT ================== */
function ImageTextEditor({ content, set }) {
  return (
    <div className="space-y-4">
      <FieldRow label="Image URL">
        <Input
          value={content.image || ""}
          onChange={(e) => set({ image: e.target.value })}
          placeholder="https://..."
        />
        <ImagePreview src={content.image} />
      </FieldRow>
      <FieldRow label="Heading">
        <Input value={content.heading || ""} onChange={(e) => set({ heading: e.target.value })} />
      </FieldRow>
      <FieldRow label="Description">
        <Textarea
          value={content.description || ""}
          onChange={(e) => set({ description: e.target.value })}
          rows={5}
        />
      </FieldRow>
      <div className="grid grid-cols-2 gap-3">
        <FieldRow label="CTA label" hint="Leave empty to hide">
          <Input value={content.ctaLabel || ""} onChange={(e) => set({ ctaLabel: e.target.value })} />
        </FieldRow>
        <FieldRow label="CTA link">
          <Input value={content.ctaLink || ""} onChange={(e) => set({ ctaLink: e.target.value })} />
        </FieldRow>
      </div>
      <FieldRow label="Image position">
        <div className="grid grid-cols-2 gap-2">
          {["top", "bottom"].map((p) => {
            const sel = (content.imagePosition || "top") === p;
            return (
              <button
                key={p}
                onClick={() => set({ imagePosition: p })}
                className={cn(
                  "rounded-lg border-2 px-3 py-2 text-xs font-bold capitalize transition",
                  sel
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40"
                )}
              >
                Image {p}
              </button>
            );
          })}
        </div>
      </FieldRow>
    </div>
  );
}

/* ================== FEATURED ITEMS ================== */
function FeaturedEditor({ content, set }) {
  const items = useMenuStore((s) => s.items);
  const selected = content.itemIds || [];
  const toggle = (id) =>
    set({
      itemIds: selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id],
    });

  return (
    <div className="space-y-4">
      <FieldRow label="Title">
        <Input value={content.title || ""} onChange={(e) => set({ title: e.target.value })} />
      </FieldRow>
      <FieldRow label="Subtitle">
        <Input value={content.subtitle || ""} onChange={(e) => set({ subtitle: e.target.value })} />
      </FieldRow>
      <div className="grid grid-cols-2 gap-3">
        <FieldRow label="CTA label">
          <Input value={content.ctaLabel || ""} onChange={(e) => set({ ctaLabel: e.target.value })} />
        </FieldRow>
        <FieldRow label="CTA link">
          <Input value={content.ctaLink || ""} onChange={(e) => set({ ctaLink: e.target.value })} />
        </FieldRow>
      </div>
      <div>
        <Label>
          Items to feature · {selected.length === 0 ? "auto (bestsellers)" : `${selected.length} selected`}
        </Label>
        <div className="mt-2 grid max-h-72 grid-cols-3 gap-1.5 overflow-y-auto rounded-xl border bg-white p-2">
          {items.map((it) => {
            const sel = selected.includes(it.id);
            return (
              <button
                key={it.id}
                onClick={() => toggle(it.id)}
                className={cn(
                  "flex flex-col items-stretch gap-1 rounded-lg border-2 p-1.5 text-left transition",
                  sel
                    ? "border-primary bg-primary/5"
                    : "border-transparent bg-white hover:border-primary/30"
                )}
              >
                <div className={cn("flex h-12 w-full items-center justify-center rounded bg-gradient-to-br text-2xl", it.gradient)}>
                  {it.emoji}
                </div>
                <p className="line-clamp-1 text-[10px] font-bold">{it.name}</p>
              </button>
            );
          })}
        </div>
        {selected.length > 0 && (
          <button
            onClick={() => set({ itemIds: [] })}
            className="mt-2 text-[11px] font-bold text-muted-foreground hover:text-foreground"
          >
            Clear selection
          </button>
        )}
      </div>
    </div>
  );
}

/* ================== CTA ================== */
function CTAEditor({ content, set }) {
  return (
    <Tabs defaultValue="content" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="content">Content</TabsTrigger>
        <TabsTrigger value="style">Style</TabsTrigger>
      </TabsList>

      <TabsContent value="content" className="space-y-4">
        <FieldRow label="Heading">
          <Input value={content.heading || ""} onChange={(e) => set({ heading: e.target.value })} />
        </FieldRow>
        <FieldRow label="Description">
          <Textarea
            value={content.description || ""}
            onChange={(e) => set({ description: e.target.value })}
            rows={4}
          />
        </FieldRow>
        <div className="grid grid-cols-2 gap-3">
          <FieldRow label="CTA label">
            <Input value={content.ctaLabel || ""} onChange={(e) => set({ ctaLabel: e.target.value })} />
          </FieldRow>
          <FieldRow label="CTA link">
            <Input value={content.ctaLink || ""} onChange={(e) => set({ ctaLink: e.target.value })} />
          </FieldRow>
        </div>
      </TabsContent>

      <TabsContent value="style" className="space-y-4">
        <FieldRow label="Background image URL (optional)">
          <Input value={content.backgroundImage || ""} onChange={(e) => set({ backgroundImage: e.target.value })} />
          <ImagePreview src={content.backgroundImage} />
        </FieldRow>
        <FieldRow label="Color variant">
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "primary", label: "Brand", preview: "bg-primary" },
              { id: "dark", label: "Dark", preview: "bg-foreground" },
              { id: "light", label: "Light", preview: "bg-secondary" },
            ].map((v) => {
              const sel = (content.variant || "primary") === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => set({ variant: v.id })}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg border-2 p-2.5 text-xs font-bold transition",
                    sel
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40"
                  )}
                >
                  <span className={cn("h-8 w-full rounded", v.preview)} />
                  {v.label}
                </button>
              );
            })}
          </div>
        </FieldRow>
      </TabsContent>
    </Tabs>
  );
}

/* ================== TESTIMONIALS ================== */
function TestimonialsEditor({ section }) {
  const updateSection = useMenuStore((s) => s.updateSection);
  const addQuote = useMenuStore((s) => s.addQuote);
  const updateQuote = useMenuStore((s) => s.updateQuote);
  const removeQuote = useMenuStore((s) => s.removeQuote);
  const quotes = section.content.quotes || [];

  return (
    <div className="space-y-5">
      <FieldRow label="Section title">
        <Input
          value={section.content.title || ""}
          onChange={(e) => updateSection(section.id, { title: e.target.value })}
        />
      </FieldRow>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <Label>Reviews · {quotes.length}</Label>
          <Button size="sm" variant="outline" onClick={() => addQuote(section.id)}>
            <Plus className="h-3.5 w-3.5" /> Review
          </Button>
        </div>

        <div className="space-y-3">
          {quotes.map((q, i) => (
            <SubCard
              key={q.id}
              title={`Review ${i + 1}`}
              onDelete={() => {
                if (confirm("Delete review?")) removeQuote(section.id, q.id);
              }}
            >
              <FieldRow label="Reviewer name">
                <Input
                  value={q.name}
                  onChange={(e) => updateQuote(section.id, q.id, { name: e.target.value })}
                />
              </FieldRow>
              <FieldRow label="Review text">
                <Textarea
                  value={q.text}
                  onChange={(e) => updateQuote(section.id, q.id, { text: e.target.value })}
                  rows={4}
                />
              </FieldRow>
              <FieldRow label={`Rating · ${q.rating || 5}/5`}>
                <Slider
                  value={[q.rating || 5]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={([v]) => updateQuote(section.id, q.id, { rating: v })}
                />
              </FieldRow>
            </SubCard>
          ))}

          {quotes.length === 0 && (
            <p className="rounded-xl border-2 border-dashed py-8 text-center text-xs text-muted-foreground">
              No reviews yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================== ABOUT ================== */
function AboutEditor({ content, set }) {
  return (
    <div className="space-y-4">
      <FieldRow label="Image URL (optional)">
        <Input value={content.image || ""} onChange={(e) => set({ image: e.target.value })} />
        <ImagePreview src={content.image} />
      </FieldRow>
      <FieldRow label="Heading">
        <Input value={content.heading || ""} onChange={(e) => set({ heading: e.target.value })} />
      </FieldRow>
      <FieldRow label="Description">
        <Textarea
          value={content.description || ""}
          onChange={(e) => set({ description: e.target.value })}
          rows={6}
        />
      </FieldRow>
    </div>
  );
}

/* ================== FOOTER ================== */
function FooterEditor({ content, set }) {
  return (
    <div className="space-y-4">
      <FieldRow label="Short description">
        <Textarea
          value={content.description || ""}
          onChange={(e) => set({ description: e.target.value })}
          rows={3}
          placeholder="One-line intro shown above contact info"
        />
      </FieldRow>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FieldRow label="Phone">
          <Input value={content.phone || ""} onChange={(e) => set({ phone: e.target.value })} />
        </FieldRow>
        <FieldRow label="Email">
          <Input value={content.email || ""} onChange={(e) => set({ email: e.target.value })} />
        </FieldRow>
      </div>
      <FieldRow label="Copyright">
        <Input value={content.copyright || ""} onChange={(e) => set({ copyright: e.target.value })} />
      </FieldRow>
    </div>
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
