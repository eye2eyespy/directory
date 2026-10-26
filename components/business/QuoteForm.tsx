"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";

export function QuoteForm({ businessId, businessName }: { businessId: string; businessName: string }) {
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  async function onSubmit(formData: FormData) {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId,
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        message: formData.get("message"),
        sourcePage: window.location.pathname,
      }),
    });
    setStatus(res.ok ? "ok" : "error");
  }

  if (status === "ok") {
    return (
      <p className="rounded-sm bg-good/10 p-4 text-sm text-good">
        Request sent to {businessName}. They should follow up shortly.
      </p>
    );
  }

  return (
    <form action={onSubmit} className="space-y-3">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" />
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" rows={4} placeholder="Roof type, timeline, ZIP..." />
      </div>
      {status === "error" ? <p className="text-sm text-red-700">Could not send. Try again.</p> : null}
      <Button type="submit" className="w-full">
        Request quote
      </Button>
    </form>
  );
}
