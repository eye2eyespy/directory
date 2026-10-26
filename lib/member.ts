import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireStaff() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "MEMBER") redirect("/account");
  return session;
}

export async function requireMember() {
  const session = await auth();
  if (!session?.user?.id) redirect("/swap/login");
  const profile = await prisma.swapProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/swap/join");
  return { session, profile };
}
