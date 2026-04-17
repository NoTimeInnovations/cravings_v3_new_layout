import { Link } from "react-router-dom";
import { useMenuStore } from "@/store/menuStore";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";
import SectionRenderer from "@/components/storefront/SectionRenderer";

export default function Storefront() {
  const storefront = useMenuStore((s) => s.storefront);

  if (!storefront?.enabled) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/30 px-6 text-center">
        <p className="text-6xl">🚧</p>
        <h1 className="mt-4 font-display text-xl font-extrabold">
          Storefront is off
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Enable it from the admin panel to publish your landing page.
        </p>
        <Link
          to="/admin"
          className="mt-5 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground shadow"
        >
          Open Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <StorefrontHeader />
      <main>
        {storefront.sections.map((sec) => (
          <SectionRenderer key={sec.id} section={sec} />
        ))}
      </main>
    </div>
  );
}
