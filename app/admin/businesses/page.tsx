import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toggleFlag } from "@/app/admin/businesses/actions";

export default async function AdminBusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ promo?: string; q?: string }>;
}) {
  const { promo, q } = await searchParams;
  const businesses = await prisma.business.findMany({
    where: {
      ...(promo === "featured" ? { featured: true } : {}),
      ...(promo === "sponsored" ? { sponsored: true } : {}),
      ...(q ? { name: { contains: q } } : {}),
    },
    include: { industry: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="serif text-3xl text-navy">Businesses</h1>
        <Link href="/admin/businesses/new" className="btn btn-primary">
          Add business
        </Link>
      </div>
      <form className="mt-4">
        <input name="q" defaultValue={q} placeholder="Search name" className="rounded-sm border border-line bg-white px-3 py-2 text-sm" />
      </form>
      <div className="mt-4 overflow-x-auto rounded-sm border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper-2 text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">City</th>
              <th className="px-3 py-2">Industry</th>
              <th className="px-3 py-2">Flags</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {businesses.map((business) => (
              <tr key={business.id} className="border-t border-line">
                <td className="px-3 py-2 font-medium">
                  <Link href={`/admin/businesses/${business.id}`} className="hover:text-primary">
                    {business.name}
                  </Link>
                </td>
                <td className="px-3 py-2 text-ink-soft">{business.city}</td>
                <td className="px-3 py-2 text-ink-soft">{business.industry.name}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {(["published", "verified", "featured", "sponsored", "homepageFeatured"] as const).map((field) => (
                      <form key={field} action={toggleFlag}>
                        <input type="hidden" name="id" value={business.id} />
                        <input type="hidden" name="field" value={field} />
                        <button
                          className={`rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            business[field] ? "bg-navy text-paper" : "bg-paper-2 text-ink-soft"
                          }`}
                        >
                          {field.replace("homepageFeatured", "home")}
                        </button>
                      </form>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <Link href={`/admin/businesses/${business.id}`} className="text-primary">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
