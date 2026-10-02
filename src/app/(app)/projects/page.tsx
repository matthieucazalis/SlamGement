import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function ProjectsPage() {
  const session = await auth();

  return (
    <main className="space-y-4 p-8">
      <h1 className="text-2xl font-bold">Mes projets</h1>
      <p>Connecté en tant que {session?.user?.name}</p>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <Button type="submit" variant="outline">
          Se déconnecter
        </Button>
      </form>
    </main>
  );
}
