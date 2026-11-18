import Link from "next/link";
import { PreferencesBar } from "@/components/preferences-bar";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { getT } from "@/i18n/server";
import { signOut } from "@/lib/auth";
import { requireUser } from "@/lib/session";
import { getUserById } from "@/services/user.service";

// Barre commune à toutes les pages connectées : navigation, raccourcis langue
// et thème, profil, déconnexion.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await requireUser();
  const [user, t] = await Promise.all([getUserById(sessionUser.id), getT()]);
  const name = user?.name ?? sessionUser.name ?? "";

  return (
    <>
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2 sm:px-8">
          <nav
            aria-label={t("nav.mainLabel")}
            className="flex items-center gap-4 text-sm"
          >
            <Link href="/projects" className="font-bold">
              {t("common.appName")}
            </Link>
            <Link href="/projects" className="hover:underline">
              {t("nav.projects")}
            </Link>
            <Link href="/settings" className="hover:underline">
              {t("nav.settings")}
            </Link>
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <PreferencesBar />
            <Link
              href="/profile"
              className="flex items-center gap-2 text-sm hover:underline"
              title={t("nav.profile")}
            >
              <UserAvatar name={name} src={user?.avatar} size={28} />
              <span className="hidden max-w-32 truncate sm:inline">{name}</span>
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <Button type="submit" variant="outline" size="sm">
                {t("auth.logout")}
              </Button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
