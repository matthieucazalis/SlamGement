"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { projectSchema } from "@/lib/validators/project";
import { createProject } from "@/services/project.service";

export type ProjectFormState = { error?: string } | undefined;

export async function createProjectAction(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const user = await requireUser();
  const parsed = projectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const project = await createProject(user.id, parsed.data);
  redirect(`/projects/${project.id}`);
}
