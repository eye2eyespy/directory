import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

async function login(formData: FormData) {
  "use server";
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=1");
    }
    throw error;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user?.role === "MEMBER") redirect("/account");
  if (session?.user) redirect("/admin");
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="serif text-center text-4xl text-navy">CMS login</h1>
      <p className="mt-2 text-center text-sm text-ink-soft">Seeded admin: admin@local / changeme</p>
      <form action={login} className="mx-auto mt-8 max-w-sm space-y-4 rounded-sm border border-line bg-white p-6">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required defaultValue="admin@local" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        {error ? <p className="text-sm text-red-700">Invalid email or password.</p> : null}
        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </form>
    </div>
  );
}
