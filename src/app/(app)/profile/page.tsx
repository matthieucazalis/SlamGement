import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getUserById } from "@/services/user.service";
import { ProfileForms } from "./profile-forms";

export default async function ProfilePage() {
  const sessionUser = await requireUser();
  const user = await getUserById(sessionUser.id);
  if (!user) redirect("/login");

  return (
    <main className="mx-auto max-w-md space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mon profil</h1>
        <Link href="/projects" className="text-sm underline">
          Retour aux projets
        </Link>
      </div>
      <ProfileForms name={user.name} email={user.email} />
    </main>
  );
}
