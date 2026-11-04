"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ProjectNav({
  projectId,
  isAdmin,
}: {
  projectId: string;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const base = `/projects/${projectId}`;

  const items = [
    { href: base, label: "Accueil", exact: true },
    { href: `${base}/dashboard`, label: "Tableau de bord" },
    { href: `${base}/adr`, label: "Décisions (ADR)" },
    { href: `${base}/kanban`, label: "Kanban" },
    { href: `${base}/members`, label: "Membres" },
    ...(isAdmin ? [{ href: `${base}/history`, label: "Historique" }] : []),
  ];

  return (
    <nav
      aria-label="Navigation du projet"
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
