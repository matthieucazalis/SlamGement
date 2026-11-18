import JSZip from "jszip";
import { getLocale, getT } from "@/i18n/server";
import { auth } from "@/lib/auth";
import { displayName } from "@/lib/labels";
import { adrFileName, adrToMarkdown, slugify } from "@/lib/adr-markdown";
import { ForbiddenError } from "@/lib/permissions";
import { listAdrsForExport } from "@/services/adr.service";
import { getProjectForUser } from "@/services/project.service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id)
    return new Response("Non authentifié", { status: 401 });

  try {
    const { project } = await getProjectForUser(session.user.id, id);
    const adrs = await listAdrsForExport(session.user.id, id);
    const [locale, t] = await Promise.all([getLocale(), getT()]);

    const zip = new JSZip();
    for (const adr of adrs) {
      const input = {
        ...adr,
        author: { name: displayName(t, adr.author.name) },
      };
      zip.file(
        adrFileName(adr.number, adr.title),
        adrToMarkdown(input, locale),
      );
    }
    const data = await zip.generateAsync({ type: "arraybuffer" });

    return new Response(data, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="adr-${slugify(project.name)}.zip"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    if (e instanceof ForbiddenError)
      return new Response("Introuvable", { status: 404 });
    throw e;
  }
}
