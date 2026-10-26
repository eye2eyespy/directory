import { Input, Select } from "@/components/ui/input";

export function Filters({
  industries,
  categories,
  values,
}: {
  industries: { name: string; slug: string }[];
  categories: { name: string; slug: string }[];
  values: Record<string, string | undefined>;
}) {
  return (
    <form className="mb-6 grid gap-3 rounded-xl border border-line bg-white p-4 shadow-sm md:grid-cols-6">
      <Input name="q" placeholder="Keyword" defaultValue={values.q} />
      <Select name="industry" defaultValue={values.industry ?? ""}>
        <option value="">All industries</option>
        {industries.map((industry) => (
          <option key={industry.slug} value={industry.slug}>
            {industry.name}
          </option>
        ))}
      </Select>
      <Select name="category" defaultValue={values.category ?? ""}>
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category.slug} value={category.slug}>
            {category.name}
          </option>
        ))}
      </Select>
      <Input name="location" placeholder="City, state, ZIP" defaultValue={values.location} />
      <Select name="minRating" defaultValue={values.minRating ?? ""}>
        <option value="">Min rating</option>
        <option value="3">3+</option>
        <option value="4">4+</option>
        <option value="4.5">4.5+</option>
      </Select>
      <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
        <label className="flex items-center gap-1">
          <input type="checkbox" name="verified" defaultChecked={values.verified === "1"} value="1" /> Verified
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" name="featured" defaultChecked={values.featured === "1"} value="1" /> Featured
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" name="video" defaultChecked={values.video === "1"} value="1" /> Video
        </label>
        <button className="btn btn-primary ml-auto">Filter</button>
      </div>
    </form>
  );
}
