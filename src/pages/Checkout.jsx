import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Briefcase, MapPin, Phone, User, Wallet, CreditCard, Smartphone, Banknote, Check, Lock, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cartStore";
import { useSessionStore } from "@/store/sessionStore";
import { formatINR, cn } from "@/lib/utils";

const ADDRESS_TYPES = [
  { id: "home", label: "Home", icon: Home },
  { id: "work", label: "Work", icon: Briefcase },
  { id: "other", label: "Other", icon: MapPin },
];

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", desc: "GPay, PhonePe, Paytm", icon: Smartphone, popular: true },
  { id: "card", label: "Card", desc: "Visa, Mastercard, Rupay", icon: CreditCard },
  { id: "wallet", label: "Wallets", desc: "Paytm, Mobikwik", icon: Wallet },
  { id: "cod", label: "Cash", desc: "Pay on delivery", icon: Banknote },
];

export default function Checkout() {
  const navigate = useNavigate();
  const subtotal = useCartStore((s) => s.getSubtotal());
  const placeOrder = useCartStore((s) => s.placeOrder);
  const orderType = useSessionStore((s) => s.orderType);
  const isTakeaway = orderType === "takeaway";

  const [addressType, setAddressType] = useState("home");
  const [payment, setPayment] = useState("upi");
  const [form, setForm] = useState({ name: "", phone: "", address: "", landmark: "" });

  const deliveryFee = isTakeaway ? 0 : subtotal > 0 ? 39 : 0;
  const taxes = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + taxes;

  const valid = isTakeaway
    ? form.name.trim() && form.phone.trim().length >= 10
    : form.name.trim() && form.phone.trim().length >= 10 && form.address.trim();

  const handlePlace = () => {
    if (!valid) return;
    placeOrder({ ...form, addressType, payment });
    navigate("/order-confirmed");
  };

  return (
    <div className="min-h-screen bg-secondary/40 pb-24">
      <Header showBack title="Checkout" />

      <div className="mx-auto max-w-2xl space-y-2 px-3 py-3">
        {/* Progress */}
        <div className="flex items-center justify-between rounded-xl border bg-white px-3 py-2.5 shadow-sm text-[10px] font-bold uppercase tracking-wider">
          <Step n={1} label="Cart" done />
          <Line done />
          <Step n={2} label={isTakeaway ? "Details" : "Address"} active />
          <Line />
          <Step n={3} label="Pay" />
        </div>

        {/* Contact / Address */}
        {isTakeaway ? (
          <Section title="Your Details" subtitle="We'll notify you when ready">
            <div className="space-y-2.5">
              <Field icon={User} placeholder="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <Field icon={Phone} placeholder="Phone number" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            </div>
          </Section>
        ) : (
          <Section title="Delivery Address" subtitle="Where should we deliver?">
            <div className="flex gap-1.5">
              {ADDRESS_TYPES.map((a) => {
                const Icon = a.icon;
                const sel = addressType === a.id;
                return (
                  <button
                    key={a.id}
                    onClick={() => setAddressType(a.id)}
                    className={cn(
                      "flex flex-1 flex-col items-center gap-1 rounded-lg border py-2 transition",
                      sel
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-background"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[10px] font-bold">{a.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 space-y-2.5">
              <Field icon={User} placeholder="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <Field icon={Phone} placeholder="Phone number" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              <Field icon={MapPin} placeholder="House no, building, street, area" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
              <Field placeholder="Landmark (optional)" value={form.landmark} onChange={(v) => setForm({ ...form, landmark: v })} />
            </div>
          </Section>
        )}

        {/* Payment */}
        <Section title="Payment" subtitle="Secure & encrypted">
          <div className="space-y-1.5">
            {PAYMENT_METHODS.map((p) => {
              const Icon = p.icon;
              const sel = payment === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPayment(p.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition",
                    sel ? "border-primary bg-primary/5" : "border-border bg-background"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg",
                      sel ? "bg-primary text-white" : "bg-secondary text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold">{p.label}</p>
                      {p.popular && (
                        <span className="rounded bg-amber-100 px-1 py-0.5 text-[8px] font-bold uppercase text-amber-800">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{p.desc}</p>
                  </div>
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border-2",
                      sel ? "border-primary bg-primary" : "border-border"
                    )}
                  >
                    {sel && <Check className="h-2.5 w-2.5 text-white" strokeWidth={4} />}
                  </div>
                </button>
              );
            })}
          </div>
        </Section>

        {/* Bill */}
        <Section title="Bill Summary">
          <div className="space-y-1 text-xs">
            <Row label="Item Total" value={formatINR(subtotal)} />
            {!isTakeaway && <Row label="Delivery Fee" value={formatINR(deliveryFee)} />}
            <Row label="GST & Charges" value={formatINR(taxes)} />
            <Separator className="my-1.5" />
            <div className="flex items-center justify-between text-sm font-extrabold">
              <span>Grand Total</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>
        </Section>

        <div className="flex items-center gap-1.5 px-1 text-[10px] text-muted-foreground">
          <Lock className="h-3 w-3" />
          Payment information is encrypted and secure.
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-white/95 px-3 py-2.5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="flex-1">
            <p className="text-[10px] text-muted-foreground">Total</p>
            <p className="text-base font-extrabold leading-none">{formatINR(total)}</p>
          </div>
          <Button
            size="sm"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/40 py-2.5"
            disabled={!valid}
            onClick={handlePlace}
          >
            Place Order <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div className="rounded-xl border bg-white p-3 shadow-sm">
      <h3 className="text-sm font-extrabold tracking-tight">{title}</h3>
      {subtitle && <p className="mb-2.5 text-[10px] text-muted-foreground">{subtitle}</p>}
      {!subtitle && <div className="mb-2" />}
      {children}
    </div>
  );
}

function Field({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />}
      <Input {...props} onChange={(e) => props.onChange(e.target.value)} className={cn("h-10 text-xs", Icon && "pl-9")} />
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

function Step({ n, label, active, done }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full text-[9px]",
          done && "bg-emerald-600 text-white",
          active && !done && "bg-primary text-white",
          !active && !done && "bg-secondary text-muted-foreground"
        )}
      >
        {done ? <Check className="h-2.5 w-2.5" strokeWidth={4} /> : n}
      </div>
      <span className={cn(active || done ? "text-foreground" : "text-muted-foreground")}>
        {label}
      </span>
    </div>
  );
}

function Line({ done }) {
  return <div className={cn("mx-1.5 h-px flex-1", done ? "bg-emerald-600" : "bg-border")} />;
}
