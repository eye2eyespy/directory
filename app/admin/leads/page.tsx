import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    include: { business: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="serif text-3xl text-navy">Leads</h1>
      <div className="mt-6 overflow-x-auto rounded-sm border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper-2 text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Business</th>
              <th className="px-3 py-2">Contact</th>
              <th className="px-3 py-2">Message</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t border-line align-top">
                <td className="px-3 py-2 text-ink-soft">{format(lead.createdAt, "MMM d, yyyy HH:mm")}</td>
                <td className="px-3 py-2">{lead.name}</td>
                <td className="px-3 py-2">{lead.business?.name ?? "—"}</td>
                <td className="px-3 py-2">
                  {lead.email}
                  <br />
                  {lead.phone}
                </td>
                <td className="px-3 py-2">{lead.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
