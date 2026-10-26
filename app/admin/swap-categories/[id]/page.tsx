import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteField, saveCategory, saveField } from "@/app/admin/spots/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";

export default async function EditSwapCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const category = await prisma.swapCategory.findUnique({
    where: { id },
    include: { fields: { orderBy: { sortOrder: "asc" } } },
  });
  if (!category) notFound();

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
      {query.saved ? <p className="text-sm text-ink-soft">Saved.</p> : null}
      {query.error ? <p className="text-sm text-red-800">{query.error}</p> : null}
      <form action={saveCategory} className="space-y-3 rounded-xl border border-line bg-white p-5">
        <input type="hidden" name="id" value={category.id} />
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required defaultValue={category.name} />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={2} defaultValue={category.description ?? ""} />
        </div>
        <div>
          <Label htmlFor="formMode">Form type</Label>
          <Select id="formMode" name="formMode" defaultValue={category.formMode}>
            <option value="GOODS">Goods</option>
            <option value="APPAREL">Apparel</option>
            <option value="DIGITAL">Digital</option>
            <option value="SERVICE">Service</option>
          </Select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={category.active} /> Active
        </label>
        <Button type="submit">Save category</Button>
      </form>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Extra fields</h2>
        {category.fields.map((field) => (
          <div key={field.id} className="flex items-start justify-between gap-3 rounded-xl border border-line bg-white p-3 text-sm">
            <div>
              <p className="font-semibold">
                {field.name} {field.required ? "" : "(optional)"}
              </p>
              <p className="text-ink-soft">
                {field.fieldType}
                {field.options ? ` · ${field.options.split("\n").join(", ")}` : ""}
              </p>
            </div>
            <form action={deleteField}>
              <input type="hidden" name="id" value={field.id} />
              <Button type="submit" size="sm" variant="outline">
                Remove
              </Button>
            </form>
          </div>
        ))}
        <form action={saveField} className="space-y-3 rounded-xl border border-line bg-white p-5">
          <input type="hidden" name="categoryId" value={category.id} />
          <div>
            <Label htmlFor="fieldName">Field name</Label>
            <Input id="fieldName" name="name" required />
          </div>
          <div>
            <Label htmlFor="fieldType">Type</Label>
            <Select id="fieldType" name="fieldType" defaultValue="text">
              <option value="text">Text</option>
              <option value="select">Choices</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="options">Choices, one per line</Label>
            <Textarea id="options" name="options" rows={4} placeholder={"New\nLike new\nGood"} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="required" /> Required
          </label>
          <Button type="submit">Add field</Button>
        </form>
      </section>
    </div>
  );
}
