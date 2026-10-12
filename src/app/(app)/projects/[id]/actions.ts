"use server";

import { redirect } from "next/navigation";
import { ForbiddenError } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import {
  ConfirmationMismatchError,
  deleteProject,
} from "@/services/project.service";

export async function deleteProjectAction(
  projectId: string,
  formData: FormData,
) {
  const user = await requireUser();
  const confirmName = String(formData.get("confirmName") ?? "");

  try {
    await deleteProject(user.id, projectId, confirmName);
  } catch (e) {
    if (e instanceof ConfirmationMismatchError)
      redirect(`/projects/${projectId}?error=confirm`);
    if (e instanceof ForbiddenError)
      redirect(`/projects/${projectId}?error=forbidden`);
    throw e;
  }

  redirect("/projects");
}
