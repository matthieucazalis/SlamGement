import { StyleSheet, Text, type TextProps } from "react-native";
import { usePreferences } from "@/context/preferences";

type Variante = "titre" | "sousTitre" | "corps" | "gras" | "doux" | "petit";

export function Texte({
  variante = "corps",
  style,
  ...props
}: TextProps & { variante?: Variante }) {
  const { couleurs } = usePreferences();
  const couleur =
    variante === "doux" || variante === "petit"
      ? couleurs.texteDoux
      : couleurs.texte;
  return (
    <Text {...props} style={[styles[variante], { color: couleur }, style]} />
  );
}

const styles = StyleSheet.create({
  titre: { fontSize: 24, fontWeight: "700" },
  sousTitre: { fontSize: 18, fontWeight: "600" },
  corps: { fontSize: 16, lineHeight: 22 },
  gras: { fontSize: 16, fontWeight: "600" },
  doux: { fontSize: 14, lineHeight: 20 },
  petit: { fontSize: 12 },
});
