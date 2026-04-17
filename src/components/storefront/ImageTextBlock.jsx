import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ImageTextBlock({ content }) {
  const {
    image,
    heading,
    description,
    ctaLabel,
    ctaLink,
    imagePosition = "top",
  } = content || {};

  const imageBlock = image && (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
      <img
        src={image}
        alt={heading}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
        loading="lazy"
      />
    </div>
  );

  const textBlock = (
    <div className="px-6 py-10 sm:py-12">
      {heading && (
        <h2 className="font-display text-[28px] font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-3xl">
          {heading}
        </h2>
      )}
      {description && (
        <p className="mt-4 text-[15px] leading-[1.7] text-foreground/75">
          {description}
        </p>
      )}
      {ctaLabel && (
        <Button asChild className="mt-6 rounded-full shadow-md">
          <Link to={ctaLink || "/"}>
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  );

  return (
    <section className="bg-white">
      <div
        className={cn(
          "mx-auto max-w-2xl",
          imagePosition === "bottom" ? "flex flex-col-reverse" : "flex flex-col"
        )}
      >
        {imageBlock}
        {textBlock}
      </div>
    </section>
  );
}
