"use client";

import { useActionState } from "react";
import { createProjectAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/i18n/client";

export function NewProjectForm() {
  const t = useT();
  const [state, action, pending] = useActionState(
    createProjectAction,
    undefined,
  );

  return (
    <form action={action} className="space-y-3 rounded-lg border p-4">
      <h2 className="font-semibold">{t("projects.newTitle")}</h2>
      <div className="space-y-2">
        <Label htmlFor="name">{t("projects.name")}</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">{t("projects.descriptionOptional")}</Label>
        <Input id="description" name="description" />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? t("projects.creating") : t("projects.create")}
      </Button>
    </form>
  );
}
