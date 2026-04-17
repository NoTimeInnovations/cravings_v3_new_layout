import { useEffect, useRef } from "react";
import { X, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatINR, cn } from "@/lib/utils";

export default function ItemDetailSheet({ item, outlet, onClose }) {
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const qty = items[item.id]?.qty || 0;
  const backdropRef = useRef(null);
  const sheetRef = useRef(null);

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
        className="relative z-10 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white transition-transform duration-300 ease-out"
        style={{ transform: "translateY(100%)" }}
      >
        {/* Drag handle */}
        <div className="sticky top-0 z-10 flex justify-center bg-white pt-2.5 pb-1">
          <div className="h-1 w-8 rounded-full bg-border" />
        </div>

        <button
          onClick={handleClose}
          className="absolute top-2.5 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-secondary"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Hero image / emoji */}
        <div
          className={cn(
            "mx-3 mt-1 flex h-40 items-center justify-center overflow-hidden rounded-xl",
            !item.imageUrl && "bg-gradient-to-br",
            !item.imageUrl && item.gradient
          )}
        >
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <span className="text-6xl drop-shadow-md">{item.emoji}</span>
          )}
        </div>

        {/* Content */}
        <div className="px-4 pb-5 pt-3">
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded-sm border-[1.5px]",
                item.veg ? "border-emerald-600" : "border-red-600"
              )}
            >
              <div className={cn("h-1.5 w-1.5 rounded-full", item.veg ? "bg-emerald-600" : "bg-red-600")} />
            </div>
            {item.bestseller && (
              <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-700">
                ⭐ Bestseller
              </span>
            )}
          </div>

          <h2 className="mt-1.5 text-lg font-extrabold tracking-tight">{item.name}</h2>

          <div className="mt-1 flex items-center gap-2">
            <span className="text-base font-extrabold">{formatINR(item.price)}</span>
          </div>

          {item.desc && (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
          )}

          {/* Add to cart */}
          <div className="mt-4">
            {qty === 0 ? (
              <button
                onClick={() => addItem(item)}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3 text-sm font-extrabold uppercase tracking-wider text-white shadow-lg transition active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" />
                Add to cart — {formatINR(item.price)}
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex flex-1 items-center justify-between rounded-xl border-2 border-emerald-600/30 bg-emerald-50 px-1.5 py-1.5">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-emerald-700"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-lg font-extrabold text-emerald-700">{qty}</span>
                  <button
                    onClick={() => addItem(item)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-emerald-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">Total</p>
                  <p className="text-base font-extrabold">{formatINR(item.price * qty)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
