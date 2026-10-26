"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["Dashboard", "/admin"],
  ["Businesses", "/admin/businesses"],
  ["Industries", "/admin/industries"],
  ["Promotions", "/admin/promotions"],
  ["Imports", "/admin/imports"],
  ["Guides", "/admin/blog"],
  ["Leads", "/admin/leads"],
  ["Spots", "/admin/spots"],
  ["Swap categories", "/admin/swap-categories"],
  ["Settings", "/admin/settings"],
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 space-y-0.5 text-sm">
      {links.map(([label, href]) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`block rounded-lg px-3 py-2 ${
              active ? "bg-[#d3d3d3] font-semibold text-[#1f1f1f]" : "text-[#4a4a4a] hover:bg-[#d3d3d3]/60"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
