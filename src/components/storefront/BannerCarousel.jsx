import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function BannerCarousel({ content }) {
  const { title, slides = [] } = content || {};
  if (!slides.length) return null;

  return (
    <section className="bg-white py-10">
      {title && (
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="font-display text-2xl font-extrabold tracking-tight">
            {title}
          </h2>
        </div>
      )}
      <div className="no-scrollbar mt-5 flex gap-4 overflow-x-auto px-6 pb-2 snap-x snap-mandatory">
        {slides.map((s) => (
          <article
            key={s.id}
            className="relative h-72 w-[86%] shrink-0 snap-start overflow-hidden rounded-2xl bg-secondary shadow-md ring-1 ring-black/5"
          >
            {s.image && (
              <img
                src={s.image}
                alt={s.heading}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 space-y-2 p-5 text-white">
              {s.heading && (
                <h3 className="font-display text-xl font-extrabold leading-tight drop-shadow">
                  {s.heading}
                </h3>
              )}
              {s.description && (
                <p className="line-clamp-2 text-[13px] font-medium leading-snug text-white/90 drop-shadow">
                  {s.description}
                </p>
              )}
              {s.ctaLabel && (
                <Button asChild size="sm" className="mt-2 rounded-full shadow-lg">
                  <Link to={s.ctaLink || "/"}>{s.ctaLabel}</Link>
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
