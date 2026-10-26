import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { safeNextPath } from "@/lib/swap";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

async function login(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("callbackUrl"), "/account");
  try {
    await signIn("credentials", { email, password, redirectTo: next });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/swap/login?error=1&callbackUrl=${encodeURIComponent(next)}`);
    }
    throw error;
  }
}

export default async function SwapLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const settings = await getSettings();
  const session = await auth();
  if (session?.user?.id) {
    const profile = await prisma.swapProfile.findUnique({ where: { userId: session.user.id } });
    redirect(profile ? safeNextPath(params.callbackUrl ?? null, "/account") : "/swap/join");
  }
  const callbackUrl = safeNextPath(params.callbackUrl ?? null, "/account");

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight">Sign in to {settings.swapName}</h1>
      <form action={login} className="mt-6 space-y-4 rounded-2xl border border-line bg-white p-6">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        {params.error ? <p className="text-sm text-red-800">Invalid email or password.</p> : null}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </form>
      <p className="mt-4 text-center text-sm">
        New here?{" "}
        <Link href="/swap/join" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
