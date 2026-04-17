import { Star, Quote } from "lucide-react";

export default function TestimonialsSection({ content }) {
  const { title, quotes = [] } = content || {};
  if (!quotes.length) return null;

  return (
    <section className="bg-secondary/40 py-12">
      <div className="mx-auto max-w-2xl px-6">
        {title && (
          <h2 className="font-display text-2xl font-extrabold tracking-tight">
            {title}
          </h2>
        )}
      </div>

      <div className="no-scrollbar mt-6 flex gap-4 overflow-x-auto px-6 pb-2 snap-x">
        {quotes.map((q) => (
          <figure
            key={q.id}
            className="flex w-[86%] shrink-0 snap-start flex-col gap-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm"
          >
            <Quote className="h-6 w-6 text-primary/70" />
            <blockquote className="text-[15px] leading-[1.7] text-foreground/90">
              "{q.text}"
            </blockquote>
            <figcaption className="mt-auto flex items-center justify-between border-t pt-4">
              <span className="text-sm font-extrabold">{q.name}</span>
              <span className="flex items-center gap-0.5">
                {Array.from({ length: q.rating || 0 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                  />
                ))}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
