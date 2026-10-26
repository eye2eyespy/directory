import Link from "next/link";
import { auth } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export default async function SwapLayout({ children }: { children: React.ReactNode }) {
  const [settings, session] = await Promise.all([getSettings(), auth()]);

  return (
    <div>
      <div className="border-b border-line bg-paper-2">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center">
          <div className="md:w-48">
            <Link href="/swap" className="text-lg font-bold tracking-tight">
              {settings.swapName}
            </Link>
            <p className="text-xs text-ink-soft">{settings.swapTagline}</p>
          </div>
          <form action="/swap/search" className="flex flex-1 gap-2">
            <input
              name="q"
              placeholder={`Search ${settings.swapName}`}
              className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2"
            />
            <button className="btn btn-primary" type="submit">
              Search
            </button>
          </form>
          <nav className="flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/swap/spots" className="hover:text-primary">
              {settings.spotLabelPlural}
            </Link>
            <Link href="/account/listings/new" className="hover:text-primary">
              Sell
            </Link>
            <Link href={session?.user ? "/account" : "/swap/login"} className="hover:text-primary">
              {session?.user ? "Account" : "Sign in"}
            </Link>
          </nav>
        </div>
      </div>
      {children}
    </div>
  );
}
