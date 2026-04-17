import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HeroSection({ content }) {
  const {
    heading,
    subheading,
    eyebrow,
    backgroundImage,
    overlayOpacity = 55,
    ctaPrimary,
    ctaSecondary,
  } = content || {};

  return (
    <section className="relative overflow-hidden">
      {backgroundImage && (
        <img
          src={backgroundImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
      )}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/90"
        style={{ opacity: overlayOpacity / 100 + 0.2 }}
      />

      <div className="relative mx-auto flex min-h-[78vh] max-w-2xl flex-col justify-end px-6 pb-14 pt-28 text-white">
        {eyebrow && (
          <span className="inline-flex w-fit items-center rounded-full bg-primary px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary-foreground shadow-lg">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-5 font-display text-[38px] font-extrabold leading-[1.05] tracking-tight drop-shadow-lg sm:text-5xl">
          {heading}
        </h1>
        {subheading && (
          <p className="mt-4 max-w-md text-[15px] font-medium leading-relaxed text-white/90 drop-shadow sm:text-base">
            {subheading}
          </p>
        )}

        <div className="mt-7 flex flex-wrap gap-3">
          {ctaPrimary?.label && (
            <Button asChild size="lg" className="rounded-full px-6 shadow-xl">
              <Link to={ctaPrimary.link || "/"}>{ctaPrimary.label}</Link>
            </Button>
          )}
          {ctaSecondary?.label && (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/70 bg-white/10 px-6 text-white backdrop-blur hover:bg-white/20 hover:text-white"
            >
              <Link to={ctaSecondary.link || "/"}>{ctaSecondary.label}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
