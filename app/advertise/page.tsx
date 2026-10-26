import Link from "next/link";
import { Check } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ADVERTISE_INTRO, PACKAGE_COPY } from "@/lib/advertise";

export const metadata = {
  title: "Business Advertising",
};

export default async function AdvertisePage() {
  const packages = await prisma.promotionPackage.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <p className="text-xs font-bold uppercase tracking-wide text-primary">{ADVERTISE_INTRO.eyebrow}</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-navy md:text-5xl">{ADVERTISE_INTRO.title}</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">{ADVERTISE_INTRO.subtitle}</p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {packages.map((pkg) => {
          const copy = PACKAGE_COPY[pkg.slug];
          const interval = pkg.billingInterval === "MONTHLY" ? "month" : pkg.billingInterval.toLowerCase();
          return (
            <div
              key={pkg.id}
              className={`flex flex-col rounded-2xl border bg-white p-6 shadow-sm ${
                pkg.slug === "exclusive-city-sponsor" ? "border-primary" : "border-line"
              }`}
            >
              <h2 className="text-2xl font-bold tracking-tight text-navy">{pkg.name}</h2>
              <p className="mt-3 text-4xl font-bold tracking-tight text-navy">
                {formatPrice(pkg.priceCents)}
                <span className="text-base font-medium text-ink-soft">/{interval}</span>
              </p>
              <p className="mt-3 text-sm text-ink-soft">{copy?.tagline ?? pkg.description}</p>
              {copy?.features?.length ? (
                <ul className="mt-5 space-y-2.5 text-sm">
                  {copy.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <Link href="/contact" className="btn btn-primary mt-8 w-full">
                Get Started
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
