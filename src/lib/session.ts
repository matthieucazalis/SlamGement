import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Un jeton de session reste valable jusqu'à son expiration : on vérifie donc
// aussi que le compte existe toujours et n'a pas été supprimé (une requête
// légère, faite une seule fois par requête grâce à cache()).
const accountState = cache((id: string) =>
  prisma.user.findUnique({ where: { id }, select: { deletedAt: true } }),
);

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const account = await accountState(session.user.id);
  if (!account || account.deletedAt) redirect("/session-expired");

  return session.user;
}
