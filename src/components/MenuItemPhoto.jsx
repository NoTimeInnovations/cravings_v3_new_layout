import { Plus, Minus } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatINR, cn } from "@/lib/utils";

export default function MenuItemPhoto({ item, onTap }) {
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const qty = items[item.id]?.qty || 0;

  return (
    <div className="relative flex flex-col">
      {/* Tappable image area */}
      <button
        onClick={onTap}
        className="relative overflow-hidden rounded-2xl ring-1 ring-black/5 active:scale-[0.97] transition"
      >
        <div
          className={cn(
            "flex aspect-square items-center justify-center overflow-hidden",
            !item.imageUrl && "bg-gradient-to-br",
            !item.imageUrl && item.gradient
          )}
        >
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              loading="lazy"
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <span className="text-4xl drop-shadow-sm">{item.emoji}</span>
          )}
        </div>

        {/* Veg mark overlay */}
        <div className="absolute top-1.5 left-1.5">
          <div
            className={cn(
              "flex h-4 w-4 items-center justify-center rounded-sm border-[1.5px] bg-white",
              item.veg ? "border-emerald-600" : "border-red-600"
            )}
          >
            <div
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                item.veg ? "bg-emerald-600" : "bg-red-600"
              )}
            />
          </div>
        </div>

        {/* Bestseller badge */}
        {item.bestseller && (
          <div className="absolute top-1.5 right-1.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-[8px] font-bold text-white">
            ⭐
          </div>
        )}
      </button>

      {/* Name + price */}
      <button onClick={onTap} className="mt-1.5 text-left px-0.5">
        <h3 className="text-[11px] font-bold leading-tight line-clamp-2">
          {item.name}
        </h3>
        <p className="mt-0.5 text-[11px] font-extrabold text-foreground">
          {formatINR(item.price)}
        </p>
      </button>

      {/* Add button */}
      <div className="mt-1.5 px-0.5">
        {qty === 0 ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              addItem(item);
            }}
            className="flex w-full items-center justify-center rounded-lg border border-emerald-600/30 bg-emerald-50 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 transition active:scale-95"
          >
            Add
          </button>
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-emerald-600/30 bg-emerald-50 px-0.5 py-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeItem(item.id);
              }}
              className="flex h-6 w-6 items-center justify-center rounded text-emerald-700"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="text-xs font-extrabold text-emerald-700">{qty}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                addItem(item);
              }}
              className="flex h-6 w-6 items-center justify-center rounded text-emerald-700"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
