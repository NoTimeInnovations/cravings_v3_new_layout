import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu as MenuIcon, X } from "lucide-react";
import { useMenuStore } from "@/store/menuStore";
import { cn } from "@/lib/utils";

export default function StorefrontHeader() {
  const [open, setOpen] = useState(false);
  const storefront = useMenuStore((s) => s.storefront);
  const restaurant = useMenuStore((s) => s.restaurant);
  const brandName = storefront.brandName || restaurant.name;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/5 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
        <Link to="/storefront" className="flex items-center gap-2">
          {storefront.logoType === "image" && storefront.logoImage ? (
            <img
              src={storefront.logoImage}
              alt={brandName}
              className="h-9 w-9 rounded-full object-cover ring-1 ring-black/10"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xl">
              {storefront.logoEmoji || "🍽️"}
            </span>
          )}
          <span className="font-display text-base font-extrabold tracking-tight">
            {brandName}
          </span>
        </Link>

        <button
          onClick={() => setOpen((v) => !v)}
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent transition"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="mx-auto max-w-2xl border-t bg-white/95 px-4 py-3 animate-fade-in">
          <nav className="flex flex-col gap-1">
            {[
              { label: "Home", href: "/storefront" },
              { label: "Order Online", href: "/" },
              { label: "Menu", href: "/" },
              { label: "Cart", href: "/cart" },
            ].map((l) => (
              <Link
                key={l.label}
                to={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-bold text-foreground hover:bg-accent"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
