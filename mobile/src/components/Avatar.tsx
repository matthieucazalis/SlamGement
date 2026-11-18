import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import { usePreferences } from "@/context/preferences";
import { Texte } from "./Texte";

function initiales(nom: string) {
  return (
    nom
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((m) => m[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

// Photo de profil ronde (comme dans le cours : 160 px, borderRadius = moitié),
// ou les initiales si aucune photo n'a été envoyée.
export function Avatar({
  nom,
  source,
  taille = 96,
}: {
  nom: string;
  source?: string | null;
  taille?: number;
}) {
  const { couleurs, t } = usePreferences();
  const forme = { width: taille, height: taille, borderRadius: taille / 2 };

  if (source)
    return (
      <Image
        source={{ uri: source }}
        style={forme}
        contentFit="cover"
        accessibilityLabel={t("profil.photo")}
      />
    );
  return (
    <View
      style={[
        styles.initiales,
        forme,
        { backgroundColor: couleurs.carteActive },
      ]}
    >
      <Texte
        style={{
          fontSize: taille * 0.38,
          fontWeight: "700",
          color: couleurs.texteDoux,
        }}
      >
        {initiales(nom)}
      </Texte>
    </View>
  );
}

const styles = StyleSheet.create({
  initiales: { alignItems: "center", justifyContent: "center" },
});
