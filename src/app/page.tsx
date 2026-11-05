import { redirect } from "next/navigation";

// Le proxy impose déjà une session : un visiteur non connecté est renvoyé vers
// /login avant d'arriver ici. Un utilisateur connecté va directement à ses projets.
export default function Home() {
  redirect("/projects");
}
