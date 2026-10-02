"use client";

import { useActionState } from "react";
import { changePasswordAction, updateProfileAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Message({ state }: { state?: { error?: string; success?: string } }) {
  if (state?.error)
    return (
      <p className="text-sm text-red-600" role="alert">
        {state.error}
      </p>
    );
  if (state?.success)
    return (
      <p className="text-sm text-green-600" role="status">
        {state.success}
      </p>
    );
  return null;
}

export function ProfileForms({ name, email }: { name: string; email: string }) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateProfileAction,
    undefined,
  );
  const [pwdState, pwdAction, pwdPending] = useActionState(
    changePasswordAction,
    undefined,
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={profileAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} disabled readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" name="name" defaultValue={name} required />
            </div>
            <Message state={profileState} />
            <Button type="submit" disabled={profilePending}>
              {profilePending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mot de passe</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={pwdAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmation</Label>
              <Input
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                required
              />
            </div>
            <Message state={pwdState} />
            <Button type="submit" disabled={pwdPending}>
              {pwdPending ? "Modification..." : "Changer le mot de passe"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
