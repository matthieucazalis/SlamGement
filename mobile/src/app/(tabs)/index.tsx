import { router } from "expo-router";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { Carte } from "@/components/Carte";
import { BlocErreur, Chargement, Vide } from "@/components/Etats";
import { Texte } from "@/components/Texte";
import { useAuth } from "@/context/auth";
import { usePreferences } from "@/context/preferences";
import { useChargement } from "@/hooks/useChargement";

// Écran 1 : la liste de mes projets (données de l'API, FlatList, tirer pour actualiser)
export default function EcranProjets() {
  const { t, couleurs } = usePreferences();
  const { api, serveur } = useAuth();
  const { donnees, erreur, chargement, actualisation, recharger } =
    useChargement(`projets:${serveur}`, () => api.projets(), { auFocus: true });

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
      ListEmptyComponent={<Vide texte={t("projets.vide")} />}
      ListHeaderComponent={
        erreur ? (
          <Texte accessibilityRole="alert" style={{ color: couleurs.danger }}>
            {t(`erreurs.${erreur.code}`)}
          </Texte>
        ) : undefined
      }
      renderItem={({ item }) => (
        <Carte
          accessibilityLabel={item.name}
          onPress={() =>
            router.push({ pathname: "/projet/[id]", params: { id: item.id } })
          }
        >
          <Texte variante="sousTitre">{item.name}</Texte>
          {item.description ? (
            <Texte variante="doux" numberOfLines={2}>
              {item.description}
            </Texte>
          ) : null}
          <View style={styles.pied}>
            <Texte variante="petit">
              {t("projets.role", { role: t(`roles.${item.role}`) })}
            </Texte>
          </View>
        </Carte>
      )}
    />
  );
}

const styles = StyleSheet.create({
  liste: { padding: 16, gap: 12, flexGrow: 1 },
  pied: { flexDirection: "row", marginTop: 4 },
});
