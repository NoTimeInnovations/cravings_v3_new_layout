import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Search, MapPin, Store, ShoppingBag, ChevronDown } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useSessionStore } from "@/store/sessionStore";
import { useMenuStore } from "@/store/menuStore";

export default function Header({ showBack = false, title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const count = useCartStore((s) => s.getCount());
  const orderType = useSessionStore((s) => s.orderType);
  const selectedOutletId = useSessionStore((s) => s.selectedOutletId);
  const selectedAddressId = useSessionStore((s) => s.selectedAddressId);
  const savedAddresses = useSessionStore((s) => s.savedAddresses);
  const resetOnboarding = useSessionStore((s) => s.resetOnboarding);
  const outlets = useMenuStore((s) => s.outlets);

  const outlet = outlets.find((o) => o.id === selectedOutletId);
  const address = savedAddresses.find((a) => a.id === selectedAddressId);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-2xl items-center gap-2 px-3">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-accent transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={resetOnboarding}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
          >
            {orderType === "takeaway" ? (
              <Store className="h-4 w-4 shrink-0 text-primary" />
            ) : (
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
            )}
            <div className="min-w-0 leading-tight">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {orderType === "takeaway" ? "Pickup from" : "Deliver to"}
              </p>
              <p className="truncate text-sm font-bold">
                {orderType === "takeaway"
                  ? outlet?.name || "Outlet"
                  : `${address?.label || "Home"} · ${address?.address?.split(",")[0] || ""}`}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        )}

        {title && (
          <h1 className="text-sm font-bold tracking-tight">{title}</h1>
        )}

        <div className="ml-auto flex items-center gap-0.5">
          {!isAdmin && !showBack && (
            <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent transition">
              <Search className="h-[18px] w-[18px]" />
            </button>
          )}
          {!isAdmin && (
            <Link
              to="/cart"
              className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent transition"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
