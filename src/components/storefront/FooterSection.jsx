import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import { useMenuStore } from "@/store/menuStore";
import { Separator } from "@/components/ui/separator";

export default function FooterSection({ content }) {
  const { description, phone, email, copyright } = content || {};
  const outlets = useMenuStore((s) => s.outlets);
  const storefront = useMenuStore((s) => s.storefront);
  const restaurant = useMenuStore((s) => s.restaurant);
  const brandName = storefront.brandName || restaurant.name;

  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="flex items-center gap-3">
          {storefront.logoType === "image" && storefront.logoImage ? (
            <img
              src={storefront.logoImage}
              alt=""
              className="h-11 w-11 rounded-full object-cover ring-2 ring-white/20"
            />
          ) : (
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl">
              {storefront.logoEmoji || "🍽️"}
            </span>
          )}
          <p className="font-display text-xl font-extrabold">{brandName}</p>
        </div>

        {description && (
          <p className="mt-4 max-w-md text-sm leading-relaxed text-background/80">
            {description}
          </p>
        )}

        {(phone || email) && (
          <div className="mt-7 space-y-2.5 text-sm">
            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-2.5 text-background/90 hover:text-background"
              >
                <Phone className="h-4 w-4" /> {phone}
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2.5 text-background/90 hover:text-background"
              >
                <Mail className="h-4 w-4" /> {email}
              </a>
            )}
          </div>
        )}

        {outlets.length > 0 && (
          <div className="mt-8">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-background/50">
              Our outlets
            </p>
            <ul className="mt-3 space-y-2.5">
              {outlets.map((o) => (
                <li
                  key={o.id}
                  className="flex items-start gap-2.5 text-[13px] text-background/80"
                >
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    <span className="font-bold text-background">{o.name}</span>
                    {o.place && <span className="ml-1 opacity-80">· {o.place}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Separator className="mt-10 bg-white/10" />
        <div className="mt-5 flex flex-col items-start justify-between gap-3 text-xs text-background/60 sm:flex-row sm:items-center">
          <p>{copyright}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-1 font-bold text-background hover:underline"
          >
            Order Online <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
