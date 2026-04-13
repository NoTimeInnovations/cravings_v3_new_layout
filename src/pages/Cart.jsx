import { Link, useNavigate } from "react-router-dom";
import { Plus, Minus, Trash2, BadgePercent, Bike, ReceiptText, ShoppingBag, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cartStore";
import { useMenuStore } from "@/store/menuStore";
import { useSessionStore } from "@/store/sessionStore";
import { formatINR, cn } from "@/lib/utils";

export default function Cart() {
  const navigate = useNavigate();
  const restaurant = useMenuStore((s) => s.restaurant);
  const orderType = useSessionStore((s) => s.orderType);
  const isTakeaway = orderType === "takeaway";
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const subtotal = useCartStore((s) => s.getSubtotal());

  const list = Object.values(items);
  const deliveryFee = isTakeaway ? 0 : subtotal > 0 ? 39 : 0;
  const taxes = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + taxes;

  if (list.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBack title="Your Cart" />
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-6 py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-4xl">
            🛒
          </div>
          <h2 className="mt-4 font-display text-xl font-extrabold">Your cart is empty</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Explore our delicious menu and add items.
          </p>
          <Button asChild className="mt-4" size="sm">
            <Link to="/">
              <ShoppingBag className="h-3.5 w-3.5" /> Browse Menu
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/40 pb-24">
      <Header showBack title="Cart" />
      <div className="mx-auto max-w-2xl space-y-2 px-3 py-3">
        {/* Restaurant */}
        <div className="flex items-center gap-2.5 rounded-xl border bg-white p-3 shadow-sm">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-rose-100 text-lg">
            ☕
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{restaurant.name}</p>
            <p className="text-[10px] text-muted-foreground">{restaurant.distance} · Connaught Place</p>
          </div>
        </div>

        {/* Items */}
        <div className="rounded-xl border bg-white p-3 shadow-sm">
          <div className="divide-y divide-border/60">
            {list.map(({ item, qty }) => (
              <div key={item.id} className="flex items-center gap-2.5 py-2.5 first:pt-0 last:pb-0">
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-2xl ring-1 ring-black/5",
                    item.gradient
                  )}
                >
                  {item.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground">{formatINR(item.price)}</p>
                </div>
                <div className="flex items-center gap-0.5 rounded-md border border-emerald-600/30 bg-white px-0.5 py-0.5">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex h-6 w-6 items-center justify-center rounded text-emerald-700"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="min-w-[16px] text-center text-xs font-extrabold text-emerald-700">
                    {qty}
                  </span>
                  <button
                    onClick={() => addItem(item)}
                    className="flex h-6 w-6 items-center justify-center rounded text-emerald-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="w-14 text-right text-xs font-bold">
                  {formatINR(item.price * qty)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-border/60">
            <button
              onClick={clearCart}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground hover:text-red-600"
            >
              <Trash2 className="h-3 w-3" /> Clear cart
            </button>
          </div>
        </div>

        {/* Coupon */}
        <button className="flex w-full items-center gap-2.5 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3 text-left">
          <BadgePercent className="h-4 w-4 text-primary" />
          <span className="flex-1 text-xs font-bold text-primary">Apply coupons & offers</span>
          <ChevronRight className="h-4 w-4 text-primary/60" />
        </button>

        {/* Delivery info */}
        {!isTakeaway && (
          <div className="flex items-center gap-2.5 rounded-xl border bg-white p-3 shadow-sm">
            <Bike className="h-4 w-4 text-emerald-700" />
            <div className="flex-1">
              <p className="text-xs font-bold">{restaurant.deliveryTime}</p>
              <p className="text-[10px] text-muted-foreground">Standard Delivery</p>
            </div>
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
              Fastest
            </span>
          </div>
        )}

        {/* Bill */}
        <div className="rounded-xl border bg-white p-3 shadow-sm">
          <div className="flex items-center gap-1.5">
            <ReceiptText className="h-3.5 w-3.5 text-muted-foreground" />
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Bill Details
            </h4>
          </div>
          <div className="mt-2 space-y-1 text-xs">
            <Row label="Item Total" value={formatINR(subtotal)} />
            {!isTakeaway && <Row label="Delivery Fee" value={formatINR(deliveryFee)} />}
            <Row label="GST & Charges" value={formatINR(taxes)} />
            <Separator className="my-1.5" />
            <div className="flex items-center justify-between text-sm font-extrabold">
              <span>To Pay</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-white/95 px-3 py-2.5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="flex-1">
            <p className="text-[10px] text-muted-foreground">Total</p>
            <p className="text-base font-extrabold leading-none">{formatINR(total)}</p>
          </div>
          <Button
            size="sm"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-2.5"
            onClick={() => navigate("/checkout")}
          >
            Proceed to Pay <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
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
