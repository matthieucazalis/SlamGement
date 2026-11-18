import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Carte } from "@/components/Carte";
import { Icone } from "@/components/Icones";
import { Vide } from "@/components/Etats";
import { Texte } from "@/components/Texte";
import { useFavoris } from "@/context/favoris";
import { usePreferences } from "@/context/preferences";
import { formaterNumeroAdr } from "@/data/regles";

// Écran 2 : les ADR épinglés. Tout vient du téléphone (AsyncStorage), donc
// l'écran marche même sans réseau.
export default function EcranFavoris() {
  const { t, couleurs } = usePreferences();
  const { favoris, basculer } = useFavoris();

  return (
    <FlatList
      data={favoris}
      keyExtractor={(f) => `${f.projetId}:${f.numero}`}
      contentContainerStyle={styles.liste}
      ListEmptyComponent={<Vide texte={t("favoris.vide")} />}
      renderItem={({ item }) => (
        <Carte
          accessibilityLabel={`ADR-${formaterNumeroAdr(item.numero)} ${item.titre}`}
          onPress={() =>
            router.push({
              pathname: "/projet/[id]/adr/[numero]",
              params: { id: item.projetId, numero: String(item.numero) },
            })
          }
        >
          <View style={styles.ligne}>
            <View style={{ flex: 1, gap: 2 }}>
              <Texte variante="gras">
                ADR-{formaterNumeroAdr(item.numero)} · {item.titre}
              </Texte>
              <Texte variante="petit">
                {t("favoris.projet", { nom: item.projetNom })}
              </Texte>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("adr.desepingler")}
              hitSlop={12}
              onPress={() => basculer(item)}
            >
              <Icone nom="favori" taille={26} couleur={couleurs.primaire} />
            </Pressable>
          </View>
        </Carte>
      )}
    />
  );
}

const styles = StyleSheet.create({
  liste: { padding: 16, gap: 12, flexGrow: 1 },
  ligne: { flexDirection: "row", alignItems: "center", gap: 12 },
});
