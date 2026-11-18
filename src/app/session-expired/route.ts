import { signOut } from "@/lib/auth";

// Atteinte quand la session appartient à un compte supprimé : on efface le
// cookie de session puis on renvoie vers la page de connexion.
export async function GET() {
  await signOut({ redirectTo: "/login" });
}
