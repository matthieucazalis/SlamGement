import * as Haptics from "expo-haptics";

export type TypeVibration = "leger" | "succes" | "erreur";

// Équivalent des appels vus en cours : impactAsync pour un appui,
// notificationAsync pour une réussite ou un échec. Sur le web ou un appareil
// sans moteur de vibration, l'appel ne fait rien : on ignore toute erreur.
export function vibrer(type: TypeVibration) {
  const action =
    type === "leger"
      ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      : Haptics.notificationAsync(
          type === "succes"
            ? Haptics.NotificationFeedbackType.Success
            : Haptics.NotificationFeedbackType.Error,
        );
  action.catch(() => undefined);
}
