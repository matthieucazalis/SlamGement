import { auth } from "@/lib/auth";
import { parseAdrNumber } from "@/lib/adr-format";
import { adrFileName, adrToMarkdown } from "@/lib/adr-markdown";
import { ForbiddenError } from "@/lib/permissions";
import { AdrNotFoundError, getAdr } from "@/services/adr.service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; number: string }> },
) {
  const { id, number: raw } = await params;

  const session = await auth();
  if (!session?.user?.id)
    return new Response("Non authentifié", { status: 401 });

  const number = parseAdrNumber(raw);
  if (!number) return new Response("Introuvable", { status: 404 });

  try {
    const adr = await getAdr(session.user.id, id, number);
    return new Response(adrToMarkdown(adr), {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${adrFileName(adr.number, adr.title)}"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    if (e instanceof ForbiddenError || e instanceof AdrNotFoundError)
      return new Response("Introuvable", { status: 404 });
    throw e;
  }
}
