import { prisma } from "@/lib/prisma";
import { BusinessForm } from "@/components/admin/BusinessForm";
import { createBusiness } from "@/app/admin/businesses/actions";

export default async function NewBusinessPage() {
  const industries = await prisma.industry.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="serif mb-6 text-3xl text-navy">Add business</h1>
      <BusinessForm action={createBusiness} industries={industries} />
    </div>
  );
}
