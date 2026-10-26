import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";

async function logout() {
  "use server";
  await signOut({ redirectTo: "/" });
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "MEMBER") redirect("/account");

  return (
    <div className="admin-shell fixed inset-0 z-50 min-h-screen overflow-auto">
      <div className="grid min-h-screen lg:grid-cols-[240px_1fr]">
        <aside className="border-r border-[#d3d3d3] bg-white p-5">
          <Link href="/admin" className="block">
            <p className="text-lg font-bold tracking-tight text-[#1f1f1f]">Directory CMS</p>
            <p className="mt-1 truncate text-xs text-[#6b6b6b]">{session.user.email}</p>
          </Link>
          <AdminNav />
          <div className="mt-8 space-y-3 border-t border-[#d3d3d3] pt-4">
            <Link href="/" className="block text-xs font-medium text-[#6b6b6b] hover:text-[#1f1f1f]">
              View site
            </Link>
            <form action={logout}>
              <button className="text-xs font-medium text-[#6b6b6b] hover:text-[#1f1f1f]">Sign out</button>
            </form>
          </div>
        </aside>
        <div className="bg-[#f9f9f9] p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
