import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useMenuStore } from "@/store/menuStore";
import { formatINR, cn } from "@/lib/utils";

export default function FeaturedItems({ content }) {
  const { title, subtitle, ctaLabel, ctaLink, itemIds = [] } = content || {};
  const items = useMenuStore((s) => s.items);

  const picked = itemIds.length
    ? itemIds.map((id) => items.find((i) => i.id === id)).filter(Boolean)
    : items.filter((i) => i.bestseller).slice(0, 6);
  const shown = picked.length ? picked : items.slice(0, 6);

  if (!shown.length) return null;

  return (
    <section className="bg-white py-12">
      <div className="mx-auto flex max-w-2xl items-end justify-between gap-4 px-6">
        <div className="min-w-0">
          {title && (
            <h2 className="font-display text-2xl font-extrabold tracking-tight">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {ctaLabel && (
          <Link
            to={ctaLink || "/"}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-extrabold text-primary hover:underline"
          >
            {ctaLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      <div className="no-scrollbar mt-6 flex gap-3.5 overflow-x-auto px-6 pb-2 snap-x">
        {shown.map((item) => (
          <Link
            to="/"
            key={item.id}
            className="w-40 shrink-0 snap-start"
          >
            <div
              className={cn(
                "relative aspect-square overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 transition-transform duration-300 hover:-translate-y-1",
                !item.imageUrl && "bg-gradient-to-br",
                !item.imageUrl && item.gradient
              )}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-7xl">
                  {item.emoji}
                </div>
              )}
              {item.bestseller && (
                <span className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white shadow">
                  ⭐ Best
                </span>
              )}
            </div>
            <p className="mt-3 line-clamp-1 text-[14px] font-extrabold">{item.name}</p>
            <div className="mt-1 flex items-center gap-2 text-[11px]">
              <span className="font-bold text-foreground">
                {formatINR(item.price)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
