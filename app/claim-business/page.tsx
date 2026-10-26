import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ClaimBusinessPage() {
  const businesses = await prisma.business.findMany({
    where: { published: true, claimed: false },
    orderBy: { name: "asc" },
    take: 40,
    include: { industry: true },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="serif text-4xl text-navy">Claim a business</h1>
      <p className="mt-3 text-ink-soft">
        Owner dashboards are a later phase. For now, request a claim through contact — listings stay CMS-managed.
      </p>
      <ul className="mt-8 divide-y divide-line rounded-sm border border-line bg-white">
        {businesses.map((business) => (
          <li key={business.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <span>
              {business.name}
              <span className="ml-2 text-ink-soft">
                {business.city}, {business.industry.name}
              </span>
            </span>
            <Link href="/contact" className="font-semibold text-primary">
              Claim
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
