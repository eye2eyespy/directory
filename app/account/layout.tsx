import Link from "next/link";
import { requireMember } from "@/lib/member";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireMember();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Swap account</p>
          <h1 className="text-3xl font-bold tracking-tight">{profile.displayName}</h1>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm font-semibold">
          <Link href="/account" className="hover:text-primary">
            Dashboard
          </Link>
          <Link href="/account/listings/new" className="hover:text-primary">
            New listing
          </Link>
          <Link href="/swap" className="hover:text-primary">
            Browse
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
