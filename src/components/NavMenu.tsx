"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
}

export const ADMIN_ITEMS: NavItem[] = [
  { href: "/admin", label: "Admin" },
  { href: "/admin/stats", label: "Estadísticas" },
  { href: "/resetqr", label: "QR club" },
];

export const CLIENT_ITEMS: NavItem[] = [{ href: "/card", label: "Mi tarjeta" }];

const NavMenu = ({
  items,
  className,
}: {
  items: NavItem[];
  className?: string;
}) => {
  const pathname = usePathname();
  // Only the most specific match is active: /admin/stats lights "Estadísticas", not "Admin".
  const activeHref = items
    .map((i) => i.href)
    .filter((href) => pathname === href || pathname.startsWith(href + "/"))
    .sort((a, b) => b.length - a.length)[0];
  return (
    <nav
      aria-label="Principal"
      className={cn(
        "flex gap-1.5 max-sm:rounded-full max-sm:bg-resetGreen/10 max-sm:p-1",
        className
      )}
    >
      {items.map(({ href, label }) => {
        const active = href === activeHref;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-11 items-center justify-center rounded-full px-[18px] font-bold text-resetGreen transition-colors hover:bg-resetGreen/10 active:scale-95 max-sm:flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-resetGreen/60",
              active && "bg-resetGreen text-white hover:bg-resetGreen"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
};

export default NavMenu;
