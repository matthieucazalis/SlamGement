import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { ErreurApi } from "@/api/client";
import { Bouton } from "@/components/Bouton";
import { Carte } from "@/components/Carte";
import { Choix } from "@/components/Choix";
import { BlocErreur, Chargement, Vide } from "@/components/Etats";
import { Texte } from "@/components/Texte";
import { useAuth } from "@/context/auth";
import { usePreferences } from "@/context/preferences";
import { estEnRetard, statutPrecedent, statutSuivant } from "@/data/regles";
import { STATUTS_TACHE, type StatutTache, type Tache } from "@/data/types";
import { useChargement } from "@/hooks/useChargement";
import { useDebounce } from "@/hooks/useDebounce";
import { formaterDate } from "@/i18n";

// Écran 7 : le Kanban. Une colonne à la fois (un téléphone est étroit), avec
// recherche, et des boutons pour déplacer une carte avec une vibration.
export default function EcranKanban() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, couleurs, langue, vibrer } = usePreferences();
  const { api } = useAuth();

  const [colonne, setColonne] = useState<StatutTache>("TODO");
  const [saisie, setSaisie] = useState("");
  const recherche = useDebounce(saisie);
  const [message, setMessage] = useState<string | null>(null);
  // Déplacements affichés tout de suite, avant la réponse du serveur ; on les
  // retire dès que le serveur a confirmé (ou refusé).
  const [provisoires, setProvisoires] = useState<Record<string, StatutTache>>(
    {},
  );

  const taches = useChargement(
    `taches:${id}:${recherche}`,
    () => api.taches(id, recherche),
    { auFocus: true },
  );

  if (taches.chargement && !taches.donnees) return <Chargement />;
  if (taches.erreur && !taches.donnees)
    return <BlocErreur erreur={taches.erreur} onReessayer={taches.recharger} />;

  const toutes: Tache[] = (taches.donnees ?? []).map((tache) => ({
    ...tache,
    status: provisoires[tache.id] ?? tache.status,
  }));
  const compte = (s: StatutTache) =>
    toutes.filter((tache) => tache.status === s).length;
  const visibles = toutes.filter((tache) => tache.status === colonne);

  async function deplacer(tache: Tache, vers: StatutTache) {
    vibrer("leger");
    setMessage(null);
    setProvisoires((p) => ({ ...p, [tache.id]: vers }));
    try {
      await api.deplacerTache(id, tache.id, vers);
      vibrer("succes");
      await taches.recharger();
    } catch (e) {
      vibrer("erreur");
      setMessage(t(`erreurs.${e instanceof ErreurApi ? e.code : "inconnue"}`));
    } finally {
      setProvisoires((p) => {
        const reste = { ...p };
        delete reste[tache.id];
        return reste;
      });
    }
  }

  return (
    <View style={styles.ecran}>
      <View style={styles.controles}>
        <TextInput
          accessibilityLabel={t("kanban.rechercher")}
          placeholder={t("kanban.rechercher")}
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
        <Choix<StatutTache>
          etiquette="Kanban"
          options={STATUTS_TACHE.map((s) => ({
            valeur: s,
            titre: `${t(`statutsTache.${s}`)} (${compte(s)})`,
          }))}
          valeur={colonne}
          onChange={setColonne}
        />
        {message ? (
          <Texte accessibilityRole="alert" style={{ color: couleurs.danger }}>
            {message}
          </Texte>
        ) : null}
      </View>

      <FlatList
        data={visibles}
        keyExtractor={(tache) => tache.id}
        contentContainerStyle={styles.liste}
        refreshControl={
          <RefreshControl
            refreshing={taches.actualisation}
            onRefresh={taches.recharger}
            tintColor={couleurs.primaire}
            colors={[couleurs.primaire]}
          />
        }
        ListEmptyComponent={<Vide texte={t("kanban.aucuneTache")} />}
        renderItem={({ item }) => {
          const precedent = statutPrecedent(item.status);
          const suivant = statutSuivant(item.status);
          const retard = estEnRetard(item.dueDate, item.status);
          return (
            <Carte>
              <Texte variante="gras">{item.title}</Texte>
              {item.description ? (
                <Texte variante="doux" numberOfLines={3}>
                  {item.description}
                </Texte>
              ) : null}
              <Texte variante="petit">
                {item.assignee ? item.assignee.name : t("kanban.nonAssignee")}
              </Texte>
              {item.dueDate ? (
                <Texte
                  variante="petit"
                  style={
                    retard
                      ? { color: couleurs.danger, fontWeight: "600" }
                      : undefined
                  }
                >
                  {t("kanban.echeance", {
                    date: formaterDate(item.dueDate, langue),
                  })}
                  {retard ? ` (${t("kanban.enRetard")})` : ""}
                </Texte>
              ) : null}
              <View style={styles.deplacements}>
                {precedent ? (
                  <Bouton
                    titre={`← ${t(`statutsTache.${precedent}`)}`}
                    accessibilityLabel={t("kanban.deplacerVers", {
                      statut: t(`statutsTache.${precedent}`),
                    })}
                    variante="secondaire"
                    style={styles.moitie}
                    onPress={() => void deplacer(item, precedent)}
                  />
                ) : (
                  <View style={styles.moitie} />
                )}
                {suivant ? (
                  <Bouton
                    titre={`${t(`statutsTache.${suivant}`)} →`}
                    accessibilityLabel={t("kanban.deplacerVers", {
                      statut: t(`statutsTache.${suivant}`),
                    })}
                    variante="secondaire"
                    style={styles.moitie}
                    onPress={() => void deplacer(item, suivant)}
                  />
                ) : (
                  <View style={styles.moitie} />
                )}
              </View>
            </Carte>
          );
        }}
      />
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
  liste: { padding: 16, paddingTop: 8, gap: 12, flexGrow: 1 },
  deplacements: { flexDirection: "row", gap: 10, marginTop: 6 },
  moitie: { flex: 1 },
});
