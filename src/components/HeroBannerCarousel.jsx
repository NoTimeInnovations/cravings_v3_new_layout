import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Horizontally-scrolling banner carousel.
 * - Native scroll-snap for touch/mouse swipe.
 * - Optional autoplay that pauses while the user is interacting.
 * - Dot indicators + keyboard arrow support via native scroll.
 */
export default function HeroBannerCarousel({
  banners,
  aspect = "aspect-[16/10]",
  autoplayMs = 4000,
  alt = "",
  onError,
}) {
  const scrollerRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  // Sync activeIdx with scroll position.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const i = Math.round(el.scrollLeft / el.clientWidth);
      setActiveIdx(i);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Autoplay: advance every `autoplayMs` unless paused or only 1 slide.
  useEffect(() => {
    if (!autoplayMs || banners.length <= 1 || paused) return;
    const id = setInterval(() => {
      const el = scrollerRef.current;
      if (!el) return;
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % banners.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    }, autoplayMs);
    return () => clearInterval(id);
  }, [autoplayMs, banners.length, paused]);

  const goTo = (i) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className={cn(
          "no-scrollbar flex w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden",
          aspect
        )}
        onPointerDown={() => setPaused(true)}
        onPointerUp={() => setPaused(false)}
        onPointerLeave={() => setPaused(false)}
      >
        {banners.map((b) => (
          <div
            key={b.id}
            className="relative h-full w-full shrink-0 snap-center bg-secondary"
          >
            {b.imageUrl ? (
              <img
                src={b.imageUrl}
                alt={alt}
                loading="lazy"
                className="h-full w-full object-cover"
                onError={onError}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-5xl text-muted-foreground">
                🍽️
              </div>
            )}
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-sm">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === activeIdx ? "w-5 bg-white" : "w-1.5 bg-white/60"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
