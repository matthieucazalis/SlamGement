import { router } from "expo-router";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { Carte } from "@/components/Carte";
import { BlocErreur, Chargement, Vide } from "@/components/Etats";
import { Icone } from "@/components/Icones";
import { Texte } from "@/components/Texte";
import { useAuth } from "@/context/auth";
import { usePreferences } from "@/context/preferences";
import { useChargement } from "@/hooks/useChargement";

// Onglet Messages : une discussion par projet. On choisit un projet, puis on
// ouvre sa conversation.
export default function EcranDiscussions() {
  const { t, couleurs } = usePreferences();
  const { api, serveur } = useAuth();
  const { donnees, erreur, chargement, actualisation, recharger } =
    useChargement(`discussions:${serveur}`, () => api.projets(), {
      auFocus: true,
    });

  if (chargement && !donnees) return <Chargement />;
  if (erreur && !donnees)
    return <BlocErreur erreur={erreur} onReessayer={recharger} />;

  return (
    <FlatList
      data={donnees ?? []}
      keyExtractor={(projet) => projet.id}
      contentContainerStyle={styles.liste}
      refreshControl={
        <RefreshControl
          refreshing={actualisation}
          onRefresh={recharger}
          tintColor={couleurs.primaire}
          colors={[couleurs.primaire]}
        />
      }
      ListEmptyComponent={<Vide texte={t("chat.listeVide")} />}
      ListHeaderComponent={
        erreur ? (
          <Texte accessibilityRole="alert" style={{ color: couleurs.danger }}>
            {t(`erreurs.${erreur.code}`)}
          </Texte>
        ) : undefined
      }
      renderItem={({ item }) => (
        <Carte
          accessibilityLabel={`${item.name} – ${t("chat.ouvrir")}`}
          onPress={() =>
            router.push({
              pathname: "/projet/[id]/messages",
              params: { id: item.id },
            })
          }
        >
          <View style={styles.ligne}>
            <View
              style={[styles.pastille, { backgroundColor: couleurs.carteActive }]}
            >
              <Icone nom="messages" taille={22} couleur={couleurs.primaire} />
            </View>
            <View style={styles.texte}>
              <Texte variante="gras" numberOfLines={1}>
                {item.name}
              </Texte>
              <Texte variante="petit">{t("chat.ouvrir")}</Texte>
            </View>
          </View>
        </Carte>
      )}
    />
  );
}

const styles = StyleSheet.create({
  liste: { padding: 16, gap: 12, flexGrow: 1 },
  ligne: { flexDirection: "row", alignItems: "center", gap: 12 },
  pastille: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  texte: { flex: 1, gap: 2 },
});
