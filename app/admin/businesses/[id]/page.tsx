import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BusinessForm } from "@/components/admin/BusinessForm";
import { updateBusiness } from "@/app/admin/businesses/actions";

export default async function EditBusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [business, industries] = await Promise.all([
    prisma.business.findUnique({ where: { id }, include: { media: true } }),
    prisma.industry.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!business) notFound();

  return (
    <div>
      <h1 className="serif mb-6 text-3xl text-navy">Edit {business.name}</h1>
      <BusinessForm action={updateBusiness} industries={industries} business={business} />
    </div>
  );
}
