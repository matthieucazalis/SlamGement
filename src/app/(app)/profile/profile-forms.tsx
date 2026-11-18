"use client";

import { useActionState } from "react";
import {
  changePasswordAction,
  deleteAccountAction,
  updateProfileAction,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useT } from "@/i18n/client";
import { AvatarUploader } from "./avatar-uploader";

function Message({ state }: { state?: { error?: string; success?: string } }) {
  if (state?.error)
    return (
      <p className="text-sm text-red-600 dark:text-red-400" role="alert">
        {state.error}
      </p>
    );
  if (state?.success)
    return (
      <p className="text-sm text-green-600 dark:text-green-400" role="status">
        {state.success}
      </p>
    );
  return null;
}

export function ProfileForms({
  name,
  email,
  avatar,
}: {
  name: string;
  email: string;
  avatar: string | null;
}) {
  const t = useT();
  const [profileState, profileAction, profilePending] = useActionState(
    updateProfileAction,
    undefined,
  );
  const [pwdState, pwdAction, pwdPending] = useActionState(
    changePasswordAction,
    undefined,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteAccountAction,
    undefined,
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.avatarTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <AvatarUploader name={name} avatar={avatar} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("profile.infoTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={profileAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("profile.email")}</Label>
              <Input id="email" value={email} disabled readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">{t("profile.name")}</Label>
              <Input id="name" name="name" defaultValue={name} required />
            </div>
            <Message state={profileState} />
            <Button type="submit" disabled={profilePending}>
              {profilePending ? t("common.saving") : t("common.save")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("profile.passwordTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={pwdAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">
                {t("profile.currentPassword")}
              </Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t("profile.newPassword")}</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">{t("profile.confirm")}</Label>
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
              {pwdPending ? t("profile.changing") : t("profile.changePassword")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("profile.dataTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {t("profile.dataHelp")}
            </p>
            <a
              href="/profile/export"
              className="inline-block rounded-md border px-3 py-2 text-sm"
            >
              {t("profile.exportData")}
            </a>
          </div>

          <form
            action={deleteAction}
            className="space-y-3 rounded-lg border border-red-300 p-4 dark:border-red-800"
          >
            <h3 className="font-semibold text-red-600 dark:text-red-400">
              {t("profile.deleteTitle")}
            </h3>
            <p className="text-sm">{t("profile.deleteHelp")}</p>
            <div className="space-y-2">
              <Label htmlFor="deletePassword">
                {t("profile.deletePassword")}
              </Label>
              <Input
                id="deletePassword"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <Message state={deleteState} />
            <Button
              type="submit"
              variant="destructive"
              disabled={deletePending}
              data-haptic="error"
            >
              {t("profile.deleteButton")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
