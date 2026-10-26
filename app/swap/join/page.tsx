import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { joinSwap } from "@/app/swap/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default async function JoinPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const settings = await getSettings();
  const session = await auth();
  if (session?.user?.id) {
    const profile = await prisma.swapProfile.findUnique({ where: { userId: session.user.id } });
    if (profile) redirect("/account");
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight">Join {settings.swapName}</h1>
      <p className="mt-2 text-sm text-ink-soft">One account can buy and sell. The directory CMS login is separate.</p>
      <form action={joinSwap} className="mt-6 space-y-4 rounded-2xl border border-line bg-white p-6">
        {error ? <p className="text-sm text-red-800">{error}</p> : null}
        <div>
          <Label htmlFor="displayName">Display name</Label>
          <Input id="displayName" name="displayName" required minLength={2} maxLength={40} defaultValue={session?.user?.name ?? ""} />
        </div>
        <div>
          <Label htmlFor="city">City (optional)</Label>
          <Input id="city" name="city" />
        </div>
        {session?.user ? (
          <p className="text-sm text-ink-soft">This profile will be attached to {session.user.email}.</p>
        ) : (
          <>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required minLength={8} />
            </div>
          </>
        )}
        <Button type="submit" className="w-full">
          Create profile
        </Button>
      </form>
    </div>
  );
}
