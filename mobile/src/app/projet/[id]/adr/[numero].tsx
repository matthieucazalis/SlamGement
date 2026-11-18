import { useLocalSearchParams } from "expo-router";
import { Stack } from "expo-router/stack";
import { useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { ErreurApi } from "@/api/client";
import { Bouton } from "@/components/Bouton";
import { Carte } from "@/components/Carte";
import { ChampTexte } from "@/components/ChampTexte";
import { BlocErreur, Chargement } from "@/components/Etats";
import { Icone } from "@/components/Icones";
import { PastilleAdr } from "@/components/Pastille";
import { Texte } from "@/components/Texte";
import { useAuth } from "@/context/auth";
import { useFavoris } from "@/context/favoris";
import { usePreferences } from "@/context/preferences";
import {
  formaterNumeroAdr,
  lireNumero,
  transitionsPossibles,
} from "@/data/regles";
import type { StatutAdr } from "@/data/types";
import { useChargement } from "@/hooks/useChargement";
import { formaterDate } from "@/i18n";

function Section({ titre, texte }: { titre: string; texte: string }) {
  return (
    <Carte>
      <Texte variante="sousTitre">{titre}</Texte>
      <Texte selectable>{texte}</Texte>
    </Carte>
  );
}

// Écran 5 : le détail d'une décision. Le numéro arrive dans l'URL, donc en TEXTE :
// on le convertit (cours : useLocalSearchParams renvoie toujours du texte).
export default function EcranAdr() {
  const { id, numero: numeroTexte } = useLocalSearchParams<{
    id: string;
    numero: string;
  }>();
  const numero = lireNumero(numeroTexte);
  const { t, couleurs, langue, vibrer } = usePreferences();
  const { api } = useAuth();
  const { estFavori, basculer } = useFavoris();

  const adr = useChargement(
    `adr:${id}:${numero}`,
    () => api.adr(id, numero ?? 0),
    { auFocus: true },
  );
  const projet = useChargement(`projet:${id}`, () => api.projet(id));

  const [remplacant, setRemplacant] = useState("");
  const [choixRemplacement, setChoixRemplacement] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<{
    genre: "succes" | "erreur";
    texte: string;
  } | null>(null);

  if (numero === null)
    return <BlocErreur erreur={new ErreurApi("introuvable")} />;
  if (adr.chargement && !adr.donnees) return <Chargement />;
  if (adr.erreur && !adr.donnees)
    return <BlocErreur erreur={adr.erreur} onReessayer={adr.recharger} />;
  if (!adr.donnees) return <Chargement />;

  const detail = adr.donnees;
  const epingle = estFavori(id, numero);

  async function changerStatut(statut: StatutAdr, remplacePar?: number) {
    setEnCours(true);
    setMessage(null);
    vibrer("leger");
    try {
      await api.changerStatutAdr(id, numero as number, statut, remplacePar);
      vibrer("succes");
      setMessage({ genre: "succes", texte: t("adr.statutChange") });
      setChoixRemplacement(false);
      await adr.recharger();
    } catch (e) {
      vibrer("erreur");
      const code = e instanceof ErreurApi ? e.code : "inconnue";
      // 409 = transition interdite par le serveur, 422 = remplaçant invalide
      setMessage({
        genre: "erreur",
        texte: t(`erreurs.${code === "validation" ? "conflit" : code}`),
      });
    } finally {
      setEnCours(false);
    }
  }

  const numeroRemplacant = Number(remplacant);
  const remplacantValide =
    Number.isInteger(numeroRemplacant) &&
    numeroRemplacant > 0 &&
    numeroRemplacant !== numero;

  return (
    <ScrollView
      contentContainerStyle={styles.contenu}
      refreshControl={
        <RefreshControl
          refreshing={adr.actualisation}
          onRefresh={adr.recharger}
          tintColor={couleurs.primaire}
          colors={[couleurs.primaire]}
        />
      }
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen
        options={{
          title: `ADR-${formaterNumeroAdr(numero)}`,
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                epingle ? t("adr.desepingler") : t("adr.epingler")
              }
              accessibilityState={{ selected: epingle }}
              hitSlop={12}
              onPress={() =>
                basculer({
                  projetId: id,
                  projetNom: projet.donnees?.name ?? "",
                  numero,
                  titre: detail.title,
                })
              }
            >
              {/* une seule étoile dans Papicons : épinglé = couleur d'accent,
                  non épinglé = couleur discrète */}
              <Icone
                nom="favori"
                taille={24}
                couleur={epingle ? couleurs.primaire : couleurs.texteDoux}
              />
            </Pressable>
          ),
        }}
      />

      <View style={styles.entete}>
        <Texte variante="titre">{detail.title}</Texte>
        <PastilleAdr statut={detail.status} />
        <Texte variante="doux">
          {t("adr.par", {
            auteur: detail.author,
            date: formaterDate(detail.createdAt, langue),
          })}
        </Texte>
        {detail.supersededBy ? (
          <Texte variante="doux">
            {t("adr.remplacePar", {
              numero: formaterNumeroAdr(detail.supersededBy),
            })}
          </Texte>
        ) : null}
        {detail.supersedes ? (
          <Texte variante="doux">
            {t("adr.remplace", {
              numero: formaterNumeroAdr(detail.supersedes),
            })}
          </Texte>
        ) : null}
      </View>

      <Section titre={t("adr.contexte")} texte={detail.context} />
      <Section titre={t("adr.decision")} texte={detail.decision} />
      <Section titre={t("adr.consequences")} texte={detail.consequences} />
      {detail.alternatives ? (
        <Section titre={t("adr.alternatives")} texte={detail.alternatives} />
      ) : null}

      {transitionsPossibles(detail.status).length > 0 ? (
        <Carte>
          <Texte variante="sousTitre">{t("adr.changerStatut")}</Texte>
          {transitionsPossibles(detail.status).map((statut) =>
            statut === "SUPERSEDED" ? (
              <View key={statut} style={{ gap: 10 }}>
                <Bouton
                  titre={t(`actionsAdr.${statut}`)}
                  variante="secondaire"
                  desactive={enCours}
                  onPress={() => setChoixRemplacement((ouvert) => !ouvert)}
                />
                {choixRemplacement ? (
                  <>
                    <ChampTexte
                      etiquette={t("adr.numeroRemplacant")}
                      value={remplacant}
                      onChangeText={setRemplacant}
                      keyboardType="number-pad"
                    />
                    <Bouton
                      titre={t("adr.confirmer")}
                      enCours={enCours}
                      desactive={!remplacantValide}
                      onPress={() =>
                        void changerStatut("SUPERSEDED", numeroRemplacant)
                      }
                    />
                  </>
                ) : null}
              </View>
            ) : (
              <Bouton
                key={statut}
                titre={t(`actionsAdr.${statut}`)}
                variante={
                  statut === "REJECTED" || statut === "DEPRECATED"
                    ? "secondaire"
                    : "primaire"
                }
                desactive={enCours}
                onPress={() => void changerStatut(statut)}
              />
            ),
          )}
          {message ? (
            <Texte
              accessibilityRole={
                message.genre === "erreur" ? "alert" : undefined
              }
              style={{
                color:
                  message.genre === "erreur"
                    ? couleurs.danger
                    : couleurs.succes,
              }}
            >
              {message.texte}
            </Texte>
          ) : null}
        </Carte>
      ) : message ? (
        <Texte
          style={{
            color:
              message.genre === "erreur" ? couleurs.danger : couleurs.succes,
          }}
        >
          {message.texte}
        </Texte>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenu: { padding: 16, gap: 12 },
  entete: { gap: 8, marginBottom: 4 },
});
