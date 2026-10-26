import type { ReactNode } from "react";

type Props = {
  listingCount: number;
  verifiedCount: number;
  averageRating?: number | null;
};

export function TrustBar({ listingCount, verifiedCount, averageRating }: Props) {
  const items: { key: string; node: ReactNode }[] = [
    {
      key: "verified",
      node: (
        <>
          <strong className="font-semibold text-ink">{verifiedCount}</strong> verified listings
        </>
      ),
    },
  ];

  if (averageRating && averageRating > 0) {
    items.push({
      key: "rating",
      node: (
        <>
          <strong className="font-semibold text-ink">{averageRating.toFixed(1)}★</strong> average Google rating
        </>
      ),
    });
  }

  items.push({
    key: "count",
    node: (
      <>
        <strong className="font-semibold text-ink">{listingCount}</strong> published listings
      </>
    ),
  });

  items.push({
    key: "updated",
    node: <>Updated weekly</>,
  });

  return (
    <section className="border-y border-line bg-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 py-4 text-sm text-ink-soft">
        {items.map((item, i) => (
          <span key={item.key} className="inline-flex items-center gap-5">
            {i > 0 ? <span className="hidden h-1 w-1 rounded-full bg-line sm:inline-block" aria-hidden="true" /> : null}
            <span>{item.node}</span>
          </span>
        ))}
      </div>
    </section>
  );
}

export function trustStats(businesses: { verified: boolean; googleRating?: number | null }[]) {
  const verifiedCount = businesses.filter((b) => b.verified).length;
  const rated = businesses.filter((b) => typeof b.googleRating === "number" && (b.googleRating as number) > 0);
  const averageRating =
    rated.length > 0 ? rated.reduce((sum, b) => sum + (b.googleRating as number), 0) / rated.length : null;
  return {
    listingCount: businesses.length,
    verifiedCount,
    averageRating,
  };
}
