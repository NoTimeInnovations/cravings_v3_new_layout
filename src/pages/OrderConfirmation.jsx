import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, MapPin, Phone, Receipt, Share2, Home, XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cartStore";
import { useMenuStore } from "@/store/menuStore";
import { useOrdersStore, ORDER_STATUSES, statusIndex, CANCELLED_STATUS } from "@/store/ordersStore";
import { formatINR, cn } from "@/lib/utils";

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const lastOrderId = useCartStore((s) => s.lastOrderId);
  const order = useOrdersStore((s) => s.orders.find((o) => o.id === lastOrderId));
  const restaurant = useMenuStore((s) => s.restaurant);

  useEffect(() => {
    if (!lastOrderId) navigate("/");
  }, [lastOrderId, navigate]);

  if (!order) return null;

  const cancelled = order.status === "cancelled";
  const currentIdx = cancelled ? -1 : statusIndex(order.status);
  const currentStatus = cancelled ? CANCELLED_STATUS : ORDER_STATUSES[currentIdx];
  const isComplete = order.status === "delivered";
  const StatusIcon = currentStatus.icon;

  return (
    <div className="min-h-screen bg-secondary/40 pb-16">
      {/* Compact status header */}
      <div
        className={cn(
          "px-3 pb-3 pt-3 text-white transition-colors duration-700",
          cancelled
            ? "bg-gradient-to-r from-red-500 to-rose-600"
            : isComplete
            ? "bg-gradient-to-r from-emerald-500 to-teal-600"
            : "bg-gradient-to-r from-orange-500 to-rose-500"
        )}
      >
        <div className="mx-auto max-w-2xl">
          {/* Top row: back + order id */}
          <div className="flex items-center justify-between">
            <button onClick={() => navigate("/")} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Order #{order.id}</p>
          </div>

          {/* Status row */}
          <div className="mt-2.5 flex items-center gap-3">
            <div className="relative">
              {!cancelled && !isComplete && (
                <span className="absolute inset-0 animate-pulse-ring rounded-full bg-white/30" />
              )}
              <div
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/30",
                  !cancelled && !isComplete && "animate-bounce-soft"
                )}
              >
                <StatusIcon className="h-5 w-5" strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-extrabold tracking-tight">
                {cancelled ? "Order Cancelled" : isComplete ? "Delivered!" : currentStatus.label}
              </h1>
              <p className="text-[11px] text-white/80 truncate">
                {cancelled ? "Refund will be processed shortly" : currentStatus.desc}
              </p>
            </div>
            {!cancelled && (
              <div className="shrink-0 rounded-lg bg-white/15 px-2.5 py-1.5 text-center backdrop-blur">
                <p className="text-[8px] uppercase tracking-wider text-white/60">ETA</p>
                <p className="text-sm font-extrabold leading-tight">{`~${order.eta}m`}</p>
              </div>
            )}
          </div>

          {!cancelled && !isComplete && (
            <div className="mt-2 flex gap-1">
              <span className="h-1 w-1 animate-bounce rounded-full bg-white/70 [animation-delay:-0.3s]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-white/70 [animation-delay:-0.15s]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-white/70" />
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-2 px-3 pt-3">
        {/* Live Tracker */}
        <div className="rounded-xl border bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold tracking-tight">Live Status</h3>
            {!cancelled && (
              <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-700">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-600" />
                </span>
                Live
              </div>
            )}
          </div>

          {cancelled ? (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-red-700">
              <XCircle className="h-4 w-4 shrink-0" />
              <p className="text-[11px] font-bold">Order cancelled. No further updates.</p>
            </div>
          ) : (
            <StatusTracker currentIdx={currentIdx} />
          )}
        </div>

        {/* Delivery details */}
        <div className="rounded-xl border bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold tracking-tight">Delivery Details</h3>
            <button className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <Phone className="h-3 w-3" />
            </button>
          </div>
          <div className="mt-1.5 flex items-start gap-2 text-[11px]">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-bold capitalize">{order.details.addressType} · {order.details.name}</p>
              <p className="text-muted-foreground">{order.details.address}</p>
              {order.details.landmark && <p className="text-muted-foreground">Near: {order.details.landmark}</p>}
              <p className="mt-0.5 text-muted-foreground">📞 {order.details.phone}</p>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="rounded-xl border bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-orange-100 to-rose-100 text-base">
              ☕
            </div>
            <p className="text-xs font-bold">{restaurant.name}</p>
          </div>

          <Separator className="my-2" />

          <div className="space-y-1">
            {order.items.map(({ item, qty }) => (
              <div key={item.id} className="flex items-center gap-1.5 text-[11px]">
                <span className="flex h-4 w-4 items-center justify-center rounded bg-secondary text-[8px] font-extrabold">
                  {qty}×
                </span>
                <span className="flex-1 truncate font-medium">{item.name}</span>
                <span className="font-bold">{formatINR(item.price * qty)}</span>
              </div>
            ))}
          </div>

          <Separator className="my-2" />

          <div className="space-y-0.5 text-[11px]">
            <Row label="Item Total" value={formatINR(order.subtotal)} />
            <Row label="Delivery Fee" value={formatINR(order.deliveryFee)} />
            <Row label="GST & Charges" value={formatINR(order.taxes)} />
            <Separator className="my-1" />
            <div className="flex items-center justify-between text-xs font-extrabold">
              <span>Total Paid</span>
              <span className="text-emerald-700">{formatINR(order.total)}</span>
            </div>
            <p className="text-[10px] capitalize text-muted-foreground">
              via {order.details.payment === "cod" ? "Cash on Delivery" : order.details.payment.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm"><Share2 className="h-3.5 w-3.5" /> Share</Button>
          <Button variant="outline" size="sm"><Receipt className="h-3.5 w-3.5" /> Invoice</Button>
        </div>

        <Button asChild size="sm" className="w-full bg-foreground text-background hover:bg-foreground/90">
          <Link to="/"><Home className="h-3.5 w-3.5" /> Back to Menu</Link>
        </Button>
      </div>
    </div>
  );
}

function StatusTracker({ currentIdx }) {
  return (
    <div className="mt-2.5 flex items-center gap-1">
      {ORDER_STATUSES.map((step, idx) => {
        const Icon = step.icon;
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        const future = idx > currentIdx;
        const isLast = idx === ORDER_STATUSES.length - 1;

        return (
          <div key={step.id} className="flex flex-1 flex-col items-center">
            {/* Step row: circle + connector */}
            <div className="flex w-full items-center">
              {idx > 0 && (
                <div className={cn("h-0.5 flex-1 rounded-full", done || active ? "bg-emerald-500" : "bg-border")} />
              )}
              <div className="relative">
                {active && (
                  <span className="absolute inset-0 animate-pulse-ring rounded-full bg-emerald-500/40" />
                )}
                <div
                  className={cn(
                    "relative z-10 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-500",
                    done && "bg-emerald-600 text-white",
                    active && "bg-emerald-600 text-white ring-2 ring-emerald-200",
                    future && "bg-secondary text-muted-foreground"
                  )}
                >
                  {done ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Icon className={cn("h-3.5 w-3.5", active && "animate-bounce-soft")} />
                  )}
                </div>
              </div>
              {!isLast && (
                <div className={cn("h-0.5 flex-1 rounded-full", done ? "bg-emerald-500" : "bg-border")} />
              )}
            </div>
            {/* Label */}
            <p className={cn(
              "mt-1 text-center text-[9px] font-bold leading-tight",
              (done || active) ? "text-foreground" : "text-muted-foreground"
            )}>
              {step.label}
            </p>
          </div>
        );
      })}
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
