import { Link } from "react-router-dom";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatINR } from "@/lib/utils";

export default function FloatingCart() {
  const count = useCartStore((s) => s.getCount());
  const subtotal = useCartStore((s) => s.getSubtotal());

  if (count === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 px-3 pb-2 animate-slide-up">
      <Link
        to="/cart"
        className="mx-auto flex max-w-2xl items-center justify-between rounded-xl bg-emerald-600 px-4 py-3 text-white shadow-xl shadow-emerald-600/25 transition active:scale-[0.99]"
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -top-1 -right-1.5 flex h-4 min-w-[14px] items-center justify-center rounded-full bg-white px-0.5 text-[9px] font-bold text-emerald-700">
              {count}
            </span>
          </div>
          <span className="text-sm font-bold">
            {count} item{count > 1 ? "s" : ""} · {formatINR(subtotal)}
          </span>
        </div>
        <div className="flex items-center gap-0.5 text-sm font-bold">
          View Cart
          <ChevronRight className="h-4 w-4" />
        </div>
      </Link>
    </div>
  );
}
