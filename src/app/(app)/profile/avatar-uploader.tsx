"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { vibrate } from "@/components/haptics";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { useHapticsEnabled, useT } from "@/i18n/client";
import { imageFileToAvatar } from "@/lib/resize-image";
import { removeAvatarAction, saveAvatarAction } from "./actions";

type Status = { kind: "success" | "error"; text: string } | null;

export function AvatarUploader({
  name,
  avatar,
}: {
  name: string;
  avatar: string | null;
}) {
  const t = useT();
  const router = useRouter();
  const haptics = useHapticsEnabled();
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>(null);
  const [pending, startTransition] = useTransition();

  const onFile = (file: File | undefined) => {
    if (!file) return;
    setStatus(null);
    startTransition(async () => {
      let dataUrl: string;
      try {
        dataUrl = await imageFileToAvatar(file);
      } catch {
        setStatus({ kind: "error", text: t("profile.avatarError") });
        return;
      }
      const result = await saveAvatarAction(dataUrl);
      if (result.error) {
        setStatus({ kind: "error", text: result.error });
        if (haptics) vibrate("error");
        return;
      }
      setStatus({ kind: "success", text: result.success ?? "" });
      if (haptics) vibrate("success"); // équivalent web d'expo-haptics Success
      router.refresh();
    });
  };

  const onRemove = () => {
    setStatus(null);
    startTransition(async () => {
      const result = await removeAvatarAction();
      setStatus({ kind: "success", text: result.success ?? "" });
      router.refresh();
    });
  };

  // Les <input type="file"> restent cachés : les boutons les déclenchent, ce qui
  // garde un focus clavier propre. « capture » ouvre l'appareil photo du
  // téléphone ; sur ordinateur, il retombe sur le sélecteur de fichiers.
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <UserAvatar
          name={name}
          src={avatar}
          size={96}
          alt={t("profile.avatarAlt")}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => cameraRef.current?.click()}
          >
            {t("profile.takePhoto")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => galleryRef.current?.click()}
          >
            {t("profile.chooseFile")}
          </Button>
          {avatar && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={onRemove}
            >
              {t("profile.removePhoto")}
            </Button>
          )}
        </div>
      </div>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        data-testid="avatar-camera"
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          e.target.value = ""; // permet de rechoisir le même fichier
        }}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        data-testid="avatar-gallery"
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      <p className="text-xs text-muted-foreground">{t("profile.avatarHelp")}</p>
      <p
        role={status?.kind === "error" ? "alert" : "status"}
        className={`min-h-5 text-sm ${
          status?.kind === "error"
            ? "text-red-600 dark:text-red-400"
            : "text-green-600 dark:text-green-400"
        }`}
      >
        {status?.text}
      </p>
    </div>
  );
}
