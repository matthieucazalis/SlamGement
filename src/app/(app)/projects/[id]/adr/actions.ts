"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ADR_STATUSES } from "@/lib/adr-status";
import { ForbiddenError } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { adrSchema } from "@/lib/validators/adr";
import {
  AdrInUseError,
  AdrLockedError,
  AdrNotFoundError,
  InvalidSupersessionError,
  InvalidTransitionError,
  changeAdrStatus,
  createAdr,
  deleteAdr,
  updateAdr,
} from "@/services/adr.service";

export type AdrFormState =
  | { error?: string; values?: Record<string, string> }
  | undefined;

export async function createAdrAction(
  projectId: string,
  _prev: AdrFormState,
  formData: FormData,
): Promise<AdrFormState> {
  const user = await requireUser();
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = adrSchema.safeParse(raw);
  if (!parsed.success)
    return { error: parsed.error.issues[0].message, values: raw };

  let number: number;
  try {
    const adr = await createAdr(user.id, projectId, parsed.data);
    number = adr.number;
  } catch (e) {
    if (e instanceof ForbiddenError)
      return { error: "Accès refusé.", values: raw };
    throw e;
  }
  redirect(`/projects/${projectId}/adr/${number}`);
}

export async function updateAdrAction(
  projectId: string,
  number: number,
  _prev: AdrFormState,
  formData: FormData,
): Promise<AdrFormState> {
  const user = await requireUser();
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = adrSchema.safeParse(raw);
  if (!parsed.success)
    return { error: parsed.error.issues[0].message, values: raw };

  try {
    await updateAdr(user.id, projectId, number, parsed.data);
  } catch (e) {
    if (e instanceof ForbiddenError)
      return { error: "Accès refusé.", values: raw };
    if (e instanceof AdrLockedError)
      return {
        error:
          "Cet ADR n'est plus modifiable (seuls les ADR proposés le sont).",
        values: raw,
      };
    if (e instanceof AdrNotFoundError)
      return { error: "ADR introuvable.", values: raw };
    throw e;
  }
  redirect(`/projects/${projectId}/adr/${number}`);
}

export async function changeStatusAction(
  projectId: string,
  number: number,
  formData: FormData,
) {
  const user = await requireUser();
  const base = `/projects/${projectId}/adr/${number}`;

  const newStatus = z.enum(ADR_STATUSES).safeParse(formData.get("newStatus"));
  if (!newStatus.success) redirect(`${base}?error=invalid`);

  const rep = formData.get("replacement");
  const replacementNumber = rep ? Number(rep) : undefined;
  if (replacementNumber !== undefined && !Number.isInteger(replacementNumber))
    redirect(`${base}?error=supersession`);

  try {
    await changeAdrStatus(
      user.id,
      projectId,
      number,
      newStatus.data,
      replacementNumber,
    );
  } catch (e) {
    if (e instanceof InvalidTransitionError)
      redirect(`${base}?error=transition`);
    if (e instanceof InvalidSupersessionError)
      redirect(`${base}?error=supersession`);
    if (e instanceof ForbiddenError || e instanceof AdrNotFoundError)
      redirect(`${base}?error=forbidden`);
    throw e;
  }

  revalidatePath(base);
  redirect(base);
}

export async function deleteAdrAction(
  projectId: string,
  number: number,
  formData: FormData,
) {
  const user = await requireUser();
  const base = `/projects/${projectId}/adr/${number}`;

  if (formData.get("confirm") !== "on") redirect(`${base}?error=invalid`);

  try {
    await deleteAdr(user.id, projectId, number);
  } catch (e) {
    if (e instanceof AdrInUseError) redirect(`${base}?error=in-use`);
    if (e instanceof ForbiddenError || e instanceof AdrNotFoundError)
      redirect(`${base}?error=forbidden`);
    throw e;
  }

  revalidatePath(`/projects/${projectId}/adr`);
  redirect(`/projects/${projectId}/adr`);
}
