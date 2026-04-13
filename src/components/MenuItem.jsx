import { Star, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatINR, cn } from "@/lib/utils";

function VegMark({ veg }) {
  return (
    <div
      className={cn(
        "flex h-3.5 w-3.5 items-center justify-center rounded-sm border-[1.5px]",
        veg ? "border-emerald-600" : "border-red-600"
      )}
    >
      <div
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          veg ? "bg-emerald-600" : "bg-red-600"
        )}
      />
    </div>
  );
}

export default function MenuItem({ item }) {
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const qty = items[item.id]?.qty || 0;

  return (
    <div className="flex gap-3 py-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <VegMark veg={item.veg} />
          {item.bestseller && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600">
              ⭐ Bestseller
            </span>
          )}
        </div>
        <h3 className="mt-1 text-sm font-bold leading-snug">
          {item.name}
        </h3>
        <div className="mt-0.5 flex items-center gap-2 text-xs font-bold">
          <span>{formatINR(item.price)}</span>
          <span className="flex items-center gap-0.5 text-[11px] font-semibold text-emerald-700">
            <Star className="h-2.5 w-2.5 fill-current" />
            {item.rating}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
          {item.desc}
        </p>
      </div>

      <div className="relative shrink-0">
        <div
          className={cn(
            "h-24 w-24 overflow-hidden rounded-xl bg-gradient-to-br shadow-sm ring-1 ring-black/5 flex items-center justify-center",
            item.gradient
          )}
        >
          <span className="text-4xl drop-shadow-sm">{item.emoji}</span>
        </div>

        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2">
          {qty === 0 ? (
            <button
              onClick={() => addItem(item)}
              className="rounded-md border border-emerald-600/30 bg-white px-4 py-1 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 shadow-md transition active:scale-95"
            >
              Add
            </button>
          ) : (
            <div className="flex items-center gap-0.5 rounded-md border border-emerald-600/30 bg-white px-0.5 py-0.5 shadow-md">
              <button
                onClick={() => removeItem(item.id)}
                className="flex h-6 w-6 items-center justify-center rounded text-emerald-700"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[16px] text-center text-xs font-extrabold text-emerald-700">
                {qty}
              </span>
              <button
                onClick={() => addItem(item)}
                className="flex h-6 w-6 items-center justify-center rounded text-emerald-700"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
