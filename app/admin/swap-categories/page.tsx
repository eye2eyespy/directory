import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formModeLabel } from "@/lib/swap";
import { saveCategory } from "@/app/admin/spots/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";

export default async function SwapCategoriesPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const categories = await prisma.swapCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { listings: true, fields: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Swap categories</h1>
        <p className="mt-1 text-sm text-ink-soft">The form type changes which fields a seller has to fill in.</p>
      </div>
      <div className="space-y-2">
        {categories.map((category) => (
          <Link key={category.id} href={`/admin/swap-categories/${category.id}`} className="flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3">
            <span className="font-semibold">{category.name}</span>
            <span className="text-sm text-ink-soft">
              {formModeLabel(category.formMode)} · {category._count.fields} fields · {category._count.listings} listings
              {category.active ? "" : " · hidden"}
            </span>
          </Link>
        ))}
      </div>
      <form action={saveCategory} className="max-w-xl space-y-3 rounded-xl border border-line bg-white p-5">
        <h2 className="font-bold">Add a category</h2>
        {error ? <p className="text-sm text-red-800">{error}</p> : null}
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={2} />
        </div>
        <div>
          <Label htmlFor="formMode">Form type</Label>
          <Select id="formMode" name="formMode" defaultValue="GOODS">
            <option value="GOODS">Goods — price, photo, meet-up spot</option>
            <option value="APPAREL">Apparel — size, color, condition, meet-up spot</option>
            <option value="DIGITAL">Digital — delivery note, no meet-up</option>
            <option value="SERVICE">Service — availability, meet-up optional</option>
          </Select>
        </div>
        <Button type="submit">Add category</Button>
      </form>
    </div>
  );
}
