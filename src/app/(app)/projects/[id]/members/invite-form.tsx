"use client";

import { useActionState } from "react";
import { inviteAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InviteForm({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState(
    inviteAction.bind(null, projectId),
    undefined,
  );

  return (
    <form action={action} className="space-y-3 rounded-lg border p-4">
      <h2 className="font-semibold">Inviter un collaborateur</h2>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Rôle</Label>
        <select
          id="role"
          name="role"
          defaultValue="MEMBER"
          className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"
        >
          <option value="MEMBER">Membre</option>
          <option value="ADMIN">Administrateur</option>
        </select>
      </div>
      {state?.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Création..." : "Créer le lien d'invitation"}
      </Button>

      {state?.invitePath && (
        <div className="space-y-2 rounded-md bg-muted p-3">
          <p className="text-sm">
            Transmets ce lien à la personne invitée (valable 7 jours, il ne sera
            plus affichable ensuite) :
          </p>
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
