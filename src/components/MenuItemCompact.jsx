import { Plus, Minus } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatINR, cn } from "@/lib/utils";

export default function MenuItemCompact({ item, onTap }) {
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const qty = items[item.id]?.qty || 0;

  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      {/* Tappable emoji card */}
      <button
        onClick={onTap}
        className={cn(
          "flex h-28 items-center justify-center bg-gradient-to-br transition active:scale-[0.97]",
          item.gradient
        )}
      >
        <span className="text-4xl drop-shadow-sm">{item.emoji}</span>
      </button>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-3 pb-2">
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border-[1.5px]",
              item.veg ? "border-emerald-600" : "border-red-600"
            )}
          >
            <div
              className={cn(
                "h-1 w-1 rounded-full",
                item.veg ? "bg-emerald-600" : "bg-red-600"
              )}
            />
          </div>
          {item.bestseller && (
            <span className="text-[9px] font-bold text-amber-600">⭐</span>
          )}
        </div>
        <button onClick={onTap} className="text-left">
          <h3 className="text-[13px] font-bold leading-tight line-clamp-2">
            {item.name}
          </h3>
        </button>
        <p className="mt-auto text-sm font-extrabold">{formatINR(item.price)}</p>
      </div>

      {/* Add button */}
      <div className="px-3 pb-3">
        {qty === 0 ? (
          <button
            onClick={() => addItem(item)}
            className="flex w-full items-center justify-center rounded-xl border border-emerald-600/30 bg-emerald-50 py-2 text-xs font-extrabold uppercase tracking-wider text-emerald-700 transition active:scale-95"
          >
            Add
          </button>
        ) : (
          <div className="flex items-center justify-between rounded-xl border border-emerald-600/30 bg-emerald-50 px-1 py-1">
            <button
              onClick={() => removeItem(item.id)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-emerald-700 hover:bg-emerald-100"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="text-sm font-extrabold text-emerald-700">{qty}</span>
            <button
              onClick={() => addItem(item)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-emerald-700 hover:bg-emerald-100"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
