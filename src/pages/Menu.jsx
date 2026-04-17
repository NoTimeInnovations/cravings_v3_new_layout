import { useMemo, useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import RestaurantHero from "@/components/RestaurantHero";
import MenuItem from "@/components/MenuItem";
import MenuItemCompact from "@/components/MenuItemCompact";
import MenuItemPhoto from "@/components/MenuItemPhoto";
import ItemDetailSheet from "@/components/ItemDetailSheet";
import BannerDetailSheet from "@/components/BannerDetailSheet";
import FloatingCart from "@/components/FloatingCart";
import WelcomeSplash from "@/components/WelcomeSplash";
import { useMenuStore } from "@/store/menuStore";
import { useSessionStore } from "@/store/sessionStore";

export default function Menu() {
  const categories = useMenuStore((s) => s.categories);
  const menu = useMenuStore((s) => s.items);
  const outlets = useMenuStore((s) => s.outlets);
  const menuLayout = useMenuStore((s) => s.menuLayout);
  const restaurantName = useMenuStore((s) => s.restaurant.name);

  const hasOnboarded = useSessionStore((s) => s.hasOnboarded);
  const selectedOutletId = useSessionStore((s) => s.selectedOutletId);

  const [active, setActive] = useState(categories[0]?.id);
  const [sheetItem, setSheetItem] = useState(null);
  const [sheetBanner, setSheetBanner] = useState(null);
  const sectionRefs = useRef({});

  const outlet = outlets.find((o) => o.id === selectedOutletId);

  const visibleMenu = useMemo(() => {
    if (!selectedOutletId) return menu;
    return menu.filter((m) => m.availability?.[selectedOutletId] !== false);
  }, [menu, selectedOutletId]);

  const grouped = useMemo(() => {
    return categories.map((cat) => ({
      ...cat,
      items: visibleMenu.filter((m) => m.category === cat.id),
    }));
  }, [categories, visibleMenu]);

  // Scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.dataset.cat);
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [grouped.length]);

  const scrollTo = (id) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!hasOnboarded) {
    return <WelcomeSplash onDone={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      <div className="mx-auto max-w-2xl">
        <RestaurantHero onBannerTap={(b) => setSheetBanner(b)} />

        {/* Category pills - sticky below header */}
        <div className="sticky top-14 z-20 mt-3 border-b border-border/60 bg-white/90 backdrop-blur-xl">
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-3 py-2">
            {grouped.map((cat) => (
              <button
                key={cat.id}
                onClick={() => scrollTo(cat.id)}
                className={
                  "shrink-0 rounded-full px-3 py-1 text-[11px] font-bold transition " +
                  (active === cat.id
                    ? "bg-foreground text-background"
                    : "bg-secondary text-foreground hover:bg-accent")
                }
              >
                {cat.name} ({cat.items.length})
              </button>
            ))}
          </div>
        </div>

        {/* Menu sections */}
        <div className="px-3">
          {grouped.map((cat) => (
            <section
              key={cat.id}
              data-cat={cat.id}
              ref={(el) => (sectionRefs.current[cat.id] = el)}
              className="scroll-mt-28 pt-4"
            >
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold tracking-tight">
                  {cat.name}
                </h2>
                <span className="text-[11px] text-muted-foreground">
                  ({cat.items.length})
                </span>
              </div>

              {menuLayout === 3 ? (
                <div className="mt-2 grid grid-cols-3 gap-2.5">
                  {cat.items.map((item) => (
                    <MenuItemPhoto
                      key={item.id}
                      item={item}
                      onTap={() => setSheetItem(item)}
                    />
                  ))}
                </div>
              ) : menuLayout === 2 ? (
                <div className="mt-2 grid grid-cols-2 gap-2.5">
                  {cat.items.map((item) => (
                    <MenuItemCompact
                      key={item.id}
                      item={item}
                      onTap={() => setSheetItem(item)}
                    />
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {cat.items.map((item) => (
                    <MenuItem key={item.id} item={item} outlet={outlet} />
                  ))}
                </div>
              )}

              {cat.items.length === 0 && (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  Not available at {outlet?.name || "this outlet"}.
                </p>
              )}
            </section>
          ))}

          <p className="py-4 text-center text-[10px] text-muted-foreground">
            {restaurantName}
          </p>
        </div>
      </div>

      <FloatingCart />

      {sheetItem && (
        <ItemDetailSheet
          item={sheetItem}
          outlet={outlet}
          onClose={() => setSheetItem(null)}
        />
      )}

      {sheetBanner && (
        <BannerDetailSheet
          banner={sheetBanner}
          onClose={() => setSheetBanner(null)}
        />
      )}
    </div>
  );
}
