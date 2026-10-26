"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

export function GetHelpButton() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector("input")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  async function onSubmit(formData: FormData) {
    setStatus("sending");
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        message: formData.get("message"),
        sourcePage: "get-help-modal",
      }),
    });
    setStatus(res.ok ? "ok" : "error");
  }

  function close() {
    setOpen(false);
    setStatus("idle");
  }

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
        Get help
      </button>

      {open && mounted
        ? createPortal(
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <button type="button" className="absolute inset-0 bg-black/70" aria-label="Close" onClick={close} />
              <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="relative z-10 w-full max-w-md rounded-2xl bg-paper p-6 shadow-2xl"
              >
            <button
              type="button"
              onClick={close}
              className="absolute right-3 top-3 rounded-lg p-2 text-ink-soft hover:bg-paper-2 hover:text-ink"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 id={titleId} className="pr-8 text-2xl font-bold tracking-tight text-navy">
              Get help
            </h2>
            <p className="mt-1 text-sm text-ink-soft">Tell us what you need and we will follow up.</p>

            {status === "ok" ? (
              <div className="mt-6">
                <p className="rounded-lg bg-good/10 p-4 text-sm text-good">Thanks. We received your request and will be in touch.</p>
                <Button type="button" className="mt-4 w-full" onClick={close}>
                  Close
                </Button>
              </div>
            ) : (
              <form action={onSubmit} className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="help-name">Full name</Label>
                  <Input id="help-name" name="name" autoComplete="name" required />
                </div>
                <div>
                  <Label htmlFor="help-phone">Phone number</Label>
                  <Input id="help-phone" name="phone" type="tel" autoComplete="tel" required />
                </div>
                <div>
                  <Label htmlFor="help-email">Email</Label>
                  <Input id="help-email" name="email" type="email" autoComplete="email" required />
                </div>
                <div>
                  <Label htmlFor="help-message">Tell us how we can help</Label>
                  <Textarea id="help-message" name="message" rows={4} required placeholder="What do you need help with?" />
                </div>
                {status === "error" ? <p className="text-sm text-red-700">Could not send. Try again.</p> : null}
                <Button type="submit" className="w-full" disabled={status === "sending"}>
                  {status === "sending" ? "Sending..." : "Submit"}
                </Button>
              </form>
            )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
