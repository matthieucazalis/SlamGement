import JSZip from "jszip";
import { auth } from "@/lib/auth";
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

    const zip = new JSZip();
    for (const adr of adrs) {
      zip.file(adrFileName(adr.number, adr.title), adrToMarkdown(adr));
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
