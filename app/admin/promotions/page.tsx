import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";

async function savePackage(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) return;
  const id = String(formData.get("id") ?? "");
  const price = Math.round(Number(formData.get("price") ?? 0) * 100);
  await prisma.promotionPackage.update({
    where: { id },
    data: {
      name: String(formData.get("name") ?? ""),
      priceCents: price,
      stripeProductId: String(formData.get("stripeProductId") ?? "") || null,
      stripePriceId: String(formData.get("stripePriceId") ?? "") || null,
      active: formData.get("active") === "on",
    },
  });
  revalidatePath("/admin/promotions");
  revalidatePath("/advertise");
}

export default async function PromotionsPage() {
  const packages = await prisma.promotionPackage.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div>
      <h1 className="serif text-3xl text-navy">Promotion packages</h1>
      <p className="mt-1 text-sm text-ink-soft">Prices are CMS-editable. Nothing is hard-coded in the advertise page.</p>
      <div className="mt-6 space-y-4">
        {packages.map((pkg) => (
          <form key={pkg.id} action={savePackage} className="grid gap-3 rounded-sm border border-line bg-white p-5 md:grid-cols-5">
            <input type="hidden" name="id" value={pkg.id} />
            <Input name="name" defaultValue={pkg.name} />
            <Input name="price" type="number" step="0.01" defaultValue={pkg.priceCents / 100} />
            <Input name="stripeProductId" placeholder="Stripe product" defaultValue={pkg.stripeProductId ?? ""} />
            <Input name="stripePriceId" placeholder="Stripe price" defaultValue={pkg.stripePriceId ?? ""} />
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="active" defaultChecked={pkg.active} /> Active
              </label>
              <Button type="submit" size="sm">
                Save
              </Button>
            </div>
            <p className="md:col-span-5 text-xs text-ink-soft">
              Current public price: {formatPrice(pkg.priceCents)} / {pkg.billingInterval.toLowerCase()}
            </p>
          </form>
        ))}
      </div>
    </div>
  );
}
