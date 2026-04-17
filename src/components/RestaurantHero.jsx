import { Phone, MapPin, Star, Clock, Bike, Percent, ChevronRight, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMenuStore } from "@/store/menuStore";
import HeroBannerCarousel from "@/components/HeroBannerCarousel";
import { cn } from "@/lib/utils";

/** WhatsApp brand mark (lucide doesn't ship brand glyphs). */
function WhatsAppIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.966-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.892a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function IconLink({ href, title, children }) {
  if (!href) return null;
  const external = href.startsWith("http");
  return (
    <Button
      asChild
      variant="outline"
      size="icon"
      className="h-9 w-9 rounded-full shrink-0"
      title={title}
    >
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        aria-label={title}
      >
        {children}
      </a>
    </Button>
  );
}

export default function RestaurantHero({ onBannerTap }) {
  const restaurant = useMenuStore((s) => s.restaurant);
  const storefront = useMenuStore((s) => s.storefront);
  const banners = useMenuStore((s) => s.banners);
  const heroLayout = useMenuStore((s) => s.heroLayout);
  const heroBanners = useMenuStore((s) => s.heroBanners);
  const autoplayMs = useMenuStore((s) => s.heroBannerAutoplayMs);

  const activeBanners = banners.filter((b) => b.active);
  const offers = activeBanners.filter((b) => b.type === "offer");
  const announcements = activeBanners.filter((b) => b.type === "announcement");

  // Build final list of hero slides.
  // Admin-managed heroBanners (if any) win; else fall back to DB store_banner / logo.
  const slides = (heroBanners || []).filter((b) => b.imageUrl);
  const fallback =
    restaurant.heroImage ||
    (storefront.logoType === "image" ? storefront.logoImage : "");
  const effectiveSlides =
    slides.length > 0
      ? slides
      : fallback
      ? [{ id: "fallback", imageUrl: fallback }]
      : [];

  // Primary logo image: first admin banner, then DB store_banner, then admin logo.
  const logoSrc = effectiveSlides[0]?.imageUrl || "";

  // Build contact links; absent fields skip rendering.
  const phoneHref = restaurant.phone
    ? `tel:${restaurant.phone.replace(/[^+\d]/g, "")}`
    : null;
  const whatsappDigits = (restaurant.whatsapp || restaurant.phone || "").replace(
    /[^\d]/g,
    ""
  );
  const whatsappHref = whatsappDigits ? `https://wa.me/${whatsappDigits}` : null;
  const instagramHref = restaurant.instagram || null;
  const mapHref =
    restaurant.mapUrl ||
    (restaurant.address
      ? `https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`
      : null);
  const reviewHref = restaurant.googleReviewUrl || null;

  const hasContacts =
    phoneHref || whatsappHref || mapHref || instagramHref || reviewHref;

  const contactRow = hasContacts && (
    <div className="no-scrollbar -mx-1 mt-3 flex items-center gap-1.5 overflow-x-auto px-1 pb-0.5">
      <IconLink href={phoneHref} title="Call">
        <Phone className="h-4 w-4" />
      </IconLink>
      <IconLink href={whatsappHref} title="WhatsApp">
        <WhatsAppIcon className="h-4 w-4" />
      </IconLink>
      <IconLink href={mapHref} title="Directions">
        <MapPin className="h-4 w-4" />
      </IconLink>
      <IconLink href={instagramHref} title="Instagram">
        <Instagram className="h-4 w-4" />
      </IconLink>
      <IconLink href={reviewHref} title="Rate us">
        <Star className="h-4 w-4" />
      </IconLink>
    </div>
  );

  const infoStrip = (restaurant.deliveryTime || restaurant.distance) && (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
      {restaurant.deliveryTime && (
        <span className="flex items-center gap-1 font-medium text-muted-foreground">
          <Clock className="h-3 w-3" /> {restaurant.deliveryTime}
        </span>
      )}
      {restaurant.deliveryTime && restaurant.distance && (
        <span className="text-border">|</span>
      )}
      {restaurant.distance && (
        <span className="flex items-center gap-1 font-medium text-muted-foreground">
          <Bike className="h-3 w-3" /> {restaurant.distance}
        </span>
      )}
    </div>
  );

  const announcementsEl = announcements.map((a) => (
    <button
      key={a.id}
      onClick={() => onBannerTap?.(a)}
      className="mt-3 flex w-full items-center gap-2.5 rounded-xl bg-blue-50 px-3 py-2 text-left ring-1 ring-blue-100 transition active:scale-[0.99]"
    >
      <span className="text-base">📢</span>
      <p className="flex-1 truncate text-[11px] font-bold text-blue-800">{a.name}</p>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-blue-400" />
    </button>
  ));

  const offersEl = offers.length > 0 && (
    <div className="no-scrollbar -mx-4 mt-3 flex gap-2.5 overflow-x-auto px-4 pb-0.5">
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
  );

  // ---------- Banner layout: full-width cover image (or carousel), info below ----------
  if (heroLayout === "banner") {
    return (
      <section>
        <div className="relative -mt-3 w-full overflow-hidden bg-secondary">
          {effectiveSlides.length > 0 ? (
            <HeroBannerCarousel
              banners={effectiveSlides}
              aspect="aspect-[16/10]"
              autoplayMs={autoplayMs}
              alt={restaurant.name}
            />
          ) : (
            <div className="flex aspect-[16/10] w-full items-center justify-center bg-gradient-to-br from-orange-100 to-rose-100 text-7xl">
              {storefront.logoEmoji || "🍽️"}
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/80 to-transparent" />
        </div>

        <div className="px-4 pt-3">
          <h1 className="font-display text-2xl font-extrabold leading-tight tracking-tight">
            {restaurant.name}
          </h1>
          {restaurant.tagline && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {restaurant.tagline}
            </p>
          )}
          {infoStrip}
          {contactRow}
          {announcementsEl}
          {offersEl}
        </div>
      </section>
    );
  }

  // ---------- Compact layout (default): small logo + name inline ----------
  return (
    <section className="px-4 pt-3">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={restaurant.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <span className="text-2xl">{storefront.logoEmoji || "🍽️"}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-extrabold tracking-tight">
            {restaurant.name}
          </h1>
          {restaurant.tagline && (
            <p className="truncate text-[11px] text-muted-foreground">
              {restaurant.tagline}
            </p>
          )}
          {infoStrip}
        </div>
      </div>

      {contactRow}
      {announcementsEl}
      {offersEl}
    </section>
  );
}
