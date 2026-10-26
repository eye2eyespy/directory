import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { auth } from "@/lib/auth";

async function addIndustry(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) return;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await prisma.industry.create({
    data: { name, slug: slugify(name), description: String(formData.get("description") ?? "") || null },
  });
  revalidatePath("/admin/industries");
}

export default async function IndustriesPage() {
  const industries = await prisma.industry.findMany({
    include: { _count: { select: { businesses: true, categories: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="serif text-3xl text-navy">Industries</h1>
      <p className="mt-1 text-sm text-ink-soft">Roofing is the first configured industry — not a hard-coded vertical.</p>
      <form action={addIndustry} className="mt-6 grid max-w-xl gap-3 rounded-sm border border-line bg-white p-5">
        <div>
          <Label>Name</Label>
          <Input name="name" placeholder="Plumbers" required />
        </div>
        <div>
          <Label>Description</Label>
          <Input name="description" />
        </div>
        <Button type="submit">Add industry</Button>
      </form>
      <ul className="mt-6 divide-y divide-line rounded-sm border border-line bg-white">
        {industries.map((industry) => (
          <li key={industry.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-semibold">{industry.name}</p>
              <p className="text-xs text-ink-soft">/{industry.slug}</p>
            </div>
            <p className="text-sm text-ink-soft">
              {industry._count.businesses} businesses · {industry._count.categories} categories
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
