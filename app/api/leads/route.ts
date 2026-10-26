import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  businessId: z.string().optional(),
  name: z.string().min(1),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
  sourcePage: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid lead" }, { status: 400 });
  }
  const lead = await prisma.lead.create({ data: parsed.data });
  if (parsed.data.businessId) {
    await prisma.analyticsEvent.create({
      data: { businessId: parsed.data.businessId, type: "quote_request", meta: JSON.stringify({ leadId: lead.id }) },
    });
  }
  return NextResponse.json({ ok: true, id: lead.id });
}
