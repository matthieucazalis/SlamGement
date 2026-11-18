import { Pressable, StyleSheet, View } from "react-native";
import { usePreferences } from "@/context/preferences";
import { Texte } from "./Texte";

// Petit sélecteur « un choix parmi N » (langue, thème, colonne du Kanban…)
export function Choix<T extends string>({
  options,
  valeur,
  onChange,
  etiquette,
}: {
  options: { valeur: T; titre: string }[];
  valeur: T | null;
  onChange: (valeur: T) => void;
  etiquette?: string;
}) {
  const { couleurs } = usePreferences();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={etiquette}
      style={styles.rangee}
    >
      {options.map((o) => {
        const actif = o.valeur === valeur;
        return (
          <Pressable
            key={o.valeur}
            accessibilityRole="radio"
            accessibilityState={{ selected: actif }}
            onPress={() => onChange(o.valeur)}
            style={[
              styles.option,
              {
                backgroundColor: actif ? couleurs.primaire : couleurs.carte,
                borderColor: actif ? couleurs.primaire : couleurs.bordure,
              },
            ]}
          >
            <Texte
              variante="doux"
              style={{
                color: actif ? couleurs.surPrimaire : couleurs.texte,
                fontWeight: actif ? "700" : "400",
              }}
            >
              {o.titre}
            </Texte>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rangee: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  option: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
