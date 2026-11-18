import Link from "next/link";
import { getT } from "@/i18n/server";

export async function generateMetadata() {
  const t = await getT();
  return { title: t("legal.noticeTitle") };
}

export default async function NoticePage() {
  const t = await getT();
  const sections = [
    ["legal.n1Title", "legal.n1Text"],
    ["legal.n2Title", "legal.n2Text"],
    ["legal.n3Title", "legal.n3Text"],
    ["legal.n4Title", "legal.n4Text"],
  ] as const;

  return (
    <main id="main-content" className="mx-auto max-w-2xl space-y-6 p-4 sm:p-8">
      <Link href="/" className="text-sm underline">
        {t("legal.back")}
      </Link>
      <h1 className="text-2xl font-bold">{t("legal.noticeTitle")}</h1>
      {sections.map(([title, text]) => (
        <section key={title} className="space-y-2">
          <h2 className="text-lg font-semibold">{t(title)}</h2>
          <p className="text-sm leading-relaxed">{t(text)}</p>
        </section>
      ))}
    </main>
  );
}
