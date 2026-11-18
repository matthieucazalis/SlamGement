import Link from "next/link";
import { redirect } from "next/navigation";
import { getT } from "@/i18n/server";
import { requireUser } from "@/lib/session";
import { getUserById } from "@/services/user.service";
import { ProfileForms } from "./profile-forms";

export async function generateMetadata() {
  const t = await getT();
  return { title: t("profile.title") };
}

export default async function ProfilePage() {
  const [sessionUser, t] = await Promise.all([requireUser(), getT()]);
  const user = await getUserById(sessionUser.id);
  if (!user) redirect("/login");

  return (
    <main id="main-content" className="mx-auto max-w-md space-y-6 p-4 sm:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("profile.title")}</h1>
        <Link href="/projects" className="text-sm underline">
          {t("profile.backToProjects")}
        </Link>
      </div>
      <ProfileForms name={user.name} email={user.email} avatar={user.avatar} />
    </main>
  );
}
