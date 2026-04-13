import { useEffect, useState, useMemo, useRef } from "react";
import { MapPin, Truck, Store, Navigation, Phone, Check, ChevronLeft, Search, LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMenuStore } from "@/store/menuStore";
import {
  useSessionStore,
  randomNearbyCoords,
  distanceKm,
} from "@/store/sessionStore";
import { cn } from "@/lib/utils";

export default function WelcomeSplash({ onDone }) {
  const [step, setStep] = useState("logo");
  const [logoAtTop, setLogoAtTop] = useState(false);
  const setOrderType = useSessionStore((s) => s.setOrderType);

  useEffect(() => {
    if (step !== "logo") return;
    const t = setTimeout(() => {
      setLogoAtTop(true);
      setTimeout(() => setStep("type"), 500);
    }, 1700);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50 overflow-y-auto">
      {/* Logo section - starts centered, moves to top */}
      <div
        className={cn(
          "flex flex-col items-center justify-center text-center transition-all duration-500 ease-out shrink-0",
          step === "logo" && !logoAtTop ? "flex-1" : "pt-12 pb-6"
        )}
      >
        <div className="relative">
          {step === "logo" && !logoAtTop && (
            <span className="absolute inset-0 animate-pulse-ring rounded-full bg-primary/30" />
          )}
          <div
            className={cn(
              "relative flex items-center justify-center rounded-full bg-white shadow-lg ring-4 ring-primary/20 transition-all duration-500",
              step === "logo" && !logoAtTop ? "h-28 w-28" : "h-16 w-16"
            )}
          >
            <span
              className={cn(
                "transition-all duration-500",
                step === "logo" && !logoAtTop ? "text-5xl animate-bounce-soft" : "text-3xl"
              )}
            >
              ☕
            </span>
          </div>
        </div>
        <h1
          className={cn(
            "font-display font-extrabold tracking-tight text-foreground transition-all duration-500",
            step === "logo" && !logoAtTop ? "mt-6 text-3xl" : "mt-3 text-xl"
          )}
        >
          Le Grand Cafe
        </h1>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
          Continental · Italian · Desserts
        </p>
        {step === "logo" && !logoAtTop && (
          <div className="mt-6 flex gap-1.5">
            <span className="h-1.5 w-1.5 animate-bounce-soft rounded-full bg-primary" />
            <span className="h-1.5 w-1.5 animate-bounce-soft rounded-full bg-primary" style={{ animationDelay: "0.15s" }} />
            <span className="h-1.5 w-1.5 animate-bounce-soft rounded-full bg-primary" style={{ animationDelay: "0.3s" }} />
          </div>
        )}
      </div>

      {/* Content below logo */}
      {step !== "logo" && (
        <div className="flex-1 px-5 pb-8 animate-appear-below">
          {step === "type" && (
            <TypeChoice
              onChoose={(t) => {
                setOrderType(t);
                setStep(t === "delivery" ? "address" : "outlet");
              }}
            />
          )}
          {step === "address" && (
            <DeliveryStep
              onBack={() => setStep("type")}
              onDone={onDone}
            />
          )}
          {step === "outlet" && (
            <TakeawayStep
              onBack={() => setStep("type")}
              onDone={onDone}
            />
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Delivery / Takeaway choice ---------- */
function TypeChoice({ onChoose }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="font-display text-xl font-extrabold tracking-tight text-foreground">
          How would you like your order?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick an option to get started
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <ChoiceCard
          icon={Truck}
          title="Delivery"
          subtitle="Delivered to your doorstep"
          onClick={() => onChoose("delivery")}
        />
        <ChoiceCard
          icon={Store}
          title="Takeaway"
          subtitle="Pick up from an outlet"
          onClick={() => onChoose("takeaway")}
        />
      </div>
    </div>
  );
}

function ChoiceCard({ icon: Icon, title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 rounded-2xl bg-white/70 backdrop-blur-sm p-5 text-left transition active:scale-[0.98] hover:bg-white"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 transition group-hover:bg-primary group-hover:text-white">
        <Icon className="h-7 w-7" />
      </div>
      <div className="flex-1">
        <p className="text-base font-extrabold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <ChevronLeft className="h-5 w-5 rotate-180 text-muted-foreground/50" />
    </button>
  );
}

/* ---------- Simulated autocomplete suggestions ---------- */
const SIMULATED_PLACES = [
  { name: "Connaught Place", area: "Central Delhi", full: "Connaught Place, Rajiv Chowk, New Delhi 110001" },
  { name: "Saket Mall", area: "South Delhi", full: "Select Citywalk, Saket, New Delhi 110017" },
  { name: "Lajpat Nagar", area: "South East Delhi", full: "Lajpat Nagar Central Market, New Delhi 110024" },
  { name: "Hauz Khas Village", area: "South Delhi", full: "Hauz Khas Village, New Delhi 110016" },
  { name: "Karol Bagh", area: "Central Delhi", full: "Karol Bagh Market, New Delhi 110005" },
  { name: "Rajouri Garden", area: "West Delhi", full: "Rajouri Garden Main Market, New Delhi 110027" },
  { name: "Dwarka Sector 21", area: "South West Delhi", full: "Sector 21, Dwarka, New Delhi 110077" },
  { name: "Nehru Place", area: "South Delhi", full: "Nehru Place IT Market, New Delhi 110019" },
  { name: "Vasant Kunj", area: "South Delhi", full: "Vasant Kunj, Ambience Mall, New Delhi 110070" },
  { name: "Chandni Chowk", area: "Old Delhi", full: "Chandni Chowk, Old Delhi 110006" },
  { name: "Greater Kailash", area: "South Delhi", full: "Greater Kailash Part 1, M Block Market, New Delhi 110048" },
  { name: "Pitampura", area: "North Delhi", full: "Pitampura, Kohat Enclave, New Delhi 110034" },
];

/* ---------- Delivery step ---------- */
function DeliveryStep({ onBack, onDone }) {
  const addAddress = useSessionStore((s) => s.addAddress);
  const selectOutlet = useSessionStore((s) => s.selectOutlet);
  const completeOnboarding = useSessionStore((s) => s.completeOnboarding);
  const outlets = useMenuStore((s) => s.outlets);

  const [mode, setMode] = useState(null); // null | 'gps' | 'search'
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [locating, setLocating] = useState(false);
  const debounceRef = useRef(null);

  // Simulate autocomplete: filter places on query change
  const handleQueryChange = (val) => {
    setQuery(val);
    setSelectedPlace(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      const q = val.toLowerCase();
      setSuggestions(
        SIMULATED_PLACES.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.area.toLowerCase().includes(q) ||
            p.full.toLowerCase().includes(q)
        ).slice(0, 5)
      );
    }, 300);
  };

  const pickPlace = (place) => {
    setSelectedPlace(place);
    setQuery(place.full);
    setSuggestions([]);
  };

  const handleUseCurrentLocation = () => {
    setLocating(true);
    // Simulate GPS delay
    setTimeout(() => {
      const coords = randomNearbyCoords();
      const place = {
        name: "Current Location",
        area: "Delhi NCR",
        full: "Near Connaught Place, New Delhi (detected)",
      };
      setSelectedPlace({ ...place, coords });
      setLocating(false);
      setMode("gps");
    }, 1200);
  };

  const handleConfirm = () => {
    if (!selectedPlace) return;
    const coords = selectedPlace.coords || randomNearbyCoords();
    const entry = addAddress({
      label: "Home",
      address: selectedPlace.full,
      lat: coords.lat,
      lng: coords.lng,
    });
    // Pick nearest outlet
    let best = outlets[0];
    let bestD = Infinity;
    for (const o of outlets) {
      const d = distanceKm(coords, o);
      if (d < bestD) {
        bestD = d;
        best = o;
      }
    }
    if (best) selectOutlet(best.id);
    completeOnboarding();
    onDone?.();
  };

  return (
    <div className="flex flex-col gap-4">
      <NativeStepHeader
        onBack={onBack}
        icon={Truck}
        title="Delivery address"
        subtitle="Where should we deliver your order?"
      />

      {/* Option 1: Use current location */}
      <button
        onClick={handleUseCurrentLocation}
        disabled={locating}
        className={cn(
          "flex items-center gap-4 rounded-2xl p-5 text-left transition active:scale-[0.98]",
          mode === "gps" && selectedPlace
            ? "bg-primary/10 ring-2 ring-primary"
            : "bg-white/70 hover:bg-white"
        )}
      >
        <div className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition",
          mode === "gps" && selectedPlace ? "bg-primary text-white" : "bg-emerald-50 text-emerald-600"
        )}>
          <LocateFixed className={cn("h-6 w-6", locating && "animate-pulse")} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold">
            {locating ? "Detecting location..." : "Use current location"}
          </p>
          {mode === "gps" && selectedPlace ? (
            <p className="text-xs text-primary font-semibold truncate">{selectedPlace.full}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Allow GPS to detect your address</p>
          )}
        </div>
        {mode === "gps" && selectedPlace && <Check className="h-5 w-5 text-primary shrink-0" />}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 px-2">
        <div className="h-px flex-1 bg-foreground/10" />
        <span className="text-xs font-bold text-muted-foreground">OR</span>
        <div className="h-px flex-1 bg-foreground/10" />
      </div>

      {/* Option 2: Search location */}
      <div className="flex flex-col gap-2">
        <div className={cn(
          "flex items-center gap-3 rounded-2xl bg-white/70 backdrop-blur-sm px-4 py-3 transition",
          mode === "search" && "ring-2 ring-primary bg-white"
        )}>
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search for area, street, locality..."
            value={query}
            onFocus={() => setMode("search")}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="flex-1 bg-transparent text-sm font-medium placeholder:text-muted-foreground/70 outline-none"
          />
        </div>

        {/* Autocomplete suggestions */}
        {suggestions.length > 0 && (
          <div className="rounded-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
            {suggestions.map((place, i) => (
              <button
                key={i}
                onClick={() => pickPlace(place)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-primary/5 active:bg-primary/10"
              >
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold truncate">{place.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{place.full}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Selected search result */}
        {mode === "search" && selectedPlace && suggestions.length === 0 && (
          <div className="flex items-center gap-3 rounded-2xl bg-primary/10 ring-2 ring-primary p-4">
            <MapPin className="h-5 w-5 text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{selectedPlace.name}</p>
              <p className="text-xs text-primary font-semibold truncate">{selectedPlace.full}</p>
            </div>
            <Check className="h-5 w-5 text-primary shrink-0" />
          </div>
        )}
      </div>

      <div className="mt-auto pt-4">
        <Button
          className="w-full rounded-2xl py-6 text-base font-bold"
          onClick={handleConfirm}
          disabled={!selectedPlace}
        >
          Continue to menu
        </Button>
      </div>
    </div>
  );
}

/* ---------- Takeaway step ---------- */
function TakeawayStep({ onBack, onDone }) {
  const outlets = useMenuStore((s) => s.outlets);
  const selectOutlet = useSessionStore((s) => s.selectOutlet);
  const selectedOutletId = useSessionStore((s) => s.selectedOutletId);
  const completeOnboarding = useSessionStore((s) => s.completeOnboarding);

  const [refCoords, setRefCoords] = useState(null);
  const [typedAddress, setTypedAddress] = useState("");

  const findNearest = () => {
    if (!typedAddress.trim()) return;
    const c = randomNearbyCoords();
    setRefCoords(c);
    let best = outlets[0];
    let bestD = Infinity;
    for (const o of outlets) {
      const d = distanceKm(c, o);
      if (d < bestD) {
        bestD = d;
        best = o;
      }
    }
    if (best) selectOutlet(best.id);
  };

  const ranked = useMemo(() => {
    if (!refCoords) return outlets;
    return [...outlets].sort(
      (a, b) => distanceKm(refCoords, a) - distanceKm(refCoords, b)
    );
  }, [outlets, refCoords]);

  const handleConfirm = () => {
    if (!selectedOutletId) return;
    completeOnboarding();
    onDone?.();
  };

  return (
    <div className="flex flex-col gap-4">
      <NativeStepHeader
        onBack={onBack}
        icon={Store}
        title="Pick an outlet"
        subtitle="Choose where you'd like to pick up your order."
      />

      <div className="space-y-2 rounded-2xl bg-white/70 backdrop-blur-sm p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Find nearest to me
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="Type your area / address"
            value={typedAddress}
            onChange={(e) => setTypedAddress(e.target.value)}
            className="flex-1 rounded-xl border-0 bg-white"
          />
          <Button size="sm" className="rounded-xl" onClick={findNearest} disabled={!typedAddress.trim()}>
            <Navigation className="h-3.5 w-3.5" /> Find
          </Button>
        </div>
        {refCoords && (
          <p className="text-[10px] text-muted-foreground">
            Using simulated coords ({refCoords.lat.toFixed(3)},{" "}
            {refCoords.lng.toFixed(3)}). Nearest outlet highlighted below.
          </p>
        )}
      </div>

      <div className="max-h-[45vh] space-y-2 overflow-y-auto">
        {ranked.length === 0 && (
          <p className="py-6 text-center text-xs text-muted-foreground">
            No outlets yet. Add one from the Admin panel.
          </p>
        )}
        {ranked.map((o) => {
          const sel = selectedOutletId === o.id;
          const d = refCoords ? distanceKm(refCoords, o) : null;
          return (
            <button
              key={o.id}
              onClick={() => selectOutlet(o.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-2xl p-4 text-left transition",
                sel
                  ? "bg-primary/10 ring-2 ring-primary"
                  : "bg-white/70 hover:bg-white"
              )}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <Store className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold">{o.name}</p>
                  {d != null && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      {d.toFixed(1)} km
                    </span>
                  )}
                </div>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  <MapPin className="mr-1 inline h-3 w-3" />
                  {o.place}
                </p>
                {o.phone && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    <Phone className="mr-1 inline h-3 w-3" />
                    {o.phone}
                  </p>
                )}
              </div>
              {sel && <Check className="h-5 w-5 text-primary" />}
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-4">
        <Button
          className="w-full rounded-2xl py-6 text-base font-bold"
          onClick={handleConfirm}
          disabled={!selectedOutletId}
        >
          Continue to menu
        </Button>
      </div>
    </div>
  );
}

function NativeStepHeader({ onBack, icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onBack}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/70 backdrop-blur-sm active:scale-95"
      >
        <ChevronLeft className="h-5 w-5 text-foreground" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg font-extrabold tracking-tight">
            {title}
          </h2>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
