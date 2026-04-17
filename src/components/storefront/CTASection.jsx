import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CTASection({ content }) {
  const {
    heading,
    description,
    ctaLabel,
    ctaLink,
    backgroundImage,
    variant = "primary",
  } = content || {};

  const variants = {
    primary: "bg-primary text-primary-foreground",
    dark: "bg-foreground text-background",
    light: "bg-secondary text-foreground",
  };

  return (
    <section className={cn("relative overflow-hidden", variants[variant])}>
      {backgroundImage && (
        <>
          <img
            src={backgroundImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-black/50" />
        </>
      )}
      <div className="relative mx-auto max-w-2xl px-6 py-14 text-center">
        {heading && (
          <h2 className="mx-auto max-w-lg font-display text-[28px] font-extrabold leading-[1.1] tracking-tight sm:text-3xl">
            {heading}
          </h2>
        )}
        {description && (
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed opacity-90">
            {description}
          </p>
        )}
        {ctaLabel && (
          <Button
            asChild
            size="lg"
            className={cn(
              "mt-7 rounded-full px-7 shadow-xl",
              (variant === "primary" || variant === "dark") &&
                "bg-white text-foreground hover:bg-white/90"
            )}
          >
            <Link to={ctaLink || "/"}>{ctaLabel}</Link>
          </Button>
        )}
      </div>
    </section>
  );
}
