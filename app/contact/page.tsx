import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { redirect } from "next/navigation";

async function sendContact(formData: FormData) {
  "use server";
  await prisma.lead.create({
    data: {
      name: String(formData.get("name") ?? "Contact"),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      message: String(formData.get("message") ?? ""),
      sourcePage: "/contact",
    },
  });
  redirect("/contact?sent=1");
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;
  return (
    <div className="mx-auto max-w-lg px-4 py-14">
      <h1 className="serif text-4xl text-navy">Contact</h1>
      {sent ? <p className="mt-4 text-good">Message received.</p> : null}
      <form action={sendContact} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" />
        </div>
        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" name="message" rows={5} />
        </div>
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}
