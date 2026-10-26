import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminHome() {
  const [businesses, published, featured, sponsored, leads, imports] = await Promise.all([
    prisma.business.count(),
    prisma.business.count({ where: { published: true } }),
    prisma.business.count({ where: { featured: true } }),
    prisma.business.count({ where: { sponsored: true } }),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.importJob.count(),
  ]);

  const cards = [
    ["Businesses", businesses, "/admin/businesses"],
    ["Published", published, "/admin/businesses"],
    ["Featured", featured, "/admin/businesses?promo=featured"],
    ["Sponsored", sponsored, "/admin/businesses?promo=sponsored"],
    ["New leads", leads, "/admin/leads"],
    ["Import jobs", imports, "/admin/imports"],
  ];

  return (
    <div>
      <h1 className="serif text-3xl text-navy">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-soft">CMS → listing → search/map → profile → Featured/Sponsored.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value, href]) => (
          <Link key={String(label)} href={String(href)} className="rounded-sm border border-line bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-ink-soft">{label}</p>
            <p className="serif mt-2 text-4xl text-navy">{value as number}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
