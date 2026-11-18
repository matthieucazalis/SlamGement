import Link from "next/link";
import { AppIcon, type AppIconName } from "@/components/icons";
import { PreferencesBar } from "@/components/preferences-bar";
import { buttonVariants } from "@/components/ui/button";
import { getT } from "@/i18n/server";
import { auth } from "@/lib/auth";

export async function generateMetadata() {
  const t = await getT();
  return { title: `${t("common.appName")} – ${t("landing.tagline")}` };
}

export default async function Home() {
  const [session, t] = await Promise.all([auth(), getT()]);
  const loggedIn = !!session?.user;

  const features: { icon: AppIconName; title: string; text: string }[] = [
    { icon: "adr", title: t("landing.adrTitle"), text: t("landing.adrText") },
    {
      icon: "kanban",
      title: t("landing.kanbanTitle"),
      text: t("landing.kanbanText"),
    },
    {
      icon: "chat",
      title: t("landing.chatTitle"),
      text: t("landing.chatText"),
    },
    {
      icon: "team",
      title: t("landing.teamTitle"),
      text: t("landing.teamText"),
    },
  ];

  const Cta = ({ size = "lg" }: { size?: "lg" | "default" }) =>
    loggedIn ? (
      <Link href="/projects" className={buttonVariants({ size })}>
        {t("landing.ctaOpen")}
      </Link>
    ) : (
      <div className="flex flex-wrap gap-3">
        <Link href="/register" className={buttonVariants({ size })}>
          {t("landing.ctaRegister")}
        </Link>
        <Link
          href="/login"
          className={buttonVariants({ size, variant: "outline" })}
        >
          {t("landing.ctaLogin")}
        </Link>
      </div>
    );

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
          <span className="flex items-center gap-2 font-bold">
            <span className="text-primary">
              <AppIcon name="logo" size={22} />
            </span>
            {t("common.appName")}
          </span>
          <div className="flex items-center gap-3">
            <PreferencesBar />
            {!loggedIn && (
              <Link
                href="/login"
                className={buttonVariants({ size: "sm", variant: "outline" })}
              >
                {t("landing.ctaLogin")}
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-5xl space-y-6 px-4 py-14 sm:px-8 sm:py-20">
          <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
            {t("landing.tagline")}
          </h1>
          <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
            {t("landing.intro")}
          </p>
          <Cta />
        </section>

        <section className="border-t bg-muted/40">
          <div className="mx-auto max-w-5xl space-y-8 px-4 py-12 sm:px-8">
            <h2 className="text-2xl font-bold">{t("landing.featuresTitle")}</h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {features.map(({ icon, title, text }) => (
                <li
                  key={title}
                  className="space-y-2 rounded-lg border bg-background p-5"
                >
                  <span
                    aria-hidden="true"
                    className="inline-block text-primary"
                  >
                    <AppIcon name={icon} size={24} />
                  </span>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-5xl space-y-4 px-4 py-14 sm:px-8">
          <h2 className="text-2xl font-bold">{t("landing.finalTitle")}</h2>
          <p className="text-muted-foreground">{t("landing.finalText")}</p>
          <Cta size="default" />
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-5xl flex-wrap gap-4 px-4 py-4 text-sm text-muted-foreground sm:px-8">
          <Link href="/legal/privacy" className="hover:underline">
            {t("landing.privacy")}
          </Link>
          <Link href="/legal/notice" className="hover:underline">
            {t("landing.notice")}
          </Link>
        </div>
      </footer>
    </div>
  );
}
