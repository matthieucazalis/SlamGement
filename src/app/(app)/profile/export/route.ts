import { auth } from "@/lib/auth";
import { exportUserData } from "@/services/account.service";

// Export RGPD : toutes les données du compte connecté, au format JSON.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const data = await exportUserData(session.user.id);
  const day = new Date().toISOString().slice(0, 10);

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="slamgement-data-${day}.json"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
