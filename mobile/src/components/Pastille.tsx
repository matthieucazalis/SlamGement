import { StyleSheet, View } from "react-native";
import { usePreferences } from "@/context/preferences";
import { STATUTS_ADR_COULEURS } from "@/constants/theme";
import type { StatutAdr } from "@/data/types";
import { Texte } from "./Texte";

export function PastilleAdr({ statut }: { statut: StatutAdr }) {
  const { t, schema } = usePreferences();
  const [fond, texte] = STATUTS_ADR_COULEURS[statut][schema];
  return (
    <View style={[styles.pastille, { backgroundColor: fond }]}>
      <Texte variante="petit" style={{ color: texte, fontWeight: "600" }}>
        {t(`statutsAdr.${statut}`)}
      </Texte>
    </View>
  );
}

const styles = StyleSheet.create({
  pastille: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
});
