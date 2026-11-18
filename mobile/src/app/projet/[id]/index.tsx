import { router, useLocalSearchParams } from "expo-router";
import { Stack } from "expo-router/stack";
import { useState } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Bouton } from "@/components/Bouton";
import { Carte } from "@/components/Carte";
import { Choix } from "@/components/Choix";
import { BlocErreur, Chargement, Vide } from "@/components/Etats";
import { PastilleAdr } from "@/components/Pastille";
import { Texte } from "@/components/Texte";
import { useAuth } from "@/context/auth";
import { usePreferences } from "@/context/preferences";
import { formaterNumeroAdr } from "@/data/regles";
import { STATUTS_ADR, type StatutAdr } from "@/data/types";
import { useChargement } from "@/hooks/useChargement";
import { useDebounce } from "@/hooks/useDebounce";
import { formaterDate } from "@/i18n";

// Écran 4 : un projet = la liste de ses décisions (ADR), avec recherche et filtre
export default function EcranProjet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, couleurs, langue } = usePreferences();
  const { api } = useAuth();

  const [saisie, setSaisie] = useState("");
  const recherche = useDebounce(saisie);
  const [statut, setStatut] = useState<StatutAdr | null>(null);

  const projet = useChargement(`projet:${id}`, () => api.projet(id));
  const adrs = useChargement(
    `adrs:${id}:${recherche}:${statut ?? ""}`,
    () => api.adrs(id, recherche, statut ?? undefined),
    { auFocus: true },
  );

  if (projet.erreur && !projet.donnees)
    return <BlocErreur erreur={projet.erreur} onReessayer={projet.recharger} />;

  const options = [
    { valeur: "tous", titre: t("projet.tous") },
    ...STATUTS_ADR.map((s) => ({
      valeur: s as string,
      titre: t(`statutsAdr.${s}`),
    })),
  ];

  return (
    <View style={styles.ecran}>
      <Stack.Screen options={{ title: projet.donnees?.name ?? "" }} />

      <View style={styles.controles}>
        <TextInput
          accessibilityLabel={t("projet.recherche")}
          placeholder={t("projet.recherche")}
          placeholderTextColor={couleurs.texteDoux}
          value={saisie}
          onChangeText={setSaisie}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          style={[
            styles.recherche,
            {
              color: couleurs.texte,
              backgroundColor: couleurs.champ,
              borderColor: couleurs.bordure,
            },
          ]}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Choix
            etiquette={t("projet.tous")}
            options={options}
            valeur={statut ?? "tous"}
            onChange={(v) => setStatut(v === "tous" ? null : (v as StatutAdr))}
          />
        </ScrollView>
        <View style={styles.rangee}>
          <Bouton
            titre={t("projet.kanban")}
            variante="secondaire"
            style={styles.moitie}
            onPress={() =>
              router.push({ pathname: "/projet/[id]/kanban", params: { id } })
            }
          />
          <Bouton
            titre={t("projet.messages")}
            variante="secondaire"
            style={styles.moitie}
            onPress={() =>
              router.push({
                pathname: "/projet/[id]/messages",
                params: { id },
              })
            }
          />
        </View>
        <View style={[styles.rangee, { marginTop: 10 }]}>
          <Bouton
            titre={t("projet.nouvelAdr")}
            style={styles.moitie}
            onPress={() =>
              router.push({
                pathname: "/projet/[id]/adr/nouveau",
                params: { id },
              })
            }
          />
        </View>
      </View>

      {adrs.chargement && !adrs.donnees ? (
        <Chargement />
      ) : adrs.erreur && !adrs.donnees ? (
        <BlocErreur erreur={adrs.erreur} onReessayer={adrs.recharger} />
      ) : (
        <FlatList
          data={adrs.donnees ?? []}
          keyExtractor={(adr) => String(adr.number)}
          contentContainerStyle={styles.liste}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={adrs.actualisation}
              onRefresh={adrs.recharger}
              tintColor={couleurs.primaire}
              colors={[couleurs.primaire]}
            />
          }
          ListEmptyComponent={
            <Vide
              texte={
                recherche.trim()
                  ? t("projet.aucunResultat", { q: recherche.trim() })
                  : t("projet.aucunAdr")
              }
            />
          }
          renderItem={({ item }) => (
            <Carte
              accessibilityLabel={`ADR-${formaterNumeroAdr(item.number)} ${item.title}`}
              onPress={() =>
                router.push({
                  pathname: "/projet/[id]/adr/[numero]",
                  params: { id, numero: String(item.number) },
                })
              }
            >
              <Texte variante="gras">
                ADR-{formaterNumeroAdr(item.number)} · {item.title}
              </Texte>
              <PastilleAdr statut={item.status} />
              <Texte variante="petit">
                {t("adr.par", {
                  auteur: item.author,
                  date: formaterDate(item.createdAt, langue),
                })}
              </Texte>
            </Carte>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1 },
  controles: { padding: 16, paddingBottom: 8, gap: 12 },
  recherche: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  rangee: { flexDirection: "row", gap: 10 },
  moitie: { flex: 1 },
  liste: { padding: 16, paddingTop: 8, gap: 12, flexGrow: 1 },
});
