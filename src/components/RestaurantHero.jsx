import { Star, Clock, Bike, Percent, ChevronRight } from "lucide-react";
import { useMenuStore } from "@/store/menuStore";

export default function RestaurantHero({ onBannerTap }) {
  const restaurant = useMenuStore((s) => s.restaurant);
  const banners = useMenuStore((s) => s.banners);

  const activeBanners = banners.filter((b) => b.active);
  const offers = activeBanners.filter((b) => b.type === "offer");
  const announcements = activeBanners.filter((b) => b.type === "announcement");

  return (
    <section className="px-4 pt-3">
      {/* Restaurant info - compact */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-rose-100 text-xl shadow-sm ring-1 ring-black/5">
          ☕
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-extrabold tracking-tight">
            {restaurant.name}
          </h1>
          <p className="truncate text-[11px] text-muted-foreground">
            {restaurant.tagline}
          </p>
        </div>
      </div>

      {/* Rating + delivery strip */}
      <div className="mt-2 flex items-center gap-2 text-[11px]">
        <span className="flex items-center gap-1 rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
          <Star className="h-2.5 w-2.5 fill-current" />
          {restaurant.rating}
        </span>
        <span className="font-semibold text-muted-foreground">
          {restaurant.ratingsCount} ratings
        </span>
        <span className="text-border">|</span>
        <span className="flex items-center gap-0.5 font-medium text-muted-foreground">
          <Clock className="h-3 w-3" /> {restaurant.deliveryTime}
        </span>
        <span className="text-border">|</span>
        <span className="flex items-center gap-0.5 font-medium text-muted-foreground">
          <Bike className="h-3 w-3" /> {restaurant.distance}
        </span>
      </div>

      {/* Announcements - full width info banner */}
      {announcements.map((a) => (
        <button
          key={a.id}
          onClick={() => onBannerTap?.(a)}
          className="mt-2 flex w-full items-center gap-2.5 rounded-xl bg-blue-50 px-3 py-2 text-left ring-1 ring-blue-100 transition active:scale-[0.99]"
        >
          <span className="text-base">📢</span>
          <p className="flex-1 truncate text-[11px] font-bold text-blue-800">{a.name}</p>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-blue-400" />
        </button>
      ))}

      {/* Offers - Swiggy-style horizontal scroll cards */}
      {offers.length > 0 && (
        <div className="no-scrollbar -mx-4 mt-2.5 flex gap-2.5 overflow-x-auto px-4 pb-0.5">
          {offers.map((o) => (
            <button
              key={o.id}
              onClick={() => onBannerTap?.(o)}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-3 py-2.5 text-left transition active:scale-[0.98]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                <Percent className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-primary">{o.name}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Use {o.code || "code"}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-primary/60" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
