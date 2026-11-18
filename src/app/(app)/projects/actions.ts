"use server";

import { redirect } from "next/navigation";
import { getT } from "@/i18n/server";
import { requireUser } from "@/lib/session";
import { firstIssueMessage } from "@/lib/validators/messages";
import { projectSchema } from "@/lib/validators/project";
import { createProject } from "@/services/project.service";

export type ProjectFormState = { error?: string } | undefined;

export async function createProjectAction(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const [user, t] = await Promise.all([requireUser(), getT()]);
  const parsed = projectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssueMessage(t, parsed.error) };

  const project = await createProject(user.id, parsed.data);
  redirect(`/projects/${project.id}`);
}
