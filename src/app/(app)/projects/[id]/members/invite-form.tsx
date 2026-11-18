"use client";

import { useActionState } from "react";
import { inviteAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/i18n/client";

export function InviteForm({ projectId }: { projectId: string }) {
  const t = useT();
  const [state, action, pending] = useActionState(
    inviteAction.bind(null, projectId),
    undefined,
  );

  return (
    <form action={action} className="space-y-3 rounded-lg border p-4">
      <h2 className="font-semibold">{t("members.inviteTitle")}</h2>
      <div className="space-y-2">
        <Label htmlFor="email">{t("members.email")}</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">{t("members.role")}</Label>
        <select
          id="role"
          name="role"
          defaultValue="MEMBER"
          className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"
        >
          <option value="MEMBER">{t("roles.MEMBER")}</option>
          <option value="ADMIN">{t("roles.ADMIN")}</option>
        </select>
      </div>
      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? t("members.creating") : t("members.createLink")}
      </Button>

      {state?.invitePath && (
        <div className="space-y-2 rounded-md bg-muted p-3">
          <p className="text-sm">{t("members.linkInfo")}</p>
          <Input
            readOnly
            value={`${window.location.origin}${state.invitePath}`}
            onFocus={(e) => e.currentTarget.select()}
          />
        </div>
      )}
    </form>
  );
}
