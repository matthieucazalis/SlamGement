import Link from "next/link";
import { getT } from "@/i18n/server";

export async function generateMetadata() {
  const t = await getT();
  return { title: t("legal.privacyTitle") };
}

export default async function PrivacyPage() {
  const t = await getT();
  const sections = [
    ["legal.s1Title", "legal.s1Text"],
    ["legal.s2Title", "legal.s2Text"],
    ["legal.s3Title", "legal.s3Text"],
    ["legal.s4Title", "legal.s4Text"],
    ["legal.s5Title", "legal.s5Text"],
    ["legal.s6Title", "legal.s6Text"],
    ["legal.s7Title", "legal.s7Text"],
  ] as const;

  return (
    <main id="main-content" className="mx-auto max-w-2xl space-y-6 p-4 sm:p-8">
      <Link href="/" className="text-sm underline">
        {t("legal.back")}
      </Link>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{t("legal.privacyTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("legal.updated")}</p>
      </div>
      {sections.map(([title, text]) => (
        <section key={title} className="space-y-2">
          <h2 className="text-lg font-semibold">{t(title)}</h2>
          <p className="text-sm leading-relaxed">{t(text)}</p>
        </section>
      ))}
    </main>
  );
}
