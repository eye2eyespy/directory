import Link from "next/link";
import {
  Building2,
  CloudRain,
  Droplets,
  Hammer,
  Home,
  Layers,
  Shield,
  Warehouse,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  "shingle-roofing": Home,
  "metal-roofing": Warehouse,
  "standing-seam": Layers,
  "stone-coated-steel": Shield,
  "tile-roofing": Building2,
  "roof-repair": Wrench,
  "commercial-roofing": Building2,
  "flat-roofing": Layers,
  "tpo-roofing": Warehouse,
  "storm-damage": CloudRain,
  gutters: Droplets,
};

export function CategoryGrid({
  categories,
}: {
  categories: { id: string; name: string; slug: string; industry?: { name: string } }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {categories.map((category) => {
        const Icon = ICONS[category.slug] ?? Hammer;
        return (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="flex flex-col items-center gap-3 rounded-xl border border-line bg-white px-3 py-5 text-center shadow-sm transition hover:border-primary hover:shadow-md"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-2 text-primary">
              <Icon className="h-6 w-6" />
            </span>
            <span className="text-sm font-semibold leading-tight text-ink">{category.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
