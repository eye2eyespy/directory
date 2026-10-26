import Link from "next/link";
import type { DirectorySettings } from "@/lib/settings";

export function Footer({
  settings,
  industries,
}: {
  settings: DirectorySettings;
  industries: { name: string; slug: string }[];
}) {
  return (
    <footer className="mt-20 border-t border-line bg-paper-2">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="text-lg font-bold tracking-tight">{settings.directoryName}</p>
          <p className="mt-2 max-w-md text-sm text-ink-soft">{settings.tagline}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">Explore</p>
          <ul className="mt-3 space-y-2 text-sm">
            {industries.map((industry) => (
              <li key={industry.slug}>
                <Link href={`/${industry.slug}`} className="hover:text-primary">
                  {industry.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/search" className="hover:text-primary">
                Find a pro
              </Link>
            </li>
            <li>
              <Link href="/swap" className="hover:text-primary">
                {settings.swapName}
              </Link>
            </li>
            <li>
              <Link href="/featured" className="hover:text-primary">
                Featured
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-primary">
                Guides
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">Businesses</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/advertise" className="hover:text-primary">
                Advertise
              </Link>
            </li>
            <li>
              <Link href="/claim-business" className="hover:text-primary">
                Claim your listing
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-primary">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-primary">
                CMS login
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-ink-soft">
        Find local pros. Compare listings. Hire with confidence.
      </div>
    </footer>
  );
}
