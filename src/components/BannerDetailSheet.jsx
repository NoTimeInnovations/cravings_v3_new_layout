import { useEffect, useRef } from "react";
import { X, Copy, Check } from "lucide-react";
import { useState } from "react";

export default function BannerDetailSheet({ banner, onClose }) {
  const backdropRef = useRef(null);
  const sheetRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const isOffer = banner.type === "offer";

  useEffect(() => {
    requestAnimationFrame(() => {
      if (backdropRef.current) backdropRef.current.style.opacity = "1";
      if (sheetRef.current) sheetRef.current.style.transform = "translateY(0)";
    });
  }, []);

  const handleClose = () => {
    if (backdropRef.current) backdropRef.current.style.opacity = "0";
    if (sheetRef.current) sheetRef.current.style.transform = "translateY(100%)";
    setTimeout(onClose, 250);
  };

  const handleCopy = () => {
    if (banner.code) {
      navigator.clipboard.writeText(banner.code).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        ref={backdropRef}
        onClick={handleClose}
        className="absolute inset-0 bg-black/50 transition-opacity duration-250"
        style={{ opacity: 0 }}
      />

      <div
        ref={sheetRef}
        className="relative z-10 overflow-hidden rounded-t-2xl bg-white transition-transform duration-300 ease-out"
        style={{ transform: "translateY(100%)" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="h-1 w-8 rounded-full bg-border" />
        </div>

        <button
          onClick={handleClose}
          className="absolute top-2.5 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-secondary"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Hero gradient */}
        <div
          className={
            "mx-3 mt-1 flex h-32 flex-col items-center justify-center rounded-xl " +
            (isOffer
              ? "bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100"
              : "bg-gradient-to-br from-blue-100 via-indigo-50 to-violet-100")
          }
        >
          <span className="text-5xl">{isOffer ? "🏷️" : "📢"}</span>
        </div>

        {/* Content */}
        <div className="px-4 pb-6 pt-4">
          <p
            className={
              "text-[10px] font-bold uppercase tracking-widest " +
              (isOffer ? "text-primary" : "text-blue-600")
            }
          >
            {isOffer ? "Offer" : "Announcement"}
          </p>

          <h2 className="mt-1 text-lg font-extrabold tracking-tight">
            {banner.name}
          </h2>

          {banner.description && (
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {banner.description}
            </p>
          )}

          {/* Offer-specific details */}
          {isOffer && (
            <div className="mt-4 space-y-3">
              {banner.code && (
                <div className="flex items-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-3">
                  <div className="flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Coupon Code
                    </p>
                    <p className="text-base font-extrabold tracking-wider text-primary">
                      {banner.code}
                    </p>
                  </div>
                  <button
                    onClick={handleCopy}
                    className={
                      "flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold transition " +
                      (copied
                        ? "bg-emerald-600 text-white"
                        : "bg-primary text-white active:scale-95")
                    }
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copy
                      </>
                    )}
                  </button>
                </div>
              )}

              {banner.validDays && (
                <p className="text-xs text-muted-foreground">
                  Valid for {banner.validDays} day{banner.validDays > 1 ? "s" : ""} from activation.
                </p>
              )}
            </div>
          )}

          <button
            onClick={handleClose}
            className={
              "mt-4 flex w-full items-center justify-center rounded-xl py-3 text-sm font-extrabold transition active:scale-[0.98] " +
              (isOffer
                ? "bg-primary text-white"
                : "bg-blue-600 text-white")
            }
          >
            {isOffer ? "Got it, order now!" : "Okay, got it!"}
          </button>
        </div>
      </div>
    </div>
  );
}
