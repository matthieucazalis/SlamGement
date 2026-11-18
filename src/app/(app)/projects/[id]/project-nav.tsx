"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/i18n/client";

export function ProjectNav({
  projectId,
  isAdmin,
}: {
  projectId: string;
  isAdmin: boolean;
}) {
  const t = useT();
  const pathname = usePathname();
  const base = `/projects/${projectId}`;

  const items = [
    { href: base, label: t("nav.home"), exact: true },
    { href: `${base}/dashboard`, label: t("nav.dashboard") },
    { href: `${base}/adr`, label: t("nav.adr") },
    { href: `${base}/kanban`, label: t("nav.kanban") },
    { href: `${base}/messages`, label: t("nav.messages") },
    { href: `${base}/members`, label: t("nav.members") },
    ...(isAdmin ? [{ href: `${base}/history`, label: t("nav.history") }] : []),
  ];

  return (
    <nav
      aria-label={t("nav.projectLabel")}
      className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-8"
    >
      <ul className="flex gap-1 whitespace-nowrap">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`inline-block border-b-2 px-3 py-2.5 text-sm ${
                  active
                    ? "border-primary font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
