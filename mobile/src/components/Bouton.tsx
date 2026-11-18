import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { usePreferences } from "@/context/preferences";
import { Texte } from "./Texte";

type Variante = "primaire" | "secondaire" | "danger" | "discret";

export function Bouton({
  titre,
  onPress,
  variante = "primaire",
  enCours = false,
  desactive = false,
  style,
  accessibilityLabel,
}: {
  titre: string;
  onPress: () => void;
  variante?: Variante;
  enCours?: boolean;
  desactive?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const { couleurs } = usePreferences();
  const inactif = desactive || enCours;

  const fond =
    variante === "primaire"
      ? couleurs.primaire
      : variante === "danger"
        ? couleurs.danger
        : "transparent";
  const texte =
    variante === "primaire" || variante === "danger"
      ? couleurs.surPrimaire
      : variante === "secondaire"
        ? couleurs.texte
        : couleurs.primaire;
  const bordure = variante === "secondaire" ? couleurs.bordure : "transparent";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? titre}
      accessibilityState={{ disabled: inactif, busy: enCours }}
      disabled={inactif}
      onPress={onPress}
      style={({ pressed }) => [
        styles.bouton,
        {
          backgroundColor: fond,
          borderColor: bordure,
          opacity: inactif ? 0.5 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      {enCours ? (
        <ActivityIndicator color={texte} />
      ) : (
        <Texte variante="gras" style={{ color: texte }}>
          {titre}
        </Texte>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bouton: {
    minHeight: 48, // zone de toucher confortable (recommandation d'accessibilité)
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
