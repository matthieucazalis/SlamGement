import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ErreurApi } from "@/api/client";
import { usePreferences } from "@/context/preferences";
import { Bouton } from "./Bouton";
import { Texte } from "./Texte";

// Les trois états d'un écran qui charge des données : chargement, erreur, vide
export function Chargement() {
  const { couleurs, t } = usePreferences();
  return (
    <View
      style={styles.centre}
      accessibilityRole="progressbar"
      accessibilityLabel={t("commun.chargement")}
    >
      <ActivityIndicator size="large" color={couleurs.primaire} />
    </View>
  );
}

export function BlocErreur({
  erreur,
  onReessayer,
}: {
  erreur: ErreurApi;
  onReessayer?: () => void;
}) {
  const { t } = usePreferences();
  return (
    <View style={styles.centre}>
      <Texte accessibilityRole="alert" style={styles.texte}>
        {t(`erreurs.${erreur.code}`)}
      </Texte>
      {onReessayer ? (
        <Bouton
          titre={t("commun.reessayer")}
          variante="secondaire"
          onPress={onReessayer}
        />
      ) : null}
    </View>
  );
}

export function Vide({ texte }: { texte: string }) {
  return (
    <View style={styles.centre}>
      <Texte variante="doux" style={styles.texte}>
        {texte}
      </Texte>
    </View>
  );
}

const styles = StyleSheet.create({
  centre: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  texte: { textAlign: "center" },
});
